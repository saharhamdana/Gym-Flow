// Fichier: frontend/src/routes.jsx

import Home from "@/pages/home";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import ProfilePage from "@/pages/profile/ProfilePage";
import MyPrograms from "@/pages/programs/MyPrograms";

// Admin imports
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
    name: "profile",
    path: "/profile",
    element: <ProfilePage />,
    hidden: true
  },
  { 
    name: "Mes Programmes",
    path: "/my-programs",
    element: <MyPrograms />,
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