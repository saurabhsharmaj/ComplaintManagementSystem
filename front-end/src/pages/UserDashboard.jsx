import { useEffect, useState } from "react";
import { fetchUsers } from "../utils/mongodb";
import { useTranslation } from "react-i18next";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";

const UserDashboard = () => {
  const [users, setUsers] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();

  const token = localStorage.getItem("token");
  useEffect(() => {
    const getUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchUsers(token);
        const isArray = Array.isArray(data);
        setUsers(isArray ? data : []);
        setFiltered(isArray ? data : []);
      } finally {
        setLoading(false);
      }
    };
    getUsers();
  }, [token]);
  

  useEffect(() => {
    const q = search.toLowerCase();
    const filteredUsers = users.filter(
      (u) =>
        u.name?.toLowerCase().includes(q) ||
        u.fname?.toLowerCase().includes(q)
    );
    setFiltered(filteredUsers);
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
          {filtered.map((user, index) => (
            <div
              key={index}
              className="border-2 border-gray-400 rounded-xl p-4 bg-white shadow-md flex flex-row items-center text-left gap-4"
            >
              {/* Profile Image */}
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

              {/* User Details */}
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
      </div>
    </>
  );
};

export default UserDashboard;
