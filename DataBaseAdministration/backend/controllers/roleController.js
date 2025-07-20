import roleServices from "../services/roleServices.js";

const roleController = {
  async getAllRoles(req, res) {
    try {
      const allRoles = await roleServices.getAllRoles();
      res.status(200).json({
        status: "SUCCESS",
        data: allRoles,
      });
    } catch (error) {
      console.error("Error fetching roles:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error fetching roles",
      });
    }
  },

  async getOneRoles(req, res) {
    try {
      const oneRole = await roleServices.getOneRole(req.params.id);
      if (oneRole) {
        res.status(200).json({
          status: "SUCCESS",
          data: oneRole,
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          warning: "Role not found",
        });
      }
    } catch (error) {
      console.error("Error fetching role:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error fetching role",
      });
    }
  },

  async createRoles(req, res) {
    try {
      console.log("Request body for createRoles:", JSON.stringify(req.body, null, 2));
      const role = await roleServices.createRole(req.body);
      res.status(201).json({
        status: "SUCCESS",
        data: role,
      });
    } catch (error) {
      console.error("Error creating role:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error creating role",
      });
    }
  },

  async updateRoles(req, res) {
    try {
      console.log("Request body for updateRoles:", JSON.stringify(req.body, null, 2));
      const role = await roleServices.updateRole(req.params.id, req.body);
      if (role.updated) {
        res.status(200).json({
          status: "SUCCESS",
          data: role,
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          warning: "Role not found",
        });
      }
    } catch (error) {
      console.error("Error updating role:", error);
      res.status(400).json({
        status: "FAILURE",
        error: error.message || "Error updating role",
      });
    }
  },

  async deleteRoles(req, res) {
    try {
      const result = await roleServices.deleteRole(req.params.id);
      if (result.affectedRows > 0) {
        res.status(200).json({
          status: "SUCCESS",
          message: "Role deleted",
        });
      } else {
        res.status(404).json({
          status: "FAILURE",
          warning: "Role not found",
        });
      }
    } catch (error) {
      console.error("Error deleting role:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message || "Error deleting role",
      });
    }
  },
};

export default roleController;