import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CreateRoles() {
  const [role_name, setRoleName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedTable, setSelectedTable] = useState("");
  const [availableTables, setAvailableTables] = useState([]);
  const [privileges, setPrivileges] = useState([]);
  const [selectedPrivileges, setSelectedPrivileges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const createRolesUrl = "http://localhost:4000/api/roles/";
  const getTablesUrl = "http://localhost:4000/api/privileges/tables";
  const getPrivilegesUrl = "http://localhost:4000/api/privileges/";

  useEffect(() => {
    async function fetchData() {
      try {
        const [tablesRes, privilegesRes] = await Promise.all([
          axios.get(getTablesUrl),
          axios.get(getPrivilegesUrl),
        ]);
        console.log("Tables response:", tablesRes.data);
        console.log("Privileges response:", privilegesRes.data);
        if (tablesRes.status === 200) {
          setAvailableTables(
            Array.isArray(tablesRes.data.data) ? tablesRes.data.data.filter(t => t) : []
          );
        }
        if (privilegesRes.status === 200 && Array.isArray(privilegesRes.data.data)) {
          // Transform privileges to have flat tables array
          const transformedPrivileges = privilegesRes.data.data.map(priv => ({
            ...priv,
            tables: Array.isArray(priv.tables)
              ? priv.tables.map(t => t.table_name).filter(Boolean)
              : [],
            actions: Array.isArray(priv.actions) ? priv.actions : [],
          }));
          setPrivileges(transformedPrivileges);
        } else {
          throw new Error("Invalid privileges response");
        }
        setError(null);
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error fetching data";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handlePrivilegeToggle = (privilegeId) => {
    setSelectedPrivileges((prev) =>
      prev.includes(privilegeId)
        ? prev.filter((id) => id !== privilegeId)
        : [...prev, privilegeId]
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (!role_name.trim()) {
      toast.warn("Role name is required");
      return;
    }
    if (selectedPrivileges.length === 0) {
      toast.warn("Please select at least one privilege");
      return;
    }
    const payload = { role_name, description, privilege_ids: selectedPrivileges };
    try {
      const res = await axios.post(createRolesUrl, payload);
      if (res.status === 201) {
        toast.success("Role created successfully");
        setRoleName("");
        setDescription("");
        setSelectedTable("");
        setSelectedPrivileges([]);
        setTimeout(() => navigate("/roles"), 1000);
      } else {
        throw new Error("Role creation failed");
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error creating role";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error creating role:", error);
    }
  }

  const filteredPrivileges = selectedTable
    ? privileges.filter((p) =>
        Array.isArray(p.tables) && p.tables.includes(selectedTable)
      )
    : privileges;

  return (
    <div className="bg-gradient-to-br from-amber-100 to-yellow-200 min-h-screen py-16 px-6 admin-font flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-700">
          Create New Role
        </h2>
        {loading && (
          <div className="text-center text-gray-600 mb-4">Loading...</div>
        )}
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {!loading && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Role Name</label>
              <input
                type="text"
                value={role_name}
                onChange={(e) => setRoleName(e.target.value)}
                placeholder="Enter role name"
                required
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter description"
                rows="4"
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Select Table</label>
              <select
                value={selectedTable}
                onChange={(e) => {
                  setSelectedTable(e.target.value);
                  setSelectedPrivileges([]); // Reset privileges when table changes
                }}
                className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="">All Tables</option>
                {availableTables.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Select Privileges</label>
              {filteredPrivileges.length > 0 ? (
                <div className="space-y-2">
                  {filteredPrivileges.map((privilege) => (
                    <label
                      key={privilege.privilege_id || `priv-${Math.random()}`}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedPrivileges.includes(String(privilege.privilege_id))}
                        onChange={() => handlePrivilegeToggle(String(privilege.privilege_id))}
                        className="mr-2 h-5 w-5 cursor-pointer"
                      />
                      <span>
                        {privilege.privilege_name || "Unnamed Privilege"} (
                        {privilege.tables.length > 0 ? privilege.tables.join(", ") : "None"}: 
                        {privilege.actions.length > 0 ? privilege.actions.join(", ") : "None"})
                      </span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">
                  {selectedTable ? "No privileges available for this table" : "No privileges available"}
                </p>
              )}
            </div>
            <button
              type="submit"
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              Create Role
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default CreateRoles;