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

const TextField = styled(MuiTextField)({
  width: "80%",
  "& fieldset": {
    borderRadius: "15px",
  },
});

// Helper function to convert buffer to base64 string
function bufferToBase64(buffer) {
  if (!buffer) return null;
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
}

const ReportComplaint = () => {
  const [Media, setMedia] = useState(null);
  const [MediaPath, setMediaPath] = useState(""); // preview URL
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

  // Fetch user profile on mount
  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/citizen-login");
      return;
    }

    setToken(token);

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        console.log(userData)
        setFormData((prev) => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
          mediaPath: userData.mediaPath || "",
          mediaType: "image",
        }));
        if (userData.mediaPath?.buffer) {
          setMediaPath(`data:image/png;base64,${userData.mediaPath?.buffer}`);
        }
      })
      .catch((err) => {
        console.error("Error loading profile:", err);
        navigate("/citizen-login");
      });
  }, []);

  // Validate password match
  useEffect(() => {
    if (FormData.password !== FormData.confirmPassword) {
      setErr("The password and confirmation password do not match.");
    } else {
      setErr(null);
    }
  }, [FormData.password, FormData.confirmPassword]);

  return (
    <div className="overflow-x-hidden">
      <SpinnerModal visible={LoaderVisibile} />
      <Navbar />

      <ToastContainer position="bottom-center" autoClose={5000} hideProgressBar />

      <h2 className="lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
        👤 Edit Profile
      </h2>

      <div className="RegisterAccount flex flex-col gap-5 items-center border-solid border-gray-500 px-3 lg:px-4 py-5 mx-4 lg:mx-12 rounded-3xl border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20">
        <form
          className="flex flex-col gap-5 w-full"
          onSubmit={(e) => {
            e.preventDefault();
            setLoaderVisibile(true);

            handleUserProfile(FormData, Media, token)
              .then(() => {
                setLoaderVisibile(false);
                toast.success("Profile updated successfully!");
                navigate(user?.type === "admin" ? "/official-dashboard" : "/citizen-dashboard");
              })
              .catch((err) => {
                setLoaderVisibile(false);
                const msg = err?.message?.split(": ")[1] || "Profile update failed.";
                setErr(msg);
                toast.error("Failed to update profile");
              });
          }}
        >
          {/* Hidden file input */}
          <input
            type="file"
            ref={FileInput}
            className="hidden"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files[0];
              if (!file) return;

              setMedia(file);
              setFormData((prev) => ({
                ...prev,
                mediaPath: file,
                mediaType: "image",
              }));
              setMediaPath(URL.createObjectURL(file)); // Show preview of new image
            }}
          />

          {/* Upload button if no media yet */}
          {!MediaPath && (
            <DashboardLinkButton
              className="mx-[8vw]"
              icon={faCamera}
              name={"Upload profile picture"}
              onClick={() => FileInput.current.click()}
              subtitle={"Make sure the image is clear"}
            />
          )}

          {/* Show image preview */}
          {MediaPath && (
            <div className="flex flex-col justify-center items-center mx-8 lg:mx-20 py-6">
              <img
                src={
                  MediaPath
                }
                alt="Profile Update"
                className="h-96 object-contain border rounded shadow"
              />
              <Button onClick={() => FileInput.current.click()} variant="outlined" className="mt-3">
                Change Image
              </Button>
            </div>
          )}

          {/* Form Fields */}
          <div>
            <label className="block font-medium">Name</label>
            <input
              type="text"
              value={FormData.name}
              onChange={(e) => setFormData({ ...FormData, name: e.target.value })}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              value={FormData.email}
              onChange={(e) => setFormData({ ...FormData, email: e.target.value })}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Mobile</label>
            <input
              type="text"
              value={FormData.mobile}
              onChange={(e) => setFormData({ ...FormData, mobile: e.target.value })}
              required
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">New Password (optional)</label>
            <input
              type="password"
              value={FormData.password}
              onChange={(e) => setFormData({ ...FormData, password: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium">Confirm Password</label>
            <input
              type="password"
              value={FormData.confirmPassword}
              onChange={(e) => setFormData({ ...FormData, confirmPassword: e.target.value })}
              className="w-full border p-2 rounded"
            />
          </div>

          {Err && <p className="text-red-600 text-sm">{Err}</p>}

          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Update Profile
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReportComplaint;
