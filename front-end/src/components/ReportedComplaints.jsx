import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintsCard from "./ComplaintsCard";
import { API_BASE_URL } from "@/config";
import { BarLoader, RingLoader } from "react-spinners";

const ReportedComplaints = () => {
  const [Complaints, setComplaints] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const handleGetComplaints = async () => {
    setLoading(true);
    const res = await fetch(API_BASE_URL + "/user/" + userId, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Unauthorized"); {
      const newUser = await res.json();
      setUser(newUser);
      if (!newUser || newUser.type !== "citizen") {
        navigate("/citizen-login");
      } else {
        // Fetch complaints for this user
        //fetchComplaintsByUser(user._id).then(handleComplaintsUpdate);

        const response = await fetch(API_BASE_URL + "/complaints/user/" + `${userId}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Failed to fetch complaints");
        }
        const data = await response.json(); // ✅ Parse response
        setComplaints(data); // ✅ Use parsed JSON
        console.log("length:", data.length); // ✅ Print length of data

        setLoading(false);

      }
    }

  }

  useEffect(() => {
    if (!token) {
      navigate("/citizen-login");
      return;
    }
    if (token && userId) {
      handleGetComplaints();
    }

    // Fetch user details
  }, [token, userId]);

  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
  };

  if (loading) {
    return (
      <div className="w-full h-[60vh] flex justify-center items-center">
        <RingLoader />
      </div>
    )
  }


  return (
    <div className="lg:border lg:shadow-[3px_4px_4px_rgba(0,0,0,0.26)] rounded-lg lg:border-solid lg:border-black w-full flex flex-col items-center lg:h-[28rem] py-2">
      <h3 className="font-bold my-2">Complaints Reported by You</h3>
      <div className="container px-4 overflow-y-auto">
        {Complaints && Complaints.length === 0 ? (
          <h2>No Complaints Found #</h2>

        ) : (
          Complaints &&
          Complaints.map((complaint) => {
            return <ComplaintsCard key={complaint._id} complaint={complaint} user={user} />;
          })
        )}
      </div>
    </div>
  );
};

export default ReportedComplaints;
