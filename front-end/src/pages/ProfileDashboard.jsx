import styled from "@emotion/styled";
import { faCamera } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@mui/material";
import MuiTextField from "@mui/material/TextField";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
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

const ReportComplaint = () => {
  const [Media, setMedia] = useState(null);
  const [MediaPath, setMediaPath] = useState("");
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [FormData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    mediaPath: "",
    mediaType: "image",
  });
  const [Err, setErr] = useState(null);
  const [LoaderVisibile, setLoaderVisibile] = useState(false);
  const FileInput = useRef(null);
  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (!token || !userId) return navigate("/citizen-login");

    setToken(token);

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((userData) => {
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          mediaPath: userData.mediaPath || "",
        }));
        if (userData.mediaPath?.buffer) {
          setMediaPath(`data:image/png;base64,${userData.mediaPath?.buffer}`);
        }
      })
      .catch(() => navigate("/citizen-login"));
  }, []);

  useEffect(() => {
    setErr(FormData.password !== FormData.confirmPassword ? t("Password do not match") : null);
  }, [FormData.password, FormData.confirmPassword]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />
      <ToastContainer position="bottom-center" autoClose={3000} hideProgressBar />

      <div className="flex-grow overflow-auto px-4 py-2">
        <h2 className="text-center font-bold text-lg lg:text-xl mb-2">👤 {t("Edit Profile")}</h2>

        <form
          className="flex flex-col gap-3 items-center max-w-xl mx-auto"
          onSubmit={(e) => {
            e.preventDefault();
            setLoaderVisibile(true);
            handleUserProfile(FormData, Media, token)
              .then(() => {
                toast.success(t("Profile updated successfully"));
                navigate(user?.type === "admin" ? "/official-dashboard" : "/citizen-dashboard");
              })
              .catch((err) => {
                setErr(err?.message?.split(": ")[1] || "Profile update failed.");
                toast.error(t("Failed to update profile"));
              })
              .finally(() => setLoaderVisibile(false));
          }}
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

          {/* Form Inputs */}
          <TextField
            label={t("Name")}
            value={FormData.name}
            onChange={(e) => setFormData({ ...FormData, name: e.target.value })}
            required
          />
          <TextField
            label={t("Email")}
            type="email"
            value={FormData.email}
            onChange={(e) => setFormData({ ...FormData, email: e.target.value })}
            required
          />
          <TextField
            label={t("Mobile")}
            value={FormData.mobile}
            onChange={(e) => setFormData({ ...FormData, mobile: e.target.value })}
            required
          />
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
            // type="submit"

            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded shadow-md transition duration-300"
          >
            {t("Update Profile")}
          </button>

        </form>
      </div>
    </div>
  );
};

export default ReportComplaint;
