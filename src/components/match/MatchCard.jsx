import { useNavigate } from "react-router-dom";

const isLive = (status) => status?.startsWith("LIVE");

const toLabel = (s = "") =>
  s.charAt(0) + s.slice(1).toLowerCase().replace(/_/g, " ");

function StatusBadge({ status }) {
  if (isLive(status)) {
    return (
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-red-500/15 px-2.5 py-1 text-xs font-bold text-red-400">
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
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${styles}`}>
      {toLabel(status)}
    </span>
  );
}

function TeamRow({ name, logo, score, wickets, isWinner, isLoser, isBatting, yetToBat }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex min-w-0 items-center gap-3">
        <img
          src={logo}
          alt=""
          className="h-10 w-10 shrink-0 rounded-full bg-zinc-800 object-cover"
        />

        <div className="min-w-0">
          <p
            className={`truncate ${
              isLoser ? "font-medium text-zinc-500" : "font-semibold text-white"
            }`}
          >
            {name}
          </p>
          {isBatting && <p className="text-xs font-medium text-green-400">Batting</p>}
          {isWinner && <p className="text-xs font-medium text-green-400">Winner</p>}
        </div>
      </div>

      {yetToBat ? (
        <p className="text-sm text-zinc-500">Yet to bat</p>
      ) : (
        <p
          className={`text-xl tabular-nums ${
            isLoser ? "font-medium text-zinc-500" : "font-bold text-white"
          }`}
        >
          {score}
          <span className="text-sm font-medium text-zinc-500">/{wickets}</span>
        </p>
      )}
    </div>
  );
}

function MatchCard({ match, controlPage = false }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (controlPage) {
      navigate(`/matches/${match.matchId}/control`);
    } else {
      navigate(`/match/${match.matchId}`);
    }
  };

  const live = isLive(match.status);
  const firstInnings = match.status === "LIVE_FIRST_INNINGS";
  const secondInnings = match.status === "LIVE_SECOND_INNINGS";
  const completed = match.status === "COMPLETED";
  const abandoned = match.status === "ABANDONED";

  // Who batted first? (toss winner chose to bat, or the other team did)
  const teamABattedFirst =
    (match.tossDecision === "BAT") === (match.tossWinnerName === match.teamAName);

  const aBatting = live && (firstInnings ? teamABattedFirst : !teamABattedFirst);
  const bBatting = live && !aBatting;

  const noRunsA = match.teamAScore === 0 && match.teamAWickets === 0;
  const noRunsB = match.teamBScore === 0 && match.teamBWickets === 0;

  // Winner comes from resultSummary ("Winner: <teamId> ...")
  const winnerA = completed && !!match.resultSummary?.includes(match.teamAId);
  const winnerB = completed && !!match.resultSummary?.includes(match.teamBId);

  // Chase info
  let chaseLine = null;
  if (secondInnings) {
    const target = (teamABattedFirst ? match.teamAScore : match.teamBScore) + 1;
    const chaseScore = teamABattedFirst ? match.teamBScore : match.teamAScore;
    const chaseName = teamABattedFirst ? match.teamBName : match.teamAName;
    const need = target - chaseScore;
    chaseLine =
      need > 0
        ? `${chaseName} need ${need} ${need === 1 ? "run" : "runs"} to win`
        : `${chaseName} have reached the target`;
  }

  return (
    <div
      onClick={handleClick}
      className={`flex cursor-pointer flex-col rounded-2xl border bg-zinc-900 p-5 transition hover:-translate-y-0.5 hover:bg-zinc-800/80 ${
        live ? "border-red-500/30 hover:border-red-500/60" : "border-zinc-800 hover:border-zinc-700"
      }`}
    >
      {/* Status */}
      <div className="mb-5 flex items-center justify-between">
        <StatusBadge status={match.status} />
        <p className="text-sm text-zinc-400">{match.overs} overs</p>
      </div>

      {/* Teams */}
      <div className="space-y-4">
        <TeamRow
          name={match.teamAName}
          logo={match.teamALogo}
          score={match.teamAScore}
          wickets={match.teamAWickets}
          isWinner={winnerA}
          isLoser={winnerB}
          isBatting={aBatting}
          yetToBat={firstInnings && !aBatting && noRunsA}
        />

        <TeamRow
          name={match.teamBName}
          logo={match.teamBLogo}
          score={match.teamBScore}
          wickets={match.teamBWickets}
          isWinner={winnerB}
          isLoser={winnerA}
          isBatting={bBatting}
          yetToBat={firstInnings && !bBatting && noRunsB}
        />
      </div>

      {/* Result / situation */}
      <div className="mt-5 border-t border-zinc-800 pt-4">
        {completed && match.resultDisplay && (
          <p className="text-sm font-medium text-green-400">{match.resultDisplay}</p>
        )}

        {abandoned && <p className="text-sm font-medium text-amber-400">Match abandoned</p>}

        {secondInnings && <p className="text-sm font-medium text-white">{chaseLine}</p>}

        {firstInnings && (
          <p className="text-sm text-zinc-300">
            {match.tossWinnerName} chose to {match.tossDecision === "BAT" ? "bat" : "bowl"}
          </p>
        )}

        <p className="mt-2 flex items-center gap-1.5 text-xs text-zinc-500">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-3.5 w-3.5"
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
    </div>
  );
}

export default MatchCard;