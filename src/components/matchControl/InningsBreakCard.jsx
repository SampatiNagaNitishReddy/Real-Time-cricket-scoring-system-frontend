import { useState } from "react";
import toast from "react-hot-toast";

import { startSecondInnings } from "../../services/matchService";

function InningsBreakCard({
    match,
    refreshMatch
}) {

    const [loading, setLoading] = useState(false);

    const chasingTeam =
        match.currentBattingTeam === match.teamA.id
            ? match.teamA
            : match.teamB;

    const firstInningsTeam =
        chasingTeam.id === match.teamA.id
            ? match.teamB
            : match.teamA;

    const handleStartSecondInnings = async () => {

        try {

            setLoading(true);

            await startSecondInnings(match.matchId);

            toast.success("Second innings started.");

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.error ||
                "Failed to start second innings."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

            <div className="flex justify-between items-center mb-6">

                <div>

                    <h2 className="text-2xl font-bold">
                        Innings Break
                    </h2>

                    <p className="text-zinc-400 mt-1">
                        First innings completed.
                    </p>

                </div>

                <span className="px-4 py-2 rounded-full bg-orange-600/20 text-orange-400 font-semibold">
                    Target {match.target}
                </span>

            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-6">

                <div className="bg-zinc-800 rounded-xl p-5">

                    <p className="text-zinc-400 text-sm">
                        First Innings Score
                    </p>

                    <h3 className="text-xl font-bold mt-2">
                        {firstInningsTeam.name}
                    </h3>

                    <p className="text-4xl font-bold mt-3">
                        {firstInningsTeam.score}/{firstInningsTeam.wickets}
                    </p>

                </div>

                <div className="bg-green-900/20 border border-green-700 rounded-xl p-5 flex flex-col justify-center">

                    <p className="text-green-300 text-lg">

                        <span className="font-bold">
                            {chasingTeam.name}
                        </span>

                        {" "}need{" "}

                        <span className="text-2xl font-bold">
                            {match.target}
                        </span>

                        {" "}runs to win.

                    </p>

                    <p className="text-zinc-400 mt-2">
                        {match.overs} overs available
                    </p>

                </div>

            </div>

            <button
                onClick={handleStartSecondInnings}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 font-semibold transition"
            >

                {
                    loading
                        ? "Starting..."
                        : "Start Second Innings"
                }

            </button>

        </div>

    );

}

export default InningsBreakCard;