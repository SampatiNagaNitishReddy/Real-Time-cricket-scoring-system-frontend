import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Scorecard from "../../components/match/Scorecard";
import { getMatchDetails } from "../../services/matchService";
import OversTimeline from "../../components/match/OverTimeline";
import CommentaryList from "../../components/match/CommentaryList";
import Squads from "../../components/match/Squads";
function MatchDetailsPage() {
  const { matchId } = useParams();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("scorecard");

  useEffect(() => {
    fetchMatchDetails();
  }, [matchId]);

  const fetchMatchDetails = async () => {
    try {
      setLoading(true);

      const data = await getMatchDetails(matchId);

      setMatch(data);
    } catch (err) {
      setError("Failed to fetch match details");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Loading
  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading Match Details...
      </div>
    );
  }

  // Error
  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-500 flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">

      {/* Match Header */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

        {/* Status */}
        <div className="flex justify-between items-center mb-6">
          <p className="text-red-400 font-semibold">
            {match.status}
          </p>

          <p className="text-zinc-400">
            {match.venue}
          </p>
        </div>

        {/* Teams */}
        <div className="space-y-5">

          {/* Team A */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={match.teamA.logo}
                alt={match.teamA.name}
                className="w-14 h-14 rounded-full"
              />

              <h2 className="text-xl font-semibold">
                {match.teamA.name}
              </h2>
            </div>

            <p className="text-2xl font-bold">
              {match.teamA.score}/{match.teamA.wickets}
            </p>
          </div>

          {/* Team B */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={match.teamB.logo}
                alt={match.teamB.name}
                className="w-14 h-14 rounded-full"
              />

              <h2 className="text-xl font-semibold">
                {match.teamB.name}
              </h2>
            </div>

            <p className="text-2xl font-bold">
              {match.teamB.score}/{match.teamB.wickets}
            </p>
          </div>
        </div>

        {/* Result */}
        <div className="mt-6">
          <p className="text-green-400 font-medium text-lg">
            {match.result}
          </p>
        </div>

      </div>
      {/* Tabs */}
      <div className="flex gap-4 mt-6 border-b border-zinc-800 pb-3">

        <button
          onClick={() => setActiveTab("scorecard")}
          className={`px-4 py-2 rounded-lg ${activeTab === "scorecard"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          Scorecard
        </button>

        <button
          onClick={() => setActiveTab("overs")}
          className={`px-4 py-2 rounded-lg ${activeTab === "overs"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          Overs
        </button>

        <button
          onClick={() => setActiveTab("commentary")}
          className={`px-4 py-2 rounded-lg ${activeTab === "commentary"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          Commentary
        </button>

        <button
          onClick={() => setActiveTab("squads")}
          className={`px-4 py-2 rounded-lg ${activeTab === "squads"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          Squads
        </button>
        <button
          onClick={() => setActiveTab("info")}
          className={`px-4 py-2 rounded-lg ${activeTab === "info"
            ? "bg-blue-600 text-white"
            : "bg-zinc-900 text-zinc-400"
            }`}
        >
          Info
        </button>

      </div>

      {/* Tab Content */}
      <div className="mt-6">

        {activeTab === "scorecard" && (
          <div>

            <Scorecard
              title={`${match.teamA.name} Innings`}
              innings={match.firstInnings}
            />

            <Scorecard
              title={`${match.teamB.name} Innings`}
              innings={match.secondInnings}
            />

          </div>
        )}

        {activeTab === "overs" && (
          <div className="bg-zinc-900 p-6 rounded-2xl">
            <div>

              <OversTimeline
                inningsTitle={`${match.teamA.name} Overs`}
                overs={match.firstInningsOvers}
              />

              <OversTimeline
                inningsTitle={`${match.teamB.name} Overs`}
                overs={match.secondInningsOvers}
              />

            </div>
          </div>
        )}

        {activeTab === "commentary" && (
          <div className="space-y-8">

            <CommentaryList overs={match.firstInningsOvers} />

            <CommentaryList overs={match.secondInningsOvers} />

          </div>
        )}

        {activeTab === "squads" && (
          <Squads
            teamA={match.teamA}
            teamB={match.teamB}
          />
        )}

        {activeTab === "info" && (
          <div className="bg-zinc-900 p-6 rounded-2xl">
            Match Info Coming Soon
          </div>
        )}

      </div>
    </div>
  );
}

export default MatchDetailsPage;