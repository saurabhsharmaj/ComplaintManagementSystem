import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TextField } from "../components/RegisterAccount";
import { handleLogin, isOfficial } from "../utils/mongodb";
import SpinnerModal from "../components/SpinnerModal";
import { API_BASE_URL } from "@/config";

const OfficialLogin = () => {
  const [FormData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [Err, setErr] = useState("");
  const [Spinner, setSpinner] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(API_BASE_URL + "/users/verifyToken", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user.type === "admin") {
          navigate("/official-dashboard");
        }
      });
  }, []);
  return (
    <div className="h-screen overflow-hidden ">
      <SpinnerModal visible={Spinner} />
      <Navbar />
      <div className=" lg:px-96 px-4 h-3/4 flex flex-col justify-center">
        <h2 className="mt-[25%] lg:mt-0 leading-normal font-bold text-center text-base lg:text-[2rem] my-8">
          Official Login
        </h2>
        <div
          className="LoginBox flex flex-col gap-5 items-center 
      border-solid border-gray-500 px-3 lg:px-12 py-12 mx-4 lg:mx-12 rounded-3xl
      border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20 lg:h-3/4
      justify-center
    "
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSpinner(true);
              handleLogin(FormData)
                .then(async (data) => {
                  if (data.user.type === "admin") {
                    navigate("/official-dashboard");
                  } else {
                    setErr("Invalid user");
                  }
                })
                .catch((err) => {
                  setErr(err.response.data.error || err.message);
                })
                .finally(() => {
                  setSpinner(false);
                });
            }}
            className=" flex flex-col gap-5 w-full"
          >
            <TextField
              variant="outlined"
              label="E-mail or Phone"
              type="text"
              onChange={(e) => {
                if (!isNaN(e.target.value)) {
                  setFormData((prev) => ({ ...prev, phone: e.target.value }));
                } else {
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                }
              }
              }
              required
            />
            <TextField
              variant="outlined"
              label="Password"
              type="password"
              value={FormData.password}
              onChange={(e) =>
                setFormData({ ...FormData, password: e.target.value })
              }
              required
            />
            <p className="text-red-600">{Err}</p>

            <Button variant="contained" type="submit">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficialLogin;
