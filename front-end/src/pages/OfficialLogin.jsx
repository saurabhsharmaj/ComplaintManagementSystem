import { Button } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TextField } from "../components/RegisterAccount";
import { handleLogin, isOfficial } from "../utils/mongodb";
import SpinnerModal from "../components/SpinnerModal";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const OfficialLogin = () => {
  const [FormData, setFormData] = useState({
    phone: "",
    email: "",
    password: "",
  });
  const navigate = useNavigate();
  const [Err, setErr] = useState("");
  const [Spinner, setSpinner] = useState(false);
  const {t} = useTranslation();
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
    <div className="min-h-screen">
      <SpinnerModal visible={Spinner} />
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-4 md:px-8 py-6">
        <h2 className="font-bold text-center text-2xl md:text-3xl lg:text-4xl mb-8 text-gray-800">
          {t("Official Login")}
        </h2>
        <div
          className="LoginBox flex flex-col gap-6 items-center border-2 border-gray-500 bg-opacity-90 backdrop-blur-sm px-8 md:px-12 lg:px-16 py-10 md:py-12 rounded-3xl shadow-[0px_20px_20px_10px_#00000024] w-full max-w-lg md:max-w-xl lg:max-w-2xl mx-auto
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
            className=" flex flex-col gap-6 w-full"
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
              size="medium"
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
              size="medium"
            />
            <p className="text-red-600">{Err}</p>

            <Button variant="contained" type="submit" size="large" fullWidth
              sx={{
                fontSize: { xs: "16px", md: "18px" },
                padding: { xs: "12px", md: "14px" },
                borderRadius: "12px",
                textTransform: "none",
                fontWeight: 600
              }}>
              {t("Login")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OfficialLogin;
