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
import React, { useEffect, useRef, useState } from "react";
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
  "& fieldset": {
    borderRadius: "15px",
  },
}));

const ReportComplaint = () => {
  const [Media, setMedia] = useState();
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
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
    if (!token) {
      navigate("/citizen-login");
      return;
    }
    setToken(token);
    const userId = localStorage.getItem("userId");

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((user) => {
        if (!user || !isOfficial(user.uid)) {
          return navigate("/");
        }
        setFormData((prev) => ({ ...prev, reportedBy: userId }));
      });
  }, []);

  return (
    <div className="overflow-x-hidden">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar
        pauseOnHover
        theme="light"
      />
      <h2 className="lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
        Report a Complaint
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setLoaderVisibile(true);
          createComplaint(FormData, Media, token)
            .then(() => {
              toast.success("Complaint Reported Successfully");
              setTimeout(() => {
                navigate("/citizen-dashboard");
              }, 3000);
            })
            .catch((err) => {
              toast.error(err.message || "Failed to submit complaint");
            })
            .finally(() => {
              setLoaderVisibile(false);
            });
        }}
      >
        {/* Hidden File Input for media */}
        <input
          required
          type="file"
          ref={FileInput}
          className="opacity-0"
          accept="image/*,video/*"
          capture="environment"
          onChange={(e) => {
            const file = e.target.files[0];
            if (!file) return;

            const fileType = file.type.split("/")[0];
            if (!["image", "video"].includes(fileType)) {
              toast.error("Invalid file type selected.");
              return;
            }

            setMedia(file);
            setFormData((prev) => ({
              ...prev,
              mediaType: fileType,
            }));

            try {
              const objectURL = URL.createObjectURL(file);
              setMediaPath(objectURL);
            } catch (error) {
              toast.error("Could not process selected file.");
              console.error(error);
            }
          }}
        />

        {/* Upload Trigger */}
        <div
          onClick={() => FileInput.current.click()}
          className="p-4 m-4 bg-slate-300 inline-flex justify-center items-center cursor-pointer font-bold"
        >
          IMAGE +
        </div>

        {/* Media Preview */}
        {Media && (
          <div className="flex flex-col justify-center items-center mx-8 lg:mx-20 py-6">
            {FormData.mediaType === "image" && (
              <img
                src={MediaPath}
                alt="Selected"
                className="max-w-full w-auto my-6 h-96 object-scale-down"
              />
            )}
            {FormData.mediaType === "video" && (
              <video
                controls
                src={MediaPath}
                className="max-w-full w-auto my-6 h-96 object-scale-down"
              />
            )}
            <Button onClick={() => FileInput.current.click()} variant="outlined">
              Change Media
            </Button>
          </div>
        )}

        {/* Form Fields */}
        <Box ml="8vw">
          <TextField
            variant="outlined"
            label="Location"
            value={FormData.location.name}
            required
            InputProps={{
              readOnly: true,
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
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
            value={FormData.reason}
          >
            <FormControlLabel
              value="Streetlight Not Working"
              control={<Radio />}
              label="Streetlight Not Working"
            />
            <FormControlLabel
              value="Dirty Water Flow on Road"
              control={<Radio />}
              label="Dirty Water Flow on Road"
            />
            <FormControlLabel
              value="Garbage Dumped on Road"
              control={<Radio />}
              label="Garbage Dumped on Road"
            />
            <FormControlLabel
              value="Open Manhole"
              control={<Radio />}
              label="Open Manhole"
            />
            <FormControlLabel
              value="Broken Footpath"
              control={<Radio />}
              label="Broken Footpath"
            />
            <FormControlLabel
              value="Water Leakage"
              control={<Radio />}
              label="Water Leakage"
            />
            <FormControlLabel
              value="Others"
              control={<Radio />}
              label="Others"
            />
          </RadioGroup>

          <p className="my-2">More Information</p>
          <TextField
            required
            multiline
            value={FormData.additionalInfo}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                additionalInfo: e.target.value,
              }))
            }
            rows={5}
            placeholder="Provide more information about the incident"
            inputProps={{
              pattern: ".*",
            }}
          />

          <FormControlLabel
            required
            control={<Checkbox />}
            label="By clicking this checkbox, I understand that reporting fake complaints against anyone may lead to legal actions against me."
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
