import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAccount from "../components/RegisterAccount";
import { isOfficial } from "../utils/mongodb";
import TrafficArt from "/src/assets/traffic-art.png";
import Navbar from "/src/components/Navbar";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";
const HomePage = () => {
  const navigate = useNavigate();
  const {t} = useTranslation();
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch(API_BASE_URL+"/users/verifyToken", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      if (data.isOfficial === true) {
        navigate("/official-dashboard");
      } else if (data.isOfficial === false) {
        navigate("/citizen-dashboard");
      }
    });
}, []);
  return (
    <div className="HomePage min-h-screen">
      <Navbar />
      <div className="HomeContainer grid grid-cols-1 lg:grid-cols-2 items-center px-4 md:px-8 lg:px-20 py-2 lg:py-4 pt-6 md:pt-8 lg:pt-10">
        <div className=" flex justify-center lg:justify-start">
        <img
          className="TrafficArt hidden lg:block h-96 xl:h-[42rem] 2xl:h-[45rem] w-full max-w-2xl object-contain"
          src={TrafficArt}
          alt=""
        />
        </div>
        <div className="flex flex-col items-center lg:items-start px-2 md:px-4">
          <h3 className="slogan text-center font-bold leading-normal text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl mt-0 mb-2 max-w-3xl mx-auto px-4">
            {t("REPORT SHIV VIHAR VIOLATIONS AND PUBLIC PROBLEMS IN COLONY")} !!!
          </h3>
          <div className="w-full max-w-lg md:max-w-xl lg:max-w-3xl">
          <RegisterAccount />
          </div>
        </div>
      </div>  
    </div>
  );
};

export default HomePage;
