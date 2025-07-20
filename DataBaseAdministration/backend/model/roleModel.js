import pool from "../db.js";
import privilegesModel from "./privilegesModel.js";

const roleModel = {
  async getAllRoles() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          r.role_id, 
          r.role_name, 
          r.description,
          GROUP_CONCAT(p.privilege_id) AS privilege_ids
        FROM roles r
        LEFT JOIN role_table_privileges rp ON r.role_id = rp.role_id
        LEFT JOIN privileges p ON rp.privilege_id = p.privilege_id
        GROUP BY r.role_id
      `);

      const roles = await Promise.all(
        rows.map(async row => {
          const privileges = row.privilege_ids
            ? await Promise.all(
                row.privilege_ids.split(",").map(async priv_id => {
                  const privilege = await privilegesModel.getOnePrivilege(priv_id);
                  return privilege;
                })
              )
            : [];
          
          return {
            role_id: String(row.role_id),
            role_name: row.role_name,
            description: row.description,
            privileges: privileges.filter(Boolean),
          };
        })
      );

      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new Error("Failed to fetch roles");
    }
  },

  async getOneRoles(id) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          r.role_id, 
          r.role_name, 
          r.description,
          GROUP_CONCAT(p.privilege_id) AS privilege_ids
        FROM roles r
        LEFT JOIN role_table_privileges rp ON r.role_id = rp.role_id
        LEFT JOIN privileges p ON rp.privilege_id = p.privilege_id
        WHERE r.role_id = ?
        GROUP BY r.role_id
      `, [id]);

      if (rows.length === 0) return null;

      const row = rows[0];
      const privileges = row.privilege_ids
        ? await Promise.all(
            row.privilege_ids.split(",").map(async priv_id => {
              const privilege = await privilegesModel.getOnePrivilege(priv_id);
              return privilege;
            })
          )
        : [];

      return {
        role_id: String(row.role_id),
        role_name: row.role_name,
        description: row.description,
        privileges: privileges.filter(Boolean),
      };
    } catch (error) {
      console.error("Error fetching role:", error);
      throw new Error("Failed to fetch role");
    }
  },

  async createRoles(data) {
    const { role_name, description, privilege_ids } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (!role_name || typeof role_name !== "string" || role_name.includes("'")) {
        throw new Error("Invalid role name");
      }
      if (!privilege_ids || !Array.isArray(privilege_ids) || privilege_ids.length === 0) {
        throw new Error("At least one privilege ID is required");
      }

      // Validate privilege IDs
      for (const priv_id of privilege_ids) {
        const [priv] = await connection.query(
          "SELECT 1 FROM privileges WHERE privilege_id = ?",
          [priv_id]
        );
        if (priv.length === 0) throw new Error(`Privilege ID ${priv_id} does not exist`);
      }

      // Create role in MySQL system
      await connection.query(`CREATE ROLE IF NOT EXISTS ?@'localhost'`, [role_name]);

      const [result] = await connection.query(
        "INSERT INTO roles (role_name, description) VALUES (?, ?)",
        [role_name, description || null]
      );
      const roleId = String(result.insertId);

      // Insert role-privilege mappings
      for (const priv_id of privilege_ids) {
        await connection.query(
          "INSERT INTO role_table_privileges (role_id, privilege_id) VALUES (?, ?)",
          [roleId, priv_id]
        );
      }

      // Fetch privilege details to apply MySQL privileges
      const privileges = await Promise.all(
        privilege_ids.map(async priv_id => {
          const privilege = await privilegesModel.getOnePrivilege(priv_id);
          if (!privilege) throw new Error(`Privilege with ID ${priv_id} not found`);
          return privilege;
        })
      );

      // Apply MySQL privileges
      for (const privilege of privileges) {
        for (const table of privilege.tables) {
          await privilegesModel.applyMySQLPrivileges(privilege.privilege_id, role_name, table);
        }
      }

      await connection.commit();
      return { role_id: roleId, role_name, description, privileges };
    } catch (error) {
      await connection.rollback();
      console.error("Error creating role:", error);
      throw new Error(`Failed to create role: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async updateRoles(id, data) {
    const { role_name, description, privilege_ids } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (!role_name || typeof role_name !== "string" || role_name.includes("'")) {
        throw new Error("Invalid role name");
      }
      if (!privilege_ids || !Array.isArray(privilege_ids) || privilege_ids.length === 0) {
        throw new Error("At least one privilege ID is required");
      }

      // Validate privilege IDs
      for (const priv_id of privilege_ids) {
        const [priv] = await connection.query(
          "SELECT 1 FROM privileges WHERE privilege_id = ?",
          [priv_id]
        );
        if (priv.length === 0) throw new Error(`Privilege ID ${priv_id} does not exist`);
      }

      // Get old role name for revoking privileges
      const [oldRole] = await connection.query(
        "SELECT role_name FROM roles WHERE role_id = ?",
        [id]
      );
      if (oldRole.length === 0) throw new Error("Role not found");

      // Get old privileges to revoke
      const [oldPrivileges] = await connection.query(
        "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
        [id]
      );

      // Revoke old privileges
      for (const priv of oldPrivileges) {
        await privilegesModel.revokeMySQLPrivileges(priv.privilege_id, oldRole[0].role_name);
      }

      // Update role in database
      const [rows] = await connection.query(
        "UPDATE roles SET role_name = ?, description = ? WHERE role_id = ?",
        [role_name, description || null, id]
      );
      if (rows.affectedRows === 0) throw new Error("Role not found");

      // Update role-privilege mappings
      await connection.query("DELETE FROM role_table_privileges WHERE role_id = ?", [id]);
      for (const priv_id of privilege_ids) {
        await connection.query(
          "INSERT INTO role_table_privileges (role_id, privilege_id) VALUES (?, ?)",
          [id, priv_id]
        );
      }

      // Create new MySQL role if needed
      const [roleCheck] = await connection.query(
        "SELECT 1 FROM mysql.user WHERE User = ? AND Host = 'localhost'",
        [role_name]
      );
      if (roleCheck.length === 0) {
        await connection.query(`CREATE ROLE ?@'localhost'`, [role_name]);
      }

      // Apply new privileges
      const privileges = await Promise.all(
        privilege_ids.map(async priv_id => {
          const privilege = await privilegesModel.getOnePrivilege(priv_id);
          if (!privilege) throw new Error(`Privilege with ID ${priv_id} not found`);
          return privilege;
        })
      );

      for (const privilege of privileges) {
        for (const table of privilege.tables) {
          await privilegesModel.applyMySQLPrivileges(privilege.privilege_id, role_name, table);
        }
      }

      await connection.commit();
      return {
        updated: rows.affectedRows,
        role_id: String(id),
        role_name,
        description,
        privileges,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error updating role:", error);
      throw new Error(`Failed to update role: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async deleteRoles(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [role] = await connection.query(
        "SELECT role_name FROM roles WHERE role_id = ?",
        [id]
      );
      if (role.length === 0) throw new Error("Role not found");

      const roleName = role[0].role_name;

      // Get privileges to revoke
      const [privileges] = await connection.query(
        "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
        [id]
      );

      // Revoke MySQL privileges
      for (const priv of privileges) {
        await privilegesModel.revokeMySQLPrivileges(priv.privilege_id, roleName);
      }

      // Delete role-privilege mappings and role
      await connection.query("DELETE FROM role_table_privileges WHERE role_id = ?", [id]);
      const [result] = await connection.query("DELETE FROM roles WHERE role_id = ?", [id]);
      if (result.affectedRows === 0) throw new Error("Role not found");

      // Drop MySQL role
      try {
        await connection.query(`DROP ROLE IF EXISTS ?@'localhost'`, [roleName]);
      } catch (dropError) {
        console.warn(`Failed to drop MySQL role ${roleName}: ${dropError.message}`);
      }
      await connection.query("FLUSH PRIVILEGES");

      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting role:", error);
      throw new Error(`Failed to delete role: ${error.message}`);
    } finally {
      connection.release();
    }
  },
};

export default roleModel;