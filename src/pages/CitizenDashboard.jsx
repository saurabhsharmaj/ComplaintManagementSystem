import {
  faEdit,
  faMobileScreen,
  faSignOut,
  faTrafficLight,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardLinkButton from "../components/DashboardLinkButton";
import Navbar from "../components/Navbar";
import ReportedComplaints from "../components/ReportedComplaints";
import SpinnerModal from "../components/SpinnerModal";
import { isOfficial } from "../utils/mongodb";

const CitizenDashboard = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [SpinnerVisible, setSpinnerVisible] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/citizen-login");
    return;
  }

   const userId= localStorage.getItem("userId");
  // Fetch user details
  fetch("http://192.168.1.37:5000/api/user/"+userId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((user) => {
      if (user.type === "official") {
        navigate("/official-dashboard");
      } else {
        setSpinnerVisible(false);
        if (params.get("newUser")) {
          toast.success("Registration Succesful, Welcome to citizen dashboard", {
            icon: "👋",
          });
        }
      }
    })
    .catch(() => {
      navigate("/citizen-login");
    });

  window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
  return () => {
    window.removeEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );
  };
}, []);
  const handleBeforeInstallPrompt = (event) => {
    event.preventDefault();
    setDeferredPrompt(event);
  };

  const handleInstall = () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice.then((choiceResult) => {
        setDeferredPrompt(null);
      });
    }
  };
  const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };

  return (
    <>
      <SpinnerModal visible={SpinnerVisible} />

      <Navbar />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      <h2 className=" lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-8 lg:text-left lg:mx-20">
        Dashboard
      </h2>
      <div className="grid lg:grid-cols-[0.8fr_0.6fr] mx-10">
        <div>
          <DashboardLinkButton
            icon={faEdit}
            name={"New Complaint"}
            link={"/report"}
          />
          <DashboardLinkButton
            icon={faTrafficLight}
            name={"Track Reported complaints"}
            link={"/track-complaints"}
            className={"lg:hidden"}
          />
          <DashboardLinkButton
            icon={faMobileScreen}
            name={"Install as an app (Mobile)"}
            onClick={handleInstall}
            className={"lg:hidden"}
          />
          <DashboardLinkButton
            icon={faSignOut}
            name={"Logout"}
            onClick={handleLogout}
            className={"lg:hidden"}
          />
        </div>
        <div className="hidden lg:flex">
          <ReportedComplaints />
        </div>
      </div>
    </>
  );
};

export default CitizenDashboard;
