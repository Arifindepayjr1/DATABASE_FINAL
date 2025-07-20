import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function RolesList() {
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const getRolesUrl = "http://localhost:4000/api/roles/";

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get(getRolesUrl);
        if (res.status === 200 && Array.isArray(res.data.data)) {
          setRoles(res.data.data);
          setError(null);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error fetching roles";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error fetching roles:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200 py-12 px-6 admin-font">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-amber-700 mb-10">
          Roles Management
        </h1>
        <Link to="/create/roles">
          <button className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
            Create New Role
          </button>
        </Link>

        {loading && (
          <div className="text-center text-gray-600 mb-6">
            <h2 className="text-xl font-medium">Loading...</h2>
          </div>
        )}
        {error && (
          <div className="text-center text-red-500 mb-6">
            <h2 className="text-xl font-medium">{error}</h2>
          </div>
        )}

        {!loading && !error && roles.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {roles.map((role) => (
              <div
                key={role.role_id || `role-${Math.random()}`} // Fallback key
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg text-gray-600 mb-1 font-medium">
                  ID: {role.role_id || "N/A"}
                </h2>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  {role.role_name || "Unnamed Role"}
                </h3>
                <p className="text-gray-700 mb-2 text-sm">
                  Description: {role.description || "No description"}
                </p>
                <p className="text-gray-700 mb-4 text-sm">
                  Privileges:{" "}
                  {role.privileges && role.privileges.length > 0
                    ? role.privileges
                        .map((p) => p.privilege_name || "Unknown")
                        .join(", ")
                    : "None"}
                </p>
                <div className="flex gap-3">
                  <Link to={`/roles/${role.role_id}`}>
                    <button
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!role.role_id}
                    >
                      Edit
                    </button>
                  </Link>
                  <Link to={`/delete/roles/${role.role_id}`}>
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!role.role_id}
                    >
                      Delete
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading &&
          !error && (
            <div className="text-center text-gray-600 mt-6">
              <h2 className="text-xl font-medium">No Roles Listed</h2>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default RolesList;