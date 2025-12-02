// File: frontend/src/App.jsx

import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Navbar } from "@/widgets/layout";
import routes from "./routes";
import AdminLayout from "@/components/admin/AdminLayout";
import ReceptionistLayout from "@/components/receptionist/ReceptionistLayout"; // ⭐ AJOUT

import { RequireAuth, RequireAdminOrReceptionistOrCoach, RequireCoach } from "./utils/AuthGuard";
import { ProgramList, CreateProgramForm } from "./components/coaching";
import APIDebugTool from './components/debug/APIDebugTool';
import EditProgramForm from './components/coaching/EditProgramForm';
import ProgramDetails from './components/coaching/ProgramDetails';
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import SuperAdminDashboard from "./pages/superadmin/Dashboard";
import SuperAdminSignIn from "./pages/superadmin/SuperAdminSignIn";


function App() {
  const { pathname } = useLocation();

  const isAdminRoute = (path) => path.startsWith('/admin/');
  const isCoachRoute = (path) => path.startsWith('/coach');
  const isPortalRoute = (path) => path.startsWith('/portal');
  const isReceptionistRoute = (path) => path.startsWith('/receptionist'); // ⭐ AJOUT

  return (
    <>
      {/* ================= NAVBAR =================== */}
      {/* Cachée sur sign-in, sign-up, admin, coach, portal ET réceptionniste */}
      {!(
        pathname === '/sign-in' ||
        pathname === '/sign-up' ||
        isAdminRoute(pathname) ||
        isCoachRoute(pathname) ||
        isPortalRoute(pathname) ||
        isReceptionistRoute(pathname)     // ⭐ AJOUT
      ) && (
          <Navbar routes={routes} />
        )}

      {/* ================= CONTENU =================== */}
      <div
        className={`w-full min-h-screen ${!(
            pathname === '/sign-in' ||
            pathname === '/sign-up' ||
            pathname === '/' ||
            isCoachRoute(pathname) ||
            isPortalRoute(pathname) ||
            isReceptionistRoute(pathname)    // ⭐ AJOUT
          )
            ? 'pt-24'
            : ''
          }`}
      >
        <Routes>
          <Route path="/superadmin/login" element={<SuperAdminSignIn />} />

          {/* Route protégée pour dashboard */}
          <Route path="/superadmin/dashboard" element={<SuperAdminDashboard />} />

          {/* LOOP DES ROUTES DE routes.jsx */}
          {routes.map(({ path, element }, key) => {
            if (!element) return null;

            // ========== ADMIN ==========
            if (isAdminRoute(path)) {
              return (
                <Route
                  key={key}
                  exact
                  path={path}
                  element={
                    <RequireAdminOrReceptionistOrCoach>
                      <AdminLayout>{element}</AdminLayout>
                    </RequireAdminOrReceptionistOrCoach>
                  }
                />
              );
            }

            // ========== RÉCEPTIONNISTE ========== ⭐ AJOUT
            if (isReceptionistRoute(path)) {
              return (
                <Route
                  key={key}
                  exact
                  path={path}
                  element={
                    <RequireAdminOrReceptionistOrCoach>
                      <ReceptionistLayout>{element}</ReceptionistLayout>
                    </RequireAdminOrReceptionistOrCoach>
                  }
                />
              );
            }

            // ========== COACH ==========
            if (isCoachRoute(path)) {
              return (
                <Route
                  key={key}
                  exact
                  path={path}
                  element={
                    <RequireCoach>
                      {element}
                    </RequireCoach>
                  }
                />
              );
            }

            // ========== MEMBRES ==========
            if (isPortalRoute(path)) {
              return (
                <Route
                  key={key}
                  exact
                  path={path}
                  element={<RequireAuth>{element}</RequireAuth>}
                />
              );
            }

            // ========== PUBLIC ==========
            return <Route key={key} exact path={path} element={element} />;
          })}

          {/* ====== ROUTES COACHING ====== */}
          <Route
            path="/coaching/programs"
            element={
              <RequireAdminOrReceptionistOrCoach>
                <ProgramList />
              </RequireAdminOrReceptionistOrCoach>
            }
          />

          <Route
            path="/coaching/programs/create"
            element={
              <RequireAdminOrReceptionistOrCoach>
                <CreateProgramForm />
              </RequireAdminOrReceptionistOrCoach>
            }
          />

          <Route path="/coaching/programs/:id/edit" element={<EditProgramForm />} />
          <Route path="/coaching/programs/:id" element={<ProgramDetails />} />
          <Route path="/coaching/programs" element={<ProgramList />} />

          {/* ====== AUTH ====== */}
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:uid/:token" element={<ResetPassword />} />

          {/* ====== DEBUG ====== */}
          <Route path="/debug" element={<APIDebugTool />} />

          {/* Redirect unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </div>
    </>
  );
}

export default App;