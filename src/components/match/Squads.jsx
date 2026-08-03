import { useEffect, useState } from "react";
import { getTeamSquad } from "../../services/teamService";

function Squads({ teamA, teamB }) {

  const [teamASquad, setTeamASquad] = useState([]);
  const [teamBSquad, setTeamBSquad] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSquads();
  }, []);

  const fetchSquads = async () => {
    try {

      const [aSquad, bSquad] = await Promise.all([
        getTeamSquad(teamA.id),
        getTeamSquad(teamB.id),
      ]);

      setTeamASquad(aSquad);
      setTeamBSquad(bSquad);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-white">
        Loading Squads...
      </div>
    );
  }

  return (
    <div className="space-y-8">

      {/* Team A */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

        <div className="flex items-center gap-4 mb-6">

          <img
            src={teamA.logo}
            alt={teamA.name}
            className="w-14 h-14 rounded-full"
          />

          <h2 className="text-2xl font-bold text-white">
            {teamA.name}
          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {teamASquad.map((player) => (

            <div
              key={player.id}
              className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
            >

              <img
                src={player.image}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>

                <h3 className="text-white font-medium">
                  {player.name}
                </h3>

                <p className="text-zinc-400 text-sm">
                  {player.role}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

      {/* Team B */}
      <div className="bg-zinc-900 rounded-2xl p-6 border border-zinc-800">

        <div className="flex items-center gap-4 mb-6">

          <img
            src={teamB.logo}
            alt={teamB.name}
            className="w-14 h-14 rounded-full"
          />

          <h2 className="text-2xl font-bold text-white">
            {teamB.name}
          </h2>

        </div>

        <div className="grid md:grid-cols-2 gap-4">

          {teamBSquad.map((player) => (

            <div
              key={player.id}
              className="flex items-center gap-4 bg-zinc-800 rounded-xl p-4"
            >

              <img
                src={player.image}
                alt={player.name}
                className="w-12 h-12 rounded-full object-cover"
              />

              <div>

                <h3 className="text-white font-medium">
                  {player.name}
                </h3>

                <p className="text-zinc-400 text-sm">
                  {player.role}
                </p>

              </div>

            </div>

          ))}

        </div>

      </div>

    </div>
  );
}

export default Squads;