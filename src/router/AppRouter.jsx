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

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index element={<RoleHomeRedirect />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "MANAGEMENT"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/institutions" element={<InstitutionsPage />} />
              <Route path="/programs" element={<ProgramsPage />} />
              <Route path="/quotas" element={<QuotasPage />} />
              <Route path="/users/create" element={<RegisterUserPage />} />
              <Route path="/register" element={<RegisterUserPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["ADMIN", "OFFICER"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/applicants" element={<ApplicantsPage />} />
              <Route path="/allocation" element={<AllocationPage />} />
              <Route path="/confirmation" element={<ConfirmationPage />} />
              <Route path="/fees" element={<FeesPage />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
