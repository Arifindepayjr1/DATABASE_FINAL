import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function DeleteRoles() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const deleteRoleUrl = `http://localhost:4000/api/roles/${id}`;

  useEffect(() => {
    async function deleteRole() {
      try {
        const res = await axios.delete(deleteRoleUrl);
        if (res.status === 200) {
          toast.success("Role deleted successfully");
          setTimeout(() => navigate("/roles"), 1000);
        } else {
          throw new Error("Failed to delete role");
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error deleting role";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error deleting role:", error);
      } finally {
        setLoading(false);
      }
    }
    deleteRole();
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading && <p className="text-lg text-gray-600">Deleting role...</p>}
      {error && <p className="text-lg text-red-500">{error}</p>}
    </div>
  );
}

export default DeleteRoles;