import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Scorecard from "../../components/match/Scorecard";
import { getMatchDetails } from "../../services/matchService";
import OversTimeline from "../../components/match/OverTimeline";
import CommentaryList from "../../components/match/CommentaryList";
import Squads from "../../components/match/Squads";

const TABS = [
  { key: "scorecard", label: "Scorecard" },
  { key: "overs", label: "Overs" },
  { key: "commentary", label: "Commentary" },
  { key: "squads", label: "Squads" },
  { key: "info", label: "Info" },
];

const REFRESH_MS = 10000;

const isLive = (status) => status?.startsWith("LIVE");

const toLabel = (s = "") =>
  s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");

const formatDateTime = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (isNaN(d)) return null;
  return d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
};

function StatusBadge({ status, live }) {
  if (live) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-xs font-bold text-red-400">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          LIVE
        </span>
        <span className="text-xs text-zinc-500">
          {status === "LIVE_SECOND_INNINGS" ? "2nd innings" : "1st innings"}
        </span>
      </div>
    );
  }

  const styles =
    status === "COMPLETED"
      ? "bg-zinc-800 text-zinc-400"
      : status === "ABANDONED"
        ? "bg-amber-500/15 text-amber-400"
        : "bg-blue-500/15 text-blue-400";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${styles}`}>
      {toLabel(status)}
    </span>
  );
}

function TeamRow({ team, isWinner, isLoser, isBatting }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex min-w-0 items-center gap-4">
        <img
          src={team.logo}
          alt=""
          className="h-14 w-14 shrink-0 rounded-full bg-zinc-800 object-cover"
        />

        <div className="min-w-0">
          <h2
            className={`truncate text-lg font-semibold sm:text-xl ${isLoser ? "text-zinc-500" : "text-white"
              }`}
          >
            {team.name}
          </h2>
          {isBatting && <p className="text-xs font-medium text-green-400">Batting</p>}
          {isWinner && <p className="text-xs font-medium text-green-400">Winner</p>}
        </div>
      </div>

      <p
        className={`text-3xl tabular-nums ${isLoser ? "font-medium text-zinc-500" : "font-bold text-white"
          }`}
      >
        {team.score}
        <span className="text-lg font-medium text-zinc-500">/{team.wickets}</span>
      </p>
    </div>
  );
}

function InfoRow({ label, children }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <dt className="text-zinc-400">{label}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

function MatchDetailsPage() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("scorecard");

  // silent = background refresh: no spinner, keep old data if it fails
  const fetchMatchDetails = async (silent = false) => {
    try {
      if (!silent) {
        setLoading(true);
        setError("");
      }

      const data = await getMatchDetails(matchId);

      setMatch(data);
    } catch (err) {
      console.error(err);
      if (!silent) setError("Failed to fetch match details");
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  // Auto-refresh while the match is live
  const matchIsLive = match ? match.live || isLive(match.status) : false;

  useEffect(() => {
    if (!matchIsLive) return;

    const id = setInterval(() => fetchMatchDetails(true), REFRESH_MS);
    return () => clearInterval(id);
  }, [matchIsLive, matchId]);

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <div className="h-60 animate-pulse rounded-2xl bg-zinc-900" />
          <div className="mt-6 h-10 w-80 animate-pulse rounded-lg bg-zinc-900" />
          <div className="mt-6 h-72 animate-pulse rounded-2xl bg-zinc-900" />
        </div>
      </div>
    );
  }

  // Error
  if (error || !match) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-black text-white">
        <p className="text-red-400">{error || "Match not found"}</p>
        <div className="flex gap-3">
          <button
            onClick={() => fetchMatchDetails()}
            className="rounded-lg bg-zinc-800 px-5 py-2 font-medium transition hover:bg-zinc-700"
          >
            Try again
          </button>
          <Link
            to="/"
            className="rounded-lg px-5 py-2 font-medium text-zinc-400 transition hover:text-white"
          >
            Back to matches
          </Link>
        </div>
      </div>
    );
  }

  const completed = match.status === "COMPLETED";

  // Team names by id, so innings titles use the team that actually batted
  const teamName = (id) =>
    id === match.teamA.id ? match.teamA.name : match.teamB.name;

  const firstBatting = teamName(match.firstInnings?.battingTeamId ?? match.teamA.id);
  const secondBatting = teamName(match.secondInnings?.battingTeamId ?? match.teamB.id);

  // Winner is read from the result text ("<team> won by ...")
  const resultText = match.result ?? "";
  const aHit = resultText.startsWith(match.teamA.name);
  const bHit = resultText.startsWith(match.teamB.name);
  const winnerA =
    completed && aHit && (!bHit || match.teamA.name.length > match.teamB.name.length);
  const winnerB =
    completed && bHit && (!aHit || match.teamB.name.length > match.teamA.name.length);

  // Live chase line
  const chasing = matchIsLive && match.currentInnings === 2;
  const chaseLine =
    chasing && match.runsRequired != null
      ? match.runsRequired > 0
        ? `${secondBatting} need ${match.runsRequired} ${match.runsRequired === 1 ? "run" : "runs"
        } from ${match.ballsRemaining} ${match.ballsRemaining === 1 ? "ball" : "balls"
        }`
        : `${secondBatting} have reached the target`
      : null;

  const tossLine = match.tossWinner
    ? `${match.tossWinner} chose to ${match.tossDecision === "BAT" ? "bat" : "bowl"}`
    : null;

  const startTime = formatDateTime(match.startTime);

  return (
    <div className="min-h-screen bg-black px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        {/* Back */}
        <Link
          to="/"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> All matches
        </Link>

        {/* Match Header */}
        <div
          className={`rounded-2xl border bg-zinc-900 p-5 sm:p-6 ${matchIsLive ? "border-red-500/30" : "border-zinc-800"
            }`}
        >
          {/* Status + venue */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
            <StatusBadge status={match.status} live={matchIsLive} />

            <p className="flex items-center gap-1.5 text-sm text-zinc-400">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18s6-5.2 6-10a6 6 0 10-12 0c0 4.8 6 10 6 10zm0-7.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z"
                  clipRule="evenodd"
                />
              </svg>
              {match.venue}
            </p>
          </div>

          {/* Teams */}
          <div className="space-y-5">
            <TeamRow
              team={match.teamA}
              isWinner={winnerA}
              isLoser={winnerB}
              isBatting={matchIsLive && match.currentBattingTeam === match.teamA.id}
            />
            <TeamRow
              team={match.teamB}
              isWinner={winnerB}
              isLoser={winnerA}
              isBatting={matchIsLive && match.currentBattingTeam === match.teamB.id}
            />
          </div>

          {/* Result / situation */}
          {(match.result || chaseLine || (matchIsLive && tossLine)) && (
            <div className="mt-6 space-y-3 border-t border-zinc-800 pt-4">
              {match.result && (
                <p className="text-lg font-medium text-green-400">{match.result}</p>
              )}

              {chaseLine && (
                <p className="text-lg font-medium text-white">
                  {chaseLine}
                  {match.target ? (
                    <span className="ml-2 text-sm font-normal text-zinc-400">
                      Target {match.target}
                    </span>
                  ) : null}
                </p>
              )}

              {matchIsLive && !chasing && tossLine && (
                <p className="text-zinc-300">{tossLine}</p>
              )}

              {completed && match.manOfTheMatch && (
                <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800 py-1 pl-1 pr-4">
                  {match.manOfTheMatch.image ? (
                    <img
                      src={match.manOfTheMatch.image}
                      alt=""
                      className="h-7 w-7 rounded-full object-cover"
                    />
                  ) : null}
                  <span className="text-sm text-zinc-400">Man of the match</span>
                  <span className="text-sm font-semibold">{match.manOfTheMatch.name}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div
          className="mt-6 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-zinc-800"
          role="tablist"
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;

            return (
              <button
                key={tab.key}
                role="tab"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`-mb-px whitespace-nowrap border-b-2 px-4 py-3 font-medium transition ${active
                    ? "border-green-500 text-green-400"
                    : "border-transparent text-zinc-400 hover:text-white"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === "scorecard" && (
            <div>
              {match.firstInnings && (
                <Scorecard
                  title={`${firstBatting} Innings`}
                  innings={match.firstInnings}
                />
              )}

              {match.secondInnings && (
                <Scorecard
                  title={`${secondBatting} Innings`}
                  innings={match.secondInnings}
                />
              )}
            </div>
          )}

          {activeTab === "overs" && (
            <div >
              <OversTimeline
                inningsTitle={`${firstBatting} Innings`}
                overs={match.firstInningsOvers}
              />

              <OversTimeline
                inningsTitle={`${secondBatting} Innings`}
                overs={match.secondInningsOvers}
              />
            </div>
          )}

          {activeTab === "commentary" && (
            <div className="space-y-8">
              <CommentaryList
                title={`${firstBatting} Innings`}
                overs={match.firstInningsOvers}
              />

              <CommentaryList
                title={`${secondBatting} Innings`}
                overs={match.secondInningsOvers}
              />
            </div>
          )}

          {activeTab === "squads" && (
            <Squads teamA={match.teamA} teamB={match.teamB} />
          )}

          {activeTab === "info" && (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 px-6 py-2">
              <dl className="divide-y divide-zinc-800">
                <InfoRow label="Match">
                  {match.teamA.name} vs {match.teamB.name}
                </InfoRow>
                {startTime && <InfoRow label="Date & time">{startTime}</InfoRow>}
                <InfoRow label="Venue">{match.venue}</InfoRow>
                <InfoRow label="Format">{match.overs} overs per side</InfoRow>
                {tossLine && <InfoRow label="Toss">{tossLine}</InfoRow>}
                {match.target ? <InfoRow label="Target">{match.target}</InfoRow> : null}
                {match.maxOversPerBowler ? (
                  <InfoRow label="Max overs per bowler">{match.maxOversPerBowler}</InfoRow>
                ) : null}
                {match.manOfTheMatch && (
                  <InfoRow label="Man of the match">
                    <span className="inline-flex items-center gap-2">
                      {match.manOfTheMatch.image ? (
                        <img
                          src={match.manOfTheMatch.image}
                          alt=""
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : null}
                      {match.manOfTheMatch.name}
                    </span>
                  </InfoRow>
                )}
                <InfoRow label="Status">{toLabel(match.status)}</InfoRow>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MatchDetailsPage;