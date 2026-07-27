import { createBrowserRouter } from "react-router";
import { Homepage } from "./pages/homepage";
import { TeacherProfile } from "./pages/teacher-profile";
import { TeacherListing } from "./pages/teacher-listing";
import { TeacherOnboarding } from "./pages/teacher-onboarding";
import { TeacherProfileEdit } from "./pages/teacher-profile-edit";
import { TeacherDashboard } from "./pages/teacher-dashboard";
import { TeacherAvailability } from "./pages/teacher-availability";
import { TeacherResources } from "./pages/teacher-resources";
import { LearnerDashboard } from "./pages/learner-dashboard";
import { LearnerProfile } from "./pages/learner-profile";
import { About } from "./pages/about";
import { SignIn } from "./pages/sign-in";
import { SignUp } from "./pages/sign-up";
import { ForgotPassword } from "./pages/forgot-password";
import { ResetPassword } from "./pages/reset-password";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Homepage,
  },
  {
    path: "/teachers",
    Component: TeacherListing,
  },
  {
    path: "/teacher/onboarding",
    Component: TeacherOnboarding,
  },
  {
    path: "/teacher/profile",
    Component: TeacherProfileEdit,
  },
  {
    path: "/teacher/dashboard",
    Component: TeacherDashboard,
  },
  {
    path: "/teacher/availability",
    Component: TeacherAvailability,
  },
  {
    path: "/teacher/resources",
    Component: TeacherResources,
  },
  {
    path: "/teacher/:id",
    Component: TeacherProfile,
  },
  {
    path: "/learner/dashboard",
    Component: LearnerDashboard,
  },
  {
    path: "/learner/profile",
    Component: LearnerProfile,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/signin",
    Component: SignIn,
  },
  {
    path: "/signup",
    Component: SignUp,
  },
  {
    path: "/forgot-password",
    Component: ForgotPassword,
  },
  {
    path: "/reset-password",
    Component: ResetPassword,
  },
]);
