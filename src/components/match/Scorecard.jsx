import BattingTable from "./BattingTable";
import BowlingTable from "./BowlingTable";

function Scorecard({ innings, title }) {
  if (!innings) return null;

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 mb-6">

      {/* Innings Title */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">
          {title}
        </h2>

        <p className="text-xl font-semibold text-white">
          {innings.runs}/{innings.wickets}
        </p>
      </div>

      {/* Batting */}
      <BattingTable batting={innings.batting} />

      {/* Bowling */}
      <div className="mt-8">
        <BowlingTable bowling={innings.bowling} />
      </div>

    </div>
  );
}

export default Scorecard;