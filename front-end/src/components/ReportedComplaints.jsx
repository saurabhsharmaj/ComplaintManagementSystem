import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintsCard from "./ComplaintsCard";
import { API_BASE_URL } from "@/config";
import SpinnerModal from "./SpinnerModal"; // ✅ Use your modal spinner component

const ReportedComplaints = () => {
  const [complaints, setComplaints] = useState(null);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const handleGetComplaints = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Unauthorized");
      }

      const newUser = await res.json();
      setUser(newUser);

      if (!newUser || newUser.type !== "citizen") {
        navigate("/citizen-login");
        return;
      }

      const response = await fetch(`${API_BASE_URL}/complaints/user/${userId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const data = await response.json();
      setComplaints(data);
    } catch (error) {
      console.error("Error fetching data:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) {
      navigate("/citizen-login");
      return;
    }
    if (token && userId) {
      handleGetComplaints();
    }
  }, [token, userId]);

  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
  };

  return (
    <div className="lg:border lg:shadow-[3px_4px_4px_rgba(0,0,0,0.26)] rounded-lg lg:border-solid lg:border-black w-full flex flex-col items-center lg:h-[28rem] py-2">
      <h3 className="font-bold my-2">Complaints Reported by You</h3>

      {/* Spinner while loading */}
      <SpinnerModal visible={loading} />

      {/* Complaint List */}
      {!loading && (
        <div className="container px-4 overflow-y-auto">
          {complaints && complaints.length === 0 ? (
            <h2>No Complaints Found #</h2>
          ) : (
            complaints &&
            complaints.map((complaint) => (
              <ComplaintsCard
                key={complaint._id}
                complaint={complaint}
                user={user}
                // userType="admin"
                userType={user?.type}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ReportedComplaints;
