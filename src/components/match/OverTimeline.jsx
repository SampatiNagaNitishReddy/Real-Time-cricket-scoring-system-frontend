const prettyName = (n = "") => n.replace(/_/g, " ");

// ball.runs already includes extras (wide/no-ball penalty, byes, leg byes)
const ballTotal = (ball) => ball.runs ?? 0;

const EXTRA_STYLE = "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40";

// Returns the text and color for one ball circle
const describeBall = (ball) => {
  if (ball.wicket) return { label: "W", style: "bg-red-500 text-white" };

  const tag =
    ball.extras?.wides > 0
      ? "Wd"
      : ball.extras?.noBalls > 0
      ? "Nb"
      : ball.extras?.byes > 0
      ? "B"
      : ball.extras?.legByes > 0
      ? "Lb"
      : null;

  if (tag) {
    const total = ballTotal(ball);
    return { label: total > 1 ? `${total}${tag}` : tag, style: EXTRA_STYLE };
  }

  if (ball.runs === 6) return { label: "6", style: "bg-green-500 text-black" };
  if (ball.runs === 4) return { label: "4", style: "bg-blue-500 text-white" };
  if (ball.runs === 0) return { label: "•", style: "bg-zinc-800 text-zinc-500" };

  return { label: String(ball.runs), style: "bg-zinc-700 text-white" };
};

function OversTimeline({ overs, inningsTitle }) {

  if (!overs || overs.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 sm:p-6 mb-6">

      {/* Title */}
      <h2 className="text-xl sm:text-2xl font-bold text-white mb-6">
        {inningsTitle}
      </h2>

      {/* Overs */}
      <div className="space-y-4">

        {overs.map((over) => {
          const runs = over.balls.reduce((sum, b) => sum + ballTotal(b), 0);
          const wickets = over.balls.filter((b) => b.wicket).length;

          return (
            <div
              key={over.overNumber}
              className="border border-zinc-800 rounded-xl p-4"
            >

              {/* Over Header */}
              <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 mb-4">

                <div className="flex items-baseline gap-3">
                  <h3 className="text-lg font-semibold text-white">
                    Over {over.overNumber}
                  </h3>

                  <p className="text-sm text-zinc-400">
                    {runs} {runs === 1 ? "run" : "runs"}
                    {wickets > 0 && (
                      <span className="ml-2 font-semibold text-red-400">
                        {wickets} {wickets === 1 ? "wkt" : "wkts"}
                      </span>
                    )}
                  </p>
                </div>

                <p className="text-sm text-zinc-400">
                  Bowler:{" "}
                  <span className="font-medium text-white">
                    {prettyName(over.bowlerName)}
                  </span>
                </p>

              </div>

              {/* Balls */}
              <div className="flex flex-wrap gap-3">

                {over.balls.map((ball, i) => {
                  const { label, style } = describeBall(ball);

                  return (
                    <div
                      key={`${ball.ballNumber}-${i}`}
                      title={prettyName(ball.batsmanName)}
                      className={`h-10 min-w-10 px-2 rounded-full flex items-center justify-center text-sm font-bold ${style}`}
                    >
                      {label}
                    </div>
                  );
                })}

              </div>

            </div>
          );
        })}

      </div>

    </div>
  );
}

export default OversTimeline;