import {
  generateCommentary,
  getCommentaryType,
} from "../../utils/generateCommentary";
import { ballTotal, describeBall, prettyName } from "../../utils/ballDisplay";

function CommentaryList({ overs, title }) {

  if (!overs || overs.length === 0) {
    return null;
  }

  return (
    <div>

      {title && (
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-4">
          {title}
        </h2>
      )}

      <div className="space-y-6">

        {overs.map((over) => {
          const runs = over.balls.reduce((sum, b) => sum + ballTotal(b), 0);

          // counts how many balls of each type we've already seen in this over
          const seen = {};

          return (
            <div
              key={over.overNumber}
              className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
            >

              {/* Over Header */}
              <div className="flex flex-wrap justify-between items-center gap-x-4 gap-y-1 mb-4">

                <div className="flex items-baseline gap-3">
                  <h2 className="text-lg font-semibold text-white">
                    Over {over.overNumber}
                  </h2>

                  <p className="text-sm text-zinc-400">
                    {runs} {runs === 1 ? "run" : "runs"}
                  </p>
                </div>

                <p className="text-zinc-400 text-sm">
                  {prettyName(over.bowlerName)}
                </p>

              </div>

              {/* Balls */}
              <div className="space-y-3">

                {over.balls.map((ball, i) => {
                  const type = getCommentaryType(ball);
                  const occurrence = seen[type] ?? 0;
                  seen[type] = occurrence + 1;

                  const { label, style } = describeBall(ball);

                  return (
                    <div
                      key={`${ball.ballNumber}-${i}`}
                      className="flex items-start gap-4 border-b border-zinc-800 pb-3 last:border-0 last:pb-0"
                    >

                      {/* Ball Number */}
                      <div className="w-12 pt-1 text-sm tabular-nums text-blue-400 font-medium">
                        {over.overNumber - 1}.{ball.ballNumber}
                      </div>

                      {/* Runs Circle */}
                      <div
                        className={`h-8 min-w-8 px-2 shrink-0 rounded-full flex items-center justify-center text-sm font-bold ${style}`}
                      >
                        {label}
                      </div>

                      {/* Commentary */}
                      <div className="flex-1">

                        <p className={ball.wicket ? "font-semibold text-red-400" : "text-white"}>
                          {generateCommentary(ball, over.overNumber, occurrence)}
                        </p>

                        <p className="text-zinc-400 text-sm mt-1">
                          {prettyName(ball.batsmanName)} vs {prettyName(ball.bowlerName)}
                        </p>

                      </div>

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

export default CommentaryList;