import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

const navLinkClass = ({ isActive }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${focusRing} ${
    isActive
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:bg-zinc-800/60 hover:text-white"
  }`;

function Logo() {
  return (
    <Link
      to="/"
      className={`flex items-center gap-2.5 rounded-lg ${focusRing}`}
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-500 text-lg font-black text-black">
        C
      </span>

      <span className="text-xl font-bold tracking-tight text-white">
        Cric<span className="text-green-400">Score</span>
      </span>
    </Link>
  );
}

function Avatar({ user, size = "h-9 w-9" }) {
  const [failed, setFailed] = useState(false);

  const src = user?.profileImage;

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-green-500/15 font-bold text-green-400 ring-1 ring-green-500/30`}
      >
        {user?.name?.charAt(0)?.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-full object-cover ring-1 ring-zinc-700`}
    />
  );
}

function MenuLink({ to, children }) {
  return (
    <Link
      to={to}
      role="menuitem"
      className="block rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
    >
      {children}
    </Link>
  );
}

function Navbar() {
  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  const [mobileOpen, setMobileOpen] = useState(false);

  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();

    navigate("/");
  };

  // Close both menus when the page changes
  useEffect(() => {
    setMenuOpen(false);
    setMobileOpen(false);
  }, [location.pathname]);

  // Close the profile menu on outside click, and both menus on Escape
  useEffect(() => {
    const onClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };

    const onKey = (e) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
        setMobileOpen(false);
      }
    };

    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const links = [
    { to: "/", label: "Matches", end: true },
    { to: "/stats", label: "Stats" },
    ...(user ? [{ to: "/dashboard", label: "Dashboard" }] : []),
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-800 bg-black">

      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">

        {/* Left: logo + links */}
        <div className="flex items-center gap-6">

          <Logo />

          <div className="hidden items-center gap-1 md:flex">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
              >
                {link.label}
              </NavLink>
            ))}
          </div>

        </div>

        {/* Right */}
        <div className="flex items-center gap-2">

          {!user ? (

            <>
              <Link
                to="/register"
                className={`hidden rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:text-white sm:block ${focusRing}`}
              >
                Register
              </Link>

              <Link
                to="/login"
                className={`rounded-lg bg-green-500 px-5 py-2 text-sm font-semibold text-black transition hover:bg-green-400 ${focusRing}`}
              >
                Login
              </Link>
            </>

          ) : (

            <div ref={menuRef} className="relative hidden md:block">

              <button
                type="button"
                onClick={() => setMenuOpen((open) => !open)}
                aria-haspopup="menu"
                aria-expanded={menuOpen}
                className={`flex items-center gap-2.5 rounded-full border border-zinc-800 py-1 pl-1 pr-3 transition hover:border-zinc-600 ${focusRing}`}
              >

                <Avatar user={user} />

                <span className="max-w-40 truncate text-sm font-medium text-white">
                  {prettyName(user.name)}
                </span>

                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className={`h-4 w-4 text-zinc-500 transition ${menuOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.3 7.3a1 1 0 011.4 0L10 10.6l3.3-3.3a1 1 0 111.4 1.4l-4 4a1 1 0 01-1.4 0l-4-4a1 1 0 010-1.4z"
                    clipRule="evenodd"
                  />
                </svg>

              </button>

              {menuOpen && (

                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-800 bg-zinc-900 p-1.5 shadow-2xl"
                >

                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold text-white">
                      {prettyName(user.name)}
                    </p>
                    {user.email && (
                      <p className="truncate text-xs text-zinc-500">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <div className="my-1 border-t border-zinc-800" />

                  <MenuLink to="/dashboard">Dashboard</MenuLink>
                  <MenuLink to="/dashboard/matches">Match controls</MenuLink>
                  <MenuLink to="/dashboard/teams">My teams</MenuLink>

                  <div className="my-1 border-t border-zinc-800" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-400 transition hover:bg-red-500/10"
                  >
                    Logout
                  </button>

                </div>

              )}

            </div>

          )}

          {/* Mobile menu button */}
          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className={`rounded-lg p-2 text-zinc-300 transition hover:bg-zinc-800 hover:text-white md:hidden ${focusRing}`}
          >

            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              className="h-6 w-6"
              aria-hidden="true"
            >
              {mobileOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>

          </button>

        </div>

      </nav>

      {/* Mobile panel */}
      {mobileOpen && (

        <div className="border-t border-zinc-800 px-4 pb-4 pt-3 md:hidden">

          <div className="flex flex-col gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={navLinkClass}
              >
                {link.label}
              </NavLink>
            ))}

            {user && (
              <>
                <NavLink to="/dashboard/matches" className={navLinkClass}>
                  Match controls
                </NavLink>
                <NavLink to="/dashboard/teams" className={navLinkClass}>
                  My teams
                </NavLink>
              </>
            )}
          </div>

          <div className="mt-3 border-t border-zinc-800 pt-3">

            {user ? (

              <div className="flex items-center justify-between gap-3">

                <div className="flex min-w-0 items-center gap-3">
                  <Avatar user={user} />
                  <span className="truncate text-sm font-medium text-white">
                    {prettyName(user.name)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleLogout}
                  className={`rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10 ${focusRing}`}
                >
                  Logout
                </button>

              </div>

            ) : (

              <Link
                to="/register"
                className="block rounded-lg px-3 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800 hover:text-white"
              >
                Create an account
              </Link>

            )}

          </div>

        </div>

      )}

    </header>
  );
}

export default Navbar;