import pool from "../db.js";

const privilegesModel = {
  async getAllPrivileges() {
    try {
      const [rows] = await pool.query(`
        SELECT 
          p.privilege_id, 
          p.privilege_name, 
          p.description,
          GROUP_CONCAT(DISTINCT tp.table_name) AS table_names,
          GROUP_CONCAT(tp.actions SEPARATOR '|') AS actions
        FROM privileges p
        LEFT JOIN table_privileges tp ON p.privilege_id = tp.privilege_id
        GROUP BY p.privilege_id
      `);

      return rows.map(row => {
        let tableNames = row.table_names ? row.table_names.split(",").filter(Boolean) : [];
        let actions = [];
        let tables = [];

        if (row.actions) {
          try {
            const actionArrays = row.actions
              .split("|")
              .map(action => {
                try {
                  return JSON.parse(action.replace(/'/g, '"'));
                } catch (err) {
                  console.error(`Error parsing actions JSON for privilege ${row.privilege_id}: ${action}`, err);
                  return [];
                }
              })
              .filter(Boolean);

            actions = actionArrays.flat();
            tables = tableNames.map((table_name, index) => ({
              table_name,
              actions: actionArrays[index] || [],
            }));
          } catch (err) {
            console.error(`Error processing actions for privilege ${row.privilege_id}:`, err);
            actions = [];
            tables = tableNames.map(table_name => ({ table_name, actions: [] }));
          }
        } else {
          tables = tableNames.map(table_name => ({ table_name, actions: [] }));
        }

        return {
          privilege_id: String(row.privilege_id),
          privilege_name: row.privilege_name,
          description: row.description,
          tables,
          actions: [...new Set(actions)],
        };
      });
    } catch (error) {
      console.error("Error fetching privileges:", error);
      throw new Error("Failed to fetch privileges");
    }
  },

  async getOnePrivilege(id) {
    try {
      const [rows] = await pool.query(
        `
        SELECT 
          p.privilege_id, 
          p.privilege_name, 
          p.description,
          GROUP_CONCAT(DISTINCT tp.table_name) AS table_names,
          GROUP_CONCAT(tp.actions SEPARATOR '|') AS actions
        FROM privileges p
        LEFT JOIN table_privileges tp ON p.privilege_id = tp.privilege_id
        WHERE p.privilege_id = ?
        GROUP BY p.privilege_id
      `,
        [id]
      );

      if (rows.length === 0) return null;

      const row = rows[0];
      let tableNames = row.table_names ? row.table_names.split(",").filter(Boolean) : [];
      let actions = [];
      let tables = [];

      if (row.actions) {
        try {
          const actionArrays = row.actions
            .split("|")
            .map(action => {
              try {
                return JSON.parse(action.replace(/'/g, '"'));
              } catch (err) {
                console.error(`Error parsing actions JSON for privilege ${row.privilege_id}: ${action}`, err);
                return [];
              }
            })
            .filter(Boolean);

          actions = actionArrays.flat();
          tables = tableNames.map((table_name, index) => ({
            table_name,
            actions: actionArrays[index] || [],
          }));
        } catch (err) {
          console.error(`Error processing actions for privilege ${row.privilege_id}:`, err);
          actions = [];
          tables = tableNames.map(table_name => ({ table_name, actions: [] }));
        }
      } else {
        tables = tableNames.map(table_name => ({ table_name, actions: [] }));
      }

      return {
        privilege_id: String(row.privilege_id),
        privilege_name: row.privilege_name,
        description: row.description,
        tables,
        actions: [...new Set(actions)],
      };
    } catch (error) {
      console.error("Error fetching privilege:", error);
      throw new Error("Failed to fetch privilege");
    }
  },

  async createPrivileges(data) {
    const { privilege_name, description, tables } = data;
    if (!privilege_name) {
      throw new Error("Privilege name is required");
    }
    if (typeof privilege_name !== "string") {
      throw new Error(`Privilege name must be a string, got ${typeof privilege_name}`);
    }
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      throw new Error("Tables array is required and must not be empty");
    }
    for (const table of tables) {
      if (!table.table_name || typeof table.table_name !== "string") {
        throw new Error("Each table must have a valid table_name (string)");
      }
      if (!Array.isArray(table.actions) || table.actions.length === 0) {
        throw new Error(`Non-empty actions array required for table ${table.table_name}`);
      }
      for (const action of table.actions) {
        if (!["SELECT", "INSERT", "UPDATE", "DELETE", "ALTER"].includes(action)) {
          throw new Error(`Invalid action "${action}" for table ${table.table_name}`);
        }
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [result] = await connection.query(
        "INSERT INTO privileges (privilege_name, description) VALUES (?, ?)",
        [privilege_name, description || null]
      );

      const privilegeId = String(result.insertId);

      for (const table of tables) {
        await connection.query(
          "INSERT INTO table_privileges (privilege_id, table_name, actions, created_at) VALUES (?, ?, ?, NOW())",
          [privilegeId, table.table_name, JSON.stringify(table.actions)]
        );
      }

      await connection.commit();
      return { privilege_id: privilegeId, privilege_name, description, tables };
    } catch (error) {
      await connection.rollback();
      console.error("Error creating privilege:", error);
      throw new Error(`Failed to create privilege: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async applyMySQLPrivileges(privilegeId, roleName, table) {
    // Sanitize roleName
    if (!/^[a-zA-Z0-9_]+$/.test(roleName)) {
      throw new Error("Invalid role name");
    }
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      if (!table.table_name || !Array.isArray(table.actions) || table.actions.length === 0) {
        throw new Error("Invalid table or actions");
      }

      const [roleCheck] = await connection.query(
        "SELECT 1 FROM mysql.user WHERE User = ? AND Host = 'localhost'",
        [roleName]
      );
      if (roleCheck.length === 0) {
        await connection.query(`CREATE ROLE IF NOT EXISTS \`${roleName}\`@'localhost'`);
      }

      const validActions = table.actions.filter(a =>
        ["SELECT", "INSERT", "UPDATE", "DELETE", "ALTER"].includes(a)
      );
      if (validActions.length > 0) {
        const grantQuery = `GRANT ${validActions.join(", ")} ON admindb.\`${table.table_name}\` TO \`${roleName}\`@'localhost'`;
        await connection.query(grantQuery);
      }

      await connection.query("FLUSH PRIVILEGES");
      await connection.commit();
    } catch (error) {
      await connection.rollback();
      console.error("Error applying MySQL privileges:", error);
      throw new Error(`Failed to apply MySQL privileges: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async updatePrivileges(id, data) {
    const { privilege_name, description, tables } = data;
    if (!privilege_name) {
      throw new Error("Privilege name is required");
    }
    if (typeof privilege_name !== "string") {
      throw new Error(`Privilege name must be a string, got ${typeof privilege_name}`);
    }
    if (!tables || !Array.isArray(tables) || tables.length === 0) {
      throw new Error("Tables array is required and must not be empty");
    }
    for (const table of tables) {
      if (!table.table_name || typeof table.table_name !== "string") {
        throw new Error("Each table must have a valid table_name (string)");
      }
      if (!Array.isArray(table.actions) || table.actions.length === 0) {
        throw new Error(`Non-empty actions array required for table ${table.table_name}`);
      }
      for (const action of table.actions) {
        if (!["SELECT", "INSERT", "UPDATE", "DELETE", "ALTER"].includes(action)) {
          throw new Error(`Invalid action "${action}" for table ${table.table_name}`);
        }
      }
    }

    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [rows] = await connection.query(
        "UPDATE privileges SET privilege_name = ?, description = ? WHERE privilege_id = ?",
        [privilege_name, description || null, id]
      );

      await connection.query("DELETE FROM table_privileges WHERE privilege_id = ?", [id]);

      for (const table of tables) {
        await connection.query(
          "INSERT INTO table_privileges (privilege_id, table_name, actions, created_at) VALUES (?, ?, ?, NOW())",
          [id, table.table_name, JSON.stringify(table.actions)]
        );
      }

      await connection.commit();

      // Reapply MySQL privileges for all roles using this privilege
      const [roles] = await connection.query(
        "SELECT role_name FROM roles r JOIN role_table_privileges rtp ON r.role_id = rtp.role_id WHERE rtp.privilege_id = ?",
        [id]
      );
      for (const role of roles) {
        for (const table of tables) {
          await privilegesModel.applyMySQLPrivileges(id, role.role_name, table);
        }
      }

      return {
        updated: rows.affectedRows,
        privilege_id: String(id),
        privilege_name,
        description,
        tables,
      };
    } catch (error) {
      await connection.rollback();
      console.error("Error updating privilege:", error);
      throw new Error(`Failed to update privilege: ${error.message}`);
    } finally {
      connection.release();
    }
  },

  async deletePrivileges(id) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const [privilege] = await connection.query(
        "SELECT privilege_name FROM privileges WHERE privilege_id = ?",
        [id]
      );
      if (privilege.length === 0) throw new Error("Privilege not found");

      await privilegesModel.revokeMySQLPrivileges(id, privilege[0].privilege_name);

      await connection.query("DELETE FROM table_privileges WHERE privilege_id = ?", [id]);
      const [result] = await connection.query("DELETE FROM privileges WHERE privilege_id = ?", [id]);

      await connection.commit();
      return { affectedRows: result.affectedRows };
    } catch (error) {
      await connection.rollback();
      console.error("Error deleting privilege:", error);
      throw new Error(`Failed to delete privilege: ${error.message}`);
    } finally {
      connection.release();
    }
  },

 async revokeMySQLPrivileges(privilegeId, roleName) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [tables] = await connection.query(
      "SELECT table_name, actions FROM table_privileges WHERE privilege_id = ?",
      [privilegeId]
    );
    if (!tables.length) {
      throw new Error("No tables found for this privilege");
    }
    if (!roleName || typeof roleName !== "string") {
      throw new Error("Invalid role name");
    }

    for (const table of tables) {
      let actions = [];
      try {
        if (typeof table.actions === "string") {
          const cleanedActions = table.actions.replace(/'/g, '"');
          actions = JSON.parse(cleanedActions);
        } else {
          actions = table.actions || [];
        }
      } catch (err) {
        console.error(`Error parsing actions for privilege ${privilegeId}, table ${table.table_name}: ${table.actions}`, err);
        actions = [];
      }

      if (actions.length > 0) {
        const validActions = actions.filter(a =>
          ["SELECT", "INSERT", "UPDATE", "DELETE", "ALTER"].includes(a)
        );
        if (validActions.length === 0) continue;

        // Check if grant exists before revoking
        const [grantCheck] = await connection.query(
          `SELECT 1 FROM mysql.tables_priv WHERE User = ? AND Host = 'localhost' AND Db = 'admindb' AND Table_name = ?`,
          [roleName, table.table_name]
        );

        if (grantCheck.length > 0) {
          const revokeQuery = `REVOKE ${validActions.join(", ")} ON admindb.\`${table.table_name}\` FROM \`${roleName}\`@'localhost'`;
          await connection.query(revokeQuery);
        } else {
          console.warn(`No grants found for ${roleName}@localhost on table ${table.table_name}`);
        }
      }
    }
    await connection.query("FLUSH PRIVILEGES");
    await connection.commit();
  } catch (error) {
    await connection.rollback();
    console.error("Error revoking MySQL privileges:", error);
    throw new Error(`Failed to revoke MySQL privileges: ${error.message}`);
  } finally {
    connection.release();
  }
},async getAllTables() {
  try {
    const [rows] = await pool.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'admindb' AND table_name IS NOT NULL"
    );
    console.log(rows);
    const tables = rows.map(row => row.TABLE_NAME)
    console.log("Tables gaming : " + tables);
    console.log("Fetched tables:", tables); // Debug log
    return tables;
  } catch (error) {
    console.error("Error fetching tables:", error);
    throw new Error("Failed to fetch tables");
  }
}



    
}

export default privilegesModel;