import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";
import AuthLayout from "../../components/auth/AuthLayout";
import { Field, PasswordField, Spinner } from "../../components/auth/fields";

function LoginPage() {

  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleLogin = async (e) => {
    e.preventDefault();

    try {

      setLoading(true);
      setError("");

      const data = await loginUser(formData);

      login(data);

      navigate("/");

    } catch (err) {

      console.error(err);

      setError(
        err.response?.data?.message ||
        "Login Failed"
      );

    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to score matches and follow the live action."
      footer={
        <p>
          Don't have an account?{" "}
          <Link
            to="/register"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Register
          </Link>
        </p>
      }
    >

      {error && (
        <div
          role="alert"
          className="mb-5 rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-400"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-5">

        <Field
          label="Email"
          id="email"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="you@example.com"
          autoComplete="email"
          required
        />

        <PasswordField
          label="Password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Enter your password"
          autoComplete="current-password"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Logging in..." : "Login"}
        </button>

      </form>

    </AuthLayout>
  );
}

export default LoginPage;