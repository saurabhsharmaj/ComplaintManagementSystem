import styled from "@emotion/styled";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import DashboardLinkButton from "../components/DashboardLinkButton";
import Navbar from "../components/Navbar";
import SpinnerModal from "../components/SpinnerModal";
import { handleUserProfile } from "../utils/mongodb";
import { API_BASE_URL } from "@/config";
import { useTranslation } from "react-i18next";

const TextField = styled(MuiTextField)({
  width: "100%",
  "& fieldset": { borderRadius: "12px" },
});

const ProfileDashboard = () => {
  const [Media, setMedia] = useState(null);
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
  const [loggedInUser, setLoggedInUser] = useState(null); // logged-in user
  const [userId, setUserId] = useState(null);
  const [FormData, setFormData] = useState({
    name: "",
    fname: "",
    email: "",
    mobile: "",
    cast: "",
    plotno: "",
    galino: "",
    password: "",
    confirmPassword: "",
    mediaPath: "",
    mediaType: "image",
    type: "citizen", // default
  });
  const [Err, setErr] = useState(null);
  const [LoaderVisibile, setLoaderVisibile] = useState(false);
  const FileInput = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { userId: paramUserId } = useParams();
  const fromUserProfile = location.state?.from === "user-profile";

  const isAdmin = loggedInUser?.type === "admin";

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem("token");
    const loggedInUserId = localStorage.getItem("userId");
    const targetUserId = paramUserId || loggedInUserId;

    if (!tokenFromStorage || !targetUserId) return navigate("/citizen-login");

    setUserId(targetUserId);
    setToken(tokenFromStorage);

    // Get logged-in user info
    fetch(`${API_BASE_URL}/user/${loggedInUserId}`, {
      headers: { Authorization: `Bearer ${tokenFromStorage}` },
    })
      .then((res) => res.json())
      .then((data) => setLoggedInUser(data));

    // Get profile to edit (might be own or another user)
    fetch(`${API_BASE_URL}/user/${targetUserId}`, {
      headers: { Authorization: `Bearer ${tokenFromStorage}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        setFormData((prev) => ({
          ...prev,
          name: userData.name || "",
          email: userData.email || "",
          mobile: userData.mobile || "",
          fname: userData.fname || "",
          cast: userData.cast || "",
          plotno: userData.plotno || "",
          galino: userData.galino || "",
          type: userData.type || "citizen",
          mediaPath: userData.mediaPath || "",
        }));

        if (userData.mediaPath?.buffer) {
          setMediaPath(`data:image/png;base64,${userData.mediaPath.buffer}`);
        }
      })
      .catch(() => navigate("/citizen-login"));
  }, [paramUserId, navigate]);

  useEffect(() => {
    setErr(
      FormData.password !== FormData.confirmPassword
        ? t("Password do not match")
        : null
    );
  }, [FormData.password, FormData.confirmPassword]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (Err) return;

    setLoaderVisibile(true);

    handleUserProfile(FormData, Media, token, userId)
      .then(() => {
        toast.success(t("Profile updated successfully"));
        if (fromUserProfile) {
          navigate("/user-dashboard");
        } else {
          navigate(loggedInUser?.type === "admin" ? "/official-dashboard" : "/citizen-dashboard");
        }
      })
      .catch((err) => {
        const message = err?.message?.split(": ")[1] || "Profile update failed.";
        setErr(message);
        toast.error(t("Failed to update profile"));
      })
      .finally(() => setLoaderVisibile(false));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />

      <div className="flex-grow overflow-auto px-3 md:px-6 lg:px-8 py-4">
        <h2 className="text-center font-bold text-lg md:text-xl lg:text-2xl mb-4 md:mb-6 mt-16">
          👤 {t("Edit Profile")}
        </h2>

        <div className="max-w-sm md:max-w-lg lg:max-w-xl mx-auto">
        <form
          className="flex flex-col gap-4 md:gap-5 items-center"
          onSubmit={handleSubmit}
        >
          <input
            type="file"
            ref={FileInput}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;
              setMedia(file);
              setFormData((prev) => ({ ...prev, mediaPath: file }));
              setMediaPath(URL.createObjectURL(file));
            }}
          />

          {!MediaPath && (
            <div className="w-full">
            <DashboardLinkButton
              icon={faCamera}
              name="Upload profile picture"
              subtitle="Make sure the image is clear"
              onClick={() => FileInput.current.click()}
            />
            </div>
          )}

          {MediaPath && (
            <div className="flex flex-col items-center mb-3 md:mb-4 w-full">
              <img
                src={MediaPath}
                alt="Profile Preview"
                className="max-h-40 md:max-h-48 lg:max-h-56 w-auto object-contain rounded-lg shadow-md border"
              />
              <Button
                variant="outlined"
                size="small"
                className="mt-3 text-xs md:text-sm"
                onClick={() => FileInput.current.click()}
              >
                {t("Change Image")}
              </Button>
            </div>
          )}

          <div className="w-full space-y-3 md:space-y-4">
          {[
            { label: t("Name"), key: "name" },
            { label: t("Father Name"), key: "fname" },
            { label: t("Email"), key: "email", type: "email" },
            { label: t("Mobile"), key: "mobile" },
            { label: t("Cast"), key: "cast" },
            { label: t("Gali No"), key: "galino" },
            { label: t("Plot No"), key: "plotno" },
          ].map(({ label, key, type = "text" }) => (
            <TextField
              key={key}
              label={label}
              type={type}
              value={FormData[key]}
              onChange={(e) => setFormData({ ...FormData, [key]: e.target.value })}
              size="medium"
              
            />
          ))}

          {/* Only show User Type if logged in user is admin */}
          {isAdmin && (
            <TextField
              select
              label={t("User Type")}
              value={FormData.type}
              onChange={(e) => setFormData({ ...FormData, type: e.target.value })}
              size="medium"
              // fullWidth
              // margin="normal"
            >
              <MenuItem value="admin">{t("admin")}</MenuItem>
              <MenuItem value="citizen">{t("citizen")}</MenuItem>
            </TextField>
          )}

          <TextField
            label={t("New Password (optional)")}
            type="password"
            value={FormData.password}
            onChange={(e) => setFormData({ ...FormData, password: e.target.value })}
            size="medium"
          />
          <TextField
            label={t("Confirm Password")}
            type="password"
            value={FormData.confirmPassword}
            onChange={(e) => setFormData({ ...FormData, confirmPassword: e.target.value })}
            size="medium"
          />
          </div>

          {Err && (<p className="text-red-600 text-xs md:text-sm text-center w-full">{Err}</p> )}

          {/* <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300 border-radius-12px"
          >
            {t("Update Profile")}
          </button> */}
          <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              className="py-3 md:py-4 text-sm md:text-base font-medium mt-4"
              sx={{
                borderRadius: '12px',
                textTransform: 'none',
                fontSize: { xs: '14px', md: '16px' },
                padding: { xs: '12px', md: '16px' },
                fontFamily: 'inherit'
              }}
            >
              {t("Update Profile")}
            </Button>
        </form>
      </div>
    </div>
    </div>
  );
};

export default ProfileDashboard;
