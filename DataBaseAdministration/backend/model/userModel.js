import pool from "../db.js";
import bcrypt from "bcrypt";
import privilegesModel from "./privilegesModel.js";

const userModel = {
  async createUser(data) {
    const { full_name, username, email, password, role_id } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      if (!username || typeof username !== "string" || username.includes("'")) {
        throw new Error("Invalid username");
      }
      if (!password || typeof password !== "string" || password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email");
      }

      // Hash password for application database
      const hashedPassword = await bcrypt.hash(password, 10);

      // Check if user exists in MySQL
      const [existingUser] = await connection.query(
        "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
        [username]
      );
      if (existingUser.length > 0) {
        if (existingUser[0].Host === '%') {
          await connection.query(`RENAME USER ?@'%' TO ?@'localhost'`, [username, username]);
        } else {
          throw new Error("User already exists");
        }
      }

      // Create MySQL user
      await connection.query(`CREATE USER ?@'localhost' IDENTIFIED BY ?`, [username, password]);

      // Assign role and privileges if provided
      if (role_id) {
        const [role] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [role_id]);
        if (role.length === 0) throw new Error("Role not found");
        const roleName = role[0].role_name;

        // Verify role exists in MySQL
        const [existingRole] = await connection.query(
          "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
          [roleName]
        );
        if (existingRole.length === 0) {
          throw new Error(`Role ${roleName} not found in MySQL`);
        }
        if (existingRole[0].Host === '%') {
          await connection.query(`RENAME USER ?@'%' TO ?@'localhost'`, [roleName, roleName]);
        }

        // Ensure role is granted before setting default
        await connection.query(`GRANT ?@'localhost' TO ?@'localhost'`, [roleName, username]);
        await connection.query(`SET DEFAULT ROLE ?@'localhost' TO ?@'localhost'`, [roleName, username]);

        // Fetch and grant role privileges with ALTER
        const [rolePrivileges] = await connection.query(
          "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
          [role_id]
        );
        for (const { privilege_id } of rolePrivileges) {
          const privilege = await privilegesModel.getOnePrivilege(privilege_id);
          for (const table of privilege.tables) {
            const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
            const grantQuery = `GRANT ${actions.join(", ")} ON admindb.\`${table.table_name}\` TO ?@'localhost'`;
            await connection.query(grantQuery, [username]);
          }
        }
      }

      // Insert into users table
      const [result] = await connection.query(
        "INSERT INTO users (full_name, username, email, password_hash, role_id, status) VALUES (?, ?, ?, ?, ?, ?)",
        [full_name || null, username, email || null, hashedPassword, role_id || null, "active"]
      );

      await connection.query("FLUSH PRIVILEGES");
      await connection.commit();
      return { user_id: String(result.insertId), full_name, username, email, role_id: role_id ? String(role_id) : null };
    } catch (error) {
      await connection.rollback();
      console.error("Error creating user:", error);
      throw new Error(`Failed to create user: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async getAllUsers() {
    try {
      const [rows] = await pool.query(`
        SELECT u.user_id, u.full_name, u.username, u.email, u.status, r.role_id, r.role_name
        FROM users u
        LEFT JOIN roles r ON u.role_id = r.role_id
      `);
      return rows.map(row => ({
        user_id: String(row.user_id),
        full_name: row.full_name,
        username: row.username,
        email: row.email,
        status: row.status,
        role_id: row.role_id ? String(row.role_id) : null,
        role_name: row.role_name,
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error(`Failed to fetch users: ${error.message}`);
    }
  },

  async getOneUser(id) {
    const [rows] = await pool.query(
      `
      SELECT u.user_id, u.full_name, u.username, u.email, u.status, r.role_id, r.role_name
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.role_id
      WHERE u.user_id = ?
    `,
      [id]
    );
    if (rows.length === 0) return null;
    return {
      user_id: String(rows[0].user_id),
      full_name: rows[0].full_name,
      username: rows[0].username,
      email: rows[0].email,
      status: rows[0].status,
      role_id: rows[0].role_id ? String(rows[0].role_id) : null,
      role_name: rows[0].role_name,
    };
  },

  async updateUser(id, data) {
    const { full_name, username, email, password, role_id, status } = data;
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Validate inputs
      if (!username || typeof username !== "string" || username.includes("'")) {
        throw new Error("Invalid username");
      }
      if (password && (typeof password !== "string" || password.length < 8)) {
        throw new Error("Password must be at least 8 characters");
      }
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error("Invalid email");
      }
      if (status && !["active", "inactive"].includes(status)) {
        throw new Error("Invalid status");
      }

      // Get existing user
      const [existingUser] = await connection.query(
        "SELECT username, role_id FROM users WHERE user_id = ?",
        [id]
      );
      if (existingUser.length === 0) throw new Error("User not found");

      const oldUsername = existingUser[0].username;
      const oldRoleId = existingUser[0].role_id;

      // Check if username is changing
      if (username !== oldUsername) {
        const [existing] = await connection.query(
          "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
          [username]
        );
        if (existing.length > 0) {
          throw new Error("Username already exists");
        }
      }

      // Handle password update
      let hashedPassword = null;
      if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
        await connection.query(`ALTER USER ?@'localhost' IDENTIFIED BY ?`, [oldUsername, password]);
      }

      // Handle role update
      if (role_id !== oldRoleId) {
        // Revoke old role and privileges
        if (oldRoleId) {
          const [oldRole] = await connection.query(
            "SELECT role_name FROM roles WHERE role_id = ?",
            [oldRoleId]
          );
          if (oldRole.length > 0) {
            try {
              await connection.query(`REVOKE ?@'localhost' FROM ?@'localhost'`, [oldRole[0].role_name, oldUsername]);
            } catch (revokeError) {
              console.warn(`No grants to revoke for role ${oldRole[0].role_name} from user ${oldUsername}`);
            }
            const [oldPrivileges] = await connection.query(
              "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
              [oldRoleId]
            );
            for (const { privilege_id } of oldPrivileges) {
              const privilege = await privilegesModel.getOnePrivilege(privilege_id);
              for (const table of privilege.tables) {
                const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
                const revokeQuery = `REVOKE ${actions.join(", ")} ON admindb.\`${table.table_name}\` FROM ?@'localhost'`;
                try {
                  await connection.query(revokeQuery, [oldUsername]);
                } catch (revokeError) {
                  console.warn(`No grants to revoke for user ${oldUsername} on table ${table.table_name}`);
                }
              }
            }
          }
        }

        // Assign new role
        if (role_id) {
          const [role] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [role_id]);
          if (role.length === 0) throw new Error("Role not found");
          const roleName = role[0].role_name;

          const [existingRole] = await connection.query(
            "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
            [roleName]
          );
          if (existingRole.length === 0) {
            throw new Error(`Role ${roleName} not found in MySQL`);
          }
          if (existingRole[0].Host === '%') {
            await connection.query(`RENAME USER ?@'%' TO ?@'localhost'`, [roleName, roleName]);
          }
          await connection.query(`GRANT ?@'localhost' TO ?@'localhost'`, [roleName, oldUsername]);
          await connection.query(`SET DEFAULT ROLE ?@'localhost' TO ?@'localhost'`, [roleName, oldUsername]);

          const [newPrivileges] = await connection.query(
            "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
            [role_id]
          );
          for (const { privilege_id } of newPrivileges) {
            const privilege = await privilegesModel.getOnePrivilege(privilege_id);
            for (const table of privilege.tables) {
              const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
              const grantQuery = `GRANT ${actions.join(", ")} ON admindb.\`${table.table_name}\` TO ?@'localhost'`;
              await connection.query(grantQuery, [oldUsername]);
            }
          }
        }
      }

      // Rename MySQL user if username changed
      if (username !== oldUsername) {
        await connection.query(`RENAME USER ?@'localhost' TO ?@'localhost'`, [oldUsername, username]);
      }

      // Update users table
      const [result] = await connection.query(
        "UPDATE users SET full_name = ?, username = ?, email = ?, password_hash = COALESCE(?, password_hash), role_id = ?, status = ? WHERE user_id = ?",
        [full_name || null, username, email || null, hashedPassword, role_id || null, status || "active", id]
      );
      if (result.affectedRows === 0) throw new Error("User not found");

      await connection.query("FLUSH PRIVILEGES");
      await connection.commit();
      return {
        user_id: String(id),
        full_name,
        username,
        email,
        role_id: role_id ? String(role_id) : null,
        status,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error updating user:", error);
      throw new Error(`Failed to update user: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async deleteUser(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [user] = await connection.query("SELECT username, role_id FROM users WHERE user_id = ?", [id]);
      if (user.length === 0) throw new Error("User not found");

      const username = user[0].username;
      if (user[0].role_id) {
        const [role] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [user[0].role_id]);
        if (role.length > 0) {
          try {
            await connection.query(`REVOKE ?@'localhost' FROM ?@'localhost'`, [role[0].role_name, username]);
          } catch (revokeError) {
            console.warn(`No grants to revoke for role ${role[0].role_name} from user ${username}`);
          }
          const [privileges] = await connection.query(
            "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
            [user[0].role_id]
          );
          for (const { privilege_id } of privileges) {
            const privilege = await privilegesModel.getOnePrivilege(privilege_id);
            for (const table of privilege.tables) {
              const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
              const revokeQuery = `REVOKE ${actions.join(", ")} ON admindb.\`${table.table_name}\` FROM ?@'localhost'`;
              try {
                await connection.query(revokeQuery, [username]);
              } catch (revokeError) {
                console.warn(`No grants to revoke for user ${username} on table ${table.table_name}`);
              }
            }
          }
        }
      }

      await connection.query("DELETE FROM users WHERE user_id = ?", [id]);
      await connection.query(`DROP USER IF EXISTS ?@'localhost'`, [username]);
      await connection.query(`DROP USER IF EXISTS ?@'%'`, [username]);
      await connection.query("FLUSH PRIVILEGES");

      await connection.commit();
      return { affectedRows: 1 };
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting user:", error);
      throw new Error(`Failed to delete user: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async assignRoles(user_id, role_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [user] = await connection.query("SELECT username, role_id FROM users WHERE user_id = ?", [user_id]);
      if (user.length === 0) throw new Error("User not found");
      const [role] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [role_id]);
      if (role.length === 0) throw new Error("Role not found");

      const username = user[0].username;
      const roleName = role[0].role_name;

      // Check if MySQL user exists
      const [existingUser] = await connection.query(
        "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
        [username]
      );
      if (existingUser.length === 0) {
        throw new Error(`MySQL user ${username} not found`);
      }
      if (existingUser[0].Host === '%') {
        await connection.query(`RENAME USER ?@'%' TO ?@'localhost'`, [username, username]);
      }

      if (user[0].role_id) {
        const [oldRole] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [user[0].role_id]);
        if (oldRole.length > 0) {
          try {
            await connection.query(`REVOKE ?@'localhost' FROM ?@'localhost'`, [oldRole[0].role_name, username]);
          } catch (revokeError) {
            console.warn(`No grants to revoke for role ${oldRole[0].role_name} from user ${username}`);
          }
          const [oldPrivileges] = await connection.query(
            "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
            [user[0].role_id]
          );
          for (const { privilege_id } of oldPrivileges) {
            const privilege = await privilegesModel.getOnePrivilege(privilege_id);
            for (const table of privilege.tables) {
              const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
              const revokeQuery = `REVOKE ${actions.join(", ")} ON admindb.\`${table.table_name}\` FROM ?@'localhost'`;
              try {
                await connection.query(revokeQuery, [username]);
              } catch (revokeError) {
                console.warn(`No grants to revoke for user ${username} on table ${table.table_name}`);
              }
            }
          }
        }
      }

      const [existingRole] = await connection.query(
        "SELECT User, Host FROM mysql.user WHERE User = ? AND Host IN ('localhost', '%')",
        [roleName]
      );
      if (existingRole.length === 0) {
        throw new Error(`Role ${roleName} not found in MySQL`);
      }
      if (existingRole[0].Host === '%') {
        await connection.query(`RENAME USER ?@'%' TO ?@'localhost'`, [roleName, roleName]);
      }
      await connection.query(`GRANT ?@'localhost' TO ?@'localhost'`, [roleName, username]);
      await connection.query(`SET DEFAULT ROLE ?@'localhost' TO ?@'localhost'`, [roleName, username]);
      const [newPrivileges] = await connection.query(
        "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
        [role_id]
      );
      for (const { privilege_id } of newPrivileges) {
        const privilege = await privilegesModel.getOnePrivilege(privilege_id);
        for (const table of privilege.tables) {
          const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
          const grantQuery = `GRANT ${actions.join(", ")} ON admindb.\`${table.table_name}\` TO ?@'localhost'`;
          await connection.query(grantQuery, [username]);
        }
      }

      await connection.query("UPDATE users SET role_id = ? WHERE user_id = ?", [role_id, user_id]);
      await connection.query("FLUSH PRIVILEGES");
      await connection.commit();
      return { user_id: String(user_id), role_id: String(role_id), role_name: roleName };
    } catch (error) {
      await connection.rollback();
      console.error("Error assigning roles:", error);
      throw new Error(`Failed to assign roles: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async clearUserRoles(user_id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const [user] = await connection.query("SELECT username, role_id FROM users WHERE user_id = ?", [user_id]);
      if (user.length === 0) throw new Error("User not found");

      if (user[0].role_id) {
        const [role] = await connection.query("SELECT role_name FROM roles WHERE role_id = ?", [user[0].role_id]);
        if (role.length > 0) {
          try {
            await connection.query(`REVOKE ?@'localhost' FROM ?@'localhost'`, [role[0].role_name, user[0].username]);
          } catch (revokeError) {
            console.warn(`No grants to revoke for role ${role[0].role_name} from user ${user[0].username}`);
          }
          const [privileges] = await connection.query(
            "SELECT privilege_id FROM role_table_privileges WHERE role_id = ?",
            [user[0].role_id]
          );
          for (const { privilege_id } of privileges) {
            const privilege = await privilegesModel.getOnePrivilege(privilege_id);
            for (const table of privilege.tables) {
              const actions = table.actions.includes("ALTER") ? table.actions : [...table.actions, "ALTER"];
              const revokeQuery = `REVOKE ${actions.join(", ")} ON admindb.\`${table.table_name}\` FROM ?@'localhost'`;
              try {
                await connection.query(revokeQuery, [user[0].username]);
              } catch (revokeError) {
                console.warn(`No grants to revoke for user ${user[0].username} on table ${table.table_name}`);
              }
            }
          }
        }
        await connection.query("UPDATE users SET role_id = NULL WHERE user_id = ?", [user_id]);
      }

      await connection.query("FLUSH PRIVILEGES");
      await connection.commit();
      return { user_id: String(user_id), role_id: null };
    } catch (error) {
      await connection.rollback();
      console.error("Error clearing user roles:", error);
      throw new Error(`Failed to clear user roles: ${error.message}`);
    } finally {
      connection.release();
    }
  },
};

export default userModel;