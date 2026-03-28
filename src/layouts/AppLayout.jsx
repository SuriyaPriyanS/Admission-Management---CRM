import {
  FiActivity,
  FiBookOpen,
  FiCheckCircle,
  FiDollarSign,
  FiGrid,
  FiKey,
  FiLayers,
  FiLogOut,
  FiMapPin,
  FiEye,
  FiSettings,
  FiUserPlus,
  FiUsers,
} from "react-icons/fi";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { showMessage } from "../features/app/appSlice";
import { logout } from "../features/auth/authSlice";
import { Button } from "../components/ui/button";

function getNavSections(role) {
  const sections = [];

  if (role === "ADMIN") {
    sections.push({
      label: "Master Setup",
      items: [
        { to: "/dashboard", label: "Dashboard", icon: FiGrid },
        { to: "/institutions", label: "Institutions", icon: FiMapPin },
        { to: "/programs", label: "Programs & Intake", icon: FiBookOpen },
        { to: "/quotas", label: "Seat Matrix", icon: FiLayers },
      ],
    });

    sections.push({
      label: "Admissions",
      items: [
        { to: "/applicants", label: "Applicants", icon: FiUsers },
        { to: "/allocation", label: "Seat Allocation", icon: FiSettings },
        { to: "/confirmation", label: "Admission Confirm", icon: FiCheckCircle },
      ],
    });

    sections.push({
      label: "Finance",
      items: [{ to: "/fees", label: "Fee Status", icon: FiDollarSign }],
    });

    sections.push({
      label: "Admin",
      items: [{ to: "/register", label: "Register User", icon: FiUserPlus }],
    });

    return sections;
  }

  if (role === "OFFICER") {
    sections.push({
      label: "Admissions",
      items: [
        { to: "/applicants", label: "Applicants", icon: FiUsers },
        { to: "/allocation", label: "Seat Allocation", icon: FiSettings },
        { to: "/confirmation", label: "Admission Confirm", icon: FiCheckCircle },
      ],
    });

    sections.push({
      label: "Finance",
      items: [{ to: "/fees", label: "Fee Status", icon: FiDollarSign }],
    });

    return sections;
  }

  return [
    {
      label: "Monitoring",
      items: [{ to: "/dashboard", label: "Dashboard", icon: FiGrid }],
    },
  ];
}

const routeTitles = {
  "/dashboard": "Dashboard",
  "/institutions": "Institutions Setup",
  "/programs": "Programs & Intake",
  "/quotas": "Seat Matrix",
  "/applicants": "Applicants",
  "/allocation": "Seat Allocation",
  "/confirmation": "Admission Confirmation",
  "/fees": "Fee Status",
  "/users/create": "Create User",
  "/register": "Create User",
};

export function AppLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const navSections = getNavSections(user?.role);

  function handleLogout() {
    dispatch(logout());
    navigate("/login", { replace: true });
  }

  const title = routeTitles[location.pathname] || "Admission Management";
  const roleLabel =
    user?.role === "ADMIN" ? "Admin" : user?.role === "OFFICER" ? "Admission Officer" : "Management";
  const roleButtons = [
    { key: "ADMIN", label: "Admin", icon: FiKey },
    { key: "OFFICER", label: "Admission Officer", icon: FiActivity },
    { key: "MANAGEMENT", label: "Management", icon: FiEye },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      <aside className="hidden w-[252px] min-w-[252px] flex-col border-r border-white/10 bg-[#0d2333] md:flex">
        <div className="border-b border-white/10 p-5">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0a9b8c] to-[#07b5a2] text-lg shadow-lg shadow-[#0a9b8c]/35">
              <FiBookOpen className="text-white" />
            </div>
            <div>
              <h2 className="font-sans text-lg font-bold text-white">EduMerge</h2>
              <p className="text-[10px] uppercase tracking-[0.6px] text-white/40">Admission CRM</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            <span className="h-2 w-2 rounded-full bg-lime-300" />
            <span>{roleLabel}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {navSections.map((section) => (
            <div key={section.label} className="mb-4">
              <p className="px-2 pb-1 text-[10px] font-semibold uppercase tracking-[1.1px] text-white/30">
                {section.label}
              </p>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink key={item.to} to={item.to}>
                      {({ isActive }) => (
                        <div
                          className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition ${
                            isActive
                              ? "bg-gradient-to-r from-[#0a9b8c] to-[#077a6e] text-white shadow-lg shadow-[#0a9b8c]/30"
                              : "text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <Icon size={15} />
                          <span>{item.label}</span>
                        </div>
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-3">
          <p className="mb-2 px-1 text-[10px] font-semibold uppercase tracking-[1.2px] text-white/30">
            Switch Role
          </p>
          <div className="space-y-2">
            {roleButtons.map((item) => {
              const Icon = item.icon;
              const isActive = user?.role === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className={`flex w-full items-center gap-2 rounded-md border px-3 py-2 text-sm transition ${
                    isActive
                      ? "border-white/15 bg-[#0d3045] text-[#0fd0bf]"
                      : "border-white/10 text-white/50 hover:bg-white/5 hover:text-white/80"
                  }`}
                  onClick={() => {
                    if (isActive) return;
                    dispatch(logout());
                    dispatch(showMessage({ message: `Logged out. Sign in as ${item.label}.`, type: "info" }));
                    navigate("/login", { replace: true });
                  }}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
          <Button
            variant="outline"
            className="mt-3 w-full border-white/20 text-white/80 hover:bg-white/10"
            onClick={handleLogout}
          >
            <FiLogOut className="mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <header className="flex h-[58px] items-center border-b border-border bg-card px-4 md:px-6">
          <h1 className="text-base font-bold text-foreground md:text-lg">{title}</h1>
          <div className="ml-auto">
            <span
              className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                user?.role === "ADMIN"
                  ? "border border-[#0a9b8c]/20 bg-[#e0f5f3] text-[#077a6e]"
                  : user?.role === "OFFICER"
                    ? "border border-green-500/20 bg-green-100 text-green-700"
                    : "border border-orange-500/20 bg-orange-100 text-orange-700"
              }`}
            >
              {roleLabel}
            </span>
          </div>
        </header>

        <div className="border-b border-border bg-card px-3 py-2 md:hidden">
          <div className="flex gap-2 overflow-x-auto">
            {navSections.flatMap((section) => section.items).map((item) => {
              const Icon = item.icon;
              return (
                <NavLink key={`mobile-${item.to}`} to={item.to}>
                  {({ isActive }) => (
                    <div
                      className={`flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-xs ${
                        isActive
                          ? "border border-primary/30 bg-primary/10 text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon size={13} />
                      <span>{item.label}</span>
                    </div>
                  )}
                </NavLink>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
