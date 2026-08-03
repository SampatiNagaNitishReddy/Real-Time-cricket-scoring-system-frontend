function BattingTable({ batting }) {
  return (
    <div>

      <h3 className="text-xl font-semibold mb-4">
        Batting
      </h3>

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-zinc-700 text-zinc-400">
            <tr>
              <th className="pb-3">Batter</th>
              <th>R</th>
              <th>B</th>
              <th>4s</th>
              <th>6s</th>
              <th>SR</th>
            </tr>
          </thead>

          <tbody>

            {batting.map((player) => (
              <tr
                key={player.batsmanId}
                className="border-b border-zinc-800"
              >
                <td className="py-4 font-medium">

                  <div className="flex items-center gap-2">

                    <span>{player.batsmanName}</span>

                    {player.onStrike && (
                      <span className="text-green-400">*</span>
                    )}

                  </div>

                </td>

                <td>{player.runs}</td>

                <td>{player.balls}</td>

                <td>{player.fours}</td>

                <td>{player.sixes}</td>

                <td>{player.strikeRate.toFixed(1)}</td>

              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BattingTable;