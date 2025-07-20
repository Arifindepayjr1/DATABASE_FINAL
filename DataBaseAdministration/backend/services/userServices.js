import userModel from "../model/userModel.js";

const userServices = {
  async getAllUsers() {
    return userModel.getAllUsers();
  },

  async createUser(data) {
    const { full_name, username, email, password, role_id } = data;
    return userModel.createUser({ full_name, username, email, password, role_id });
  },

  async getOneUser(id) {
    return userModel.getOneUser(id);
  },

  async updateUser(id, data) {
    const { full_name, username, email, password, role_id, status } = data;
    return userModel.updateUser(id, { full_name, username, email, password, role_id, status });
  },

  async deleteUser(id) {
    return userModel.deleteUser(id);
  },

  async assignRoles(user_id, role_id) {
    return userModel.assignRoles(user_id, role_id);
  },

  async clearUserRoles(user_id) {
    return userModel.clearUserRoles(user_id);
  },
};

export default userServices;