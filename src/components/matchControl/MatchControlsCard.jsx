import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import { Spinner } from "../auth/fields";

import {
    endFirstInnings,
    startSecondInnings,
    endMatch,
} from "../../services/matchService";

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function ConfirmModal({
    title,
    children,
    confirmLabel,
    busyLabel,
    cancelLabel = "Go back",
    tone = "danger",
    busy,
    onConfirm,
    onClose,
}) {

    useEffect(() => {

        const onKey = (e) => {
            if (e.key === "Escape" && !busy) onClose();
        };

        document.addEventListener("keydown", onKey);

        return () => document.removeEventListener("keydown", onKey);

    }, [onClose, busy]);

    const confirmStyle =
        tone === "warning"
            ? "bg-amber-500 text-black hover:bg-amber-400"
            : "bg-red-600 text-white hover:bg-red-500";

    return (

        <div
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
            onMouseDown={(e) => {
                if (e.target === e.currentTarget && !busy) onClose();
            }}
        >

            <div
                role="dialog"
                aria-modal="true"
                aria-label={title}
                className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
            >

                <h2 className="text-xl font-bold text-white">
                    {title}
                </h2>

                <div className="mt-3 text-zinc-300">
                    {children}
                </div>

                <div className="mt-6 flex gap-3">

                    {/* The safe choice is focused first */}
                    <button
                        type="button"
                        autoFocus
                        onClick={onClose}
                        disabled={busy}
                        className={`flex-1 rounded-lg border border-zinc-700 py-3 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50 ${focusRing}`}
                    >
                        {cancelLabel}
                    </button>

                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={busy}
                        className={`flex flex-1 items-center justify-center gap-2 rounded-lg py-3 font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${confirmStyle} ${focusRing}`}
                    >
                        {busy && <Spinner />}
                        {busy ? busyLabel : confirmLabel}
                    </button>

                </div>

            </div>

        </div>

    );

}

function MatchControlsCard({
    match,
    refreshMatch,
}) {

    // Which request is running (locks every button while one is in flight)
    const [busy, setBusy] = useState(null);

    // Which confirmation dialog is open: "endFirst" | "CANCELLED" | "ABANDONED"
    const [confirm, setConfirm] = useState(null);

    const [showMore, setShowMore] = useState(false);

    const run = async (key, action, successMessage, failMessage) => {

        if (busy) return;

        try {

            setBusy(key);

            await action();

            toast.success(successMessage);

            await refreshMatch();

        } catch (err) {

            toast.error(
                err?.response?.data?.error ||
                failMessage
            );

        } finally {

            setBusy(null);

            setConfirm(null);

        }

    };

    const handleEndFirstInnings = () =>
        run(
            "endFirst",
            () => endFirstInnings(match.matchId),
            "First innings ended",
            "Failed to end first innings"
        );

    const handleStartSecondInnings = () =>
        run(
            "startSecond",
            () => startSecondInnings(match.matchId),
            "Second innings started",
            "Failed to start second innings"
        );

    const handleEndMatch = (reason) =>
        run(
            reason,
            () => endMatch(match.matchId, reason),
            reason === "CANCELLED"
                ? "Match Cancelled"
                : "Match Abandoned",
            "Failed to end match"
        );

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

    if (!showEndFirstInnings && !showStartSecondInnings && !showDangerButtons) {

        return null;

    }

    // Same rule the page uses to decide the innings is over (display only)
    const completedOvers =
        match.firstInningsOvers?.filter(
            over => over.legalDeliveries >= 6
        ).length ?? 0;

    const firstInningsDone =
        showEndFirstInnings &&
        (
            completedOvers >= match.overs ||
            match.firstInnings?.wickets >= 10
        );

    const anyBusy = busy !== null;

    return (

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:p-5">

            {/* Header row */}

            <div className="flex flex-wrap items-center justify-between gap-3">

                <h2 className="text-lg font-semibold text-white">

                    Match controls

                </h2>

                <div className="flex items-center gap-2">

                    {/* Mid-innings: a compact End First Innings button */}
                    {showEndFirstInnings && !firstInningsDone && (

                        <button
                            type="button"
                            onClick={() => setConfirm("endFirst")}
                            disabled={anyBusy}
                            className={`touch-manipulation rounded-lg border border-amber-500/40 px-4 py-2 text-sm font-medium text-amber-400 transition hover:bg-amber-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >

                            End first innings

                        </button>

                    )}

                    {showDangerButtons && (

                        <button
                            type="button"
                            onClick={() => setShowMore((open) => !open)}
                            disabled={anyBusy}
                            aria-expanded={showMore}
                            className={`touch-manipulation rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >

                            More {showMore ? "▴" : "▾"}

                        </button>

                    )}

                </div>

            </div>

            {/* Innings is over: make the next step obvious */}

            {firstInningsDone && (

                <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">

                    <p className="font-semibold text-amber-400">

                        First innings complete

                    </p>

                    <p className="mt-1 text-sm text-zinc-300">

                        All overs are bowled or the team is all out. End the innings to move on.

                    </p>

                    <button
                        type="button"
                        onClick={() => setConfirm("endFirst")}
                        disabled={anyBusy}
                        className={`mt-4 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-amber-500 font-bold text-black transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                    >

                        {busy === "endFirst" && <Spinner />}

                        End first innings

                    </button>

                </div>

            )}

            {/* Innings break: start the chase */}

            {showStartSecondInnings && (

                <button
                    type="button"
                    onClick={handleStartSecondInnings}
                    disabled={anyBusy}
                    className={`mt-4 flex h-12 w-full touch-manipulation items-center justify-center gap-2 rounded-xl bg-green-500 font-bold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
                >

                    {busy === "startSecond" && <Spinner />}

                    {busy === "startSecond" ? "Starting..." : "Start second innings"}

                </button>

            )}

            {/* Danger zone (hidden until asked for) */}

            {showDangerButtons && showMore && (

                <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">

                    <p className="text-sm font-medium text-red-300">

                        Danger zone

                    </p>

                    <p className="mt-1 text-sm text-zinc-400">

                        These end the match and stop scoring. Only use them if play can't go on.

                    </p>

                    <div className="mt-3 grid gap-2 sm:grid-cols-2">

                        <button
                            type="button"
                            onClick={() => setConfirm("CANCELLED")}
                            disabled={anyBusy}
                            className={`touch-manipulation rounded-lg border border-red-500/40 py-2.5 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >

                            Cancel match

                        </button>

                        <button
                            type="button"
                            onClick={() => setConfirm("ABANDONED")}
                            disabled={anyBusy}
                            className={`touch-manipulation rounded-lg border border-red-500/40 py-2.5 font-medium text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >

                            Abandon match

                        </button>

                    </div>

                </div>

            )}

            {/* Confirmations */}

            {confirm === "endFirst" && (

                <ConfirmModal
                    tone="warning"
                    title="End the first innings?"
                    confirmLabel="End innings"
                    busyLabel="Ending..."
                    busy={busy === "endFirst"}
                    onConfirm={handleEndFirstInnings}
                    onClose={() => setConfirm(null)}
                >

                    <p>

                        The first innings will be closed at{" "}
                        <span className="font-semibold text-white">
                            {match.firstInnings?.runs}/{match.firstInnings?.wickets}
                        </span>
                        . Make sure the last ball has been recorded.

                    </p>

                </ConfirmModal>

            )}

            {(confirm === "CANCELLED" || confirm === "ABANDONED") && (

                <ConfirmModal
                    title={
                        confirm === "CANCELLED"
                            ? "Cancel this match?"
                            : "Abandon this match?"
                    }
                    cancelLabel="Keep scoring"
                    confirmLabel={
                        confirm === "CANCELLED"
                            ? "Cancel match"
                            : "Abandon match"
                    }
                    busyLabel="Ending match..."
                    busy={busy === confirm}
                    onConfirm={() => handleEndMatch(confirm)}
                    onClose={() => setConfirm(null)}
                >

                    <p>

                        The match will be marked as{" "}
                        <span className="font-semibold text-white">
                            {confirm === "CANCELLED" ? "cancelled" : "abandoned"}
                        </span>{" "}
                        and scoring will stop. This can't be undone from this screen.

                    </p>

                </ConfirmModal>

            )}

        </div>

    );
}

export default MatchControlsCard;