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
      <div className="px-20 ">
        <h2 className=" lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-8 lg:text-left">
          Official Dashboard
        </h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
      <p style={{ margin: 0, color: statusColors.inProgress }}>
        In Progress : {inProgress}
      </p>
      <span>|</span>
      <p style={{ margin: 0, color: statusColors.solved }}>
        Solved : {solved}
      </p>
      <span>|</span>
      <p style={{ margin: 0, color: statusColors.rejected }}>
        Rejected : {rejected}
      </p>
    </div>
        <Dialog
          open={ModalOpen}
          children={
            <ComplaintDetailModal
              setDialogOpen={setModalOpen}
              complaint={complaint}
            />
          }
        />
        <DataGrid
          rows={Complaints}
          getRowId={(row) => row._id}
          columns={columns}
          onRowClick={(params) => {
            setComplaint(params.row);
            setModalOpen(true);
          }}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 10 },
            },
          }}
          pageSizeOptions={[10, 20, 30]}
          sx={{
            ".MuiDataGrid-columnHeaderTitle": {
              fontWeight: "bold !important",
              overflow: "visible !important",
            },
            "& .StatusCol": {
              color: "#fff",
              fontWeight: 900,
              marginY: 1.5,
              minHeight: "30px !important",
              marginLeft: "auto !important",
              borderRadius: 500,
            },
            "& .StatusCol.inProgress": {
              backgroundColor: statusColors.inProgress,
            },
            "& .StatusCol.Rejected": {
              backgroundColor: statusColors.rejected,
            },
            "& .StatusCol.Solved": {
              backgroundColor: statusColors.solved,
            },
          }}
          // checkboxSelection
        ></DataGrid>
      </div>
    </>
  );
};

export default OfficialDashboard;
