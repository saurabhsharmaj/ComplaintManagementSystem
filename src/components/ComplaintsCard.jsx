import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import ComplaintDetailModal from "./ComplaintDetailModal";
import { fetchUserById } from "../utils/mongodb";
import { Statuses, statusColors } from "../utils/enums";

const ComplaintsCard = ({ complaint }) => {
  const [DialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  const date = new Date(complaint.timestamp);
  const statusKey = Object.keys(Statuses).find(
    (key) => Statuses[key] === complaint.status
  );
  const statusColor = statusColors[statusKey] || "#333";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = complaint.reportedBy;
    if (userId && token) {
      fetchUserById(userId, token)
        .then(setUser)
        .catch((err) => console.error("User fetch error:", err));
    }
  }, [complaint]);

  if (!user) return null;

  return (
    <>
      <Dialog
        open={DialogOpen}
        children={
          <ComplaintDetailModal
            setDialogOpen={setDialogOpen}
            complaint={complaint}
          />
        }
      />
      <div
        className="border shadow-md rounded-lg my-4 p-4 flex justify-between gap-3"
        style={{ borderLeft: `5px solid ${statusColor}` }}
      >
        <div className="flex items-center gap-8">
          <img
            src={
              user?.mediaPath?.buffer
                ? `data:image/png;base64,${user.mediaPath.buffer}`
                : "/default-avatar.png"
            }
            alt="User"
            className="w-28 h-28 rounded-sm object-cover"
          />
          <div>
            <span>Reported Date: {date.toLocaleDateString("en-IN")}</span>
            <p className="font-bold text-sm">{user.name}</p>
            <p className="text-xs text-gray-600">{user.mobile}</p>
            <p className="font-semibold"><span className="text-gray-800">{complaint.reason}</span></p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{complaint.location?.name}</span>
            </div>
          </div>
        </div>

        {/* <div className="flex justify-between text-sm">
        </div> */}

        <div className="flex flex-col justify-between text-sm">
          <span
            className="cursor-pointer font-semibold text-blue-600 hover:underline flex justify-end"
            onClick={() => setDialogOpen(true)}
          >
            Detailed View
          </span>
          <div className="font-bold flex items-center gap-1">
            Status:
            <span style={{ color: statusColor }}>{complaint.status}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintsCard;
