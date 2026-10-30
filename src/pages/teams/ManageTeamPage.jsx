import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import PlayerSearch from "../../components/user/PlayerSearch";
import { Spinner } from "../../components/auth/fields";
import {
    addPlayer,
    addMultiplePlayers,
    removePlayer,
    getTeamSquad,
    getMyTeams,
} from "../../services/teamService";

const ROLE_ORDER = ["BATTER", "WICKET_KEEPER", "ALL_ROUNDER", "BOWLER"];

const prettyName = (n = "") => n.replace(/_/g, " ");

const prettyRole = (r = "") =>
    r.charAt(0).toUpperCase() + r.slice(1).toLowerCase().replace(/_/g, " ");

const roleRank = (r) => {
    const i = ROLE_ORDER.indexOf(r);
    return i === -1 ? 99 : i;
};

// Captain, vice-captain, then by role, then by name
const sortSquad = (players) =>
    [...players].sort((a, b) => {
        if (a.captain !== b.captain) return a.captain ? -1 : 1;
        if (a.viceCaptain !== b.viceCaptain) return a.viceCaptain ? -1 : 1;

        return roleRank(a.role) - roleRank(b.role) || (a.name ?? "").localeCompare(b.name ?? "");
    });

// The backend may send a string, { error } or { message }
const errorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (typeof data === "string" && data) return data;
    return data?.error || data?.message || fallback;
};

const ICONS = {
    plus: "M12 4.5v15m7.5-7.5h-15",
    users:
        "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
    pencil:
        "M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10",
    copy:
        "M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75",
};

function Icon({ name, className = "h-6 w-6" }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            aria-hidden="true"
        >
            <path d={ICONS[name]} />
        </svg>
    );
}

function Avatar({ src, name, size = "h-12 w-12", text = "text-base" }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <span
                aria-hidden="true"
                className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-green-500/15 ${text} font-bold text-green-400`}
            >
                {name?.[0]?.toUpperCase()}
            </span>
        );
    }

    return (
        <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className={`${size} shrink-0 rounded-full object-cover ring-2 ring-zinc-700`}
        />
    );
}

function CopyChip({ value }) {
    const copy = async () => {
        try {
            await navigator.clipboard.writeText(value);
            toast.success("Team ID copied");
        } catch {
            toast.error("Couldn't copy");
        }
    };

    return (
        <button
            type="button"
            onClick={copy}
            title="Copy team ID"
            className="inline-flex items-center gap-1.5 rounded-md bg-zinc-800 px-2 py-0.5 font-mono text-xs text-zinc-400 transition hover:text-white"
        >
            {value}
            <Icon name="copy" className="h-3.5 w-3.5" />
        </button>
    );
}

function Modal({ title, onClose, children, footer, wide = false }) {
    useEffect(() => {
        const onKey = (e) => e.key === "Escape" && onClose();
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget) onClose();
            }}
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className={`w-full ${wide ? "max-w-2xl" : "max-w-xl"} rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl`}
            >
                <h2 className="mb-6 text-2xl font-bold text-white">{title}</h2>

                {children}

                <div className="mt-8 flex justify-end gap-3">{footer}</div>
            </div>
        </div>
    );
}

const cancelBtn =
    "rounded-lg border border-zinc-700 px-5 py-2 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white";

const primaryBtn =
    "flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-50";

function ActionCard({ icon, title, description, onClick, to }) {
    const className =
        "group block w-full rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-left transition hover:-translate-y-0.5 hover:border-zinc-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

    const body = (
        <>
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-zinc-800 text-green-400 transition group-hover:bg-green-500/15">
                <Icon name={icon} />
            </span>

            <h3 className="mt-5 text-lg font-semibold text-white">{title}</h3>

            <p className="mt-1 text-sm text-zinc-400">{description}</p>
        </>
    );

    return to ? (
        <Link to={to} className={className}>
            {body}
        </Link>
    ) : (
        <button type="button" onClick={onClick} className={className}>
            {body}
        </button>
    );
}

function ManageTeamPage() {

    const { teamId } = useParams();

    const [team, setTeam] = useState(null);

    const [squad, setSquad] = useState([]);
    const [squadLoading, setSquadLoading] = useState(true);
    const [squadError, setSquadError] = useState(false);

    const [showAddPlayer, setShowAddPlayer] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);

    const [showAddPlayers, setShowAddPlayers] = useState(false);
    const [selectedPlayers, setSelectedPlayers] = useState([]);

    const [removeTarget, setRemoveTarget] = useState(null);

    const [busy, setBusy] = useState(false);

    const fetchSquad = async () => {

        try {

            const data = await getTeamSquad(teamId);

            setSquad(data ?? []);
            setSquadError(false);

        } catch (err) {

            console.error(err);

            setSquadError(true);

        } finally {

            setSquadLoading(false);

        }

    };

    useEffect(() => {

        setSquadLoading(true);
        fetchSquad();

        // Header details are a nice-to-have, so failures are ignored
        getMyTeams()
            .then((teams) => setTeam((teams ?? []).find((t) => t.teamId === teamId) ?? null))
            .catch(() => { });

    }, [teamId]);

    const inSquad = (player) => squad.some((p) => p.userId === player.userId);

    // ----- Add one player -----

    const closeAddPlayer = () => {
        setShowAddPlayer(false);
        setSelectedPlayer(null);
    };

    const handlePickSingle = (player) => {

        if (inSquad(player)) {
            toast.error(`${prettyName(player.name)} is already in this team.`);
            return;
        }

        setSelectedPlayer(player);

    };

    const handleAddPlayer = async () => {

        if (!selectedPlayer) return;

        try {

            setBusy(true);

            await addPlayer(teamId, selectedPlayer.userId);

            toast.success(`${prettyName(selectedPlayer.name)} added to the team`);

            closeAddPlayer();

            fetchSquad();

        } catch (err) {

            console.error(err);

            toast.error(errorMessage(err, "Failed to add player."));

        } finally {

            setBusy(false);

        }

    };

    // ----- Add several players -----

    const closeAddPlayers = () => {
        setShowAddPlayers(false);
        setSelectedPlayers([]);
    };

    const handleSelectPlayer = (player) => {

        if (inSquad(player)) {
            toast.error(`${prettyName(player.name)} is already in this team.`);
            return;
        }

        if (selectedPlayers.some((p) => p.userId === player.userId)) {
            return;
        }

        setSelectedPlayers((prev) => [...prev, player]);

    };

    const removeSelectedPlayer = (userId) => {

        setSelectedPlayers((prev) => prev.filter((p) => p.userId !== userId));

    };

    const handleAddPlayers = async () => {

        try {

            setBusy(true);

            const ids = selectedPlayers.map((p) => p.userId);

            await addMultiplePlayers(teamId, ids);

            toast.success(
                `${ids.length} ${ids.length === 1 ? "player" : "players"} added to the team`
            );

            closeAddPlayers();

            fetchSquad();

        } catch (err) {

            console.error(err);

            toast.error(errorMessage(err, "Failed to add players."));

        } finally {

            setBusy(false);

        }

    };

    // ----- Remove a player -----

    const handleRemovePlayer = async () => {

        const player = removeTarget;

        try {

            setBusy(true);

            await removePlayer(teamId, player.userId);

            toast.success(`${prettyName(player.name)} removed from the team`);

            setRemoveTarget(null);

            fetchSquad();

        } catch (err) {

            console.error(err);

            toast.error(errorMessage(err, "Failed to remove player."));

        } finally {

            setBusy(false);

        }

    };

    return (

        <div className="min-h-screen bg-black px-6 py-10 text-white">

            <div className="mx-auto max-w-5xl">

                {/* Back */}
                <Link
                    to="/dashboard/teams"
                    className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
                >
                    <span aria-hidden="true">←</span> My teams
                </Link>

                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

                    <div className="flex min-w-0 items-center gap-5">

                        {team && (
                            <Avatar
                                src={team.teamLogoUrl}
                                name={team.name}
                                size="h-20 w-20"
                                text="text-3xl"
                            />
                        )}

                        <div className="min-w-0">

                            <p className="text-sm font-medium uppercase tracking-wide text-green-400">
                                Manage team
                            </p>

                            <h1 className="truncate text-2xl font-bold sm:text-3xl">
                                {team?.name ?? "Your team"}
                            </h1>

                            <div className="mt-2 flex flex-wrap items-center gap-3">
                                <CopyChip value={teamId} />

                                {!squadLoading && !squadError && (
                                    <span className="text-sm text-zinc-400">
                                        {squad.length} {squad.length === 1 ? "player" : "players"}
                                    </span>
                                )}
                            </div>

                        </div>

                    </div>

                    <Link
                        to={`/dashboard/teams/${teamId}`}
                        className="rounded-lg bg-zinc-800 px-5 py-2.5 font-medium text-white transition hover:bg-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500"
                    >
                        View squad
                    </Link>

                </div>

                {/* Quick actions */}
                <h2 className="mb-4 mt-10 text-xl font-semibold">Quick actions</h2>

                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

                    <ActionCard
                        icon="plus"
                        title="Add player"
                        description="Add a single player to this team."
                        onClick={() => setShowAddPlayer(true)}
                    />

                    <ActionCard
                        icon="users"
                        title="Add multiple"
                        description="Search and add several players together."
                        onClick={() => setShowAddPlayers(true)}
                    />

                    <ActionCard
                        icon="pencil"
                        title="Edit team"
                        description="Update the team name, logo and details."
                        to={`/dashboard/teams/${teamId}/edit`}
                    />

                </div>

                {/* Squad */}
                <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

                    <div className="mb-5">
                        <h2 className="text-xl font-semibold">Squad</h2>
                        <p className="mt-1 text-sm text-zinc-500">
                            The captain and vice-captain can't be removed here.
                        </p>
                    </div>

                    {squadLoading && (
                        <div className="space-y-3">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="h-20 animate-pulse rounded-xl bg-zinc-800" />
                            ))}
                        </div>
                    )}

                    {!squadLoading && squadError && (
                        <div className="py-8 text-center">
                            <p className="mb-4 text-red-400">Failed to load squad.</p>

                            <button
                                onClick={() => {
                                    setSquadLoading(true);
                                    fetchSquad();
                                }}
                                className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
                            >
                                Try again
                            </button>
                        </div>
                    )}

                    {!squadLoading && !squadError && squad.length === 0 && (
                        <p className="py-8 text-center text-zinc-400">
                            No players yet. Use "Add player" to build your squad.
                        </p>
                    )}

                    {!squadLoading && !squadError && squad.length > 0 && (
                        <div className="space-y-3">

                            {sortSquad(squad).map((player) => (

                                <div
                                    key={player.userId}
                                    className="flex items-center justify-between gap-4 rounded-xl bg-zinc-800 p-4"
                                >

                                    <div className="flex min-w-0 items-center gap-4">

                                        <Avatar src={player.profileImage} name={player.name} />

                                        <div className="min-w-0">

                                            <div className="flex flex-wrap items-center gap-2">

                                                <h3 className="truncate font-semibold">
                                                    {prettyName(player.name)}
                                                </h3>

                                                {player.captain && (
                                                    <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-black">
                                                        C
                                                    </span>
                                                )}

                                                {player.viceCaptain && (
                                                    <span className="rounded bg-zinc-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
                                                        VC
                                                    </span>
                                                )}

                                            </div>

                                            <p className="text-sm text-zinc-400">
                                                {prettyRole(player.role)}
                                            </p>

                                        </div>

                                    </div>

                                    {!player.captain && !player.viceCaptain && (

                                        <button
                                            onClick={() => setRemoveTarget(player)}
                                            className="shrink-0 rounded-lg border border-red-500/40 px-4 py-2 text-sm font-medium text-red-400 transition hover:bg-red-500/10"
                                        >
                                            Remove
                                        </button>

                                    )}

                                </div>

                            ))}

                        </div>
                    )}

                </section>

            </div>

            {/* Add Player Modal */}
            {showAddPlayer && (

                <Modal
                    title="Add player"
                    onClose={closeAddPlayer}
                    footer={
                        <>
                            <button type="button" onClick={closeAddPlayer} className={cancelBtn}>
                                Cancel
                            </button>

                            <button
                                type="button"
                                disabled={!selectedPlayer || busy}
                                onClick={handleAddPlayer}
                                className={primaryBtn}
                            >
                                {busy && <Spinner />}
                                {busy ? "Adding..." : "Add player"}
                            </button>
                        </>
                    }
                >

                    <PlayerSearch
                        label="Search Player"
                        selectedPlayer={selectedPlayer}
                        onSelect={handlePickSingle}
                        excludeIds={squad.map((p) => p.userId)}
                    />

                </Modal>

            )}

            {/* Add Players Modal */}
            {showAddPlayers && (

                <Modal
                    wide
                    title="Add multiple players"
                    onClose={closeAddPlayers}
                    footer={
                        <>
                            <button type="button" onClick={closeAddPlayers} className={cancelBtn}>
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleAddPlayers}
                                disabled={selectedPlayers.length === 0 || busy}
                                className={primaryBtn}
                            >
                                {busy && <Spinner />}
                                {busy
                                    ? "Adding..."
                                    : `Add ${selectedPlayers.length || ""} player${selectedPlayers.length !== 1 ? "s" : ""}`}
                            </button>
                        </>
                    }
                >

                    <PlayerSearch
                        label="Search Players"
                        selectedPlayer={null}
                        onSelect={handleSelectPlayer}
                        excludeIds={[
                            ...squad.map((p) => p.userId),
                            ...selectedPlayers.map((p) => p.userId),
                        ]}
                    />

                    {selectedPlayers.length > 0 && (

                        <div className="mt-6">

                            <h3 className="mb-3 text-sm font-semibold text-zinc-300">
                                Selected players ({selectedPlayers.length})
                            </h3>

                            <div className="flex flex-wrap gap-3">

                                {selectedPlayers.map((player) => (

                                    <div
                                        key={player.userId}
                                        className="flex items-center gap-2 rounded-full bg-zinc-800 py-1 pl-1 pr-3"
                                    >

                                        <Avatar
                                            src={player.profileImage}
                                            name={player.name}
                                            size="h-8 w-8"
                                            text="text-xs"
                                        />

                                        <span className="text-sm">{prettyName(player.name)}</span>

                                        <button
                                            type="button"
                                            onClick={() => removeSelectedPlayer(player.userId)}
                                            aria-label={`Remove ${prettyName(player.name)} from selection`}
                                            className="text-zinc-500 transition hover:text-red-400"
                                        >
                                            ✕
                                        </button>

                                    </div>

                                ))}

                            </div>

                        </div>

                    )}

                </Modal>

            )}

            {/* Remove confirmation */}
            {removeTarget && (

                <Modal
                    title="Remove player?"
                    onClose={() => setRemoveTarget(null)}
                    footer={
                        <>
                            <button type="button" onClick={() => setRemoveTarget(null)} className={cancelBtn}>
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleRemovePlayer}
                                disabled={busy}
                                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {busy && <Spinner />}
                                {busy ? "Removing..." : "Remove"}
                            </button>
                        </>
                    }
                >

                    <p className="text-zinc-300">
                        <span className="font-semibold text-white">
                            {prettyName(removeTarget.name)}
                        </span>{" "}
                        will be removed from this team.
                    </p>

                </Modal>

            )}

        </div>

    );

}

export default ManageTeamPage;