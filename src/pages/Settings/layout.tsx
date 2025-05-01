import { Outlet, Link, useLocation } from "react-router-dom";

export function SettingsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="py-2">
      <div className="flex flex-col items-start justify-center mb-9">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-secondary-foreground/50">Description subtext will go here</p>
      </div>

      <div className="flex mb-8 text-sm">
        <Link
          to="/settings/general"
          className={`px-4 py-2 font-medium ${
            currentPath === "/settings/general" ? "font-medium bg-secondary rounded-md" : "text-muted-foreground"
          }`}
        >
          General
        </Link>
        <Link
          to="/settings/members"
          className={`px-4 py-2 font-medium ${
            currentPath === "/settings/members" ? "font-medium bg-secondary rounded-md" : "text-muted-foreground"
          }`}
        >
          Members
        </Link>
        <Link
          to="/settings/profile"
          className={`px-4 py-2 font-medium ${
            currentPath === "/settings/profile" ? "font-medium bg-secondary rounded-md" : "text-muted-foreground"
          }`}
        >
          Profile
        </Link>
        <Link
          to="/settings/plan-billing"
          className={`px-4 py-2 font-medium ${
            currentPath === "/settings/plan-billing" ? "font-medium bg-secondary rounded-md" : "text-muted-foreground"
          }`}
        >
          Plan & Billing
        </Link>
        <Link
          to="/settings/security"
          className={`px-4 py-2 font-medium ${
            currentPath === "/settings/security" ? "font-medium bg-secondary rounded-md" : "text-muted-foreground"
          }`}
        >
          Security
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
