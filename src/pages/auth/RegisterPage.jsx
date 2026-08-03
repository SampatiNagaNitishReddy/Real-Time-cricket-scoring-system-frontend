import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { registerUser } from "../../services/authService";

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

        <div className="min-h-screen bg-black flex items-center justify-center">

            <div className="bg-zinc-900 w-full max-w-xl rounded-2xl p-8 shadow-xl">

                <h1 className="text-4xl font-bold text-white mb-8">

                    Register

                </h1>

                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >

                    <div className="flex flex-col items-center">

                        {
                            preview ?

                                <img
                                    src={preview}
                                    alt=""
                                    className="w-28 h-28 rounded-full object-cover border-4 border-zinc-700"
                                />

                                :

                                <div className="w-28 h-28 rounded-full bg-zinc-700 flex items-center justify-center text-4xl">

                                    👤

                                </div>

                        }

                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleImage}
                            className="mt-4 text-white"
                        />

                    </div>

                    <input
                        name="name"
                        placeholder="Name"
                        value={form.name}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                    />

                    <input
                        name="email"
                        type="email"
                        placeholder="Email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                    />

                    <input
                        name="password"
                        type="password"
                        placeholder="Password"
                        value={form.password}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                    />

                    <div className="grid grid-cols-2 gap-4">

                        <input
                            name="age"
                            type="number"
                            placeholder="Age"
                            value={form.age}
                            onChange={handleChange}
                            className="bg-black border border-zinc-700 rounded-lg p-3 text-white"
                        />

                        <input
                            name="place"
                            placeholder="Place"
                            value={form.place}
                            onChange={handleChange}
                            className="bg-black border border-zinc-700 rounded-lg p-3 text-white"
                        />

                    </div>

                    <select
                        name="type"
                        value={form.type}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                    >

                        <option value="BATTER">Batter</option>
                        <option value="BOWLER">Bowler</option>
                        <option value="ALL_ROUNDER">All Rounder</option>
                        <option value="WICKET_KEEPER">Wicket Keeper</option>

                    </select>

                    <select
                        name="batting"
                        value={form.batting}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
                    >

                        <option value="RIGHT_HAND">Right Hand</option>
                        <option value="LEFT_HAND">Left Hand</option>

                    </select>

                    <select
                        name="bowling"
                        value={form.bowling}
                        onChange={handleChange}
                        className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white"
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

                    </select>

                    <button
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 rounded-lg p-3 font-semibold text-white transition"
                    >

                        {
                            loading
                                ? "Registering..."
                                : "Register"
                        }

                    </button>

                </form>

                <p className="text-center text-zinc-400 mt-6">

                    Already have an account?{" "}

                    <Link
                        to="/login"
                        className="text-blue-500 hover:underline"
                    >

                        Login

                    </Link>

                </p>

            </div>

        </div>

    );

}

export default RegisterPage;