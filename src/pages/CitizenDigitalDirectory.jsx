import {
  faEdit,
  faMobileScreen,
  faSignOut,
  faTrafficLight,
} from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from "react-toastify";
import DashboardLinkButton from "../components/DashboardLinkButton";
import Navbar from "../components/Navbar";
import ReportedComplaints from "../components/ReportedComplaints";
import SpinnerModal from "../components/SpinnerModal";
import UsersCard from "../components/UsersCard";

const CitizenDigitalDirectory = () => {

   const handleLogout = () => {
    auth.signOut();
    navigate("/");
  };
  return (
    <>
     
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
        Citizen Digital Directory
      </h2>
      <div className="grid lg:grid-cols-[0.8fr_0.6fr] mx-10">        
        <div className="hidden lg:flex">
          <UsersCard />
        </div>
      </div>
    </>
  );
};

export default CitizenDigitalDirectory;
