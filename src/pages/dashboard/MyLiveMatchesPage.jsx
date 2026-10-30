import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import MatchCard from "../../components/match/MatchCard";
import { getMyLiveMatches } from "../../services/matchService";

const SETUP_STATUSES = ["SCHEDULED", "TOSS_COMPLETED", "PLAYING_XI_SELECTED"];

const isInProgress = (m) =>
    m.status?.startsWith("LIVE") || m.status === "INNINGS_BREAK";

const isSetup = (m) => SETUP_STATUSES.includes(m.status);

// What the scorer does next, shown under each card (display only)
const NEXT_STEP = {
    SCHEDULED: "Next: conduct the toss",
    TOSS_COMPLETED: "Next: select the Playing XI",
    PLAYING_XI_SELECTED: "Next: start the match",
    LIVE_FIRST_INNINGS: "Continue scoring",
    LIVE_SECOND_INNINGS: "Continue scoring",
    INNINGS_BREAK: "Next: start the second innings",
};

const focusRing =
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function SectionTitle({ children, count }) {

    return (

        <div className="mb-4 flex items-center gap-3">

            <h2 className="text-lg font-semibold text-white">

                {children}

            </h2>

            <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400">

                {count}

            </span>

        </div>

    );

}

function MatchGrid({ matches }) {

    return (

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

            {
                matches.map(match => (

                    <div
                        key={match.matchId}
                        className="flex flex-col gap-2"
                    >

                        <MatchCard
                            match={match}
                            controlPage={true}
                        />

                        {
                            NEXT_STEP[match.status] && (

                                <p className="px-1 text-sm text-zinc-400">

                                    <span
                                        aria-hidden="true"
                                        className="mr-1 font-medium text-green-400"
                                    >
                                        →
                                    </span>

                                    {NEXT_STEP[match.status]}

                                </p>

                            )
                        }

                    </div>

                ))
            }

        </div>

    );

}

function MyLiveMatchesPage() {

    const [matches, setMatches] = useState([]);

    const [loading, setLoading] = useState(true);

    const [refreshing, setRefreshing] = useState(false);

    const [error, setError] = useState(false);

    useEffect(() => {

        loadMatches();

    }, []);

    const loadMatches = async (isRefresh = false) => {

        try {

            if (isRefresh) {
                setRefreshing(true);
            } else {
                setLoading(true);
            }

            setError(false);

            const data = await getMyLiveMatches();

            setMatches(data ?? []);

        } catch (err) {

            console.error(err);

            setError(true);

            toast.error(
                err.response?.data?.error ||
                "Failed to load live matches."
            );

        } finally {

            setLoading(false);

            setRefreshing(false);

        }

    };

    const inProgress = matches.filter(isInProgress);

    const readyToSetUp = matches.filter(isSetup);

    const other = matches.filter(m => !isInProgress(m) && !isSetup(m));

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">

                <Link
                    to="/dashboard"
                    className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
                >

                    <span aria-hidden="true">←</span> Dashboard

                </Link>

                {/* Header */}

                <div className="mb-8 flex flex-wrap items-start justify-between gap-4">

                    <div>

                        <h1 className="text-3xl font-bold sm:text-4xl">

                            My matches

                        </h1>

                        <p className="mt-2 text-zinc-400">

                            {loading || error
                                ? "Matches you're the scorer for"
                                : `Matches you're the scorer for · ${matches.length} ${matches.length === 1 ? "match" : "matches"}`}

                        </p>

                    </div>

                    <div className="flex items-center gap-2">

                        <button
                            type="button"
                            onClick={() => loadMatches(true)}
                            disabled={loading || refreshing}
                            className={`flex items-center gap-2 rounded-lg border border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-50 ${focusRing}`}
                        >

                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
                                aria-hidden="true"
                            >
                                <path d="M16.023 9.348h4.992V4.356M2.985 19.644v-4.992h4.992m10.876-5.304A8.25 8.25 0 005.4 8.25M3.147 14.652A8.25 8.25 0 0018.6 15.75" />
                            </svg>

                            {refreshing ? "Refreshing..." : "Refresh"}

                        </button>

                        <Link
                            to="/matches/create"
                            className={`rounded-lg bg-green-500 px-4 py-2.5 text-sm font-semibold text-black transition hover:bg-green-400 ${focusRing}`}
                        >

                            + Create match

                        </Link>

                    </div>

                </div>

                {/* Loading */}

                {
                    loading && (

                        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

                            {[...Array(3)].map((_, i) => (
                                <div
                                    key={i}
                                    className="h-52 animate-pulse rounded-2xl bg-zinc-900"
                                />
                            ))}

                        </div>

                    )
                }

                {/* Error (only when there is nothing to show) */}

                {
                    !loading && error && matches.length === 0 && (

                        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-12 text-center">

                            <p className="mb-5 text-red-400">

                                Couldn't load your matches.

                            </p>

                            <button
                                type="button"
                                onClick={() => loadMatches()}
                                className={`rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700 ${focusRing}`}
                            >

                                Try again

                            </button>

                        </div>

                    )
                }

                {/* Empty */}

                {
                    !loading && !error && matches.length === 0 && (

                        <div className="rounded-2xl border border-dashed border-zinc-700 bg-zinc-900 p-12 text-center sm:p-16">

                            <h2 className="text-2xl font-semibold">

                                No matches to score yet

                            </h2>

                            <p className="mx-auto mb-8 mt-3 max-w-md text-zinc-400">

                                Matches appear here when you create one, or when someone assigns you as a scorer.

                            </p>

                            <Link
                                to="/matches/create"
                                className={`rounded-lg bg-green-500 px-6 py-3 font-semibold text-black transition hover:bg-green-400 ${focusRing}`}
                            >

                                Create a match

                            </Link>

                        </div>

                    )
                }

                {/* Matches */}

                {
                    !loading && matches.length > 0 && (

                        <div className="space-y-10">

                            {
                                inProgress.length > 0 && (

                                    <section>

                                        <SectionTitle count={inProgress.length}>
                                            In progress
                                        </SectionTitle>

                                        <MatchGrid matches={inProgress} />

                                    </section>

                                )
                            }

                            {
                                readyToSetUp.length > 0 && (

                                    <section>

                                        <SectionTitle count={readyToSetUp.length}>
                                            Ready to set up
                                        </SectionTitle>

                                        <MatchGrid matches={readyToSetUp} />

                                    </section>

                                )
                            }

                            {
                                other.length > 0 && (

                                    <section>

                                        <SectionTitle count={other.length}>
                                            Other
                                        </SectionTitle>

                                        <MatchGrid matches={other} />

                                    </section>

                                )
                            }

                        </div>

                    )
                }

            </div>

        </div>

    );

}

export default MyLiveMatchesPage;