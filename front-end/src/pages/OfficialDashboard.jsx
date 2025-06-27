import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import ComplaintsCard from "../components/ComplaintsCard";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const PAGE_SIZE = 10;

const OfficialDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  // Fetch complaints from backend with pagination
  const fetchComplaints = async (pageNum = 1) => {
    setLoading(true);
    try {
      const res = await fetch(
        `${API_BASE_URL}/complaints?page=${pageNum}&limit=${PAGE_SIZE}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch complaints");
      }

      const { totalCount, complaints: data } = await res.json();

      // Append or replace based on page
      setComplaints((prev) => (pageNum === 1 ? data : [...prev, ...data]));

      // Determine if more data is available
      setHasMore(pageNum * PAGE_SIZE < totalCount);
    } catch (err) {
      console.error("Error fetching complaints:", err);
    }
    setLoading(false);
  };

  // Initial fetch
  useEffect(() => {
    if (!token || !userId) {
      navigate("/official-login");
      return;
    }
    fetchComplaints(1);
  }, []);

  // Load next page
  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchComplaints(nextPage);
  };

  return (
    <>
      <SpinnerModal visible={loading && page === 1} />
      <Navbar />
      <div className="container px-4 py-4">
        {complaints.map((c, i) => (
          <ComplaintsCard
            key={c._id}
            complaint={c}
            user={c.reportedBy} // ✅ Full user details come from backend
            index={i}
            userType="admin"
          />
        ))}

        {hasMore && (
          <div className="flex justify-center mt-4">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={loadMore}
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
