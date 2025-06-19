import styled from "@emotion/styled";
import { LocationSearching } from "@mui/icons-material";
import {
  Box,
  Button,
  ButtonBase,
  Checkbox,
  FormControlLabel,
  Radio,
  RadioGroup,
} from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { createComplaint, isOfficial } from "../utils/mongodb";
import { identifyLocation } from "../utils/MiscFunctions";
import { Statuses } from "../utils/enums";
import { API_BASE_URL } from "@/config";
 
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
 
const ReportComplaint = (user) => {
  const [Media, setMedia] = useState(null);
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
  const [complaintCode, setComplaintCode] = useState(""); // NEW
  const [FormData, setFormData] = useState({
    location: {
      name: "",
      lat: "",
      lng: "",
    },
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
 
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setToken(token);
    const userId = localStorage.getItem("userId");
 
    
        if (!user || user.type !== "admin") {
          return navigate("/");
        }
        localStorage.setItem("userType", user.type); // "admin" or "citizen"
        setFormData((prev) => ({ ...prev, reportedBy: userId }));
      
  }, []);
 
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
 
    if (!file.type.match("image.*")) {
      toast.error("Please upload an image file");
      return;
    }
 
    setLoaderVisibile(true);
    try {
      const compressedImage = await compressImage(file, 100);
      const blob = dataURLtoBlob(compressedImage);
      const compressedFile = new File([blob], file.name, {
        type: "image/jpeg",
        lastModified: Date.now(),
      });
 
      setMedia(compressedFile);
      setFormData({ ...FormData, mediaType: "image" });
      setMediaPath(compressedImage);
    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Error compressing image");
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
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };
 
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoaderVisibile(true);
    createComplaint(FormData, Media, token)
      .then((response) => {
        console.log(response);
        toast.success("Complaint Reported Successfully");
        if (response?.code) {
          setComplaintCode(response.code); // show the complaint code
        }
 
        const userType = localStorage.getItem("userType");
        setTimeout(() => {
          if (userType === "admin") {
            navigate("/official-dashboard");
          } else {
            navigate("/citizen-dashboard");
          }
        }, 3000); // show code for 3 seconds
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => {
        setLoaderVisibile(false);
      });
  };
 
  return (
    <div className="overflow-x-hidden">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={5000} theme="light" />
      <h2 className="lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
        Report a Complaint
      </h2>
 
      <form onSubmit={handleSubmit}>
        <input
          required
          type="file"
          ref={FileInput}
          className="opacity-0"
          accept="image/*"
          onChange={handleFileChange}
        />
        <div
          onClick={() => FileInput.current?.click()}
          className="p-4 m-4 bg-slate-300 inline-flex justify-center items-center cursor-pointer font-bold"
        >
          IMAGE +
        </div>
 
        <div
          className={`relative flex flex-col justify-center items-center mx-8 lg:mx-20 py-6 ${Media ? "block" : "hidden"}`}
        >
          <img
            src={Media && FormData.mediaType === "image" ? MediaPath : ""}
            alt="Compressed preview"
            className="max-w-full w-auto my-6 h-96 object-scale-down"
          />
 
          {complaintCode && (
            <div className="absolute top-4 left-4 bg-black text-white px-4 py-2 rounded shadow-lg text-lg font-bold">
              {complaintCode}
            </div>
          )}
 
          <Button onClick={() => FileInput.current?.click()} variant="outlined">
            Change Image
          </Button>
        </div>
 
        <Box ml={"8vw"}>
          <TextField
            variant="outlined"
            label="Location"
            value={FormData.location.name}
            InputProps={{
              endAdornment: (
                <ButtonBase
                  onClick={async () => {
                    const locationRes = await identifyLocation();
                    setFormData((prev) => ({
                      ...prev,
                      location: locationRes,
                    }));
                  }}
                >
                  <LocationSearching />
                </ButtonBase>
              ),
            }}
          />
 
          <p className="mt-6">Reason:</p>
          <RadioGroup
            onChange={(e) => setFormData({ ...FormData, reason: e.target.value })}
            value={FormData.reason}
          >
            <FormControlLabel value="Streetlight Not Working" control={<Radio />} label="Streetlight Not Working" />
            <FormControlLabel value="Dirty Water Flow on Road" control={<Radio />} label="Dirty Water Flow on Road" />
            <FormControlLabel value="Garbage Dumped on Road" control={<Radio />} label="Garbage Dumped on Road" />
            <FormControlLabel value="Open Manhole" control={<Radio />} label="Open Manhole" />
            <FormControlLabel value="Broken Footpath" control={<Radio />} label="Broken Footpath" />
            <FormControlLabel value="Water Leakage" control={<Radio />} label="Water Leakage" />
            <FormControlLabel value="Others" control={<Radio />} label="Others" />
          </RadioGroup>
 
          <p className="my-2">More Information</p>
          <TextField
            required
            multiline
            value={FormData.additionalInfo}
            onChange={(e) =>
              setFormData({ ...FormData, additionalInfo: e.target.value })
            }
            rows={5}
            placeholder="Provide more information about the incident"
          />
 
          <FormControlLabel
            required
            value="terms-accepted"
            control={<Checkbox />}
            label="By clicking this checkbox, I understood that reporting fake complaints against anyone will lead to legal actions against me."
          />
        </Box>
 
        <div className="flex justify-center my-8 px-40 lg:px-96">
          <Button variant="contained" fullWidth type="submit">
            Submit
          </Button>
        </div>
      </form>
    </div>
  );
};
 
export default ReportComplaint;