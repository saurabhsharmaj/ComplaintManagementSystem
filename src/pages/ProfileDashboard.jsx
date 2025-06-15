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

const TextField = styled(MuiTextField)((props) => ({
  width: "80%",
  [`& fieldset`]: {
    borderRadius: "15px",
  },
}));

const ReportComplaint = () => {
  const [Media, setMedia] = useState();
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
    mediaType: ""
  });
  const [Err, setErr] = useState(null);
  const [LoaderVisibile, setLoaderVisibile] = useState(false);
  const FileInput = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) {
      navigate("/citizen-login");
      return;
    } else {
      setToken(token);
    }

    fetch(`${API_BASE_URL}/user/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((userData) => {
        setUser(userData);
        setFormData((prev) => ({
          ...prev,
          name: userData.name,
          email: userData.email,
          mobile: userData.mobile,
        }));
      })
      .catch(() => {
        navigate("/citizen-login");
      });

  }, []);

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

  <ToastContainer
    position="bottom-center"
    autoClose={5000}
    hideProgressBar
    newestOnTop={false}
    closeOnClick
    rtl={false}
    pauseOnFocusLoss
    draggable
    pauseOnHover
    theme="light"
  />

  <h2 className="lg:mt-10 leading-normal font-bold text-center text-xl lg:text-[2rem] my-6 lg:text-left lg:mx-20">
    👤 Edit Profile
  </h2>

  <div className="RegisterAccount flex flex-col gap-5 items-center border-solid border-gray-500 px-3 lg:px-4 py-5 mx-4 lg:mx-12 rounded-3xl border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20">
    <div className="flex flex-col lg:flex-row w-full gap-10">
      {/* Media Preview Section */}
      {Media && (
        <div className="w-full lg:w-1/2 flex flex-col items-center justify-center">
          {FormData.mediaType === "image" && (
            <img
              src={MediaPath}
              alt="Preview"
              className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow"
            />
          )}
          <Button onClick={() => FileInput.current.click()} variant="outlined" className="mt-4">
            Change Image
          </Button>
        </div>
      )}

      {/* Form Section */}
      <form
        className="flex flex-col gap-5 w-full lg:w-1/2"
        onSubmit={(e) => {
          e.preventDefault();
          setLoaderVisibile(true);

          handleUserProfile(FormData, Media, token)
            .then((updatedUser) => {
              setLoaderVisibile(false);
              toast.success("Profile updated successfully!");
              navigate(user.type === "admin" ? `/official-dashboard` : `/citizen-dashboard`);
            })
            .catch((err) => {
              setLoaderVisibile(false);
              const msg = err?.message?.split(": ")[1] || "Profile update failed.";
              setErr(msg);
              toast.error("Failed to update profile");
            });
        }}
      >
        <input
          required
          type="file"
          ref={FileInput}
          className="opacity-0"
          accept="image/*,video/*"
          onChange={(e) => {
            setMedia(e.target.files[0]);
            setFormData({
              ...FormData,
              mediaType: e.target.files[0].type.split("/")[0],
            });
            setMediaPath(URL.createObjectURL(e.target.files[0]));
          }}
        />

        <DashboardLinkButton
          className={`${Media ? "hidden" : "block"} mx-[8vw]`}
          icon={faCamera}
          name={"Upload a picture/video of incident"}
          onClick={() => FileInput.current.click()}
          subtitle={"Make sure that everything is clear"}
        />

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
</div>

  );
};

export default ReportComplaint;
