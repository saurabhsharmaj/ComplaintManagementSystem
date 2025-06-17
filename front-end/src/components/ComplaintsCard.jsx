import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@mui/material";
import { useEffect, useState } from "react";
import ComplaintDetailModal from "./ComplaintDetailModal";
import imageCompression from "browser-image-compression";
import { Statuses, statusColors } from "../utils/enums";

const ComplaintsCard = ({ complaint, user }) => {
  const [DialogOpen, setDialogOpen] = useState(false);
  const [compressedImage, setCompressedImage] = useState(null);
  const date = new Date(complaint.timestamp);

  const statusKey = Object.keys(Statuses).find(
    (key) => Statuses[key] === complaint.status
  );
  const statusColor = statusColors[statusKey] || "#333";

  useEffect(() => {
    const compressImage = async () => {
      if (user?.mediaPath?.buffer) {
        try {
          // Decode base64 buffer to binary
          const binary = atob(user.mediaPath.buffer);
          const array = Uint8Array.from(binary, (char) => char.charCodeAt(0));
          const blob = new Blob([array], { type: "image/png" });

          // Compress the image
          const options = {
            maxSizeMB: 0.1, // < 100KB
            maxWidthOrHeight: 300, // Resize to smaller dimensions
            useWebWorker: true,
          };

          const compressedBlob = await imageCompression(blob, options);
          const base64 = await imageCompression.getDataUrlFromFile(compressedBlob);

          setCompressedImage(base64);
        } catch (err) {
          console.error("Image compression failed:", err);
        }
      }
    };

    compressImage();
  }, [user]);

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
          <div className="flex flex-col items-center">
            <img
              src={compressedImage || "/default-avatar.png"}
              alt="User"
              className="w-28 h-28 rounded-sm object-cover"
            />
            <p className="font-bold text-sm mt-2">{user.name}</p>
          </div>
          <div>
            <span>Reported Date: {date.toLocaleDateString("en-IN")}</span>
            <p className="text-xs text-gray-600">{user.mobile}</p>
            <p className="font-semibold">
              <span className="text-gray-800">{complaint.reason}</span>
            </p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{complaint.location?.name}</span>
            </div>
          </div>
        </div>

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
