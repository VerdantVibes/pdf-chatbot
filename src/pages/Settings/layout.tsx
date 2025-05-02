import { Outlet, Link, useLocation } from "react-router-dom";

export function SettingsLayout() {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div className="py-2">
      <div className="flex flex-col items-start justify-center mb-4 md:mb-9">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-secondary-foreground/50 hidden md:block">Description subtext will go here</p>
      </div>

      <div className="flex flex-col gap-2 md:gap-0 md:flex-row mb-6 md:mb-8 text-sm">
        <Link
          to="/settings/general"
          className={`font-medium w-fit md:w-auto ${
            currentPath === "/settings/general"
              ? "font-medium bg-secondary rounded-md px-2.5 py-2 md:px-4 "
              : "text-muted-foreground px-0 py-[0.06125rem] md:py-2 md:px-4"
          }`}
        >
          General
        </Link>
        <Link
          to="/settings/members"
          className={`font-medium w-fit md:w-auto ${
            currentPath === "/settings/members"
              ? "font-medium bg-secondary rounded-md px-2.5 py-2 md:px-4 "
              : "text-muted-foreground px-0 py-[0.06125rem] md:py-2 md:px-4 "
          }`}
        >
          Members
        </Link>
        <Link
          to="/settings/profile"
          className={`font-medium w-fit md:w-auto ${
            currentPath === "/settings/profile"
              ? "font-medium bg-secondary rounded-md px-2.5 py-2 md:px-4 "
              : "text-muted-foreground px-0 py-[0.06125rem] md:py-2 md:px-4 "
          }`}
        >
          Profile
        </Link>
        <Link
          to="/settings/plan-billing"
          className={`font-medium w-fit md:w-auto ${
            currentPath === "/settings/plan-billing"
              ? "font-medium bg-secondary rounded-md px-2.5 py-2 md:px-4 "
              : "text-muted-foreground px-0 py-[0.06125rem] md:py-2 md:px-4 "
          }`}
        >
          Plan & Billing
        </Link>
        <Link
          to="/settings/security"
          className={`font-medium w-fit md:w-auto ${
            currentPath === "/settings/security"
              ? "font-medium bg-secondary rounded-md px-2.5 py-2 md:px-4 "
              : "text-muted-foreground px-0 py-[0.06125rem] md:py-2 md:px-4 "
          }`}
        >
          Security
        </Link>
      </div>

      <Outlet />
    </div>
  );
}
