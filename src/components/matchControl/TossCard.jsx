import { useEffect, useState } from "react";

function TossCard({
    match,
    loading = false,
    onConductToss
}) {

    const [tossWinner, setTossWinner] = useState("");
    const [tossDecision, setTossDecision] = useState("BAT");

    useEffect(() => {

        if (match?.tossWinner) {
            setTossWinner(match.tossWinner);
        }

        if (match?.tossDecision) {
            setTossDecision(match.tossDecision);
        }

    }, [match]);

    const handleSubmit = () => {

        if (!tossWinner) {
            return;
        }

        onConductToss(tossWinner, tossDecision);

    };
    

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <h2 className="text-lg font-semibold mb-5">
                Toss
            </h2>

            {
                match.status === "SCHEDULED" ? (

                    <div className="space-y-4">

                        <div>

                            <label className="block text-sm text-zinc-400 mb-2">
                                Toss Winner
                            </label>

                            <select
                                value={tossWinner}
                                onChange={(e) =>
                                    setTossWinner(e.target.value)
                                }
                                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3"
                            >

                                <option value="">
                                    Select Team
                                </option>

                                <option value={match.teamA.id}>
                                    {match.teamA.name}
                                </option>

                                <option value={match.teamB.id}>
                                    {match.teamB.name}
                                </option>

                            </select>

                        </div>

                        <div>

                            <label className="block text-sm text-zinc-400 mb-2">
                                Decision
                            </label>

                            <select
                                value={tossDecision}
                                onChange={(e) =>
                                    setTossDecision(e.target.value)
                                }
                                className="w-full rounded-lg bg-zinc-800 border border-zinc-700 px-4 py-3"
                            >

                                <option value="BAT">
                                    Bat
                                </option>

                                <option value="BOWL">
                                    Bowl
                                </option>

                            </select>

                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={loading || !tossWinner}
                            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed rounded-lg py-3 font-semibold"
                        >
                            {loading
                                ? "Conducting Toss..."
                                : "Conduct Toss"}
                        </button>

                    </div>

                ) : (

                    <div className="rounded-xl bg-green-950/30 border border-green-800 p-5">

                        <p className="text-green-400 font-semibold mb-3">
                            ✓ Toss Completed
                        </p>

                        <p className="text-lg font-semibold">

                            {
                                match.tossWinner === match.teamA.id
                                    ? match.teamA.name
                                    : match.teamB.name
                            }

                        </p>

                        <p className="text-zinc-400 mt-1">
                            won the toss and elected to
                        </p>

                        <p className="mt-3 text-xl font-bold text-white">

                            {match.tossDecision}

                        </p>

                    </div>

                )
            }

        </div>

    );

}

export default TossCard;