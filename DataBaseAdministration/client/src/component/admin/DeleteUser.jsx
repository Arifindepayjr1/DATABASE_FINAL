import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

function DeleteUser() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const deleteUserUrl = `http://localhost:4000/api/users/${id}`;

  useEffect(() => {
    async function deleteUser() {
      try {
        const res = await axios.delete(deleteUserUrl);
        if (res.status === 200) {
          toast.success("User deleted successfully");
          setTimeout(() => navigate("/user"), 1000);
        } else {
          throw new Error("Failed to delete user");
        }
      } catch (error) {
        const errorMsg = error.response?.data?.error || "Error deleting user";
        setError(errorMsg);
        toast.error(errorMsg);
        console.error("Error deleting user:", error);
      } finally {
        setLoading(false);
      }
    }
    deleteUser();
  }, [id, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {loading && <p className="text-lg text-gray-600">Deleting user...</p>}
      {error && <p className="text-lg text-red-500">{error}</p>}
    </div>
  );
}

export default DeleteUser;