import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PlayerSearch from "../../components/user/PlayerSearch";
import { Field, Spinner } from "../../components/auth/fields";
import {
    updateTeam,
    getTeamDetails,
    getTeamSquad,
} from "../../services/teamService";

// The backend may send a string, { error } or { message }
const errorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (typeof data === "string" && data) return data;
    return data?.error || data?.message || fallback;
};

function Section({ title, description, children }) {
    return (
        <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <h2 className="text-lg font-semibold text-white">{title}</h2>

            {description && (
                <p className="mt-1 text-sm text-zinc-400">{description}</p>
            )}

            <div className="mt-5">{children}</div>

        </section>
    );
}

function LogoImage({ src, name }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <span className="flex h-full w-full items-center justify-center bg-green-500/15 text-3xl font-bold text-green-400">
                {name?.[0]?.toUpperCase() ?? "🛡️"}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt="Team logo"
            onError={() => setFailed(true)}
            className="h-full w-full object-cover"
        />
    );
}

function EditTeamPage() {

    const navigate = useNavigate();

    const { teamId } = useParams();

    const managePath = `/dashboard/teams/${teamId}/manage`;

    const [name, setName] = useState("");

    const [captain, setCaptain] = useState(null);

    const [viceCaptain, setViceCaptain] = useState(null);

    const [teamLogo, setTeamLogo] = useState(null);
    const [preview, setPreview] = useState(null);
    const [currentLogo, setCurrentLogo] = useState(null);

    // What the team looked like when loaded, to know if anything changed
    const [initial, setInitial] = useState(null);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [attempt, setAttempt] = useState(0);

    const [saving, setSaving] = useState(false);

    useEffect(() => {
        let ignore = false; // drop the response if the user navigated away

        const load = async () => {

            setLoading(true);
            setError(false);

            // Details are required; the squad only supplies player photos
            const [detailsRes, squadRes] = await Promise.allSettled([
                getTeamDetails(teamId),
                getTeamSquad(teamId),
            ]);

            if (ignore) return;

            if (detailsRes.status === "rejected") {

                console.error(detailsRes.reason);

                setError(true);

            } else {

                const team = detailsRes.value;

                const squad =
                    squadRes.status === "fulfilled" ? squadRes.value ?? [] : [];

                const asPlayer = (userId, fallbackName) => {
                    const match = squad.find((p) => p.userId === userId);

                    return {
                        userId,
                        name: match?.name ?? fallbackName,
                        profileImage: match?.profileImage,
                    };
                };

                setName(team.name);
                setCaptain(asPlayer(team.captain, team.captainName));
                setViceCaptain(asPlayer(team.viceCaptain, team.viceCaptainName));
                setCurrentLogo(team.teamLogoUrl ?? team.teamLogo ?? team.logo ?? null);

                setInitial({
                    name: team.name,
                    captainId: team.captain,
                    viceCaptainId: team.viceCaptain,
                });

            }

            setLoading(false);

        };

        load();

        return () => {
            ignore = true;
        };

    }, [teamId, attempt]);

    // Release the preview URL when it changes or the page closes
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const handleLogo = (e) => {

        const file = e.target.files[0];

        if (!file) return;

        setTeamLogo(file);

        setPreview(URL.createObjectURL(file));

    };

    const dirty =
        !!initial &&
        (name.trim() !== initial.name ||
            captain?.userId !== initial.captainId ||
            viceCaptain?.userId !== initial.viceCaptainId ||
            !!teamLogo);

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (!captain || !viceCaptain) {
            toast.error("Please select a captain and a vice captain.");
            return;
        }

        if (captain.userId === viceCaptain.userId) {
            toast.error("Captain and vice captain must be different players.");
            return;
        }

        try {

            setSaving(true);

            const formData = new FormData();

            formData.append("name", name.trim());
            formData.append("captain", captain.userId);
            formData.append("viceCaptain", viceCaptain.userId);

            if (teamLogo) {
                formData.append("teamLogo", teamLogo);
            }

            await updateTeam(teamId, formData);

            toast.success("Team updated successfully");

            navigate(managePath);

        } catch (err) {

            console.error(err);

            toast.error(errorMessage(err, "Failed to update team."));

        } finally {

            setSaving(false);

        }

    };

    return (

        <div className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">

            <div className="mx-auto max-w-3xl">

                <Link
                    to={managePath}
                    className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
                >
                    <span aria-hidden="true">←</span> Manage team
                </Link>

                <h1 className="text-3xl font-bold sm:text-4xl">
                    Edit team
                </h1>

                <p className="mb-8 mt-2 text-zinc-400">
                    Update the name, logo or leadership of your team.
                </p>

                {/* Loading */}
                {loading && (
                    <div className="space-y-6">
                        <div className="h-44 animate-pulse rounded-2xl bg-zinc-900" />
                        <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">

                        <p className="mb-5 text-red-400">Failed to load team.</p>

                        <button
                            onClick={() => setAttempt((n) => n + 1)}
                            className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
                        >
                            Try again
                        </button>

                    </div>
                )}

                {!loading && !error && (

                    <form
                        onSubmit={handleSubmit}
                        className="space-y-6"
                    >

                        {/* Identity */}
                        <Section
                            title="Team identity"
                            description="How your team appears on match cards and scorecards."
                        >

                            <div className="flex flex-col gap-6 sm:flex-row sm:items-center">

                                <div className="flex items-center gap-4">

                                    <label
                                        htmlFor="teamLogo"
                                        className="group relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-zinc-600 bg-zinc-800 transition focus-within:border-green-500 hover:border-green-500"
                                    >
                                        <input
                                            id="teamLogo"
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogo}
                                            className="sr-only"
                                        />

                                        <LogoImage src={preview ?? currentLogo} name={name} />

                                        <span className="absolute inset-x-0 bottom-0 bg-black/60 py-1 text-center text-xs text-white opacity-0 transition group-hover:opacity-100">
                                            Change
                                        </span>
                                    </label>

                                    <div className="sm:hidden">
                                        <p className="font-medium text-white">Team logo</p>
                                        <label
                                            htmlFor="teamLogo"
                                            className="cursor-pointer text-sm font-medium text-green-400 hover:text-green-300"
                                        >
                                            Change logo
                                        </label>
                                    </div>

                                </div>

                                <div className="flex-1">

                                    <Field
                                        label="Team name"
                                        id="teamName"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        autoComplete="off"
                                        required
                                    />

                                    <p className="mt-2 hidden text-sm text-zinc-500 sm:block">
                                        {preview ? "New logo selected. " : "Logo is optional. "}
                                        <label
                                            htmlFor="teamLogo"
                                            className="cursor-pointer font-medium text-green-400 hover:text-green-300"
                                        >
                                            {preview ? "Choose a different one" : "Upload a new one"}
                                        </label>
                                    </p>

                                </div>

                            </div>

                        </Section>

                        {/* Leadership */}
                        <Section
                            title="Leadership"
                            description="Search to change the captain or vice-captain. They must be different people."
                        >

                            <div className="-mb-6 grid gap-x-5 sm:grid-cols-2">

                                <PlayerSearch
                                    label="Captain"
                                    selectedPlayer={captain}
                                    onSelect={setCaptain}
                                    excludeIds={
                                        viceCaptain
                                            ? [viceCaptain.userId]
                                            : []
                                    }
                                />

                                <PlayerSearch
                                    label="Vice captain"
                                    selectedPlayer={viceCaptain}
                                    onSelect={setViceCaptain}
                                    excludeIds={
                                        captain
                                            ? [captain.userId]
                                            : []
                                    }
                                />

                            </div>

                        </Section>

                        {/* Actions */}
                        <div className="space-y-4">

                            {dirty && (
                                <p className="text-center text-sm text-amber-400">
                                    You have unsaved changes.
                                </p>
                            )}

                            <div className="flex flex-col-reverse gap-3 sm:flex-row">

                                <Link
                                    to={managePath}
                                    className="rounded-lg border border-zinc-700 px-6 py-3 text-center font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
                                >
                                    Cancel
                                </Link>

                                <button
                                    type="submit"
                                    disabled={saving || !dirty}
                                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {saving && <Spinner />}
                                    {saving ? "Saving..." : "Save changes"}
                                </button>

                            </div>

                        </div>

                    </form>

                )}

            </div>

        </div>

    );

}

export default EditTeamPage;