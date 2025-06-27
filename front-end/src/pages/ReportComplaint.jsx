import styled from "@emotion/styled";
import { LocationSearching } from "@mui/icons-material";
import {
  Button,
  ButtonBase,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { createComplaint} from "../utils/mongodb";
import { identifyLocation } from "../utils/MiscFunctions";
import { Statuses } from "../utils/enums";
import { useTranslation } from "react-i18next";

const TextField = styled(MuiTextField)(() => ({
  width: "80%",
  [`& fieldset`]: {
    borderRadius: "15px",
  },
}));

const compressImage = async (file, maxSizeKB = 100) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        let width = img.width;
        let height = img.height;
        let quality = 0.9;
        let result;

        const doCompress = () => {
          canvas.width = width;
          canvas.height = height;
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, width, height);

          result = canvas.toDataURL("image/jpeg", quality);
          const sizeKB =
            (result.length - "data:image/jpeg;base64,".length) * 0.75 / 1024;

          if (sizeKB > maxSizeKB) {
            if (quality > 0.5) {
              quality -= 0.1;
            } else if (width > 800 || height > 800) {
              width *= 0.8;
              height *= 0.8;
            } else {
              return resolve(result);
            }
            return doCompress();
          }

          return resolve(result);
        };

        doCompress();
      };
    };
  });
};

// ... imports remain same

const ReportComplaint = () => {
  const location = useLocation();
  const user = location.state?.user;
  const [Media, setMedia] = useState(null);
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
  const [complaintCode, setComplaintCode] = useState("");
  const [FormData, setFormData] = useState({
    location: { name: "", lat: "", lng: "" },
    mediaPath: "",
    reason: "",
    additionalInfo: "",
    reportedBy: "",
    timestamp: "",
    status: Statuses.inProgress,
    mediaType: "",
  });
  const [LoaderVisibile, setLoaderVisibile] = useState(false);
  const FileInput = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setToken(token);
    const userId = localStorage.getItem("userId");
    if (!user || user.type !== "admin") return navigate("/report");
    localStorage.setItem("userType", user.type);
    setFormData((prev) => ({ ...prev, reportedBy: userId }));
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.match("image.*")) {
      toast.error(token("Please upload an image file"));
      return;
    }

    setLoaderVisibile(true);
    try {
      const compressedImage = await compressImage(file, 100);
      const blob = dataURLtoBlob(compressedImage);
      const compressedFile = new File([blob], file.name, { type: "image/jpeg" });
      setMedia(compressedFile);
      setFormData({ ...FormData, mediaType: "image" });
      setMediaPath(compressedImage);
    } catch (error) {
      toast.error(t("Error compressing image"));
    } finally {
      setLoaderVisibile(false);
    }
  };

  const dataURLtoBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoaderVisibile(true);
    createComplaint(FormData, Media, token)
      .then((response) => {
        toast.success(t("Complaint Reported Successfully"));
        setComplaintCode(response?.code || "");
        setTimeout(() => {
          navigate(user?.type === "admin" ? "/official-dashboard" : "/citizen-dashboard");
        }, 2000);
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setLoaderVisibile(false));
  };

  return (
    <div className="h-screen w-full overflow-hidden flex flex-col">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={5000} theme="light" />

      <div className="flex-grow overflow-auto px-4 lg:px-16 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <h2 className="text-center text-xl font-bold">{t("Report Complaint")}</h2>

          <input
            required
            type="file"
            ref={FileInput}
            className="hidden"
            accept="image/*"
            onChange={handleFileChange}
          />
          <div
            onClick={() => FileInput.current?.click()}
            className="bg-slate-300 p-2 rounded cursor-pointer text-center"
          >
            {t("Image")} +
          </div>

          {Media && (
            <div className="text-center">
              <img
                src={MediaPath}
                alt="Preview"
                className="mx-auto max-h-40 object-contain"
              />
              <Button onClick={() => FileInput.current?.click()} variant="outlined" size="small">
                {t("Change Image")}
              </Button>
            </div>
          )}

          {complaintCode && (
            <div className="bg-black text-white px-4 py-2 rounded text-center font-bold">
              {complaintCode}
            </div>
          )}

          <TextField
            label={t("Location")}
            value={FormData.location.name}
            InputProps={{
              endAdornment: (
                <ButtonBase
                  onClick={async () => {
                    const loc = await identifyLocation();
                    setFormData((prev) => ({ ...prev, location: loc }));
                  }}
                >
                  <LocationSearching />
                </ButtonBase>
              ),
            }}
          />

          <div>
            <p className="font-medium">{t("Reason")}:</p>
            <RadioGroup
              onChange={(e) => setFormData({ ...FormData, reason: e.target.value })}
              value={FormData.reason}
            >
              {[
                "Streetlight Not Working",
                "Dirty Water Flow on Road",
                "Garbage Dumped on Road",
                "Open Manhole",
                "Broken Footpath",
                "Water Leakage",
                "Others",
              ].map((reason) => (
                <FormControlLabel
                  key={reason}
                  value={reason}
                  control={<Radio size="small" />}
                  label={t(reason)}
                />
              ))}
            </RadioGroup>
          </div>

          <TextField
            multiline
            rows={2}
            value={FormData.additionalInfo}
            onChange={(e) => setFormData({ ...FormData, additionalInfo: e.target.value })}
            placeholder={t("More Information")}
          />

          <FormControlLabel
            required
            control={<Checkbox />}
            label={t("By clicking on this checkbox I understand that you want to lodge a complaint...")}
          />

          <Button type="submit" fullWidth variant="contained">
            {t("Submit")}
          </Button>
        </form>
      </div>
    </div>
  );
};


export default ReportComplaint;