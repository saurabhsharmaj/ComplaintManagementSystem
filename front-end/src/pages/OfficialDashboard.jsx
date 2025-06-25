import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import ComplaintsCard from "../components/ComplaintsCard";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [visibleComplaints, setVisibleComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [isTailLoading, setIsTailLoading] = useState(false);
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

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch complaints & users
  useEffect(() => {
    if (!token || !userId) {
      navigate("/official-login");
      return;
    }

    setSpinnerVisible(true);

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
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
            fetch(`${API_BASE_URL}/complaints`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch(`${API_BASE_URL}/users`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
            fetch(`${API_BASE_URL}/complaints/status-summary`, {
              headers: { Authorization: `Bearer ${token}` },
            }).then((res) => res.json()),
          ]).then(([complaintsData, usersData, statusSummary]) => {
            const sorted = complaintsData.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            setComplaints(sorted);
            setFilteredComplaints(sorted);
            setVisibleComplaints(sorted.slice(0, PAGE_SIZE));
            setUsers(usersData);
            setInProgress(statusSummary.inProgress || 0);
            setSolved(statusSummary.solved || 0);
            setRejected(statusSummary.rejected || 0);
            const reasons = [...new Set(sorted.map((c) => c.reason?.trim()).filter(Boolean))];
            setUniqueReasons(reasons.sort((a, b) => a.localeCompare(b)));
          }).finally(() => setSpinnerVisible(false));
        }
      })
      .catch(() => navigate("/official-login"));
  }, []);

  // Filter complaints
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
    setPage(1);
    setVisibleComplaints(filtered.slice(0, PAGE_SIZE));
  }, [selectedStatus, selectedReason, searchName, searchIndex, complaints, getUser]);

  const handleLoadMore = () => {
    setIsTailLoading(true);
    setTimeout(() => {
      const nextPage = page + 1;
      const nextData = filteredComplaints.slice(0, nextPage * PAGE_SIZE);
      setVisibleComplaints(nextData);
      setPage(nextPage);
      setIsTailLoading(false);
    }, 1000); // ⏱️ simulate loading
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
        {/* Status Summary */}
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

        {/* Filters */}
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

        {/* Complaints */}
        {visibleComplaints.map((complaint, index) => (
          <ComplaintsCard
            key={complaint._id}
              complaint={complaint}
              user={getUser(complaint.reportedBy)}
              userType={users?.type}
              index={index}
          />
        ))}

        {/* Load More */}
        {visibleComplaints.length < filteredComplaints.length && (
          <div className="flex justify-center mt-4">
            {isTailLoading ? (
              <div className="w-8 h-8 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin" />
            ) : (
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                {t("Load More")}
              </button>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
