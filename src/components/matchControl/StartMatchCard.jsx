import { useState } from "react";
import toast from "react-hot-toast";

import { startMatch } from "../../services/matchService";

function StartMatchCard({
    match,
    refreshMatch
}) {

    const [loading, setLoading] = useState(false);

    const handleStartMatch = async () => {

        try {

            setLoading(true);

            await startMatch(match.matchId);

            toast.success("Match started successfully.");

            await refreshMatch();

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.error ||
                "Failed to start match."
            );

        } finally {

            setLoading(false);

        }

    };

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">

            <h2 className="text-2xl font-bold mb-6">
                Ready to Start Match
            </h2>

            <div className="space-y-4">

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-zinc-400">
                        Batting First
                    </p>

                    <p className="text-xl font-semibold text-green-400">
                        {
                            match.currentBattingTeam === match.teamA.id
                                ? match.teamA.name
                                : match.teamB.name
                        }
                    </p>

                </div>

                <div className="rounded-xl bg-zinc-800 p-4">

                    <p className="text-zinc-400">
                        Bowling First
                    </p>

                    <p className="text-xl font-semibold text-blue-400">
                        {
                            match.currentBowlingTeam === match.teamA.id
                                ? match.teamA.name
                                : match.teamB.name
                        }
                    </p>

                </div>

            </div>

            <button
                onClick={handleStartMatch}
                disabled={loading}
                className="mt-8 w-full bg-green-600 hover:bg-green-700 rounded-xl py-4 text-lg font-semibold disabled:bg-zinc-700"
            >

                {
                    loading
                        ? "Starting Match..."
                        : "Start Match"
                }

            </button>

        </div>

    );

}

export default StartMatchCard;