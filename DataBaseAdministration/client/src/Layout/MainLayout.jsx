import { Outlet, Link } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import './admin.css';

function MainLayout() {
  return (
    <div className="min-h-screen flex admin-font bg-gray-100">
      {/* Sidebar Navigation */}
      <aside className="w-64 bg-amber-600 text-white p-6 space-y-6 flex flex-col shadow-lg">
        <div className="text-2xl font-extrabold tracking-wide mb-8">
          <Link to="/">Blog Admin</Link>
        </div>
        <nav className="flex flex-col gap-3 text-sm font-medium">
          <Link to="/user" className="nav-link">Users</Link>
          <Link to="/create/user" className="nav-link">Add User</Link>
          <Link to="/privileges" className="nav-link">Privileges</Link>
          <Link to="/create/privileges" className="nav-link">Add Privilege</Link>
          <Link to="/roles" className="nav-link">Roles</Link>
          <Link to="/create/roles" className="nav-link">Add Role</Link>
          <Link to="/backup" className="nav-link"> Back Up </Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>

      <ToastContainer />
    </div>
  );
}

export default MainLayout;
