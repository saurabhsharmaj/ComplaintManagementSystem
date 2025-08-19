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
        className="border shadow-md rounded-lg my-4 p-3 md:p-4 flex flex-col sm:flex-row justify-between gap-3 md:gap-4"
        style={{ borderLeft: `5px solid ${statusColor}` }}
      >
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-3 sm:gap-4 md:gap-8 flex-1">  
          <div className="flex flex-col items-center flex-shrink-0">
            <span className="text-xs md:text-sm font-bold mb-1 text-center break-all max-w-[80px] sm:max-w-none">{complaint.code}</span>

            <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 flex-shrink-0">
            {/* ⬇️ Conditional display of media */}
            {userType === "citizen" ? (
              complaint.mediaType === "image" ? (
                <img
                  className="max-w-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-sm"
                  src={`data:image/png;base64,${complaint.mediaPath?.buffer}`}
                  alt="Complaint Media"
                />
              ) : (
                <video
                  controls
                  className="max-w-full w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 object-cover rounded-sm"
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
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-sm object-cover"
              />
            )}
            </div>
          

            {/* 👤 Show name only for non-citizen (i.e., admin) view */}
            {userType !== "citizen" && (
              <p className="text-center sm:mt-2 font-medium text-xs md:text-sm break-words max-w-[100px] sm:max-w-none">{user.name}</p>
            )}
          </div> 

          <div className="flex-1 min-w-0 space-y-1 sm:space-y-2 text-center sm:text-left">

            <div className="text-xs md:text-sm">
            <span className="font-medium">{t("Reported Date")}: </span>
            <span className="break-words">
              {date.toLocaleString("en-IN", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
            </div>

            <p className="text-xs text-gray-600 break-all">{user.mobile}</p>
            <p className="font-semibold text-gray-800 text-sm md:text-base break-words">{t(complaint.reason)}</p>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <FontAwesomeIcon icon={faMapMarkerAlt} className="text-xs md:text-sm flex-shrink-0" />
              <span className="text-xs md:text-sm break-words min-w-0">{complaint.location?.name}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-row sm:flex-col justify-between sm:justify-between items-center sm:items-end gap-3 sm:gap-2 flex-shrink-0 mt-3 sm:mt-0">
          <div className="order-2 sm:order-1">
            <span
              className="cursor-pointer font-semibold text-blue-600 hover:underline hover:text-blue-700 transition-colors duration-200 text-xs md:text-sm whitespace-nowrap"
              onClick={() => setDialogOpen(true)}
            >
              {t("Detailed View")}
            </span>
          </div>

          <div className="font-bold flex items-center gap-1 order-1 sm:order-2">
            <span style={{ color: statusColor }} className="text-xs md:text-sm whitespace-nowrap">{t(complaint.status)}</span>
          </div>
        </div>
      </div>
    </>
  );
};

export default ComplaintsCard;
