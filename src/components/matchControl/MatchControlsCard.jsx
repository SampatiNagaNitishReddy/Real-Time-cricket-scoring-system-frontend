import toast from "react-hot-toast";

import {
    endFirstInnings,
    startSecondInnings,
    endMatch,
} from "../../services/matchService";

function MatchControlsCard({
    match,
    refreshMatch,
}) {

    const handleEndFirstInnings = async () => {

        try {

            await endFirstInnings(match.matchId);

            toast.success("First innings ended");

            refreshMatch();

        } catch (err) {

            toast.error(
                err?.response?.data?.error ||
                "Failed to end first innings"
            );
        }
    };

    const handleStartSecondInnings = async () => {

        try {

            await startSecondInnings(match.matchId);

            toast.success("Second innings started");

            refreshMatch();

        } catch (err) {

            toast.error(
                err?.response?.data?.error ||
                "Failed to start second innings"
            );
        }
    };

    const handleEndMatch = async (reason) => {

        const confirmed = window.confirm(
            `Are you sure you want to ${reason.toLowerCase()} this match?`
        );

        if (!confirmed)
            return;

        try {

            await endMatch(
                match.matchId,
                reason
            );

            toast.success(
                reason === "CANCELLED"
                    ? "Match Cancelled"
                    : "Match Abandoned"
            );

            refreshMatch();

        } catch (err) {

            toast.error(
                err?.response?.data?.error ||
                "Failed to end match"
            );
        }
    };

    const showEndFirstInnings =
        match.status === "LIVE_FIRST_INNINGS";

    const showStartSecondInnings =
        match.status === "INNINGS_BREAK";

    const showDangerButtons =
        ![
            "COMPLETED",
            "CANCELLED",
            "ABANDONED",
        ].includes(match.status);

    return (

        <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800">

            <h2 className="text-xl font-bold mb-5">
                Match Controls
            </h2>

            <div className="space-y-4">

                {showEndFirstInnings && (

                    <button
                        onClick={handleEndFirstInnings}
                        className="w-full bg-orange-600 hover:bg-orange-700 py-3 rounded-lg font-semibold transition"
                    >
                        End First Innings
                    </button>

                )}

                {showStartSecondInnings && (

                    <button
                        onClick={handleStartSecondInnings}
                        className="w-full bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold transition"
                    >
                        Start Second Innings
                    </button>

                )}

                {showDangerButtons && (

                    <>
                        <hr className="border-zinc-700" />

                        <p className="text-sm text-zinc-400 font-medium">
                            Danger Zone
                        </p>

                        <div className="grid grid-cols-2 gap-3">

                            <button
                                onClick={() =>
                                    handleEndMatch("CANCELLED")
                                }
                                className="bg-red-600 hover:bg-red-700 py-3 rounded-lg font-semibold transition"
                            >
                                Cancel Match
                            </button>

                            <button
                                onClick={() =>
                                    handleEndMatch("ABANDONED")
                                }
                                className="bg-red-800 hover:bg-red-900 py-3 rounded-lg font-semibold transition"
                            >
                                Abandon Match
                            </button>

                        </div>

                    </>

                )}

            </div>

        </div>

    );
}

export default MatchControlsCard;