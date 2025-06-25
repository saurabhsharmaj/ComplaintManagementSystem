import {
  faEdit,
  faSignOut,
  faTrafficLight,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardLinkButton from "../components/DashboardLinkButton";
import Navbar from "../components/Navbar";
import ReportedComplaints from "../components/ReportedComplaints";
import SpinnerModal from "../components/SpinnerModal";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";


const CitizenDashboard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [SpinnerVisible, setSpinnerVisible] = useState(false);
  const [user, setUser] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [params] = useSearchParams();
  const navigate = useNavigate();
   const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/citizen-login");
      return;
    }

    // Fetch user
    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((user) => {
        setUser(user);
        if (user.type === "official") {
          navigate("/official-dashboard");
        } else {
          setSpinnerVisible(false);
          if (params.get("newUser")) {
            toast.success("Registration Successful, Welcome to citizen dashboard", {
              icon: "👋",
            });
          }
          fetchComplaints(userId, token);
        }
      })
      .catch(() => {
        navigate("/citizen-login");
      });

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const fetchComplaints = (userId, token) => {
    fetch(`${API_BASE_URL}/complaints/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setComplaints(data);
      })
      .catch((err) => {
        console.error("Failed to fetch complaints:", err);
      });
  };

  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    setDeferredPrompt(event);
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then(() => {
        setDeferredPrompt(null);
      });
    }
  };

  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  // Safe status checking
  const normalize = (status) => status?.toLowerCase() || "";
  const total = complaints.length;
  const inProgress = complaints.filter((c) => normalize(c.status) === "in-progress").length;
  const solved = complaints.filter((c) => normalize(c.status) === "solved").length;
  const rejected = complaints.filter((c) => normalize(c.status) === "rejected").length;

  return (
    <>
      <SpinnerModal visible={SpinnerVisible} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar theme="light" />

      {/* Top section with status cards */}
      <h2 className="lg:mt-10 font-bold text-center text-xl lg:text-[2rem] my-4 lg:text-left lg:mx-20">
        {t("Dashboard")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-5 lg:px-20 mb-6">
        <div className="bg-blue-100 text-blue-800 rounded-xl p-4 text-center shadow-md">
          <h3 className="font-semibold text-lg">{t("Total")}</h3>
          <p className="text-2xl font-bold">{total}</p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 rounded-xl p-4 text-center shadow-md">
          <h3 className="font-semibold text-lg">{t("InProgress")}</h3>
          <p className="text-2xl font-bold">{inProgress}</p>
        </div>
        <div className="bg-green-100 text-green-800 rounded-xl p-4 text-center shadow-md">
          <h3 className="font-semibold text-lg">{t("Solved")}</h3>
          <p className="text-2xl font-bold">{solved}</p>
        </div>
        <div className="bg-red-100 text-red-800 rounded-xl p-4 text-center shadow-md">
          <h3 className="font-semibold text-lg">{t("Rejected")}</h3>
          <p className="text-2xl font-bold">{rejected}</p>
        </div>
      </div>

      {/* Action buttons + complaint list */}
      <div className="grid lg:grid-cols-[0.8fr_0.6fr] mx-10">
        <div>
          <DashboardLinkButton icon={faEdit} name={"New Complaint"} link={"/report"} />
          <DashboardLinkButton
            icon={faTrafficLight}
            name={"Track Reported complaints"}
            link={"/track-complaints"}
            className={"lg:hidden"}
          />
          <DashboardLinkButton
            icon={faSignOut}
            name={"Logout"}
            link={"/"}
            onClick={handleLogout}
            className={"lg:hidden"}
          />
        </div>

        {/* Show list of complaints on large screens */}
        <div className="hidden lg:flex">
          <ReportedComplaints user={user} />
        </div>
      </div>
    </>
  );
};

export default CitizenDashboard;
