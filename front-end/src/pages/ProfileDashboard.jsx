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
    <div className="h-screen flex flex-col overflow-hidden">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />

      <div className="flex-grow overflow-auto px-4 py-2">
        <h2 className="text-center font-bold text-lg lg:text-xl mb-2 mt-16">
          👤 {t("Edit Profile")}
        </h2>

        <form
          className="flex flex-col gap-3 items-center max-w-xl mx-auto"
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
            <DashboardLinkButton
              icon={faCamera}
              name="Upload profile picture"
              subtitle="Make sure the image is clear"
              onClick={() => FileInput.current.click()}
            />
          )}

          {MediaPath && (
            <div className="flex flex-col items-center mb-2">
              <img
                src={MediaPath}
                alt="Profile Preview"
                className="max-h-[30vh] object-contain rounded shadow"
              />
              <Button
                variant="outlined"
                size="small"
                className="mt-2"
                onClick={() => FileInput.current.click()}
              >
                {t("Change Image")}
              </Button>
            </div>
          )}

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
              
            />
          ))}

          {/* Only show User Type if logged in user is admin */}
          {isAdmin && (
            <TextField
              select
              label={t("User Type")}
              value={FormData.type}
              onChange={(e) => setFormData({ ...FormData, type: e.target.value })}
              fullWidth
              margin="normal"
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
          />
          <TextField
            label={t("Confirm Password")}
            type="password"
            value={FormData.confirmPassword}
            onChange={(e) => setFormData({ ...FormData, confirmPassword: e.target.value })}
          />
          {Err && <p className="text-red-600 text-sm">{Err}</p>}

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300"
          >
            {t("Update Profile")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ProfileDashboard;
