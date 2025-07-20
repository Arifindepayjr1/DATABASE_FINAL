import pool from "../db.js";

const adminModel = {
  login: async function(email) {
    console.log("Checking login for email:", email);
  
    const [rows] = await pool.query(
      `SELECT u.user_id, u.full_name, u.username, u.email, u.password_hash, r.role_name
       FROM users u
       JOIN user_roles ur ON u.user_id = ur.user_id
       JOIN roles r ON ur.role_id = r.role_id
       WHERE u.email = ?`,
      [email]
    );
  
    if (rows.length === 0) return null;
  
    const hasAdminRole = rows.some(row => row.role_name === "Admin");
    if (!hasAdminRole) return null;
  
    return rows[0];
  }
  
  
};

export default adminModel;
