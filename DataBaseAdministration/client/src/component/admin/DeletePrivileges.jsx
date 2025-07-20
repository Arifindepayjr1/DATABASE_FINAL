import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function DeletePrivileges() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const deletePrivilegesUrl = `http://localhost:4000/api/privileges/${id}`;

  useEffect(() => {
    async function deletePrivilege() {
      try {
        await axios.delete(deletePrivilegesUrl);
        toast.success("Privilege deleted successfully");
        setTimeout(() => navigate("/privileges"), 1000);
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Failed to delete privilege";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    }
    deletePrivilege();
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading && <p className="text-lg text-gray-600">Deleting privilege...</p>}
      {error && <p className="text-lg text-red-500">{error}</p>}
    </div>
  );
}

export default DeletePrivileges;