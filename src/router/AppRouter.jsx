import { Suspense, lazy } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "../layouts/AppLayout";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ProtectedRoute } from "../routes/ProtectedRoute";
import { RoleHomeRedirect } from "../routes/RoleHomeRedirect";

const LoginPage = lazy(() => import("../pages/LoginPage.jsx").then((m) => ({ default: m.LoginPage })));
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx").then((m) => ({ default: m.DashboardPage })));
const InstitutionsPage = lazy(() => import("../pages/InstitutionsPage.jsx").then((m) => ({ default: m.InstitutionsPage })));
const ProgramsPage = lazy(() => import("../pages/ProgramsPage.jsx").then((m) => ({ default: m.ProgramsPage })));
const QuotasPage = lazy(() => import("../pages/QuotasPage.jsx").then((m) => ({ default: m.QuotasPage })));
const ApplicantsPage = lazy(() => import("../pages/ApplicantsPage.jsx").then((m) => ({ default: m.ApplicantsPage })));
const AllocationPage = lazy(() => import("../pages/AllocationPage.jsx").then((m) => ({ default: m.AllocationPage })));
const ConfirmationPage = lazy(() => import("../pages/ConfirmationPage.jsx").then((m) => ({ default: m.ConfirmationPage })));
const FeesPage = lazy(() => import("../pages/FeesPage.jsx").then((m) => ({ default: m.FeesPage })));
const RegisterUserPage = lazy(() => import("../pages/RegisterUserPage.jsx").then((m) => ({ default: m.RegisterUserPage })));

function LoadingScreen() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loading</CardTitle>
        <CardDescription>Preparing screen...</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Navigate to="/login" replace />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<RoleHomeRedirect />} />

              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "MANAGEMENT"]}>
                    <DashboardPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/institutions"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <InstitutionsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/programs"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <ProgramsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/quotas"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <QuotasPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN"]}>
                    <RegisterUserPage />
                  </ProtectedRoute>
                }
              />
              <Route path="/users/create" element={<Navigate to="/register" replace />} />

              <Route
                path="/applicants"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                    <ApplicantsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/allocation"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                    <AllocationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/confirmation"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                    <ConfirmationPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/fees"
                element={
                  <ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]}>
                    <FeesPage />
                  </ProtectedRoute>
                }
              />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
