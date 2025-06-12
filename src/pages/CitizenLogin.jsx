import { Button } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import { TextField } from "../components/RegisterAccount";
import { handleLogin } from "../utils/mongodb";
import SpinnerModal from "../components/SpinnerModal";

const CitizenLogin = () => {
  const [FormData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [Spinner, setSpinner] = useState(false);
  const [Err, setErr] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("/users/verifyToken", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          navigate("/citizen-dashboard");
        }
      })
      .catch(() => { });
  }, []);

  const isEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isMobile = (value) => /^[0-9]{10}$/.test(value);

  return (
    <div className="h-screen overflow-hidden ">
      <SpinnerModal visible={Spinner} />
      <Navbar />
      <div className="lg:px-96 px-4 h-3/4 flex flex-col justify-center">
        <h2 className="mt-[25%] lg:mt-0 leading-normal font-bold text-center text-base lg:text-[2rem] my-8">
          Citizen Login
        </h2>
        <div className="LoginBox flex flex-col gap-5 items-center border-solid border-gray-500 px-3 lg:px-12 py-12 mx-4 lg:mx-12 rounded-3xl border-2 shadow-[0px_20px_20px_10px_#00000024] bg-opacity-20 lg:h-3/4 justify-center">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setSpinner(true);

              // Determine if identifier is email or mobile
              const loginPayload = isEmail(FormData.identifier)
                ? { email: FormData.identifier, password: FormData.password }
                : isMobile(FormData.identifier)
                  ? { mobile: FormData.identifier, password: FormData.password }
                  : null;

              if (!loginPayload) {
                setErr("Please enter a valid email or 10-digit mobile number");
                setSpinner(false);
                return;
              }

              handleLogin(loginPayload)
                .then(async (user) => {
                  if (user.type !== "admin") {
                    navigate("/citizen-dashboard");
                  } else {
                    await auth.signOut?.();
                    throw new Error("Invalid user");
                  }
                })
                .catch((err) => {
                  setErr(err.message.split(": ")[1] || err.message);
                })
                .finally(() => setSpinner(false));
            }}
            className="flex flex-col gap-5 w-full"
          >
            <TextField
              variant="outlined"
              label="E-mail or Mobile"
              type="text"
              onChange={(e) =>
                setFormData({ ...FormData, identifier: e.target.value })
              }
              required
            />
            <TextField
              variant="outlined"
              label="Password"
              type="password"
              onChange={(e) =>
                setFormData({ ...FormData, password: e.target.value })
              }
              required
            />
            <p className="text-red-600">{Err}</p>

            <Button variant="contained" type="submit">
              Login
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CitizenLogin;
