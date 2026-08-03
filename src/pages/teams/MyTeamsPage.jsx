import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { getMyTeams } from "../../services/teamService";

function MyTeamsPage() {
  const navigate = useNavigate();
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {

    try {

      setLoading(true);

      const data = await getMyTeams();

      setTeams(data);

    } catch (err) {

      console.error(err);

      alert("Failed to load teams.");

    } finally {

      setLoading(false);

    }

  };

  if (loading) {

    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading teams...
      </div>
    );

  }

  return (

    <div className="min-h-screen bg-black text-white p-8">

      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-10">

          <div>

            <h1 className="text-4xl font-bold">
              My Teams
            </h1>

            <p className="text-zinc-400 mt-2">
              Teams you are part of
            </p>

          </div>

          <Link
            to="/dashboard/teams/create"
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
          >
            + Create Team
          </Link>

        </div>

        {teams.length === 0 ? (

          <div className="bg-zinc-900 rounded-xl p-16 text-center">

            <div className="text-6xl mb-5">
              🛡️
            </div>

            <h2 className="text-3xl font-semibold">
              No Teams Yet
            </h2>

            <p className="text-zinc-400 mt-3 mb-8">
              Create your first cricket team.
            </p>

            <Link
              to="/dashboard/teams/create"
              className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg"
            >
              Create Team
            </Link>

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">

            {teams.map(team => (

              <div
                key={team.teamId}
                className="bg-zinc-900 rounded-xl p-6 border border-zinc-800 hover:border-blue-500 transition"
              >

                <div className="flex items-center gap-4">

                  <img
                    src={team.teamLogoUrl}
                    alt={team.name}
                    className="w-16 h-16 rounded-full object-cover border border-zinc-700"
                  />

                  <div>

                    <h2 className="text-xl font-bold">
                      {team.name}
                    </h2>

                    <p className="text-zinc-400">
                      {team.playerCount} Players
                    </p>

                  </div>

                </div>

                <div className="mt-6 space-y-2 text-sm">

                  <p>
                    <span className="text-zinc-500">
                      Captain:
                    </span>{" "}
                    {team.captainName}
                  </p>

                  <p>
                    <span className="text-zinc-500">
                      Vice Captain:
                    </span>{" "}
                    {team.viceCaptainName}
                  </p>

                </div>

                <div className="mt-6 flex gap-3">

                  <button
                    className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-lg py-2"
                    onClick={() => navigate(`/dashboard/teams/${team.teamId}`)}
                  >
                    View
                  </button>

                  <button
                    className="flex-1 bg-zinc-800 hover:bg-zinc-700 rounded-lg py-2"
                    onClick={() => navigate(`/dashboard/teams/${team.teamId}/manage`)}
                  >
                    Manage
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>

  );

}

export default MyTeamsPage;