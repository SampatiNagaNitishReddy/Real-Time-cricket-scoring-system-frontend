import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import TeamPlayingXI from "./TeamPlayingXI";
import { Spinner } from "../auth/fields";

import {
    createPlayingXI,
    getPlayingXI,
    updatePlayingXI
} from "../../services/matchService";

import { getTeamSquad } from "../../services/teamService";

const XI_SIZE = 11;

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

// The backend may send a string, { error } or { message }
const errorMessage = (err, fallback) => {
    const data = err.response?.data;
    if (typeof data === "string" && data) return data;
    return data?.error || data?.message || err.message || fallback;
};

function Progress({ name, count }) {

    const done = count === XI_SIZE;

    return (

        <div
            className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 ${done
                ? "bg-green-500/10 ring-1 ring-green-500/30"
                : "bg-zinc-800"
                }`}
        >

            <p className="min-w-0 truncate text-sm font-medium text-zinc-300">
                {name}
            </p>

            <p
                className={`shrink-0 font-semibold tabular-nums ${done ? "text-green-400" : "text-white"
                    }`}
            >

                {count}/{XI_SIZE} {done && "✓"}

            </p>

        </div>

    );

}

function PlayingXICard({
    match,
    refreshMatch
}) {

    const [teamASquad, setTeamASquad] = useState([]);
    const [teamBSquad, setTeamBSquad] = useState([]);

    const [selectedTeamA, setSelectedTeamA] = useState([]);
    const [selectedTeamB, setSelectedTeamB] = useState([]);

    const [playingXIExists, setPlayingXIExists] = useState(false);

    const [loading, setLoading] = useState(true);

    const [error, setError] = useState(false);

    const [saving, setSaving] = useState(false);

    useEffect(() => {

        loadData();

    }, []);

    const loadData = async () => {

        try {

            setLoading(true);

            setError(false);

            const [teamAPlayers, teamBPlayers] =
                await Promise.all([

                    getTeamSquad(match.teamA.id),

                    getTeamSquad(match.teamB.id)

                ]);

            setTeamASquad(teamAPlayers);

            setTeamBSquad(teamBPlayers);

            try {

                const playingXI =
                    await getPlayingXI(match.matchId);

                setSelectedTeamA(
                    playingXI.teamAPlayers
                );

                setSelectedTeamB(
                    playingXI.teamBPlayers
                );

                setPlayingXIExists(true);

            } catch {

                setPlayingXIExists(false);

            }

        } catch (err) {

            console.error(err);

            setError(true);

            toast.error("Failed to load squads.");

        } finally {

            setLoading(false);

        }

    };

    const toggleTeamA = (userId) => {

        if (
            selectedTeamA.length >= XI_SIZE &&
            !selectedTeamA.includes(userId)
        ) {

            toast.error(`${match.teamA.name} already has ${XI_SIZE} players selected.`);

            return;

        }

        setSelectedTeamA(prev => {

            if (prev.includes(userId)) {

                return prev.filter(id => id !== userId);

            }

            if (prev.length >= XI_SIZE) {

                return prev;

            }

            return [...prev, userId];

        });

    };

    const toggleTeamB = (userId) => {

        if (
            selectedTeamB.length >= XI_SIZE &&
            !selectedTeamB.includes(userId)
        ) {

            toast.error(`${match.teamB.name} already has ${XI_SIZE} players selected.`);

            return;

        }

        setSelectedTeamB(prev => {

            if (prev.includes(userId)) {

                return prev.filter(id => id !== userId);

            }

            if (prev.length >= XI_SIZE) {

                return prev;

            }

            return [...prev, userId];

        });

    };

    const handleSave = async () => {

        if (saving) {

            return;

        }

        if (selectedTeamA.length !== XI_SIZE) {

            toast.error("Select exactly 11 players for Team A");
            return;

        }

        if (selectedTeamB.length !== XI_SIZE) {

            toast.error("Select exactly 11 players for Team B");
            return;

        }

        try {

            setSaving(true);

            const payload = {
                teamAPlayers: selectedTeamA,
                teamBPlayers: selectedTeamB
            };

            if (playingXIExists) {

                await updatePlayingXI(
                    match.matchId,
                    payload
                );

                toast.success("Playing XI updated successfully.");

            } else {

                await createPlayingXI(
                    match.matchId,
                    payload
                );

                toast.success("Playing XI saved successfully.");

            }

            setPlayingXIExists(true);

            await refreshMatch();

        } catch (err) {

            console.error("SAVE ERROR");
            console.error(err);

            toast.error(
                errorMessage(err, "Failed to save Playing XI.")
            );

        } finally {

            setSaving(false);

        }

    };

    // --------------------------------------------------
    // Display only
    // --------------------------------------------------

    const countA = selectedTeamA.length;
    const countB = selectedTeamB.length;

    const ready = countA === XI_SIZE && countB === XI_SIZE;

    const missing = (count, name) =>
        `Pick ${XI_SIZE - count} more for ${name}`;

    const hint = ready
        ? "Both teams are ready."
        : countA !== XI_SIZE
            ? missing(countA, match.teamA.name)
            : missing(countB, match.teamB.name);

    const smallSquads = [
        { team: match.teamA, size: teamASquad.length },
        { team: match.teamB, size: teamBSquad.length },
    ].filter(({ size }) => size < XI_SIZE);

    // How many bowlers a full innings needs: the max-overs quota and the
    // "no two overs in a row" rule both force enough options.
    const minBowlingOptions =
        match.overs <= 1
            ? 1
            : Math.max(
                2,
                match.maxOversPerBowler > 0
                    ? Math.ceil(match.overs / match.maxOversPerBowler)
                    : 2
            );
    if (loading) {

        return (

            <div className="space-y-4">

                <div className="h-8 w-56 animate-pulse rounded-lg bg-zinc-900" />

                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="h-12 animate-pulse rounded-xl bg-zinc-900" />
                    <div className="h-12 animate-pulse rounded-xl bg-zinc-900" />
                </div>

                <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />

                <div className="h-72 animate-pulse rounded-2xl bg-zinc-900" />

            </div>

        );

    }

    if (error) {

        return (

            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-10 text-center">

                <p className="mb-4 text-red-400">
                    Couldn't load the squads.
                </p>

                <button
                    type="button"
                    onClick={loadData}
                    className={`rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700 ${focusRing}`}
                >
                    Try again
                </button>

            </div>

        );

    }

    return (

        <div className="space-y-6">

            <div>

                <h2 className="text-2xl font-bold text-white">

                    Select Playing XI

                </h2>

                <p className="mt-1 text-zinc-400">

                    Choose exactly {XI_SIZE} players for each team.

                    {playingXIExists && (
                        <span className="text-green-400">
                            {" "}A Playing XI is already saved. You can change it and update.
                        </span>
                    )}

                </p>

            </div>

            {/* Progress */}

            <div className="grid gap-3 sm:grid-cols-2">

                <Progress name={match.teamA.name} count={countA} />

                <Progress name={match.teamB.name} count={countB} />

            </div>

            {/* Squads that are too small */}

            {smallSquads.length > 0 && (

                <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 px-4 py-3">

                    <p className="text-sm text-yellow-300">

                        {smallSquads
                            .map(({ team, size }) => `${team.name} has only ${size} ${size === 1 ? "player" : "players"}`)
                            .join(" and ")}
                        . A Playing XI needs {XI_SIZE}, so add more players from the team's Manage page first.

                    </p>

                </div>

            )}

            <TeamPlayingXI
                teamName={match.teamA.name}
                players={teamASquad}
                selectedPlayers={selectedTeamA}
                onTogglePlayer={toggleTeamA}
                minBowlingOptions={minBowlingOptions}
            />

            <TeamPlayingXI
                teamName={match.teamB.name}
                players={teamBSquad}
                selectedPlayers={selectedTeamB}
                onTogglePlayer={toggleTeamB}
                minBowlingOptions={minBowlingOptions}
            />

            {/* Save bar */}

            <div className="sticky bottom-0 -mx-6 rounded-b-2xl border-t border-zinc-800 bg-black/90 px-6 py-4 backdrop-blur">

                <p
                    aria-live="polite"
                    className={`mb-3 min-h-5 text-center text-sm ${ready ? "font-medium text-green-400" : "text-zinc-400"}`}
                >

                    {hint}

                </p>

                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !ready}
                    className={`flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 ${focusRing}`}
                >

                    {saving && <Spinner />}

                    {
                        saving
                            ? "Saving..."
                            : playingXIExists
                                ? "Update Playing XI"
                                : "Save Playing XI"
                    }

                </button>

            </div>

        </div>

    );

}

export default PlayingXICard;