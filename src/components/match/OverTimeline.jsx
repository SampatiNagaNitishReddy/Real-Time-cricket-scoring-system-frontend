function OversTimeline({ overs, inningsTitle }) {

  if (!overs || overs.length === 0) {
    return null;
  }

  return (
    <div className="bg-zinc-900 rounded-2xl p-6 mb-6">

      {/* Title */}
      <h2 className="text-2xl font-bold mb-6">
        {inningsTitle}
      </h2>

      {/* Overs */}
      <div className="space-y-6">

        {overs.map((over) => (
          <div
            key={over.overNumber}
            className="border border-zinc-800 rounded-xl p-4"
          >

            {/* Over Header */}
            <div className="flex justify-between items-center mb-4">

              <h3 className="text-lg font-semibold">
                Over {over.overNumber}
              </h3>

              <p className="text-zinc-400">
                Bowler: {over.bowlerName}
              </p>

            </div>

            {/* Balls */}
            <div className="flex flex-wrap gap-3">

              {over.balls.map((ball) => (

                <div
                  key={ball.ballNumber}
                  className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center font-semibold"
                >

                  {ball.wicket
                    ? "W"
                    : ball.runs}

                </div>

              ))}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}

export default OversTimeline;