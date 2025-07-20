import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

function CreatePrivileges() {
  const [privilege_name, setPrivilegeName] = useState("");
  const [description, setDescription] = useState("");
  const [tables, setTables] = useState([]);
  const [availableTables, setAvailableTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState("");
  const [actions, setActions] = useState([]);
  const [existingPrivileges, setExistingPrivileges] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const createPrivilegesUrl = "http://localhost:4000/api/privileges/";
  const getTablesUrl = "http://localhost:4000/api/privileges/tables";
  const getPrivilegesUrl = "http://localhost:4000/api/privileges/";
  const possibleActions = ["SELECT", "INSERT", "UPDATE", "DELETE", "ALTER"];

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [tablesRes, privilegesRes] = await Promise.all([
          axios.get(getTablesUrl),
          axios.get(getPrivilegesUrl),
        ]);
        setAvailableTables(tablesRes.data.data || []);
        setExistingPrivileges(privilegesRes.data.data || []);
        setError(null);
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error fetching data";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    setActions([]);
  }, [selectedTable]);

  const handleAddTable = () => {
    if (selectedTable && actions.length > 0) {
      if (tables.some((t) => t.table_name === selectedTable)) {
        toast.warn("Table already added");
        return;
      }
      setTables([...tables, { table_name: selectedTable, actions }]);
      setSelectedTable("");
      setActions([]);
    } else {
      toast.warn("Please select a table and at least one action");
    }
  };

  const handleRemoveTable = (index) => {
    setTables(tables.filter((_, i) => i !== index));
  };

  const handleActionToggle = (action) => {
    setActions((prev) =>
      prev.includes(action) ? prev.filter((a) => a !== action) : [...prev, action]
    );
  };

  async function handleSubmit(e) {
    e.preventDefault();
    if (tables.length === 0) {
      toast.warn("Please add at least one table with actions");
      return;
    }
    const payload = { privilege_name, description, tables };
    setLoading(true);
    try {
      const res = await axios.post(createPrivilegesUrl, payload);
      toast.success("Privilege created successfully");
      setPrivilegeName("");
      setDescription("");
      setTables([]);
      setTimeout(() => navigate("/privileges"), 1000);
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Error creating privilege";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  }

  const filteredPrivileges = existingPrivileges.filter((p) =>
    p.tables.some((t) => t.table_name === selectedTable)
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200 py-16 px-6 flex items-center justify-center">
      <div className="bg-white p-10 rounded-2xl shadow-md w-full max-w-xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-amber-700">
          Create New Privilege
        </h2>
        {error && <div className="text-red-500 mb-4 text-center">{error}</div>}
        {loading && <div className="text-center text-gray-600 mb-4">Loading...</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">Privilege Name</label>
            <input
              type="text"
              value={privilege_name}
              onChange={(e) => setPrivilegeName(e.target.value)}
              placeholder="Enter privilege name"
              required
              disabled={loading}
              className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              rows="4"
              required
              disabled={loading}
              className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            ></textarea>
          </div>
          <div>
            <label className="block mb-1 font-medium text-gray-700">Select Table</label>
            <select
              value={selectedTable}
              onChange={(e) => setSelectedTable(e.target.value)}
              disabled={loading}
              className="w-full border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              <option value="">Select a table</option>
              {availableTables.map((table) => (
                <option key={table} value={table}>
                  {table}
                </option>
              ))}
            </select>
          </div>
          {selectedTable && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">
                Existing Privileges for {selectedTable}
              </h3>
              {filteredPrivileges.length > 0 ? (
                <ul className="space-y-2">
                  {filteredPrivileges.map((p) => (
                    <li key={p.privilege_id}>
                      {p.privilege_name}: {p.actions.join(", ")}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No privileges for this table</p>
              )}
            </div>
          )}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Actions</label>
            <div className="flex flex-wrap gap-4">
              {possibleActions.map((action) => (
                <label key={action} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={actions.includes(action)}
                    onChange={() => handleActionToggle(action)}
                    disabled={loading}
                    className="mr-2"
                  />
                  {action}
                </label>
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={handleAddTable}
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 rounded-lg mb-4 disabled:opacity-50"
          >
            Add Table and Actions
          </button>
          {tables.length > 0 && (
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Selected Tables and Actions</h3>
              <ul className="space-y-2">
                {tables.map((table, index) => (
                  <li key={index} className="flex justify-between items-center">
                    <span>
                      {table.table_name}: {table.actions.join(", ")}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTable(index)}
                      disabled={loading}
                      className="text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            Create Privilege
          </button>
        </form>
      </div>
    </div>
  );
}

export default CreatePrivileges;