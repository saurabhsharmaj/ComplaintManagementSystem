import { Dialog } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintDetailModal from "../components/ComplaintDetailModal";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints, isOfficial } from "../utils/mongodb";
import { Statuses, statusColors } from "../utils/enums";
import { API_BASE_URL } from "@/config";
import ReportedComplaints from "../components/ReportedComplaints";
import ComplaintsCard from "../components/ComplaintsCard";

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [Complaints, setComplaints] = useState([]);
  const [ModalOpen, setModalOpen] = useState(false);
  const [complaint, setComplaint] = useState({});
  const [SpinnerVisible, setSpinnerVisible] = useState(false);
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState();
  const [solved, setSolved] = useState();
  const [rejected, setRejected] = useState();
  const [Visible, setVisible] = useState(false);

  useEffect(() => {
  const token = localStorage.getItem("token");
  if (!token) {
    navigate("/official-login");
    return;
  }
  const userId= localStorage.getItem("userId");
  fetch(API_BASE_URL+"/user/"+userId, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((user) => {
      if (!user || user.type !== "admin") {
        navigate("/citizen-dashboard");
      } else {
        setSpinnerVisible(false);
        fetchComplaints(token).then(handleComplaintsUpdate);
        fetchUsers(token).then((users)=>{setUsers(users)});
      }
    })
    .catch((err) => {
      console.error("Fetch current user error:", err);
      navigate("/official-login");
    });

    
    fetch(API_BASE_URL+"/complaints/status-summary", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((res) => {
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    })
    .then((res) => {
      
      setInProgress(res.inProgress);
      setRejected(res.rejected);
      setSolved(res.solved);
      console.log("--"+inProgress);
    })
    .catch((err) => {
      console.error("Fetch current user error:", err);
      //navigate("/official-login");
    });

}, []);


  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
  };

  const getUser = (userId) => {
    const user = users.find((u) => u._id === userId);

    return user.mediaPath?<p><img
                  src={
                    user?.mediaPath?.buffer
                      ? `data:image/png;base64,${user.mediaPath.buffer}`
                      : "/default-avatar.png" // Use your local or hosted default image
                  }
                  alt="Profile"
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />{user.name}</p>:<p><img alt=""/>{user.name}</p>;
  };

  let columns = [
    {
      field: "reason",
      headerName: "Complaint Reason",
      width: 300,
      headerClassName: "",
    },
   
    {
      field: "location",
      headerName: "Reported Location",
      width: 200,

      valueGetter: (params) => `${params.row.location.name}`,
    },{
      field: "timestamp",
      headerName: "Reported Date & Time",
      width: 200,

      valueGetter: (params) => {
        let d = new Date(params.row.timestamp);
        let date = d.toLocaleDateString();
        let time = d.toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "numeric",
          hour12: true,
        });
        return date + " , " + time;
      },
    },{
      field: "reportedBy",
      headerName: "Reported By",
     renderCell: (params) => getUser(params.value),
                  width: 150
    },{
      field: "status",
      headerName: "Status",
      width: 150,
      headerClassName: "",
      headerAlign: "center",
      align: "center",
      cellClassName: (params) => {
        if (params.value == null) {
          return "";
        }

        return clsx("StatusCol", {
          inProgress: params.value === Statuses.inProgress,
          Rejected: params.value === Statuses.rejected,
          Solved: params.value === Statuses.solved,
        });
      },
    },
  ];
  return (
    <>
      <SpinnerModal visible={SpinnerVisible} />
      <Navbar />
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
    </>
  );
};

export default OfficialDashboard;
