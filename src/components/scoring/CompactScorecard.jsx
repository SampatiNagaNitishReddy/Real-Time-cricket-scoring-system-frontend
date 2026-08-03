function CompactScorecard({ match }) {

    if (!match) return null;

    const innings =
        match.currentInnings === 1
            ? match.firstInnings
            : match.secondInnings;

    if (!innings) return null;

    const battingTeam =
        match.currentBattingTeam === match.teamA.id
            ? match.teamA
            : match.teamB;

    const currentOver =
        match.currentInnings === 1
            ? match.firstInningsOvers
            : match.secondInningsOvers;

    const striker = innings.batting?.find(
        b => b.batsmanId === innings.strikerId
    );

    const nonStriker = innings.batting?.find(
        b => b.batsmanId === innings.nonStrikerId
    );

    const bowler = innings.bowling?.find(
        b => b.bowlerId === innings.currentBowlerId
    );

    const overNumber =
        currentOver?.length > 0
            ? currentOver[currentOver.length - 1].overNumber
            : 1;

    const legalBalls =
        currentOver?.length > 0
            ? currentOver[currentOver.length - 1].legalDeliveries
            : 0;

    return (

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-6">

            {/* Header */}

            <div className="flex justify-between items-start">

                <div>

                    <h2 className="text-2xl font-bold">

                        Live Score

                    </h2>

                    <p className="text-zinc-400">

                        {battingTeam.name}

                    </p>

                </div>

                <div className="text-right">

                    <h1 className="text-5xl font-bold">

                        {innings.runs}/{innings.wickets}

                    </h1>

                    <p className="text-zinc-400 mt-1">

                        Over {overNumber - 1}.{legalBalls}

                    </p>

                </div>

            </div>

            {/* Batsmen */}

            <div className="space-y-3">

                <h3 className="font-semibold text-lg">

                    Batting

                </h3>

                <div className="bg-zinc-800 rounded-xl p-4 flex justify-between">

                    <div>

                        <p className="font-semibold">

                            {
                                striker
                                    ? `${striker.batsmanName} *`
                                    : "Striker not selected"
                            }

                        </p>

                    </div>

                    <div className="font-semibold">

                        {
                            striker
                                ? `${striker.runs} (${striker.balls})`
                                : "--"
                        }

                    </div>

                </div>

                <div className="bg-zinc-800 rounded-xl p-4 flex justify-between">

                    <div>

                        <p className="font-semibold">

                            {
                                nonStriker
                                    ? nonStriker.batsmanName
                                    : "Non-Striker not selected"
                            }

                        </p>

                    </div>

                    <div className="font-semibold">

                        {
                            nonStriker
                                ? `${nonStriker.runs} (${nonStriker.balls})`
                                : "--"
                        }

                    </div>

                </div>

            </div>

            {/* Bowler */}

            <div>

                <h3 className="font-semibold text-lg mb-3">

                    Bowling

                </h3>

                <div className="bg-zinc-800 rounded-xl p-4 flex justify-between">

                    <div>

                        <p className="font-semibold">

                            {
                                bowler
                                    ? bowler.bowlerName
                                    : "Bowler not selected"
                            }

                        </p>

                    </div>

                    <div className="text-right">

                        {
                            bowler
                                ? (
                                    <>
                                        <p className="font-semibold">

                                            {bowler.overs} ov

                                        </p>

                                        <p className="text-sm text-zinc-400">

                                            {bowler.runs}/{bowler.wickets}

                                        </p>
                                    </>
                                )
                                : "--"
                        }

                    </div>

                </div>

            </div>

        </div>

    );

}

export default CompactScorecard;