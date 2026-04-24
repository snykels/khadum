import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/LandingPage";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import FreelancerApplyPage from "./pages/FreelancerApplyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/apply",
    Component: FreelancerApplyPage,
  },
  {
    path: "/freelancer",
    Component: FreelancerDashboard,
  },
  {
    path: "/freelancer/*",
    Component: FreelancerDashboard,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
  },
  {
    path: "/admin/*",
    Component: AdminDashboard,
  },
]);
