import { useEffect, useState } from "react";
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

  const [spinnerVisible, setSpinnerVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

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

  const fetchComplaints = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/complaints?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

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
        c.reportedBy?.name?.toLowerCase().includes(searchName.toLowerCase())
      );
    }

    if (searchIndex) {
      filtered = filtered.filter((_, idx) =>
        `SVVS#${idx + 1}`.toLowerCase().includes(searchIndex.toLowerCase())
      );
    }

    setFilteredComplaints(filtered);
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
    const handleWindowScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;

      if (
        scrollTop + clientHeight >= scrollHeight - 100 &&
        hasMore &&
        !loading
      ) {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchComplaints(nextPage);
      }
    };

    window.addEventListener("scroll", handleWindowScroll);
    return () => window.removeEventListener("scroll", handleWindowScroll);
  }, [page, hasMore, loading]);

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

      <div className="px-3 md:px-4 py-4">
        {/* Status summary */}
        <div className="mt-16 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
            {[
              {
                label: "Total",
                value: "",
                count: inProgress + solved + rejected,
              },
              { label: "InProgress", value: "in-progress", count: inProgress },
              { label: "Solved", value: "solved", count: solved },
              { label: "Rejected", value: "rejected", count: rejected },
            ].map((status) => {
              const isActive = selectedStatus === status.value;
              const style = statusStyles[status.value];

              return (
                <div
                  key={status.value}
                  className={`${isActive ? style.activeBg : style.bg} ${
                    style.text
                  } ${
                    style.hover
                  } p-3 md:p-4 rounded-lg shadow text-center cursor-pointer transition ring-1 ring-inset ${
                    isActive ? "ring-black/50" : "ring-transparent"
                  }`}
                  onClick={() =>
                    setSelectedStatus((prev) =>
                      prev === status.value ? "" : status.value
                    )
                  }
                >
                  <h3 className="text-xs md:text-sm font-bold">
                    {t(status.label)}
                  </h3>
                  <p className="text-lg md:text-xl">{status.count}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Clear Filters */}
        {(selectedReason || selectedStatus || searchName || searchIndex) && (
          <div className="mb-2 text-right">
            <button
              className="text-xs md:text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300 transition"
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
        <div className="mb-4 space-y-3 md:space-y-0">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
              <label
                htmlFor="reason"
                className="text-sm font-semibold whitespace-nowrap"
              >
                {t("Filters")}
              </label>
              <select
                id="reason"
                className="w-full sm:w-autoborder border-gray-300 rounded-md px-3 py-1 text-xs md:text-sm min-w-0"
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

            <div className="flex flex-col sm:flex-row gap-2 md:gap-4 flex-1 min-w-0">
              <input
                type="text"
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex:1 min-w-0 border border-gray-300 rounded-md px-3 py-1 text-xs md:text-sm"
                placeholder={t("Name")}
              />

              <input
                type="text"
                value={searchIndex}
                onChange={(e) => setSearchIndex(e.target.value)}
                className="flex-1 min-w-0 border border-gray-300 rounded-md px-3 py-1 text-xs md:text-sm"
                placeholder={t("IndexCode")}
              />
            </div>
          </div>
        </div>

        {/* Complaints List */}
        {filteredComplaints.map((c, i) => (
          <ComplaintsCard
            key={c._id}
            complaint={c}
            user={c.reportedBy}
            index={i}
            userType="admin"
          />
        ))}

        {!hasMore && complaints.length > 0 && (
          <p className="text-center mt-4 text-xs md:text-sm text-gray-500">
            {t("No more complaints")}
          </p>
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
