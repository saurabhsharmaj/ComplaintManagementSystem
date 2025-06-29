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
  isOfficial,
  markAsRejected,
  markAsSolved,
} from "../utils/mongodb";
import { Statuses, statusColors } from "../utils/enums";
import CommentsTile from "./CommentsTile";
import { API_BASE_URL } from "@/config";

const ComplaintDetailModal = ({ setDialogOpen, complaint }) => {
  const [Official, setOfficial] = useState(false);
  const [comments, setComments] = useState(complaint.comments || []);
  const [token, setToken] = useState("");
  const [CommentBoxDisabled, setCommentBoxDisabled] = useState(true);
  const [CommentFValue, setCommentFValue] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    setToken(token);

    // Fetch user
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
  }, []);

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

  // Add Comment Handler
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
        Complaint Details
        <DialogActions>
          <FontAwesomeIcon
            onClick={() => setDialogOpen(false)}
            className="cursor-pointer"
            icon={faClose}
          />
        </DialogActions>
      </DialogTitle>

      <DialogContent>
        <div>
          <div className="flex justify-between">
            <div className="flex gap-4 items-center">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <p>{complaint.location.name}</p>
            </div>
            <span
              className="w-30 text-center rounded-xl font-bold flex items-center text-white h-12 lg:h-6 px-4"
              style={{ backgroundColor: statusColors[StatusColorEnum] }}
            >
              {complaint.status}
            </span>
          </div>

          <div className="flex gap-3 items-center">
            <FontAwesomeIcon icon={faClockFour} />
            <p>{date + " , " + time}</p>
          </div>

          <h2 className="text-lg font-bold my-4">{complaint.reason}</h2>
          <p>{complaint.additionalInfo}</p>

          {complaint.mediaType === "image" ? (
            <img
              className="max-w-full w-auto h-96 object-scale-down"
              src={`data:image/png;base64,${complaint.mediaPath.buffer}`}
              alt="Complaint media"
            />
          ) : (
            <video
              controls
              className="max-w-full w-auto h-96 object-scale-down"
              src={`data:video/mp4;base64,${complaint.mediaPath.buffer}`}
            />
          )}

          <h2 className="text-lg font-bold my-4">Comments</h2>

          <div>
            {comments.length === 0 ? (
              <p className="text-center">No Comments</p>
            ) : (
              comments.map((comment, idx) => (
                <CommentsTile key={idx} comment={comment} />
              ))
            )}
          </div>

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
                label="Add your comment"
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
        </div>
      </DialogContent>

      <DialogActions>
        {Official && complaint.status === Statuses.inProgress && (
          <>
            <Button
              color="error"
              variant="outlined"
              onClick={async () => {
                await markAsRejected(complaint._id, token);
                setDialogOpen(false);
              }}
            >
              Mark as Rejected
            </Button>
            <Button
              color="success"
              variant="contained"
              onClick={async () => {
                await markAsSolved(complaint._id, token);
                setDialogOpen(false);
              }}
            >
              Mark as Solved
            </Button>
          </>
        )}
      </DialogActions>
    </div>
  );
};

export default ComplaintDetailModal;
