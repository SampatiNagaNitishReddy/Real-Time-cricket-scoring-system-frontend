const prettyName = (n = "") => n.replace(/_/g, " ");

const fmt = (n) => (n == null ? "-" : Number(n).toFixed(1));

function BowlingTable({ bowling = [] }) {
  return (
    <div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Bowling
      </h3>

      <div className="overflow-x-auto">

        <table className="w-full text-left tabular-nums">

          <thead className="border-b border-zinc-700 text-sm text-zinc-400">
            <tr>
              <th className="sticky left-0 bg-zinc-900 pb-3 pr-4 font-medium">
                Bowler
              </th>
              <th className="px-3 pb-3 text-right font-medium">O</th>
              <th className="px-3 pb-3 text-right font-medium">R</th>
              <th className="px-3 pb-3 text-right font-medium">W</th>
              <th className="pb-3 pl-3 text-right font-medium">ECO</th>
            </tr>
          </thead>

          <tbody>

            {bowling.map((player) => (
              <tr
                key={player.bowlerId}
                className="border-b border-zinc-800 last:border-0"
              >
                <td className="sticky left-0 whitespace-nowrap bg-zinc-900 py-3 pr-4 font-medium text-white">
                  {prettyName(player.bowlerName)}
                </td>

                <td className="px-3 text-right text-zinc-300">{player.overs}</td>

                <td className="px-3 text-right text-zinc-300">{player.runs}</td>

                <td className="px-3 text-right font-bold text-white">
                  {player.wickets}
                </td>

                <td className="pl-3 text-right text-zinc-400">
                  {fmt(player.economy)}
                </td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BowlingTable;