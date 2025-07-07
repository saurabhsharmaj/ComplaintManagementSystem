import { useEffect, useState } from "react";
import { fetchUsers } from "../utils/mongodb";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit } from "@fortawesome/free-solid-svg-icons";

const PAGE_SIZE = 16;

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const response = await fetchUsers(token, page, PAGE_SIZE);
        const { users, totalPages } = response;
        setUsers(users);
        setFiltered(users);
        setTotalPages(totalPages);
      } catch (err) {
        console.error("Error fetching users:", err);
        setUsers([]);
        setFiltered([]);
      } finally {
        setLoading(false);
      }
    };

    if (token) getUsers();
  }, [page, token]);

  useEffect(() => {
    const query = search.toLowerCase();
    const results = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(query) ||
        u.fname?.toLowerCase().includes(query) ||
        u.galino?.toLowerCase().includes(query)
    );
    setFiltered(results);
  }, [search, users]);

  return (
    <>
      <SpinnerModal visible={loading} />
      <Navbar />
      <div className="px-5 py-8 mt-10">
        <div className="mb-6 max-w-md mx-auto">
          <input
            type="text"
            placeholder={t("Search by name or father's name")}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-gray-400 rounded-lg shadow-sm"
          />
        </div>

        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((user) => (
            <div
              key={user._id}
              className="relative border-2 border-gray-400 rounded-xl p-4 bg-white shadow-md flex flex-row items-center text-left gap-4"
            >
              <div
                className="absolute top-2 right-2 text-blue-500 cursor-pointer"
                onClick={() =>
                  navigate(`/profile-dashboard/${user._id}`, {
                    state: { from: "user-profile" },
                  })
                }
              >
                <FontAwesomeIcon icon={faEdit} />
              </div>

              <div className="w-28 h-32 bg-gray-100 overflow-hidden flex-shrink-0">
                <img
                  src={
                    user.mediaPath?.buffer
                      ? `data:${user.mediaType};base64,${user.mediaPath.buffer}`
                      : "/default-avatar.png"
                  }
                  alt="Profile"
                  className="object-cover w-full h-full"
                />
              </div>

              <div className="flex flex-col gap-1 flex-grow">
                <p className="font-bold text-base">{t("Name")}: {user.name}</p>
                <p className="text-sm">{t("Father's Name")}: {user.fname}</p>
                <p className="text-sm">{t("Caste")}: {user.cast}</p>
                <p className="text-sm">{t("Plot No")}: {user.plotno}</p>
                <p className="text-sm">{t("Gali No")}: {user.galino}</p>
                <p className="text-sm">{t("Phone No")}: {user.mobile}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center gap-4 mt-10">
          <button
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            {t("Previous")}
          </button>
          <span className="self-center text-gray-600">
            {t("Page")} {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
          >
            {t("Next")}
          </button>
        </div>
      </div>
    </>
  );
};

export default UserDashboard;
