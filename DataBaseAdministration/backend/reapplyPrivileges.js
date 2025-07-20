import pool from "./db.js";
import privilegesModel from "./model/privilegesModel.js";

async function reapplyPrivileges() {
  const privilegeId = "1";
  try {
    const [roles] = await pool.query(
      "SELECT role_name FROM roles r JOIN role_table_privileges rtp ON r.role_id = rtp.role_id WHERE rtp.privilege_id = ?",
      [privilegeId]
    );
    const privilege = await privilegesModel.getOnePrivilege(privilegeId);
    if (!privilege) {
      console.error("Privilege not found");
      return;
    }
    for (const role of roles) {
      for (const table of privilege.tables) {
        await privilegesModel.applyMySQLPrivileges(privilegeId, role.role_name, table);
      }
    }
    console.log("Privileges reapplied successfully");
  } catch (error) {
    console.error("Error reapplying privileges:", error);
  } finally {
    await pool.end();
  }
}

reapplyPrivileges();