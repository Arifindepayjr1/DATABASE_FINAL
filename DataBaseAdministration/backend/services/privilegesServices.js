import privilegesModel from "../model/privilegesModel.js";

const privilegesServices = {
  async getAllPrivileges() {
    try {
      const privileges = await privilegesModel.getAllPrivileges();
      return {
        status: "SUCCESS",
        data: privileges,
      };
    } catch (error) {
      throw new Error(error.message || "Error fetching privileges");
    }
  },

  async getOnePrivilege(id) {
    try {
      const privilege = await privilegesModel.getOnePrivilege(id);
      if (!privilege) {
        throw new Error("Privilege not found");
      }
      return {
        status: "SUCCESS",
        data: privilege,
      };
    } catch (error) {
      throw new Error(error.message || "Error fetching privilege");
    }
  },

  async createPrivileges(data) {
    try {
      const privilege = await privilegesModel.createPrivileges(data);
      return {
        status: "SUCCESS",
        data: privilege,
      };
    } catch (error) {
      throw new Error(error.message || "Error creating privilege");
    }
  },

  async updatePrivileges(id, data) {
    try {
      const privilege = await privilegesModel.updatePrivileges(id, data);
      return {
        status: "SUCCESS",
        data: privilege,
      };
    } catch (error) {
      throw new Error(error.message || "Error updating privilege");
    }
  },

  async deletePrivileges(id) {
    try {
      const result = await privilegesModel.deletePrivileges(id);
      return {
        status: "SUCCESS",
        message: "Privilege deleted",
        data: result,
      };
    } catch (error) {
      throw new Error(error.message || "Error deleting privilege");
    }
  },

 async getAllTables() {
    try {
      const tables = await privilegesModel.getAllTables();
      console.log("Service tables:", tables); // Debug log
      return {
        status: "SUCCESS",
        data: Array.isArray(tables) ? tables : [],
      };
    } catch (error) {
      console.error("Service error fetching tables:", error);
      throw new Error(error.message || "Error fetching tables");
    }
  },
};

export default privilegesServices;