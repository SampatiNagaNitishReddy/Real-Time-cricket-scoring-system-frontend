import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

function Navbar() {

  const { user, logout } = useAuth();

  const navigate = useNavigate();

  const handleLogout = () => {

    logout();

    navigate("/");
  };

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 px-6 py-4 flex items-center justify-between">

      {/* Logo */}
      <Link
        to="/"
        className="text-2xl font-bold text-white"
      >
        CricScore
      </Link>

      {/* Right Side */}
      <div className="flex items-center gap-4">

        {!user ? (

          <Link
            to="/login"
            className="bg-blue-600 hover:bg-blue-700 transition px-5 py-2 rounded-lg text-white font-medium"
          >
            Login
          </Link>

        ) : (

          <>
            {/* Profile */}
            <Link
              to="/dashboard"
              className="flex items-center gap-3 hover:opacity-80"
            >
              <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                {user.name?.charAt(0)}
              </div>

              <p className="text-white font-medium">
                {user.name}
              </p>
            </Link>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 transition px-4 py-2 rounded-lg text-white"
            >
              Logout
            </button>
          </>

        )}

      </div>

    </nav>
  );
}

export default Navbar;