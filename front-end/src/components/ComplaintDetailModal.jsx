import { faClockFour } from "@fortawesome/free-regular-svg-icons";
import { faClose, faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Send } from "@mui/icons-material";
import {
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";
import {
  addComment,
  markAsRejected,
  markAsSolved,
} from "../utils/mongodb";
import { Statuses, statusColors } from "../utils/enums";
import CommentsTile from "./CommentsTile";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const ComplaintDetailModal = ({ setDialogOpen, complaint }) => {
  const [official, setOfficial] = useState(false);
  const [comments, setComments] = useState(complaint.comments || []);
  const [CommentBoxDisabled, setCommentBoxDisabled] = useState(true);
  const [CommentFValue, setCommentFValue] = useState("");
  const {t} = useTranslation();

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (token && userId) {
      fetch(`${API_BASE_URL}/user/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => {
          if (!res.ok) throw new Error("Unauthorized");
          return res.json();
        })
        .then((user) => {
          setOfficial(user.type === "admin");
        });
    }
  }, [token, userId]);

  const TimeStamp = new Date(complaint.timestamp);
  const date = TimeStamp.toLocaleDateString();
  const time = TimeStamp.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  });

  const StatusColorEnum = Object.keys(Statuses).find(
    (key) => Statuses[key] === complaint.status
  );

  const handleAddComment = async () => {
    const userId = localStorage.getItem("userId");
    const newComment = {
      author: userId,
      comment: CommentFValue,
      timestamp: Date.now(),
    };

    try {
      await addComment(complaint._id, CommentFValue, token);
      setComments((prev) => [...prev, newComment]);
      setCommentFValue("");
      setCommentBoxDisabled(true);
    } catch (error) {
      console.error("Error adding comment:", error.message);
    }
  };

  return (
    <div>
      <DialogTitle className="flex justify-between">
       {t("Complaint Details")}
        <FontAwesomeIcon
          onClick={() => setDialogOpen(false)}
          className="cursor-pointer"
          icon={faClose}
        />
      </DialogTitle>

      <DialogContent className="relative pb-24">
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex gap-4 items-center">
            <FontAwesomeIcon icon={faMapMarkerAlt} />
            <p>{complaint.location?.name || "Unknown Location"}</p>
          </div>
          <span
            className="w-30 text-center rounded-xl font-bold flex items-center text-white h-12 lg:h-6 px-4"
            style={{ backgroundColor: statusColors[StatusColorEnum] }}
          >
            {t(complaint.status)}
          </span>
        </div>

        <div className="flex gap-3 items-center mt-2">
          <FontAwesomeIcon icon={faClockFour} />
          <p>{date + " , " + time}</p>
        </div>

        <h2 className="text-lg font-bold my-4">{t(complaint.reason)}</h2>
        <p>{complaint.additionalInfo}</p>

        {/* Media Section */}
        {complaint.mediaType === "image" && complaint?.mediaPath?.buffer ? (
          <img
            className="max-w-full w-auto h-96 object-scale-down"
            src={`data:image/png;base64,${complaint.mediaPath.buffer}`}
            alt="Complaint media"
          />
        ) : complaint.mediaType === "video" && complaint?.mediaPath?.buffer ? (
          <video
            controls
            className="max-w-full w-auto h-96 object-scale-down"
            src={`data:video/mp4;base64,${complaint.mediaPath.buffer}`}
          />
        ) : (
          <p className="text-center text-gray-500 mt-4">No media available</p>
        )}

        {/* Comments */}
        <h2 className="text-lg font-bold my-4">{t("Comments")}</h2>
        {comments.length === 0 ? (
          <p className="text-center">{t("No Comments")}</p>
        ) : (
          comments.map((comment, idx) => (
            <CommentsTile key={idx} comment={comment} />
          ))
        )}

        {/* Comment Input */}
        {complaint.status === Statuses.inProgress && (
          <div className="my-4 flex gap-4 items-center">
            <TextField
              fullWidth
              value={CommentFValue}
              onChange={(e) => {
                setCommentFValue(e.target.value);
                setCommentBoxDisabled(e.target.value.trim() === "");
              }}
              variant="outlined"
              label={t("Add your comment")}
            />
            <IconButton
              className="h-10 w-10 shadow-xl border rounded-full flex items-center justify-center"
              onClick={handleAddComment}
              disabled={CommentBoxDisabled}
            >
              <Send />
            </IconButton>
          </div>
        )}
      </DialogContent>

      {/* Sticky Footer Actions */}
     {official && complaint.status === Statuses.inProgress && (
  <div className="sticky bottom-0 bg-white z-10 border-t p-4 flex justify-end gap-4">
    <button
      className="px-4 py-2 border border-red-600 text-red-600 hover:bg-red-50 font-medium rounded transition duration-300"
      onClick={async () => {
        if (CommentFValue.trim()) await handleAddComment();
        await markAsRejected(complaint._id, token);
        setDialogOpen(false);
      }}
    >
      {t("Mark as Rejected")}
    </button>

    <button
      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded transition duration-300"
      onClick={async () => {
        if (CommentFValue.trim()) await handleAddComment();
        await markAsSolved(complaint._id, token);
        setDialogOpen(false);
      }}
    >
      {t("Mark as Solved")}
    </button>
  </div>
)}

    </div>
  );
};

export default ComplaintDetailModal;
