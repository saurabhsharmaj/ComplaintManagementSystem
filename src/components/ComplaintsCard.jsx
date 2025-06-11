import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import { Statuses, statusColors } from "../utils/enums";
import ComplaintDetailModal from "./ComplaintDetailModal";
import { fetchUserById } from "../utils/mongodb";
// import { Refresh } from "@mui/icons-material";
// import { fetchCommentById } from "../utils/mongodb";

const ComplaintsCard = ({ complaint }) => {
  const [DialogOpen, setDialogOpen] = useState(false);
  const [user, setUser] = useState(null);
  let date = new Date(complaint.timestamp);
  let StatusColorEnum = Object.keys(Statuses).find(
    (key) => Statuses[key] === complaint.status
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (userId && token) {
      fetchUserById(userId, token).then((user) => {
        console.log(user);
        setUser(user);
      }).catch((err) => {
        console.log(err);
      });
    }
  }, []);
  if (!user) {
    return null;
  }
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
        className="border shadow-[2px_4px_11px_1px_rgba(0,0,0,0.25)] border-solid border-[rgba(45,41,41,0.4)] rounded-lg my-4 p-4 flex flex-col gap-2">
        <div className="flex justify-between">
          <p>Reported Date : {date.toLocaleDateString("en-IN")}</p>
          <p
            className="cursor-pointer text-sm font-semibold"
            onClick={async () => {
              setDialogOpen(true);
            }}
          >
            Detailed View
          </p>
        </div>
        <p className="font-bold">{user.name}</p>
        <p className="font-bold">{user.mobile}</p>
        <p className="font-bold">{complaint.reason}</p>

        <div>
          <img
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
          />
        </div>
        <div className="flex justify-between">
          <div className="flex gap-3 items-center">
            <FontAwesomeIcon size="1x" icon={faMapMarkerAlt} />
            <p>{complaint.location.name}</p>
          </div>
          <span className="flex gap-2 font-bold">
            Status:{" "}
            <p
              style={{
                color: statusColors[StatusColorEnum],
              }}
            >
              {complaint.status}
            </p>
          </span>
        </div>
      </div>
    </>
  );
};

export default ComplaintsCard;
