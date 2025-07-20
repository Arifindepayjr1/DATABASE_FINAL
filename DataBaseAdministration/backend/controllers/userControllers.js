import userServices from "../services/userServices.js";

const userController = {
  async getAllUsers(req, res) {
    try {
      const users = await userServices.getAllUsers();
      res.status(200).json({
        status: "SUCCESS",
        data: users,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error fetching users",
      });
    }
  },

  async getOneUser(req, res) {
    try {
      const user = await userServices.getOneUser(req.params.id);
      if (user) {
        res.status(200).json({
          status: "SUCCESS",
          data: user,
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          warning: "User not found",
        });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error fetching user",
      });
    }
  },

  async createUser(req, res) {
    try {
      const user = await userServices.createUser(req.body);
      res.status(201).json({
        status: "SUCCESS",
        data: user,
      });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error creating user",
      });
    }
  },

  async updateUser(req, res) {
    try {
      const user = await userServices.updateUser(req.params.id, req.body);
      res.status(200).json({
        status: "SUCCESS",
        data: user,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error updating user",
      });
    }
  },

  async deleteUser(req, res) {
    try {
      const result = await userServices.deleteUser(req.params.id);
      if (result.affectedRows > 0) {
        res.status(200).json({
          status: "SUCCESS",
          message: "User deleted",
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          warning: "User not found",
        });
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error deleting user",
      });
    }
  },

  async assignRoles(req, res) {
    try {
      const { user_id, role_id } = req.body;
      const result = await userServices.assignRoles(user_id, role_id);
      res.status(200).json({
        status: "SUCCESS",
        data: result,
      });
    } catch (error) {
      console.error("Error assigning roles:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error assigning roles",
      });
    }
  },

  async clearUserRoles(req, res) {
    try {
      const { user_id } = req.body;
      const result = await userServices.clearUserRoles(user_id);
      res.status(200).json({
        status: "SUCCESS",
        data: result,
      });
    } catch (error) {
      console.error("Error clearing user roles:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error clearing user roles",
      });
    }
  },
};

export default userController;