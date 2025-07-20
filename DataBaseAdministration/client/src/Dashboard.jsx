// Dashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

export default function Dashboard() {
  const [stats, setStats] = useState({ users: 0, roles: 0, privileges: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const users = await axios.get("http://localhost:4000/api/users/");
        const roles = await axios.get("http://localhost:4000/api/roles/");
        const privileges = await axios.get("http://localhost:4000/api/privileges/");

        setStats({
          users: users.data.data.length,
          roles: roles.data.data.length,
          privileges: privileges.data.data.length,
        });
      } catch (err) {
        console.error("Error loading dashboard stats", err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="min-h-screen bg-white p-10 admin-font">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-12 text-center">
          Dashboard Overview
        </h1>

        {/* Summary Cards */}
        <div className="grid gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 mb-14">
          <div className="bg-amber-100 border-l-8 border-amber-500 rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600">Total Users</p>
            <h2 className="text-3xl font-bold text-amber-700">{stats.users}</h2>
          </div>
          <div className="bg-blue-100 border-l-8 border-blue-500 rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600">Total Roles</p>
            <h2 className="text-3xl font-bold text-blue-700">{stats.roles}</h2>
          </div>
          <div className="bg-green-100 border-l-8 border-green-500 rounded-xl p-6 shadow-md">
            <p className="text-sm text-gray-600">Total Privileges</p>
            <h2 className="text-3xl font-bold text-green-700">{stats.privileges}</h2>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <Link to="/user" className="bg-white hover:bg-amber-50 border border-gray-200 rounded-xl p-5 shadow transition">
            <h3 className="text-lg font-semibold text-amber-700 mb-1">User Management</h3>
            <p className="text-sm text-gray-500">View and manage all users</p>
          </Link>

          <Link to="/roles" className="bg-white hover:bg-blue-50 border border-gray-200 rounded-xl p-5 shadow transition">
            <h3 className="text-lg font-semibold text-blue-700 mb-1">Roles</h3>
            <p className="text-sm text-gray-500">Assign and edit roles</p>
          </Link>

          <Link to="/privileges" className="bg-white hover:bg-green-50 border border-gray-200 rounded-xl p-5 shadow transition">
            <h3 className="text-lg font-semibold text-green-700 mb-1">Privileges</h3>
            <p className="text-sm text-gray-500">Control permissions & access</p>
          </Link>

          <Link to="/create/user" className="bg-amber-500 text-white rounded-xl p-5 shadow hover:bg-amber-600 transition">
            <h3 className="text-lg font-semibold mb-1">+ Add New User</h3>
            <p className="text-sm">Quickly register new account</p>
          </Link>

          <Link to="/create/roles" className="bg-blue-500 text-white rounded-xl p-5 shadow hover:bg-blue-600 transition">
            <h3 className="text-lg font-semibold mb-1">+ Add Role</h3>
            <p className="text-sm">Define access levels</p>
          </Link>

          <Link to="/create/privileges" className="bg-green-500 text-white rounded-xl p-5 shadow hover:bg-green-600 transition">
            <h3 className="text-lg font-semibold mb-1">+ Add Privilege</h3>
            <p className="text-sm">Configure system controls</p>
          </Link>
        </div>
      </div>
    </div>
  );
}