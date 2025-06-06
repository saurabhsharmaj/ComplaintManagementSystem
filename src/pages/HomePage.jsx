import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RegisterAccount from "../components/RegisterAccount";
import { isOfficial } from "../utils/mongodb";
import TrafficArt from "/src/assets/traffic-art.png";
import Navbar from "/src/components/Navbar";
const HomePage = () => {
  const navigate = useNavigate();
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) return;

  fetch("http://192.168.1.37:5000/api/users/verifyToken", {
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
    <div className="HomePage">
      <Navbar />
      <div className="HomeContainer grid grid-cols-1 lg:grid-cols-2 items-center px-5 lg:px-20">
        <img
          className="TrafficArt hidden lg:block h-[32rem]"
          src={TrafficArt}
          alt=""
        />
        <div>
          <h3 className="slogan mt-[25%] lg:mt-0 leading-normal font-bold text-center text-base lg:text-[2rem]">
            REPORT SHIV VIHAR VIOLATIONS AND PUBLIC PROBLEMS IN COLONY !!!
          </h3>
          <RegisterAccount />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
