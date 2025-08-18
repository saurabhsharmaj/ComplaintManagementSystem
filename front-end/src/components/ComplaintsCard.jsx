import { faMapMarkerAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@mui/material";
import { useState } from "react";
import ComplaintDetailModal from "./ComplaintDetailModal";
import { Statuses, statusColors } from "../utils/enums";
import { useTranslation } from "react-i18next";

const ComplaintsCard = ({ complaint, user, userType }) => {
  const [DialogOpen, setDialogOpen] = useState(false);
  const { t } = useTranslation();
  const date = new Date(complaint.timestamp);

  const statusKey = Object.keys(Statuses).find(
    (key) => Statuses[key] === complaint.status
  );
  const statusColor = statusColors[statusKey] || "#333";

  if (!user) return null;

  return (
    <>
      <Dialog open={DialogOpen} onClose={() => setDialogOpen(false)}>
        <ComplaintDetailModal
          setDialogOpen={setDialogOpen}
          complaint={complaint}
        />
      </Dialog>

      <div
        className="border shadow-md rounded-lg my-4 p-4 flex justify-between gap-3"
        style={{ borderLeft: `5px solid ${statusColor}` }}
      >
        <div className="flex items-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-sm font-bold mb-1">{complaint.code}</span>

            {/* ⬇️ Conditional display of media */}
            {userType === "citizen" ? (
              complaint.mediaType === "image" ? (
                <img
                  className="max-w-full w-28 h-28 object-cover rounded-sm"
                  src={`data:image/png;base64,${complaint.mediaPath?.buffer}`}
                  alt="Complaint Media"
                />
              ) : (
                <video
                  controls
                  className="max-w-full w-28 h-28 object-cover rounded-sm"
                  src={`data:video/mp4;base64,${complaint.mediaPath?.buffer}`}
                />
              )
            ) : (
              <img
                src={
                  user?.mediaPath?.buffer
                    ? `data:image/jpeg;base64,${user.mediaPath.buffer}`
                    : "/default-avatar.png"
                }
                alt="User"
                className="w-28 h-28 rounded-sm object-cover"
              />
            )}

            {/* 👤 Show name only for non-citizen (i.e., admin) view */}
            {userType !== "citizen" && (
              <p className="text-center mt-2 font-medium">{user.name}</p>
            )}
          </div>

          <div>
            <span>
              {t("Reported Date")}:{" "}
              {date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>

            <p className="text-xs text-gray-600">{user.mobile}</p>
            <p className="font-semibold text-gray-800">{t(complaint.reason)}</p>
            <div className="flex items-center gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} />
              <span>{complaint.location?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between text-sm">
          <div className="flex flex-row gap-5">
            <span
              className="cursor-pointer font-semibold text-blue-600 hover:underline flex justify-end"
              onClick={() => setDialogOpen(true)}
            >
              {t("Detailed View")}
            </span>
          </div>
          <div className="font-bold flex items-center gap-1">
            <span style={{ color: statusColor }}>{t(complaint.status)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintsCard;
