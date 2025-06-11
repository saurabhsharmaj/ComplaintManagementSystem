import { Dialog } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import clsx from "clsx";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ComplaintDetailModal from "../components/ComplaintDetailModal";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { fetchUsers, fetchComplaints, isOfficial } from "../utils/mongodb";
import { Statuses } from "../utils/enums";
import { API_BASE_URL } from "@/config";
import ReportedComplaints from "../components/ReportedComplaints";
import ComplaintsCard from "../components/ComplaintsCard";

const OfficialDashboard = () => {
  const [users, setUsers] = useState([]);
  const [Complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [ModalOpen, setModalOpen] = useState(false);
  const [complaint, setComplaint] = useState({});
  const [SpinnerVisible, setSpinnerVisible] = useState(false);
  const navigate = useNavigate();
  const [inProgress, setInProgress] = useState();
  const [solved, setSolved] = useState();
  const [rejected, setRejected] = useState();
  const [Visible, setVisible] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [uniqueReasons, setUniqueReasons] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/official-login");
      return;
    }

    const userId = localStorage.getItem("userId");

    fetch(`${API_BASE_URL}/user/${userId}`, {
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
          fetchUsers(token).then((users) => setUsers(users));
        }
      })
      .catch((err) => {
        console.error("Fetch current user error:", err);
        navigate("/official-login");
      });

    fetch(`${API_BASE_URL}/complaints/status-summary`, {
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
      })
      .catch((err) => {
        console.error("Fetch summary error:", err);
      });
  }, []);

  const handleComplaintsUpdate = (updatedComplaints) => {
    setComplaints(updatedComplaints);
    setFilteredComplaints(updatedComplaints);

    const reasons = [
      ...new Set(
        updatedComplaints.map((c) => c.reason?.trim()).filter(Boolean)
      ),
    ];
    setUniqueReasons(reasons);
  };

  const getUser = (userId) => {
    const user = users.find((u) => u._id === userId);
    return user?.mediaPath ? (
      <p>
        <img
          src={
            user?.mediaPath?.buffer
              ? `data:image/png;base64,${user.mediaPath.buffer}`
              : "/default-avatar.png"
          }
          alt="Profile"
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            objectFit: "cover",
          }}
        />
        {user.name}
      </p>
    ) : (
      <p>
        <img alt="" />
        {user?.name}
      </p>
    );
  };

  return (
    <>
      <SpinnerModal visible={SpinnerVisible} />
      <Navbar />

      <div className="container px-4 py-4 overflow-y-auto">
        {/* Dropdown Filter */}
        <div className="mb-4 flex items-center space-x-4">
          <label htmlFor="reason" className="text-sm font-semibold">
            Filter by Reason:
          </label>
          <select
            id="reason"
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
            value={selectedReason}
            onChange={(e) => {
              const value = e.target.value;
              setSelectedReason(value);
              if (value === "") {
                setFilteredComplaints(Complaints);
              } else {
                setFilteredComplaints(
                  Complaints.filter((c) => c.reason === value)
                );
              }
            }}
          >
            <option value="">All Reasons</option>
            {uniqueReasons.map((reason, idx) => (
              <option key={idx} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* Complaint Cards */}
        {filteredComplaints.length === 0 ? (
          <h2>No Complaints Found</h2>
        ) : (
          filteredComplaints.map((complaint) => (
            <ComplaintsCard key={complaint._id} complaint={complaint} />
          ))
        )}
      </div>
    </>
  );
};

export default OfficialDashboard;
