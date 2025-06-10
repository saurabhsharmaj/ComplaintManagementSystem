import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintsCard from "./ComplaintsCard";
import { API_BASE_URL } from "@/config";

const ReportedComplaints = () => {
  const [Complaints, setComplaints] = useState([]);
  const navigate = useNavigate();
  
  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/citizen-login");
    return;
  }

  const userId= localStorage.getItem("userId");
  // Fetch user details
  fetch(API_BASE_URL+"/user/"+userId, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((user) => {
      if (!user || user.type !== "citizen") {
        navigate("/citizen-login");
      } else {
        // Fetch complaints for this user
        //fetchComplaintsByUser(user._id).then(handleComplaintsUpdate);

        fetch(API_BASE_URL+"/complaints/user/"+`${userId}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              }
            })
              .then((response) => {
                if (!response.ok) {
                  throw new Error("Failed to fetch complaints");
                }
                return response.json(); // ✅ Parse response
              })
              .then((data) => {
                setComplaints(data); // ✅ Use parsed JSON
                console.log("length:", data.length); // ✅ Print length of data
              })
              .catch((error) => {
                console.error("Error fetching complaints:", error);
              });
       
      }
    })
    .catch(() => {
      //navigate("/citizen-login");
    });
}, []);

  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
  };
  return (
    <div className="lg:border lg:shadow-[3px_4px_4px_rgba(0,0,0,0.26)] rounded-lg lg:border-solid lg:border-black w-full flex flex-col items-center lg:h-[28rem] py-2">
      <h3 className="font-bold my-2">Complaints Reported by You</h3>
      <div className="container px-4 overflow-y-auto">
        {Complaints.length === 0 ? (
          <h2>No Complaints Found #</h2>
        ) : (
          Complaints &&
          Complaints.map((complaint) => {
            return <ComplaintsCard key={complaint._id} complaint={complaint} />;
          })
        )}
      </div>
    </div>
  );
};

export default ReportedComplaints;
