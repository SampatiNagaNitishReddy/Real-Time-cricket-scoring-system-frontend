import { useEffect, useState } from "react";

import { Spinner } from "../auth/fields";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function TeamLogo({ src, name, size = "h-14 w-14" }) {

    const [failed, setFailed] = useState(false);

    if (!src || failed) {

        return (

            <span
                aria-hidden="true"
                className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-green-500/15 text-xl font-bold text-green-400`}
            >

                {name?.[0]?.toUpperCase()}

            </span>

        );

    }

    return (

        <img
            src={src}
            alt=""
            onError={() => setFailed(true)}
            className={`${size} shrink-0 rounded-full bg-zinc-800 object-cover`}
        />

    );

}

function ChoiceButton({ selected, disabled, onClick, children }) {

    return (

        <button
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={onClick}
            className={`
                touch-manipulation rounded-xl border p-4 text-left transition
                disabled:cursor-not-allowed disabled:opacity-60
                ${focusRing}
                ${selected
                    ? "border-green-500 bg-green-500/10"
                    : "border-zinc-700 bg-zinc-800 hover:border-zinc-500"
                }
            `}
        >

            {children}

        </button>

    );

}

function TossCard({
    match,
    loading = false,
    onConductToss
}) {

    const [tossWinner, setTossWinner] = useState("");
    const [tossDecision, setTossDecision] = useState("BAT");

    // The details API can send the toss winner as a team id or a team name,
    // so match either one and keep the team *id* in state.
    const teamFor = (value) =>
        [match.teamA, match.teamB].find(
            (team) => team?.id === value || team?.name === value
        );

    useEffect(() => {

        if (match?.tossWinner) {
            setTossWinner(teamFor(match.tossWinner)?.id ?? match.tossWinner);
        }

        if (match?.tossDecision) {
            setTossDecision(match.tossDecision);
        }

    }, [match]);

    const handleSubmit = () => {

        if (!tossWinner || loading) {
            return;
        }

        onConductToss(tossWinner, tossDecision);

    };

    const selectedTeam = teamFor(tossWinner);

    const decisionWord = tossDecision === "BAT" ? "bat" : "bowl";

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

            <h2 className="mb-5 text-xl font-bold text-white">
                Toss
            </h2>

            {
                match.status === "SCHEDULED" ? (

                    <div className="space-y-6">

                        {/* Winner */}

                        <div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                Who won the toss?
                            </p>

                            <div
                                role="radiogroup"
                                aria-label="Toss winner"
                                className="grid gap-3 sm:grid-cols-2"
                            >

                                {[match.teamA, match.teamB].map((team) => (

                                    <ChoiceButton
                                        key={team.id}
                                        selected={tossWinner === team.id}
                                        disabled={loading}
                                        onClick={() => setTossWinner(team.id)}
                                    >

                                        <span className="flex items-center gap-3">

                                            <TeamLogo src={team.logo} name={team.name} />

                                            <span className="min-w-0 font-semibold text-white">
                                                {team.name}
                                            </span>

                                            {tossWinner === team.id && (
                                                <span
                                                    aria-hidden="true"
                                                    className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-black"
                                                >
                                                    ✓
                                                </span>
                                            )}

                                        </span>

                                    </ChoiceButton>

                                ))}

                            </div>

                        </div>

                        {/* Decision */}

                        <div>

                            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                                They chose to
                            </p>

                            <div
                                role="radiogroup"
                                aria-label="Toss decision"
                                className="grid grid-cols-2 gap-3"
                            >

                                {[
                                    { value: "BAT", label: "Bat" },
                                    { value: "BOWL", label: "Bowl" },
                                ].map((option) => (

                                    <ChoiceButton
                                        key={option.value}
                                        selected={tossDecision === option.value}
                                        disabled={loading}
                                        onClick={() => setTossDecision(option.value)}
                                    >

                                        <span className="block text-center text-lg font-semibold text-white">
                                            {option.label}
                                        </span>

                                    </ChoiceButton>

                                ))}

                            </div>

                        </div>

                        {/* Summary + confirm */}

                        <div className="space-y-3">

                            <p
                                aria-live="polite"
                                className={`min-h-5 text-center text-sm ${selectedTeam ? "font-medium text-white" : "text-zinc-500"}`}
                            >

                                {selectedTeam
                                    ? `${selectedTeam.name} won the toss and will ${decisionWord} first.`
                                    : "Pick the team that won the toss."}

                            </p>

                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={loading || !tossWinner}
                                className={`flex h-14 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 text-lg font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500 ${focusRing}`}
                            >

                                {loading && <Spinner />}

                                {loading
                                    ? "Conducting Toss..."
                                    : "Conduct Toss"}

                            </button>

                        </div>

                    </div>

                ) : (

                    <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-5">

                        <p className="mb-4 font-semibold text-green-400">
                            ✓ Toss Completed
                        </p>

                        <div className="flex items-center gap-4">

                            <TeamLogo
                                src={selectedTeam?.logo}
                                name={selectedTeam?.name}
                            />

                            <div>

                                <p className="text-lg font-semibold text-white">

                                    {selectedTeam?.name ?? match.tossWinner}

                                </p>

                                <p className="text-zinc-400">

                                    won the toss and elected to{" "}

                                    <span className="font-bold text-white">

                                        {match.tossDecision === "BAT" ? "bat" : "bowl"}

                                    </span>

                                </p>

                            </div>

                        </div>

                    </div>

                )
            }

        </div>

    );

}

export default TossCard;