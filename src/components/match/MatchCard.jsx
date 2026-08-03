import { useNavigate } from "react-router-dom";

function MatchCard({
    match,
    controlPage = false
}) {

    const navigate = useNavigate();

    const handleClick = () => {

        if (controlPage) {

            navigate(`/matches/${match.matchId}/control`);

        } else {

            navigate(`/match/${match.matchId}`);

        }

    };

  return (
    <div
      onClick={handleClick}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 cursor-pointer hover:bg-zinc-800 transition"
    >
      {/* Status */}
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-red-400 font-semibold">
          {match.status}
        </p>

        <p className="text-sm text-zinc-400">
          {match.overs} Overs
        </p>
      </div>

      {/* Team A */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <img
            src={match.teamALogo}
            alt={match.teamAName}
            className="w-10 h-10 rounded-full object-cover"
          />

          <p className="text-white font-medium">
            {match.teamAName}
          </p>
        </div>

        <p className="text-white font-bold">
          {match.teamAScore}/{match.teamAWickets}
        </p>
      </div>

      {/* Team B */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <img
            src={match.teamBLogo}
            alt={match.teamBName}
            className="w-10 h-10 rounded-full object-cover"
          />

          <p className="text-white font-medium">
            {match.teamBName}
          </p>
        </div>

        <p className="text-white font-bold">
          {match.teamBScore}/{match.teamBWickets}
        </p>
      </div>

      {/* Result */}
      <p className="text-sm text-green-400">
        {match.resultDisplay}
      </p>

      {/* Venue */}
      <p className="text-xs text-zinc-500 mt-2">
        {match.venue}
      </p>
    </div>
  );
}

export default MatchCard;