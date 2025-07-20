import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useParams, useNavigate } from "react-router-dom";

function UpdateUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [full_name, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("active");
  const [role_id, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getUserUrl = `http://localhost:4000/api/users/${id}`;
  const updateUserUrl = `http://localhost:4000/api/users/${id}`;
  const getRolesUrl = "http://localhost:4000/api/roles/";

  useEffect(() => {
    async function fetchData() {
      try {
        const [userRes, rolesRes] = await Promise.all([
          axios.get(getUserUrl),
          axios.get(getRolesUrl),
        ]);
        if (userRes.status === 200) {
          const { full_name, username, email, role_id, status } = userRes.data.data;
          setFullName(full_name || "");
          setUsername(username || "");
          setEmail(email || "");
          setRoleId(role_id || "");
          setStatus(status || "active");
        } else {
          throw new Error("Failed to fetch user");
        }
        if (rolesRes.status === 200 && Array.isArray(rolesRes.data.data)) {
          setRoles(rolesRes.data.data);
        } else {
          throw new Error("Invalid roles response");
        }
        setError(null);
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error fetching user or roles";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username) {
      toast.warn("Username is required");
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.warn("Invalid email format");
      return;
    }
    if (password && password.length < 8) {
      toast.warn("Password must be at least 8 characters");
      return;
    }
    const payload = {
      full_name: full_name || null,
      username,
      email: email || null,
      password: password || undefined,
      role_id: role_id || null,
      status,
    };
    try {
      setLoading(true);
      const res = await axios.put(updateUserUrl, payload);
      if (res.status === 200) {
        toast.success("User updated successfully");
        setTimeout(() => navigate("/user"), 1000);
      } else {
        throw new Error("User update failed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error updating user";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error updating user:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-100 to-yellow-200 min-h-screen py-16 px-6 admin-font flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-700">
          Edit User
        </h2>
        {loading && (
          <div className="text-center text-gray-600 mb-4">Loading...</div>
        )}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Full Name (optional)</label>
              <input
                type="text"
                value={full_name}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter full name"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Email (optional)</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Password (optional)</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Assign Role</label>
              <select
                value={role_id}
                onChange={(e) => setRoleId(e.target.value)}
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">No Role</option>
                {roles.map((role) => (
                  <option key={role.role_id} value={role.role_id}>
                    {role.role_name} ({role.description || "No description"})
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Update User
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default UpdateUser;