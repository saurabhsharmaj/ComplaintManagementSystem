import { RingLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import ComplaintsCard from "../components/ComplaintsCard";

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [Complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [SpinnerVisible, setSpinnerVisible] = useState(false);
  const [inProgress, setInProgress] = useState(0);
  const [solved, setSolved] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [uniqueReasons, setUniqueReasons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/official-login");
      return;
    }

    fetch(`${API_BASE_URL}/user/${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((user) => {
        if (user?.type !== "admin") {
          navigate("/citizen-dashboard");
        } else {
          fetchComplaints(token).then(handleComplaintsUpdate);
          fetchUsers(token).then(setUsers);
        }
      })
      .catch((err) => {
        console.error("User fetch error:", err);
        navigate("/official-login");
      });

    fetch(`${API_BASE_URL}/complaints/status-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setInProgress(res.inProgress || 0);
        setSolved(res.solved || 0);
        setRejected(res.rejected || 0);
      })
      .catch((err) => console.error("Summary fetch error:", err));
  }, []);

  useEffect(() => {
    let complaints = [...Complaints];

    if (selectedStatus) {
      complaints = complaints.filter(
        (c) => c.status?.toLowerCase() === selectedStatus
      );
    }

    if (selectedReason) {
      complaints = complaints.filter((c) => c.reason === selectedReason);
    }

    setFilteredComplaints(complaints);
  }, [selectedStatus, selectedReason, Complaints]);

  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
    setFilteredComplaints(updatedComplaints);
    const reasons = [
      ...new Set(
        updatedComplaints.map((c) => c.reason?.trim()).filter(Boolean)
      ),
    ];
    setUniqueReasons(reasons);
  };

  return (
    <>
      <SpinnerModal visible={SpinnerVisible} />
      <Navbar />

      <div className="container px-4 py-4 overflow-y-auto">
        {/* Status Summary */}
        <div className="flex justify-center sm:justify-between gap-1 mb-6 px-2">
          {[
            { label: "InProgress", value: "in-progress", color: "yellow" },
            { label: "Solved", value: "solved", color: "green" },
            { label: "Rejected", value: "rejected", color: "red" },
          ].map((status) => {
            const isActive = selectedStatus === status.value;
            const bgColor = isActive
              ? `bg-${status.color}-300`
              : `bg-${status.color}-100`;
            const textColor = `text-${status.color}-800`;
            const hoverColor = `hover:bg-${status.color}-200`;

            const count =
              status.value === "in-progress"
                ? inProgress
                : status.value === "solved"
                  ? solved
                  : rejected;

            return (
              <div
                key={status.value}
                className={`flex-1 min-w-[120px] ${bgColor} ${textColor} p-4 rounded-lg shadow text-center cursor-pointer transition ${hoverColor} ring-1 ring-inset ${isActive ? "ring-black/50" : "ring-transparent"
                  }`}
                onClick={() =>
                  setSelectedStatus((prev) =>
                    prev === status.value ? "" : status.value
                  )
                }
              >
                <h3 className="text-sm font-bold">{status.label}</h3>
                <p className="text-xl">{count}</p>
              </div>
            );
          })}
        </div>

        {/* Clear Filters */}
        {(selectedReason || selectedStatus) && (
          <div className="mb-2 text-right">
            <button
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
              onClick={() => {
                setSelectedReason("");
                setSelectedStatus("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Filter Dropdown */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <label htmlFor="reason" className="text-sm font-semibold">
            Filter by Reason:
          </label>
          <select
            id="reason"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">All Reasons</option>
            {uniqueReasons.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Complaint Cards */}
        {filteredComplaints.length === 0 ? (
          <div className="w-full h-[60vh] flex justify-center items-center">
            <RingLoader />
          </div>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintsCard key={complaint._id} complaint={complaint} />
          ))
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
