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
    <main className="min-h-screen pt-16">
    
    <div className="border shadow-[3px_4px_4px_rgba(0,0,0,0.26)] rounded-lg border-solid border-black p-6 lg:p-8 h-full lg:h-96 flex flex-col">
      {/* <div className="px-3 md:px-6 lg:px-8 py-4 md:py-6">
      <div className="max-w-6xl mx-auto">
      <div className="border border-gray-200 shadow-lg rounded-lg md:rounded-xl p-4 md:p-6"> */}
      <h3 className="font-bold text-lg md:text-xl lg:text-2xl text-center mb-4 md:mb-6 text-gray-800">Complaints Reported by You</h3>

      {/* Spinner while loading */}
      {/* <SpinnerModal visible={loading} /> */}

      {/* Complaint List */}
      {!loading && (
        // <div className="space-y-3 md:space-y-4">
        <div className="flex-1 flex flex-col overflow-hidden">
          {complaints && complaints.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
            <div className="text-center py-8">
            <h2 className="text-lg text-gray-600">No Complaints Found #</h2>
            </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar" style={{
                  scrollbarWidth: 'none',
                  scrollbarColor: 'none',
                }}>
            {complaints &&
            complaints.map((complaint) => (
              <ComplaintsCard
                key={complaint._id}
                complaint={complaint}
                user={user}
                // userType="admin"
                userType={user?.type}
              />
            ))}
            </div>
          )}
        </div>
      )}
    </div>
    </main>
  );
};

export default ReportedComplaints;
// commit