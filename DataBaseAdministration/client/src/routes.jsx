import { createBrowserRouter } from "react-router-dom";
import MainLayout from "./Layout/MainLayout";
import Dashboard from "./Dashboard";
import UserList from "./component/admin/UserList";
import CreateUser from "./component/admin/CreateUser";
import UpdateUser from "./component/admin/UpdateUser";
import DeleteUser from "./component/admin/DeleteUser";
import PrivilegesList from "./component/admin/PrivilegesList";
import CreatePrivileges from "./component/admin/CreatePrivileges";
import EditPrivileges from "./component/admin/EditPrivilege";
import DeletePrivileges from "./component/admin/DeletePrivileges";
import RolesList from "./component/admin/RolesList";
import CreateRoles from "./component/admin/CreateRoles";
import UpdateRoles from "./component/admin/UpdateRoles";
import DeleteRoles from "./component/admin/DeleteRoles";
import AuthWrapper from "./component/admin/AuthWrapper";
import Backup from "../../backup/Backup";
import Login from "./component/admin/Login";

const router = createBrowserRouter([
  { path: "/login", element: <Login /> },
  {
    path: "/",
    element: <AuthWrapper />,
    children: [
      {
        element: <MainLayout />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "user", element: <UserList /> },
          { path: "create/user", element: <CreateUser /> },
          { path: "user/:id", element: <UpdateUser /> },
          { path: "delete/user/:id", element: <DeleteUser /> },
          { path: "privileges", element: <PrivilegesList /> },
          { path: "create/privileges", element: <CreatePrivileges /> },
          { path: "privileges/edit/:id", element: <EditPrivileges /> }, // Updated route
          { path: "privileges/delete/:id", element: <DeletePrivileges /> }, // Updated route
          { path: "roles", element: <RolesList /> },
          { path: "create/roles", element: <CreateRoles /> },
          { path: "roles/:id", element: <UpdateRoles /> },
          { path: "delete/roles/:id", element: <DeleteRoles /> },
          { path: "backup" , element: <Backup/>}
        ],
      },
    ],
  },
]);

export default router;