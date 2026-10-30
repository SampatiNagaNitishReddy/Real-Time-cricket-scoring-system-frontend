import PlayerSelectionCard from "./PlayerSelectionCard";

const XI_SIZE = 11;

const GROUPS = [
    { role: "BATTER", label: "Batters", short: "BAT" },
    { role: "WICKET_KEEPER", label: "Wicket-keepers", short: "WK" },
    { role: "ALL_ROUNDER", label: "All-rounders", short: "AR" },
    { role: "BOWLER", label: "Bowlers", short: "BOWL" },
];

function TeamPlayingXI({
    teamName,
    players,
    selectedPlayers,
    onTogglePlayer,
    minBowlingOptions = 0
}) {

    const count = selectedPlayers.length;

    const full = count >= XI_SIZE;

    // --------------------------------------------------
    // Group the squad by role (display only)
    // --------------------------------------------------

    const groups = GROUPS.map(group => ({
        ...group,
        players: players.filter(p => p.role === group.role)
    }));

    const others = players.filter(
        p => !GROUPS.some(group => group.role === p.role)
    );

    if (others.length > 0) {

        groups.push({
            role: "OTHER",
            label: "Other",
            short: "OTHER",
            players: others
        });

    }

    const selectedIn = (group) =>
        group.players.filter(p => selectedPlayers.includes(p.userId)).length;

    const makeUp = groups
        .map(group => ({ short: group.short, n: selectedIn(group) }))
        .filter(item => item.n > 0)
        .map(item => `${item.n} ${item.short}`)
        .join(" · ");

    // Same roles the bowler picker offers later in the match
    const bowlingOptions = groups
        .filter(group => group.role === "BOWLER" || group.role === "ALL_ROUNDER")
        .reduce((sum, group) => sum + selectedIn(group), 0);

    const showBowlingCheck = minBowlingOptions > 0 && count > 0;

    const bowlingOk = bowlingOptions >= minBowlingOptions;

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            {/* Header */}

            <div className="mb-2 flex items-center justify-between gap-3">

                <h3 className="truncate text-lg font-semibold text-white">

                    {teamName}

                </h3>

                <span
                    className={`shrink-0 text-sm font-semibold tabular-nums ${full ? "text-green-400" : "text-zinc-400"}`}
                >

                    {count} / {XI_SIZE} Selected {full && "✓"}

                </span>

            </div>

            {/* Progress */}

            <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-zinc-800">

                <div
                    className={`h-full rounded-full transition-all ${full ? "bg-green-500" : "bg-green-500/60"}`}
                    style={{ width: `${Math.min(count / XI_SIZE, 1) * 100}%` }}
                />

            </div>

            {/* Team make-up and bowling check */}

            {(makeUp || showBowlingCheck) && (

                <div className="mb-5 space-y-1 text-sm">

                    {makeUp && (
                        <p className="text-zinc-400">
                            {makeUp}
                        </p>
                    )}

                    {showBowlingCheck && (
                        <p
                            className={
                                bowlingOk
                                    ? "text-green-400"
                                    : full
                                        ? "text-amber-400"
                                        : "text-zinc-500"
                            }
                        >

                            Bowling options: {bowlingOptions}
                            {!bowlingOk && ` (needs at least ${minBowlingOptions} to cover every over)`}
                            {bowlingOk && " ✓"}

                        </p>
                    )}

                </div>

            )}

            {/* Players, grouped by role */}

            <div className="space-y-6">

                {
                    groups
                        .filter(group => group.players.length > 0)
                        .map(group => (

                            <section key={group.role}>

                                <h4 className="mb-2 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">

                                    {group.label}

                                    <span className="font-normal normal-case tracking-normal text-zinc-600">

                                        {selectedIn(group)} of {group.players.length} picked

                                    </span>

                                </h4>

                                <div className="grid gap-2 sm:grid-cols-2">

                                    {
                                        group.players.map(player => {

                                            const checked =
                                                selectedPlayers.includes(player.userId);

                                            const blocked = !checked && full;

                                            return (

                                                <div
                                                    key={player.userId}
                                                    className={blocked ? "opacity-50" : ""}
                                                >

                                                    <PlayerSelectionCard
                                                        player={player}
                                                        selected={checked}
                                                        onClick={() => onTogglePlayer(player.userId)}
                                                    />

                                                </div>

                                            );

                                        })
                                    }

                                </div>

                            </section>

                        ))
                }

                {players.length === 0 && (

                    <p className="rounded-xl bg-zinc-800 p-6 text-center text-zinc-400">

                        This team has no players yet.

                    </p>

                )}

            </div>

        </div>

    );

}

export default TeamPlayingXI;