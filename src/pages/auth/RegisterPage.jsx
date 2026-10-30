import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { registerUser } from "../../services/authService";
import AuthLayout from "../../components/auth/AuthLayout";
import {
  Field,
  PasswordField,
  SelectField,
  Spinner,
} from "../../components/auth/fields";

const SectionTitle = ({ children }) => (
  <h2 className="border-b border-zinc-800 pb-2 text-xs font-semibold uppercase tracking-wide text-zinc-500">
    {children}
  </h2>
);

function RegisterPage() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [preview, setPreview] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    age: "",
    place: "",
    type: "BATTER",
    batting: "RIGHT_HAND",
    bowling: "NONE"
  });

  const [profileImage, setProfileImage] = useState(null);

  // Release the preview URL when it changes or the page closes
  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const handleChange = (e) => {

    setForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));

  };

  const handleImage = (e) => {

    const file = e.target.files[0];

    if (!file) return;

    setProfileImage(file);

    setPreview(URL.createObjectURL(file));

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!profileImage) {

      toast.error("Please select a profile image.");

      return;

    }

    try {

      setLoading(true);

      const formData = new FormData();

      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("profileImage", profileImage);
      formData.append("age", form.age);
      formData.append("place", form.place);
      formData.append("type", form.type);
      formData.append("batting", form.batting);
      formData.append("bowling", form.bowling);

      await registerUser(formData);

      toast.success("Registration Successful");

      navigate("/login");

    } catch (err) {

      toast.error(
        err.response?.data?.message ||
        "Registration Failed"
      );

    } finally {

      setLoading(false);

    }

  };

  return (
    <AuthLayout
      wide
      title="Create your account"
      subtitle="Set up your player profile to join teams and matches."
      footer={
        <p>
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-green-400 hover:text-green-300"
          >
            Login
          </Link>
        </p>
      }
    >

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* Profile photo */}
        <div className="flex items-center gap-5">

          <label
            htmlFor="profileImage"
            className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-zinc-600 bg-zinc-800 transition focus-within:border-green-500 hover:border-green-500"
          >
            <input
              id="profileImage"
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="sr-only"
            />

            {preview ? (
              <img
                src={preview}
                alt="Profile preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl">
                👤
              </span>
            )}

            <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
              Change
            </span>
          </label>

          <div>
            <p className="font-medium text-white">Profile photo</p>
            <p className="text-sm text-zinc-400">Required. JPG or PNG works best.</p>

            <label
              htmlFor="profileImage"
              className="mt-2 inline-block cursor-pointer text-sm font-medium text-green-400 hover:text-green-300"
            >
              {preview ? "Choose a different photo" : "Upload photo"}
            </label>
          </div>

        </div>

        {/* Account */}
        <section className="space-y-4">
          <SectionTitle>Account</SectionTitle>

          <Field
            label="Name"
            id="name"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Your full name"
            autoComplete="name"
            required
          />

          <Field
            label="Email"
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />

          <PasswordField
            label="Password"
            id="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
        </section>

        {/* Player profile */}
        <section className="space-y-4">
          <SectionTitle>Player profile</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Age"
              id="age"
              name="age"
              type="number"
              min="1"
              value={form.age}
              onChange={handleChange}
              placeholder="Age"
              required
            />

            <Field
              label="Place"
              id="place"
              name="place"
              value={form.place}
              onChange={handleChange}
              placeholder="City or town"
              required
            />
          </div>

          <SelectField
            label="Role"
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
          >
            <option value="BATTER">Batter</option>
            <option value="BOWLER">Bowler</option>
            <option value="ALL_ROUNDER">All Rounder</option>
            <option value="WICKET_KEEPER">Wicket Keeper</option>
          </SelectField>
        </section>

        {/* Playing style */}
        <section className="space-y-4">
          <SectionTitle>Playing style</SectionTitle>

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Batting"
              id="batting"
              name="batting"
              value={form.batting}
              onChange={handleChange}
            >
              <option value="RIGHT_HAND">Right Hand</option>
              <option value="LEFT_HAND">Left Hand</option>
            </SelectField>

            <SelectField
              label="Bowling"
              id="bowling"
              name="bowling"
              value={form.bowling}
              onChange={handleChange}
            >
              <option value="NONE">None</option>
              <option value="FAST">Fast</option>
              <option value="MEDIUM_FAST">Medium Fast</option>
              <option value="OFF_BREAK">Off Break</option>
              <option value="LEG_BREAK">Leg Break</option>
              <option value="SLOW_LEFT_ARM">Slow Left Arm</option>
              <option value="LEFT_ARM_FAST">Left Arm Fast</option>
              <option value="LEFT_ARM_MEDIUM_FAST">Left Arm Medium Fast</option>
              <option value="LEFT_ARM_LEGSPIN">Left Arm Leg Spin</option>
            </SelectField>
          </div>
        </section>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading && <Spinner />}
          {loading ? "Registering..." : "Register"}
        </button>

      </form>

    </AuthLayout>
  );
}

export default RegisterPage;