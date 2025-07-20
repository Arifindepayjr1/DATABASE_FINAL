import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CreateUser() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role_id, setRoleId] = useState("");
  const [roles, setRoles] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createUserUrl = "http://localhost:4000/api/users/";
  const getRolesUrl = "http://localhost:4000/api/roles/";

  useEffect(() => {
    async function fetchRoles() {
      try {
        const res = await axios.get(getRolesUrl);
        if (res.status === 200) {
          setRoles(res.data.data);
        }
      } catch (error) {
        setError(error.response?.data?.error || "Error fetching roles");
        toast.error(error.response?.data?.error || "Error fetching roles");
        console.error("Error:", error);
      }
    }
    fetchRoles();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!username || !password) {
      toast.warn("Please provide username and password");
      return;
    }
    const payload = { username, password, role_id: role_id || null };
    try {
      const res = await axios.post(createUserUrl, payload);
      if (res.status === 201) {
        toast.success("User created successfully");
        setUsername("");
        setPassword("");
        setRoleId("");
        setTimeout(() => navigate("/user"), 1000);
      } else {
        toast.warn("User creation failed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error creating user";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error:", error);
    }
  }

  return (
    <div className="bg-gradient-to-br from-amber-100 to-yellow-200 min-h-screen py-16 px-6 admin-font flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-700">
          Create New User
        </h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
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
            <label className="block mb-1 font-medium text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            />
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
                  {role.role_name}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition"
          >
            Create User
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreateUser;