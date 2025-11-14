// File: frontend/src/routes.jsx

import Home from "@/pages/home";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ProfilePage from "@/pages/profile/ProfilePage";
import MyPrograms from "@/pages/programs/MyPrograms";
import Terms from "@/pages/Terms";

// Member Portal Components
import MemberLayout from "@/components/member/MemberLayout";
import MemberDashboard from "@/pages/member/MemberDashboard";
import MemberProgress from "@/pages/member/MemberProgress";
import MemberBookings from "@/pages/member/MemberBookings";

// ⭐ NOUVEAUX IMPORTS COACH
import CoachPanel from "@/pages/coach/CoachPanel";
import CoachMembers from "@/pages/coach/CoachMembers";
import CoachSchedule from "@/pages/coach/CoachSchedule";
import CoachExercises from "@/pages/coach/CoachExercises";
import CoachSettings from "@/pages/coach/CoachSettings";

// Admin imports
import Dashboard from "@/pages/admin/dashboard/Dashboard";
import { ProgramBuilder, ExerciseList } from "@/pages/admin/programs";
import ReservationList from "@/pages/admin/ReservationList";
import { Staff, UserCreate } from "@/pages/admin/staff";

// Imports Membres
import MemberCreate from "@/pages/admin/members/MemberCreate";
import MemberDetail from "@/pages/admin/members/MemberDetail";
import MemberEdit from "@/pages/admin/members/MemberEdit";
import MemberList from "@/pages/admin/members/MemberList";

// Imports Salles (Rooms)
import RoomCreate from "./pages/admin/bookings/rooms/RoomCreate";
import RoomList from "./pages/admin/bookings/rooms/RoomList";
import RoomDetail from "./pages/admin/bookings/rooms/RoomDetail";
import RoomEdit from "./pages/admin/bookings/rooms/RoomEdit";

// Imports Types de Cours (Course Types)
import CourseTypeCreate from "./pages/admin/bookings/course-types/CourseTypeCreate";
import CourseTypeList from "./pages/admin/bookings/course-types/CourseTypeList";
import CourseTypeDetail from "./pages/admin/bookings/course-types/CourseTypeDetail";
import CourseTypeEdit from "./pages/admin/bookings/course-types/CourseTypeEdit";

// Imports Cours/Sessions (Courses)
import CourseCreate from "./pages/admin/bookings/courses/CourseCreate";
import CourseList from "./pages/admin/bookings/courses/CourseList";
import CourseDetail from "./pages/admin/bookings/courses/CourseDetail";
import CourseEdit from "./pages/admin/bookings/courses/CourseEdit";
import CourseCalendar from "./pages/admin/bookings/courses/CourseCalendar";

// Imports Réservations (Bookings)
import BookingCreate from "./pages/admin/bookings/bookings/BookingCreate";
import BookingList from "./pages/admin/bookings/bookings/BookingList";
import BookingDetail from "./pages/admin/bookings/bookings/BookingDetail";
import BookingEdit from "./pages/admin/bookings/bookings/BookingEdit";

// Imports Subscriptions
import {
  SubscriptionPlanList,
  SubscriptionPlanForm,
  SubscriptionList,
  SubscriptionCreate,
  SubscriptionDetail,
} from "./pages/subscriptions";

export const routes = [
  // ==========================================
  // ROUTES PUBLIQUES
  // ==========================================
  {
    name: "home",
    path: "/", 
    element: <Home />,
  },
  {
    name: "Sign In",
    path: "/sign-in",
    element: <SignIn />,
  },
  {
    name: "Sign Up",
    path: "/sign-up",
    element: <SignUp />,
  },
  {
    name: "Docs",
    href: "https://www.material-tailwind.com/docs/react/installation",
    target: "_blank",
    element: "",
  },

  // ==========================================
  // ROUTES MEMBRES (AUTHENTIFIÉES)
  // ==========================================
  {
    name: "Member Dashboard",
    path: "/portal",
    element: <MemberLayout><MemberDashboard /></MemberLayout>,
  },
  {
    name: "Member Profile",
    path: "/portal/profile",
    element: <MemberLayout><ProfilePage /></MemberLayout>,
  },
  {
    name: "Member Programs",
    path: "/portal/programs",
    element: <MemberLayout><MyPrograms /></MemberLayout>,
  },
  {
    name: "Member Bookings",
    path: "/portal/bookings",
    element: <MemberLayout><MemberBookings /></MemberLayout>,
  },
  {
    name: "Member Progress",
    path: "/portal/progress",
    element: <MemberLayout><MemberProgress /></MemberLayout>,
  },
  // ==========================================
  // ⭐ NOUVELLES ROUTES COACH
  // ==========================================
  {
    name: "Coach Dashboard",
    path: "/coach",
    element: <CoachPanel />,
    hidden: true // Caché de la navbar
  },
  {
    name: "Coach Members",
    path: "/coach/members",
    element: <CoachMembers />,
    hidden: true
  },
  {
    name: "Coach Schedule",
    path: "/coach/schedule",
    element: <CoachSchedule />,
    hidden: true
  },
  {
    name: "Coach Exercises",
    path: "/coach/exercises",
    element: <CoachExercises />,
    hidden: true
  },
  {
    name: "Coach Settings",
    path: "/coach/settings",
    element: <CoachSettings />,
    hidden: true
  },
  // ==========================================
  // ROUTES ADMIN - DASHBOARD & PROFILE
  // ==========================================
  {
    name: "Dashboard",
    path: "/admin/dashboard",
    element: <Dashboard />,
  },
  {
    name: "Admin Profile",
    path: "/admin/profile",
    element: <ProfilePage adminView={true} />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - PROGRAMMES & EXERCICES
  // ==========================================
  { 
    name: "Créer Programme",
    path: "/admin/programs/create",
    element: <ProgramBuilder />,
  },
  { 
    name: "Gérer Exercices",
    path: "/admin/exercises",
    element: <ExerciseList />,
  },

  // ==========================================
  // ROUTES ADMIN - MEMBRES
  // ==========================================
  {
    name: "Gestion Membres",
    path: "/admin/members",
    element: <MemberList />,
  },
  {
    path: "/admin/members/create", 
    element: <MemberCreate />,
    hidden: true
  },
  {
    path: "/admin/members/:userId",
    element: <MemberDetail />,
    hidden: true
  },
  {
    path: "/admin/members/:userId/edit",
    element: <MemberEdit />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - STAFF
  // ==========================================
  {
    name: "Gestion Personnel",
    path: "/admin/staff",
    element: <Staff />,
  },
  {
    path: "/admin/users/create",
    element: <UserCreate />,
    hidden: true,
  },

  // ==========================================
  // ROUTES ADMIN - ABONNEMENTS
  // ==========================================
  {
    name: "Plans d'Abonnement",
    path: "/admin/subscription-plans",
    element: <SubscriptionPlanList />,
  },
  {
    path: "/admin/subscription-plans/create",
    element: <SubscriptionPlanForm />,
    hidden: true
  },
  {
    path: "/admin/subscription-plans/:planId/edit",
    element: <SubscriptionPlanForm />,
    hidden: true
  },
  {
    name: "Abonnements",
    path: "/admin/subscriptions",
    element: <SubscriptionList />,
  },
  {
    path: "/admin/subscriptions/create",
    element: <SubscriptionCreate />,
    hidden: true
  },
  {
    path: "/admin/subscriptions/:subscriptionId",
    element: <SubscriptionDetail />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - SALLES (ROOMS)
  // ==========================================
  {
    name: "Gestion Salles",
    path: "/admin/rooms",
    element: <RoomList />,
  },
  {
    path: "/admin/rooms/create",
    element: <RoomCreate />,
    hidden: true
  },
  {
    path: "/admin/rooms/:roomId",
    element: <RoomDetail />,
    hidden: true
  },
  {
    path: "/admin/rooms/:roomId/edit",
    element: <RoomEdit />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - TYPES DE COURS
  // ==========================================
  {
    name: "Types de Cours",
    path: "/admin/course-types",
    element: <CourseTypeList />,
  },
  {
    path: "/admin/course-types/create",
    element: <CourseTypeCreate />,
    hidden: true
  },
  {
    path: "/admin/course-types/:typeId",
    element: <CourseTypeDetail />,
    hidden: true
  },
  {
    path: "/admin/course-types/:typeId/edit",
    element: <CourseTypeEdit />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - COURS/SESSIONS
  // ==========================================
  {
    name: "Planning Cours",
    path: "/admin/courses",
    element: <CourseList />,
  },
  {
    name: "Calendrier Cours",
    path: "/admin/courses/calendar",
    element: <CourseCalendar />,
  },
  {
    path: "/admin/courses/create",
    element: <CourseCreate />,
    hidden: true
  },
  {
    path: "/admin/courses/:courseId",
    element: <CourseDetail />,
    hidden: true
  },
  {
    path: "/admin/courses/:courseId/edit",
    element: <CourseEdit />,
    hidden: true
  },

  // ==========================================
  // ROUTES ADMIN - RÉSERVATIONS
  // ==========================================
  {
    name: "Réservations",
    path: "/admin/bookings",
    element: <BookingList />,
  },
  {
    path: "/admin/bookings/create",
    element: <BookingCreate />,
    hidden: true
  },
  {
    path: "/admin/bookings/:bookingId",
    element: <BookingDetail />,
    hidden: true
  },
  {
    path: "/admin/bookings/:bookingId/edit",
    element: <BookingEdit />,
    hidden: true
  },
  {
    name: "terms",
    path: "/terms",
    element: <Terms />,
  },

  // ==========================================
  // ROUTES ADMIN - ANCIENNES RÉSERVATIONS
  // ==========================================
  {
    path: "/admin/reservations",
    element: <ReservationList />,
    hidden: true
  },
];

export default routes;