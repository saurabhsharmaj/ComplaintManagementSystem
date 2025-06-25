import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import ComplaintsCard from "../components/ComplaintsCard";
import { useTranslation } from "react-i18next";

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

  const { t } = useTranslation();

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

  const getUser = useCallback(
    (userId) =>
      users.find((user) => user._id === userId) || {
        name: "Unknown User",
        mobile: "N/A",
        mediaPath: { buffer: null },
      },
    [users]
  );

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
      filtered = filtered.filter((c) =>
        c.code?.toLowerCase().includes(searchIndex.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
  }, [selectedStatus, selectedReason, searchName, searchIndex, complaints, getUser]);

  const handleComplaintsUpdate = (updatedComplaints) => {
    const sorted = [...updatedComplaints].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    setComplaints(sorted);
    setFilteredComplaints(sorted);

    const reasons = [
      ...new Set(sorted.map((c) => c.reason?.trim()).filter(Boolean)),
    ];
    setUniqueReasons(reasons.sort((a, b) => a.localeCompare(b)));
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

  const statusLabels = {
    "in-progress": "InProgress",
    solved: "Solved",
    rejected: "Rejected",
  };

  return (
    <>
      <SpinnerModal visible={spinnerVisible} />
      <Navbar />

      <div className="container px-4 py-4 overflow-y-auto">
        <div className="flex justify-center sm:justify-between gap-1 mb-6 px-2">
          {["in-progress", "solved", "rejected"].map((status) => {
            const isActive = selectedStatus === status;
            const style = statusStyles[status];

            const count =
              status === "in-progress"
                ? inProgress
                : status === "solved"
                ? solved
                : rejected;

            return (
              <div
                key={status}
                className={`flex-1 min-w-[120px] ${isActive ? style.activeBg : style.bg} ${style.text} ${style.hover} p-4 rounded-lg shadow text-center cursor-pointer transition ring-1 ring-inset ${isActive ? "ring-black/50" : "ring-transparent"}`}
                onClick={() =>
                  setSelectedStatus((prev) =>
                    prev === status ? "" : status
                  )
                }
              >
                <h3 className="text-sm font-bold">{t(statusLabels[status])}</h3>
                <p className="text-xl">{count}</p>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 px-2 font-semibold text-sm text-gray-700">
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M3 4h18v2H3zm4 7h10v2H7zm2 7h6v2H9z" />
          </svg>
          {t("Filters")}
        </div>

        <div className="flex flex-wrap gap-4 items-center px-2 mt-2">
          <select
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-48"
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
          >
            <option value="">{t("Reason")}</option>
            {uniqueReasons.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>

          <input
            type="text"
            placeholder={t("Name")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-48"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
          />

          <input
            type="text"
            placeholder={t("IndexCode")}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm w-full sm:w-48"
            value={searchIndex}
            onChange={(e) => setSearchIndex(e.target.value)}
          />
        </div>

        {(selectedReason || selectedStatus || searchName || searchIndex) && (
          <div className="text-right px-2 mt-2">
            <button
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
              onClick={() => {
                setSelectedReason("");
                setSelectedStatus("");
                setSearchName("");
                setSearchIndex("");
              }}
            >
              {t("ClearFilters")}
            </button>
          </div>
        )}

        {spinnerVisible ? (
          <div className="w-full h-[60vh] flex justify-center items-center">
            <span className="text-gray-500">{t("Loading")}</span>
          </div>
        ) : filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint, index) => (
            <ComplaintsCard
              key={complaint._id}
              complaint={complaint}
              user={getUser(complaint.reportedBy)}
              userType={users?.type}
              index={index}
            />
          ))
        ) : (
          <div className="text-center text-gray-500 mt-8">
            {t("NoComplaints")}
          </div>
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
