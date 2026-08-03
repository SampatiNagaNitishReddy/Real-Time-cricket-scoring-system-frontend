import { generateCommentary } from "../../utils/generateCommentary";

function CommentaryList({ overs }) {

  return (
    <div className="space-y-6">

      {overs.map((over) => (

        <div
          key={over.overNumber}
          className="bg-zinc-900 rounded-2xl p-5 border border-zinc-800"
        >

          {/* Over Header */}
          <div className="flex justify-between items-center mb-4">

            <h2 className="text-lg font-semibold text-white">
              Over {over.overNumber}
            </h2>

            <p className="text-zinc-400 text-sm">
              {over.bowlerName}
            </p>

          </div>

          {/* Balls */}
          <div className="space-y-3">

            {over.balls.map((ball) => (

              <div
                key={ball.ballNumber}
                className="flex items-start gap-4 border-b border-zinc-800 pb-3"
              >

                {/* Ball Number */}
                <div className="w-14 text-blue-400 font-medium">
                 {over.overNumber - 1}.{ball.ballNumber}
                </div>

                {/* Runs Circle */}
                <div
                  className={`
                    w-8 h-8 rounded-full flex items-center justify-center
                    text-sm font-bold
                    ${
                      ball.wicket
                        ? "bg-red-600"
                        : ball.runs === 4
                        ? "bg-blue-600"
                        : ball.runs === 6
                        ? "bg-green-600"
                        : "bg-zinc-700"
                    }
                  `}
                >
                  {ball.wicket ? "W" : ball.runs}
                </div>

                {/* Commentary */}
                <div className="flex-1">

                  <p className="text-white">
                    {generateCommentary(ball, over.overNumber)}
                  </p>

                  <p className="text-zinc-400 text-sm mt-1">
                    {ball.batsmanName} vs {ball.bowlerName}
                  </p>

                </div>

              </div>

            ))}

          </div>

        </div>

      ))}

    </div>
  );
}

export default CommentaryList;