function BowlingTable({ bowling }) {
  return (
    <div>

      <h3 className="text-xl font-semibold mb-4">
        Bowling
      </h3>

      <div className="overflow-x-auto">

        <table className="w-full text-left">

          <thead className="border-b border-zinc-700 text-zinc-400">
            <tr>
              <th className="pb-3">Bowler</th>
              <th>O</th>
              <th>R</th>
              <th>W</th>
              <th>ECO</th>
            </tr>
          </thead>

          <tbody>

            {bowling.map((player) => (
              <tr
                key={player.bowlerId}
                className="border-b border-zinc-800"
              >
                <td className="py-4 font-medium">
                  {player.bowlerName}
                </td>

                <td>{player.overs}</td>

                <td>{player.runs}</td>

                <td>{player.wickets}</td>

                <td>{player.economy.toFixed(1)}</td>
              </tr>
            ))}

          </tbody>

        </table>

      </div>

    </div>
  );
}

export default BowlingTable;