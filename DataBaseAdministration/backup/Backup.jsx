import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

function Backup() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const backupUrl = 'http://localhost:4000/api/backup/create';
  const listBackupsUrl = 'http://localhost:4000/api/backup/list';
  const restoreUrl = 'http://localhost:4000/api/backup/restore';

  // Fetch available backups on mount
  useEffect(() => {
    async function fetchBackups() {
      try {
        setLoading(true);
        const res = await axios.get(listBackupsUrl);
        if (res.status === 200 && Array.isArray(res.data.data)) {
          setBackups(res.data.data);
          setError(null);
        } else {
          throw new Error('Invalid backups response');
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || 'Error fetching backups';
        setError(errorMsg);
        toast.error(errorMsg);
        console.error('Error fetching backups:', error);
      } finally {
        setLoading(false);
      }
    }
    fetchBackups();
  }, []);

  // Handle backup creation
  const handleCreateBackup = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(backupUrl);
      if (res.status === 200) {
        toast.success(res.data.message);
        // Refresh backups list
        const backupRes = await axios.get(listBackupsUrl);
        if (backupRes.status === 200 && Array.isArray(backupRes.data.data)) {
          setBackups(backupRes.data.data);
        }
      } else {
        throw new Error('Backup creation failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error creating backup';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error creating backup:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle backup restoration
  const handleRestoreBackup = async (backupFile) => {
    if (!window.confirm(`Are you sure you want to restore from ${backupFile}? This will overwrite the current database!`)) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await axios.post(restoreUrl, { backupFile });
      if (res.status === 200) {
        toast.success(res.data.message);
      } else {
        throw new Error('Backup restoration failed');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.error || 'Error restoring backup';
      setError(errorMsg);
      toast.error(errorMsg);
      console.error('Error restoring backup:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-100 to-yellow-200 py-12 px-6 admin-font">
      <div className="max-w-5xl mx-auto bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-amber-700 mb-10">
          Database Backup & Restore
        </h1>
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
        <div className="flex justify-center mb-8">
          <button
            onClick={handleCreateBackup}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-6 rounded-lg text-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            Create Backup
          </button>
        </div>
        {backups.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-6">
            {backups.map((backup) => (
              <div
                key={backup}
                className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 shadow-sm hover:shadow-md transition"
              >
                <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                  {backup}
                </h3>
                <button
                  onClick={() => handleRestoreBackup(backup)}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-md hover:bg-yellow-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={loading}
                >
                  Restore
                </button>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="text-center text-gray-600 mt-6">
              <h2 className="text-xl font-medium">No Backups Available</h2>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default Backup;