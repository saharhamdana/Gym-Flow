import { Home, Profile, SignIn, SignUp } from "@/pages";
import MyPrograms from "./pages/MyPrograms";
// 💡 Composants à créer pour les routes Admin/Coach
import ProgramBuilder from "./pages/admin/ProgramBuilder"; 
import ExerciseList from "./pages/admin/ExerciseList"; 


export const routes = [
  {
    name: "home",
    path: "/", // Changement de /home à / pour être l'accueil principal
    element: <Home />,
  },
  {
    name: "profile",
    path: "/profile",
    element: <Profile />,
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
  // 💡 NOUVELLE ROUTE MEMBRE SPRINT 3
  { 
    name: "Mes Programmes",
    path: "/my-programs",
    element: <MyPrograms />,
  },
  // 💡 NOUVELLES ROUTES ADMIN/COACH SPRINT 3
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
  {
    name: "Docs",
    href: "https://www.material-tailwind.com/docs/react/installation",
    target: "_blank",
    element: "",
  },
];

export default routes;