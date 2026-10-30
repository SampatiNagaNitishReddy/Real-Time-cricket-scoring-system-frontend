import { useEffect, useId, useMemo, useState } from "react";
import { searchPlayers } from "../../services/userService";
import { Spinner } from "../auth/fields";

const NO_EXCLUDES = [];

const prettyName = (n = "") => n.replace(/_/g, " ");

function Avatar({ src, name, size = "h-10 w-10" }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <span
        aria-hidden="true"
        className={`flex ${size} shrink-0 items-center justify-center rounded-full bg-green-500/15 text-sm font-bold text-green-400`}
      >
        {name?.[0]?.toUpperCase()}
      </span>
    );
  }

  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
      className={`${size} shrink-0 rounded-full object-cover ring-2 ring-zinc-700`}
    />
  );
}

function PlayerSearch({
  label,
  selectedPlayer,
  onSelect,
  excludeIds = NO_EXCLUDES,
}) {

  const inputId = useId();
  const listId = `${inputId}-list`;

  const [keyword, setKeyword] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const query = keyword.trim();
  const searching = query.length >= 2;

  useEffect(() => {

    if (!searching) {
      setPlayers([]);
      setLoading(false);
      setError(false);
      return;
    }

    let ignore = false; // drop responses from older keystrokes

    setLoading(true);
    setError(false);

    const timer = setTimeout(async () => {

      try {

        const data = await searchPlayers(query);

        if (!ignore) {
          setPlayers(data ?? []);
          setActiveIndex(0);
        }

      } catch (err) {

        console.error(err);

        if (!ignore) {
          setPlayers([]);
          setError(true);
        }

      } finally {

        if (!ignore) setLoading(false);

      }

    }, 300);

    return () => {
      ignore = true;
      clearTimeout(timer);
    };

  }, [query, searching]);

  const filteredPlayers = useMemo(() => {
    return players.filter(
      (player) => !excludeIds.includes(player.userId)
    );
  }, [players, excludeIds]);

  const showList = searching && !loading && !error && filteredPlayers.length > 0;
  const active = Math.min(activeIndex, filteredPlayers.length - 1);

  // Keep the highlighted row visible while moving with the arrow keys
  useEffect(() => {
    if (!showList) return;
    document
      .getElementById(`${listId}-${active}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active, showList, listId]);

  const choose = (player) => {

    onSelect(player);

    setKeyword("");
    setPlayers([]);

  };

  const handleKeyDown = (e) => {

    if (e.key === "Escape" && keyword) {
      e.stopPropagation(); // clear the box without closing a parent modal
      setKeyword("");
      return;
    }

    if (!showList) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex(Math.min(active + 1, filteredPlayers.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex(Math.max(active - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault(); // don't submit a surrounding form
      choose(filteredPlayers[active]);
    }

  };

  return (

    <div className="mb-6">

      <label
        htmlFor={inputId}
        className="mb-1.5 block text-sm font-medium text-zinc-300"
      >
        {label}
      </label>

      {/* Search box */}
      <div className="relative">

        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500"
          aria-hidden="true"
        >
          <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>

        <input
          id={inputId}
          type="text"
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-activedescendant={showList ? `${listId}-${active}` : undefined}
          autoComplete="off"
          placeholder="Search by name..."
          className="w-full rounded-lg border border-zinc-700 bg-zinc-950 py-3 pl-11 pr-11 text-white placeholder-zinc-500 outline-none transition focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={handleKeyDown}
        />

        {loading && (
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-green-400">
            <Spinner />
          </span>
        )}

      </div>

      {/* Hints and results */}
      {keyword && !searching && (
        <p role="status" className="mt-2 text-sm text-zinc-500">
          Type at least 2 characters to search.
        </p>
      )}

      {error && (
        <p role="status" className="mt-2 text-sm text-red-400">
          Couldn't search players. Check your connection and try again.
        </p>
      )}

      {showList && (

        <ul
          id={listId}
          role="listbox"
          className="mt-2 max-h-60 overflow-y-auto rounded-lg border border-zinc-700 bg-zinc-900 py-1"
        >

          {filteredPlayers.map((player, i) => (

            <li
              key={player.userId}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={i === active}
              onClick={() => choose(player)}
              onMouseEnter={() => setActiveIndex(i)}
              className={`flex cursor-pointer items-center gap-3 px-3 py-2.5 ${
                i === active ? "bg-zinc-800" : ""
              }`}
            >

              <Avatar src={player.profileImage} name={player.name} />

              <div className="min-w-0">

                <p className="truncate font-medium text-white">
                  {prettyName(player.name)}
                </p>

                {player.place && (
                  <p className="truncate text-sm text-zinc-400">
                    {player.place}
                  </p>
                )}

              </div>

            </li>

          ))}

        </ul>

      )}

      {searching && !loading && !error && filteredPlayers.length === 0 && (
        <p role="status" className="mt-2 text-sm text-zinc-500">
          {players.length > 0
            ? "Everyone matching is already added."
            : `No players found for "${query}".`}
        </p>
      )}

      {/* Selected player */}
      {selectedPlayer && (

        <div className="mt-3 flex items-center gap-3 rounded-lg border border-green-500/40 bg-green-500/10 p-3">

          <Avatar src={selectedPlayer.profileImage} name={selectedPlayer.name} />

          <div className="min-w-0 flex-1">

            <p className="truncate font-semibold text-white">
              {prettyName(selectedPlayer.name)}
            </p>

            {selectedPlayer.place && (
              <p className="truncate text-sm text-zinc-400">
                {selectedPlayer.place}
              </p>
            )}

          </div>

          <span className="rounded bg-green-500 px-2 py-0.5 text-xs font-bold text-black">
            Selected
          </span>

        </div>

      )}

    </div>

  );
}

export default PlayerSearch;