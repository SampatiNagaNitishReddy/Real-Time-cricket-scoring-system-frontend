const prettyName = (n = "") => n.replace(/_/g, " ");

const fmt = (n) => (n == null ? "-" : Number(n).toFixed(1));

function BattingTable({ batting = [], extras = {} }) {
  const extrasTotal =
    (extras.wides ?? 0) +
    (extras.noBalls ?? 0) +
    (extras.byes ?? 0) +
    (extras.legByes ?? 0);

  const extrasDetail = [
    ["wd", extras.wides],
    ["nb", extras.noBalls],
    ["b", extras.byes],
    ["lb", extras.legByes],
  ]
    .filter(([, v]) => v > 0)
    .map(([k, v]) => `${k} ${v}`)
    .join(", ");

  return (
    <div>

      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-400">
        Batting
      </h3>

      <div className="overflow-x-auto">

        <table className="w-full text-left tabular-nums">

          <thead className="border-b border-zinc-700 text-sm text-zinc-400">
            <tr>
              <th className="sticky left-0 bg-zinc-900 pb-3 pr-4 font-medium">
                Batter
              </th>
              <th className="px-3 pb-3 text-right font-medium">R</th>
              <th className="px-3 pb-3 text-right font-medium">B</th>
              <th className="px-3 pb-3 text-right font-medium">4s</th>
              <th className="px-3 pb-3 text-right font-medium">6s</th>
              <th className="pb-3 pl-3 text-right font-medium">SR</th>
            </tr>
          </thead>

          <tbody>

            {batting.map((player) => (
              <tr
                key={player.batsmanId}
                className="border-b border-zinc-800"
              >
                <td className="sticky left-0 whitespace-nowrap bg-zinc-900 py-3 pr-4">

                  <div className="flex items-center gap-1.5 font-medium text-white">
                    <span>{prettyName(player.batsmanName)}</span>

                    {player.onStrike && (
                      <span className="text-green-400">*</span>
                    )}
                  </div>

                  {player.dismissal ? (
                    <p className="text-xs text-zinc-500">{player.dismissal}</p>
                  ) : (
                    <p className="text-xs text-green-400">not out</p>
                  )}

                </td>

                <td className="px-3 text-right font-bold text-white">{player.runs}</td>

                <td className="px-3 text-right text-zinc-300">{player.balls}</td>

                <td className="px-3 text-right text-zinc-300">{player.fours}</td>

                <td className="px-3 text-right text-zinc-300">{player.sixes}</td>

                <td className="pl-3 text-right text-zinc-400">
                  {fmt(player.strikeRate)}
                </td>

              </tr>
            ))}

            {/* Extras */}
            <tr>
              <td className="sticky left-0 whitespace-nowrap bg-zinc-900 py-3 pr-4 text-zinc-400">
                Extras
                {extrasDetail && (
                  <span className="ml-2 text-xs text-zinc-500">
                    ({extrasDetail})
                  </span>
                )}
              </td>

              <td className="px-3 text-right font-medium text-zinc-300">
                {extrasTotal}
              </td>

              <td colSpan={4} />
            </tr>

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BattingTable;