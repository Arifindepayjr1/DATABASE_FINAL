import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

function PrivilegesList() {
  const [privileges, setPrivileges] = useState([]);
  const [tables, setTables] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTable, setSelectedTable] = useState("");
  const getPrivilegesUrl = "http://localhost:4000/api/privileges/";
  const getTablesUrl = "http://localhost:4000/api/privileges/tables";

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const [privilegesRes, tablesRes] = await Promise.all([
          axios.get(getPrivilegesUrl),
          axios.get(getTablesUrl),
        ]);
        console.log("Privileges response:", privilegesRes.data); // Debug log
        console.log("Tables response:", tablesRes.data); // Debug log
        setPrivileges(privilegesRes.data.data || []);
        setTables(tablesRes.data.data || []);
        setError(null);
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error fetching privileges or tables";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const filteredPrivileges = selectedTable
    ? privileges.filter((p) => p.tables.some((t) => t.table_name === selectedTable))
    : privileges;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-amber-700 mb-10">
          Privileges Management
        </h1>
        <Link to="/create/privileges">
          <button className="mb-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg">
            Create New Privilege
          </button>
        </Link>

        <div className="mb-6">
          <label className="block mb-2 font-medium text-gray-700">Filter by Table</label>
          <select
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full max-w-xs border border-amber-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
          >
            <option value="">All Tables</option>
            {tables.map((table, index) => (
              <option key={table || index} value={table}>
                {table}
              </option>
            ))}
          </select>
        </div>

        {loading && <div className="text-center text-gray-600 mb-6">Loading...</div>}
        {error && <div className="text-center text-red-500 mb-6">{error}</div>}

        {filteredPrivileges.length !== 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {filteredPrivileges.map((privilege) => (
              <div
                key={privilege.privilege_id}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h2 className="text-lg text-gray-600 mb-1 font-medium">
                  ID: {privilege.privilege_id}
                </h2>
                <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                  {privilege.privilege_name}
                </h3>
                <p className="text-gray-700 mb-2 text-sm">
                  Description: {privilege.description || "None"}
                </p>
                <p className="text-gray-700 mb-2 text-sm">
                  Tables and Actions:
                </p>
                <ul className="text-gray-700 mb-4 text-sm list-disc list-inside">
                  {privilege.tables.map((table, index) => (
                    <li key={`${table.table_name}-${index}`}>
                      {table.table_name}: {table.actions.join(", ") || "None"}
                    </li>
                  ))}
                </ul>
                <div className="flex gap-3">
                  <Link to={`/privileges/edit/${privilege.privilege_id}`}>
                    <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">
                      Edit
                    </button>
                  </Link>
                  <Link to={`/privileges/delete/${privilege.privilege_id}`}>
                    <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition">
                      Delete
                    </button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && !error && (
            <div className="text-center text-gray-600 mt-6">
              <h2 className="text-xl font-medium">No Privileges Listed</h2>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default PrivilegesList;