import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TextField } from "../components/RegisterAccount";
import { handleLogin } from "../utils/mongodb";
import SpinnerModal from "../components/SpinnerModal";
import { useTranslation } from "react-i18next";
const CitizenLogin = () => {
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [Spinner, setSpinner] = useState(false);
  const [Err, setErr] = useState("");
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token) return;

    fetch("/users/verifyToken", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .catch((data) => {
        if (data.user) {
          navigate("/citizen-dashboard");
        }
      });
  }, []);
  return (
    <div className="h-screen overflow-hidden">
      <SpinnerModal visible={Spinner} />
      <Navbar />
      <div className=" lg:px-96 px-4 h-3/4 flex flex-col justify-center">
        <h2 className="mt-[25%] lg:mt-0 leading-normal font-bold text-center text-base lg:text-[2rem] my-8">
          {t("Citizen Login")}
        </h2>
        <div
          className="LoginBox flex flex-col gap-5 items-center 
      border-solid border-gray-500 px-3 lg:px-12 py-12 mx-4 lg:mx-12 rounded-3xl
      border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20 lg:h-3/4
      justify-center
    "
        >
          <form
            action=""
            onSubmit={(e) => {
              e.preventDefault();
              console.log(FormData);
              setSpinner(true);
              handleLogin(FormData)
                .then(async (user) => {
                  console.log(user);
                  if (user.type !== "admin") {
                    navigate("/citizen-dashboard");
                  } else {
                    await auth.signOut();
                    throw new Error("Invalid user");
                  }
                })
                .catch((err) => {
                  console.log(err);

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
              onChange={(e) =>
                setFormData({ ...FormData, password: e.target.value })
              }
              required
            />
            <p className="text-red-600">{Err}</p>

            <Button variant="contained" type="submit">
              {t("Login")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;




//okkk
