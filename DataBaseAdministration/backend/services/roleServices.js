import roleModel from "../model/roleModel.js";

const roleServices = {
  getAllRoles: function () {
    return roleModel.getAllRoles();
  },
  getOneRole: function (id) {
    return roleModel.getOneRoles(id);
  },
  createRole: function (data) {
    return roleModel.createRoles(data);
  },
  updateRole: function (id, data) {
    return roleModel.updateRoles(id, data);
  },
  deleteRole: function (id) {
    return roleModel.deleteRoles(id);
  },
};

export default roleServices;