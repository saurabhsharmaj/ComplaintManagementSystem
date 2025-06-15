import { RingLoader } from "react-spinners";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import ComplaintsCard from "../components/ComplaintsCard";

const OfficialDigitalDirectory = () => {
 

  return (
    <>
      
      <Navbar />

      <div className="container px-4 py-4 overflow-y-auto">
        Official Digital Directory
      </div>
    </>
  );
};

export default OfficialDigitalDirectory;
