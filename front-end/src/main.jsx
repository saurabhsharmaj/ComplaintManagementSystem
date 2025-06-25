import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import ReportedComplaints from "./components/ReportedComplaints";
import "./index.css";
import CitizenDashboard from "./pages/CitizenDashboard";
import CitizenLogin from "./pages/CitizenLogin";
import HomePage from "./pages/HomePage";
import OfficialDashboard from "./pages/OfficialDashboard";
import OfficialLogin from "./pages/OfficialLogin";
import ReportComplaint from "./pages/ReportComplaint";
import ProfileDashboard from "./pages/ProfileDashboard";
import { ToastContainer } from "react-toastify";
import './i18n';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import { LanguageProvider } from './context/LanguageContext';

const router = createBrowserRouter([
  {
    path: "/",
    element: <HomePage />,
  },
  {
    path: "/profile-Dashboard",
    element: <ProfileDashboard />,
  },
  {
    path: "/citizen-login",
    element: <CitizenLogin />,
  },
  {
    path: "/official-login",
    element: <OfficialLogin />,
  },
  {
    path: "/citizen-dashboard",
    element: <CitizenDashboard />,
  },
  {
    path: "/official-dashboard",
    element: <OfficialDashboard />,
  },
  {
    path: "/report",
    element: <ReportComplaint />,
  },
  {
    path: "/track-complaints",
    element: (
      <>
        <Navbar />
        <ReportedComplaints />
      </>
    ),
  },
]);
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <I18nextProvider i18n={i18n}>
      <LanguageProvider>
        <RouterProvider router={router} />
        <ToastContainer limit={1} />
      </LanguageProvider>
    </I18nextProvider>
  </React.StrictMode>
);

