import BattingTable from "./BattingTable";
import BowlingTable from "./BowlingTable";

function Scorecard({ innings, title }) {
  if (!innings) return null;

  return (
    <div className="mb-6 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">

      {/* Innings Title */}
      <div className="flex items-center justify-between border-b border-zinc-800 px-5 py-4 sm:px-6">
        <h2 className="text-xl font-bold text-white sm:text-2xl">
          {title}
        </h2>

        <p className="text-xl font-bold tabular-nums text-white sm:text-2xl">
          {innings.runs}
          <span className="text-base font-medium text-zinc-500 sm:text-lg">
            /{innings.wickets}
          </span>
        </p>
      </div>

      {/* Batting */}
      <div className="px-5 pb-2 pt-5 sm:px-6">
        <BattingTable batting={innings.batting} extras={innings.extras ?? {}} />
      </div>

      {/* Bowling */}
      <div className="px-5 pb-5 pt-6 sm:px-6">
        <BowlingTable bowling={innings.bowling} />
      </div>

    </div>
  );
}

export default Scorecard;