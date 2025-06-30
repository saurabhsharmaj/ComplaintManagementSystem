import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import ComplaintsCard from "../components/ComplaintsCard";
import { fetchUsers } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [spinnerVisible, setSpinnerVisible] = useState(true);

  const [inProgress, setInProgress] = useState(0);
  const [solved, setSolved] = useState(0);
  const [rejected, setRejected] = useState(0);

  const [selectedReason, setSelectedReason] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [searchName, setSearchName] = useState("");
  const [searchIndex, setSearchIndex] = useState("");
  const [uniqueReasons, setUniqueReasons] = useState([]);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const containerRef = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const fetchComplaints = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/complaints?page=${pageNum}&limit=${PAGE_SIZE}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to fetch complaints");

      const { totalCount, complaints: data } = await res.json();

      const updated = pageNum === 1 ? data : [...complaints, ...data];
      setComplaints(updated);
      setHasMore(pageNum * PAGE_SIZE < totalCount);
      handleComplaintsUpdate(updated);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
    setLoading(false);
  };

  const handleComplaintsUpdate = (updatedComplaints) => {
    const sorted = [...updatedComplaints].sort(
      (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
    );
    setComplaints(sorted);

    const reasons = [
      ...new Set(sorted.map((c) => c.reason?.trim()).filter(Boolean)),
    ];
    setUniqueReasons(reasons);

    applyFilters(sorted);
  };

  const applyFilters = (complaintsList) => {
    let filtered = [...complaintsList];

    if (selectedStatus) {
      filtered = filtered.filter((c) => c.status?.toLowerCase() === selectedStatus);
    }

    if (selectedReason) {
      filtered = filtered.filter(
        (c) => c.reason?.toLowerCase() === selectedReason.toLowerCase()
      );
    }

    if (searchName) {
      filtered = filtered.filter((c) =>
        c.reportedBy?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchIndex) {
      filtered = filtered.filter((_, idx) =>
        `SVVS#${idx + 1}`.toLowerCase().includes(searchIndex.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
    setVisibleCount(10);
  };

  useEffect(() => {
    if (!token || !userId) {
      navigate("/official-login");
      return;
    }

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((user) => {
        if (user?.type !== "admin") {
          navigate("/citizen-dashboard");
        } else {
          Promise.all([
            fetchComplaints(1),
            fetchUsers(token).then(setUsers),
          ]).finally(() => setSpinnerVisible(false));
        }
      })
      .catch(() => navigate("/official-login"));

    fetch(`${API_BASE_URL}/complaints/status-summary`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((res) => {
        setInProgress(res.inProgress || 0);
        setSolved(res.solved || 0);
        setRejected(res.rejected || 0);
      });
  }, []);

  useEffect(() => {
    applyFilters(complaints);
  }, [selectedStatus, selectedReason, searchName, searchIndex]);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;

      if (scrollTop + clientHeight >= scrollHeight - 50) {
        setTimeout(() => {
          setVisibleCount((prev) =>
            Math.min(prev + 10, filteredComplaints.length)
          );
        }, 500);
      }
    };

    const container = containerRef.current;
    container?.addEventListener("scroll", handleScroll);
    return () => container?.removeEventListener("scroll", handleScroll);
  }, [filteredComplaints]);

  const statusStyles = {
    "": {
      bg: "bg-blue-100",
      activeBg: "bg-blue-300",
      text: "text-blue-800",
      hover: "hover:bg-blue-200",
    },
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
      <SpinnerModal visible={spinnerVisible || (loading && page === 1)} />
      <Navbar />

      <div ref={containerRef} className="container px-4 py-4 overflow-y-auto h-[calc(100vh-64px)]">
        {/* Status summary */}
        <div className="flex justify-center sm:justify-between gap-2 mb-6 px-2 flex-wrap mt-16">
          {[
            { label: "Total", value: "", count: inProgress + solved + rejected },
            { label: "InProgress", value: "in-progress", count: inProgress },
            { label: "Solved", value: "solved", count: solved },
            { label: "Rejected", value: "rejected", count: rejected },
          ].map((status) => {
            const isActive = selectedStatus === status.value;
            const style = statusStyles[status.value];

            return (
              <div
                key={status.value}
                className={`flex-1 min-w-[120px] ${
                  isActive ? style.activeBg : style.bg
                } ${style.text} ${style.hover} p-4 rounded-lg shadow text-center cursor-pointer transition ring-1 ring-inset ${
                  isActive ? "ring-black/50" : "ring-transparent"
                }`}
                onClick={() =>
                  setSelectedStatus((prev) =>
                    prev === status.value ? "" : status.value
                  )
                }
              >
                <h3 className="text-sm font-bold">{t(status.label)}</h3>
                <p className="text-xl">{status.count}</p>
              </div>
            );
          })}
        </div>

        {/* Clear Filters */}
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
              {t("ClearFilters")}
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="mb-4 flex flex-col sm:flex-row sm:flex-wrap gap-4 sm:items-center">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <label htmlFor="reason" className="text-sm font-semibold">
              {t("Filters")}
            </label>
            <select
              id="reason"
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              value={selectedReason}
              onChange={(e) => setSelectedReason(e.target.value)}
            >
              <option value="">{t("Reason")}</option>
              {uniqueReasons.map((reason, idx) => (
                <option key={idx} value={reason}>
                    {t(reason)}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
      
            <input
              id="name"
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              placeholder={t("Name")}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          
            <input
              id="index"
              type="text"
              value={searchIndex}
              onChange={(e) => setSearchIndex(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-1 text-sm"
              placeholder={t("IndexCode")}
            />
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.slice(0, visibleCount).map((c, i) => (
          <ComplaintsCard
            key={c._id}
            complaint={c}
            user={c.reportedBy}
            index={i}
            userType="admin"
          />
        ))}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => {
                const nextPage = page + 1;
                setPage(nextPage);
                fetchComplaints(nextPage);
              }}
              disabled={loading}
            >
              {loading ? t("Loading…") : t("Load More")}
            </button>
          </div>
        )}

        {!hasMore && complaints.length > 0 && (
          <p className="text-center mt-4 text-gray-500">{t("No more complaints")}</p>
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
