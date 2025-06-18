import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import ComplaintsCard from "../components/ComplaintsCard";

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [inProgress, setInProgress] = useState(0);
  const [solved, setSolved] = useState(0);
  const [rejected, setRejected] = useState(0);
  const [selectedReason, setSelectedReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchIndex, setSearchIndex] = useState("");
  const [uniqueReasons, setUniqueReasons] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/official-login");
      return;
    }

    setSpinnerVisible(true);

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
          Promise.all([
            fetchComplaints(token).then((data) => {
              handleComplaintsUpdate(data);
            }),
            fetchUsers(token).then(setUsers),
          ]).finally(() => setSpinnerVisible(false));
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
    let filtered = [...complaints];

    if (selectedStatus) {
      filtered = filtered.filter(
        (c) => c.status?.toLowerCase() === selectedStatus
      );
    }

    if (selectedReason) {
      filtered = filtered.filter(
        (c) => c.reason?.toLowerCase() === selectedReason.toLowerCase()
      );
    }

    if (searchName) {
      filtered = filtered.filter((c) =>
        getUser(c.reportedBy)?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchIndex) {
      filtered = filtered.filter((_, idx) =>
        `SVVS#${idx + 1}`.toLowerCase().includes(searchIndex.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [selectedStatus, selectedReason, searchName, searchIndex, complaints]);

  const handleComplaintsUpdate = (updatedComplaints) => {
    const sorted = [...updatedComplaints].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    setComplaints(sorted);
    setFilteredComplaints(sorted);

    const reasons = [
      ...new Set(
        sorted.map((c) => c.reason?.trim()).filter(Boolean)
      ),
    ];
    setUniqueReasons(reasons);
  };

  const getUser = (userId) => {
    return users.find((user) => user._id === userId) || {
      name: "Unknown User",
      mobile: "N/A",
      mediaPath: { buffer: null },
    };
  };

  const statusStyles = {
    "in-progress": {
      bg: "bg-yellow-100",
      activeBg: "bg-yellow-300",
      text: "text-yellow-800",
      hover: "hover:bg-yellow-200",
    },
    solved: {
      bg: "bg-green-100",
      activeBg: "bg-green-300",
      text: "text-green-800",
      hover: "hover:bg-green-200",
    },
    rejected: {
      bg: "bg-red-100",
      activeBg: "bg-red-300",
      text: "text-red-800",
      hover: "hover:bg-red-200",
    },
  };

  return (
    <>
      <SpinnerModal visible={spinnerVisible} />
      <Navbar />

      <div className="container px-4 py-4 overflow-y-auto">
        <div className="flex justify-center sm:justify-between gap-1 mb-6 px-2">
          {[
            { label: "InProgress", value: "in-progress" },
            { label: "Solved", value: "solved" },
            { label: "Rejected", value: "rejected" },
          ].map((status) => {
            const isActive = selectedStatus === status.value;
            const style = statusStyles[status.value];

            const count =
              status.value === "in-progress"
                ? inProgress
                : status.value === "solved"
                  ? solved
                  : rejected;

            return (
              <div
                key={status.value}
                className={`flex-1 min-w-[120px] ${isActive ? style.activeBg : style.bg} ${style.text} ${style.hover} p-4 rounded-lg shadow text-center cursor-pointer transition ring-1 ring-inset ${isActive ? "ring-black/50" : "ring-transparent"}`}
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

        {(selectedReason || selectedStatus || searchName || searchIndex) && (
          <div className="mb-2 text-right">
            <button
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
              onClick={() => {
                setSelectedReason("");
                setSelectedStatus("");
                setSearchName("");
                setSearchIndex("");
              }}
            >
              Clear Filters
            </button>
          </div>
        )}

        <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-center">
          {/* Filter by Reason */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
            <label htmlFor="reason" className="text-sm font-semibold">
              Filter by Reason:
            </label>
            <select
              id="reason"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto"
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

          {/* Search Filters */}
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-4 w-full">
            {/* Name Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label htmlFor="nameFilter" className="text-sm font-semibold">
                Search by Name:
              </label>
              <input
                id="nameFilter"
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto"
                placeholder="e.g., Sohil"
              />
            </div>

            {/* Index Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
              <label htmlFor="indexFilter" className="text-sm font-semibold">
                Search by Index:
              </label>
              <input
                id="indexFilter"
                type="text"
                value={searchIndex}
                onChange={(e) => setSearchIndex(e.target.value)}
                className="border border-gray-300 rounded-md px-3 py-1 text-sm w-full sm:w-auto"
                placeholder="e.g., SVVS#3"
              />
            </div>
          </div>
        </div>


        {spinnerVisible ? (
          <div className="w-full h-[60vh] flex justify-center items-center" />
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint, index) => (
            <ComplaintsCard
              key={complaint._id}
              complaint={complaint}
              user={getUser(complaint.reportedBy)}
              index={index}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No complaints to display.
          </div>
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
