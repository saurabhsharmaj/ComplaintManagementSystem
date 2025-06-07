import styled from "@emotion/styled";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { LocationSearching } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup
} from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import DashboardLinkButton from "../components/DashboardLinkButton";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { createComplaint, isOfficial } from "../utils/mongodb";
import { identifyLocation } from "../utils/MiscFunctions";
import { Statuses } from "../utils/enums";

const TextField = styled(MuiTextField)((props) => ({
  width: "80%",
  [`& fieldset`]: {
    borderRadius: "15px",
  },
}));
const ReportComplaint = () => {
  const [Media, setMedia] = useState();
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
  const [FormData, setFormData] = useState({
      name: "",
      email: "",
      mobile: "",
      password: "",
      confirmPassword: "",
    });
    const [Err, setErr] = useState(null);
  const [LoaderVisibile, setLoaderVisibile] = useState(false);
  const FileInput = useRef(null);
  const navigate = useNavigate();
    useEffect(() => {
        if (FormData.password != FormData.confirmPassword) {
          setErr("The password and confirmation password do not match.");
        } else {
          setErr(null);
        }
      }, [FormData]);
  return (
    
    <div className="overflow-x-hidden">
      <SpinnerModal visible={LoaderVisibile} />
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
      <h2 className=" lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
        👤 Edit Profile
      </h2>
    <div
      className="RegisterAccount flex flex-col gap-5 items-center 
      border-solid border-gray-500 px-3 lg:px-4 py-5 mx-4 lg:mx-12 rounded-3xl
      border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20
    "
    >
    <form
            action=""
            className=" flex flex-col gap-5 w-full"
            onSubmit={(e) => {
              e.preventDefault();
    
              handleRegistration(FormData)
                .then((user) => {
                  console.log(user);
    
                  navigate("/citizen-dashboard?newUser=true");
                })
                .catch((err) => {
                  setErr(err.message.split(": ")[1]);
                });
            }}
          >
        <div>
          <label className="block font-medium">Name</label>
          <input
            type="text"
            name="name"
            value={FormData.name}
            onChange={(e) => {
              setFormData({ ...FormData, name: e.target.value });
            }}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={FormData.email}
            onChange={(e) => {
              setFormData({ ...FormData, email: e.target.value });
            }}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Mobile</label>
          <input
            type="text"
            name="mobile"
            value={FormData.mobile}
            onChange={(e) => {
              setFormData({ ...FormData, mobile: e.target.value });
            }}
            required
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">New Password (optional)</label>
          <input
            type="password"
            name="password"
            value={FormData.password}
            onChange={(e) => {
              setFormData({ ...FormData, password: e.target.value });
            }}
            className="w-full border p-2 rounded"
          />
        </div>
        <div>
          <label className="block font-medium">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={FormData.confirmPassword}
            onChange={(e) => {
              setFormData({ ...FormData, confirmPassword: e.target.value });
            }}
            className="w-full border p-2 rounded"
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Update Profile
        </button>
      </form>
      </div>
    </div>
  );
};

export default ReportComplaint;
