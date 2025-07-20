import privilegesServices from "../services/privilegesServices.js";

const privilegesController = {
  async getAllPrivileges(req, res) {
    try {
      const result = await privilegesServices.getAllPrivileges();
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },

  async getOnePrivilege(req, res) {
    try {
      const { id } = req.params;
      const result = await privilegesServices.getOnePrivilege(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.message.includes("not found") ? 404 : 500).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },

  async createPrivilege(req, res) {
    try {
      const result = await privilegesServices.createPrivileges(req.body);
      res.status(201).json(result);
    } catch (error) {
      res.status(400).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },

  async updatePrivilege(req, res) {
    try {
      const { id } = req.params;
      const result = await privilegesServices.updatePrivileges(id, req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },

  async deletePrivilege(req, res) {
    try {
      const { id } = req.params;
      const result = await privilegesServices.deletePrivileges(id);
      res.status(200).json(result);
    } catch (error) {
      res.status(500).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },

   async getAllTables(req, res) {
    try {
      const result = await privilegesServices.getAllTables();
      console.log("Controller tables:", result.data); // Debug log
      res.status(200).json(result);
    } catch (error) {
      console.error("Controller error fetching tables:", error);
      res.status(500).json({
        status: "FAILURE",
        error: error.message,
      });
    }
  },
};

export default privilegesController;