import { useEffect, useMemo, useState } from "react";
import { searchPlayers } from "../../services/userService";

function PlayerSearch({
  label,
  selectedPlayer,
  onSelect,
  excludeIds = [],
}) {

  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    if (keyword.trim().length < 2) {
      setPlayers([]);
      return;
    }

    const timer = setTimeout(async () => {

      try {

        setLoading(true);

        const data = await searchPlayers(keyword);

        setPlayers(data);

      } catch (err) {

        console.error(err);

      } finally {

        setLoading(false);

      }

    }, 300);

    return () => clearTimeout(timer);

  }, [keyword]);

  const filteredPlayers = useMemo(() => {
    return players.filter(
      player => !excludeIds.includes(player.userId)
    );
  }, [players, excludeIds]);

  return (

    <div className="mb-6">

      <label className="block mb-2 font-semibold">
        {label}
      </label>

      <input
        type="text"
        placeholder="Search player..."
        className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
      />

      {loading && (
        <p className="text-zinc-400 mt-2">
          Searching...
        </p>
      )}

      {!loading && keyword.length >= 2 && filteredPlayers.length > 0 && (

        <div className="mt-2 bg-zinc-900 rounded-lg border border-zinc-700 max-h-60 overflow-y-auto">

          {filteredPlayers.map(player => (

            <button
              key={player.userId}
              type="button"
              onClick={() => {

                onSelect(player);

                setKeyword(player.name);

                setPlayers([]);

              }}
              className="w-full text-left p-3 hover:bg-zinc-800 flex items-center gap-3"
            >

              <img
                src={player.profileImage}
                alt={player.name}
                className="w-10 h-10 rounded-full object-cover"
              />

              <div>

                <p className="font-medium">
                  {player.name}
                </p>

                <p className="text-sm text-zinc-400">
                  {player.place}
                </p>

              </div>

            </button>

          ))}

        </div>

      )}

      {!loading &&
        keyword.length >= 2 &&
        filteredPlayers.length === 0 && (

          <p className="text-zinc-500 mt-2">
            No players found.
          </p>

        )}

      {selectedPlayer && (

        <div className="mt-3 bg-green-900/30 border border-green-600 rounded-lg p-3 flex items-center gap-3">

          <img
            src={selectedPlayer.profileImage}
            alt={selectedPlayer.name}
            className="w-10 h-10 rounded-full object-cover"
          />

          <div>

            <p className="font-semibold">
              {selectedPlayer.name}
            </p>

            <p className="text-sm text-zinc-400">
              {selectedPlayer.place}
            </p>

          </div>

        </div>

      )}

    </div>

  );
}

export default PlayerSearch;