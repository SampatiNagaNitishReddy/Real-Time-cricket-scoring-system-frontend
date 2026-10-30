const prettyName = (n = "") => n.replace(/_/g, " ");

const fmt = (n, digits = 1) =>
    n == null || Number.isNaN(Number(n)) ? "-" : Number(n).toFixed(digits);

const EXTRA_STYLE = "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40";

// Text and color for one ball chip in the "This over" row
function chipOf(ball) {

    const ex = ball.extras ?? {};

    if (ball.wicket) return { label: "W", style: "bg-red-500 text-white" };

    const tag =
        ex.wides > 0 ? "Wd"
            : ex.noBalls > 0 ? "Nb"
                : ex.byes > 0 ? "B"
                    : ex.legByes > 0 ? "Lb"
                        : null;

    if (tag) {

        // ball.runs already includes extras
        const total = ball.runs ?? 0;

        return { label: total > 1 ? `${total}${tag}` : tag, style: EXTRA_STYLE };

    }

    if (ball.runs === 6) return { label: "6", style: "bg-green-500 text-black" };
    if (ball.runs === 4) return { label: "4", style: "bg-blue-500 text-white" };
    if (ball.runs === 0) return { label: "•", style: "bg-zinc-800 text-zinc-500" };

    return { label: String(ball.runs), style: "bg-zinc-700 text-white" };

}

function Row({ active = false, name, empty, right, sub }) {

    return (

        <div
            className={`
                flex items-center justify-between gap-3 rounded-xl px-4 py-3
                ${active ? "bg-green-500/10 ring-1 ring-green-500/30" : "bg-zinc-800"}
            `}
        >

            <div className="min-w-0">

                <p
                    className={`flex items-center gap-2 truncate font-semibold ${name ? "text-white" : "text-zinc-500"}`}
                >

                    {active && name && (
                        <span
                            aria-label="On strike"
                            className="h-2 w-2 shrink-0 rounded-full bg-green-400"
                        />
                    )}

                    {name ? prettyName(name) : empty}

                </p>

                {sub && (
                    <p className="text-xs text-zinc-500">
                        {sub}
                    </p>
                )}

            </div>

            <div className="shrink-0 text-right font-semibold tabular-nums text-white">

                {right ?? <span className="text-zinc-600">--</span>}

            </div>

        </div>

    );

}

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

    const lastOver =
        currentOver?.length > 0
            ? currentOver[currentOver.length - 1]
            : null;

    const overNumber = lastOver?.overNumber ?? 1;

    const legalBalls = lastOver?.legalDeliveries ?? 0;

    // After six legal balls the over is complete: show 25.0, not 24.6
    const oversText =
        legalBalls >= 6
            ? `${overNumber}.0`
            : `${overNumber - 1}.${legalBalls}`;

    // Run rate: runs per over so far
    const totalBalls =
        currentOver?.reduce((sum, o) => sum + (o.legalDeliveries ?? 0), 0) ?? 0;

    const runRate =
        totalBalls > 0 ? (innings.runs * 6) / totalBalls : null;

    // Chase (second innings only)
    const chasing =
        match.currentInnings === 2 && match.target != null;

    const runsRequired = match.runsRequired;

    const ballsRemaining = match.ballsRemaining;

    const requiredRate =
        runsRequired > 0 && ballsRemaining > 0
            ? (runsRequired * 6) / ballsRemaining
            : null;

    return (

        <div className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6 lg:sticky lg:top-4">

            {/* Header */}

            <div className="flex items-start justify-between gap-3">

                <div className="min-w-0">

                    <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">

                        Live score

                    </p>

                    <h2 className="mt-1 truncate text-lg font-semibold text-white">

                        {battingTeam.name}

                    </h2>

                </div>

                <div className="text-right">

                    <p className="text-5xl font-bold leading-none tabular-nums text-white">

                        {innings.runs}
                        <span className="text-3xl font-semibold text-zinc-500">
                            /{innings.wickets}
                        </span>

                    </p>

                    <p className="mt-2 text-sm text-zinc-400">

                        Over {oversText}

                        {runRate != null && (
                            <span className="ml-2 text-zinc-500">
                                · RR {fmt(runRate, 2)}
                            </span>
                        )}

                    </p>

                </div>

            </div>

            {/* Chase */}

            {chasing && (

                <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3">

                    <p className="font-semibold text-green-400">

                        {runsRequired > 0
                            ? `Need ${runsRequired} ${runsRequired === 1 ? "run" : "runs"} from ${ballsRemaining} ${ballsRemaining === 1 ? "ball" : "balls"}`
                            : "Target reached"}

                    </p>

                    <p className="mt-0.5 text-sm text-zinc-400">

                        Target {match.target}

                        {requiredRate != null && (
                            <span> · Required rate {fmt(requiredRate, 2)}</span>
                        )}

                    </p>

                </div>

            )}

            {/* This over */}

            {lastOver?.balls?.length > 0 && (

                <div>

                    <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">

                        {legalBalls >= 6 ? "Last over" : "This over"}

                    </h3>

                    <div className="flex flex-wrap gap-2">

                        {lastOver.balls.map((ball, i) => {

                            const { label, style } = chipOf(ball);

                            return (

                                <span
                                    key={`${ball.ballNumber}-${i}`}
                                    className={`flex h-8 min-w-8 items-center justify-center rounded-full px-2 text-xs font-bold ${style}`}
                                >

                                    {label}

                                </span>

                            );

                        })}

                    </div>

                </div>

            )}

            {/* Batsmen */}

            <div className="space-y-2">

                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">

                    Batting

                </h3>

                <Row
                    active
                    name={striker?.batsmanName}
                    empty="Striker not selected"
                    sub={striker ? `SR ${fmt(striker.strikeRate)}` : null}
                    right={
                        striker
                            ? `${striker.runs} (${striker.balls})`
                            : null
                    }
                />

                <Row
                    name={nonStriker?.batsmanName}
                    empty="Non-Striker not selected"
                    sub={nonStriker ? `SR ${fmt(nonStriker.strikeRate)}` : null}
                    right={
                        nonStriker
                            ? `${nonStriker.runs} (${nonStriker.balls})`
                            : null
                    }
                />

            </div>

            {/* Bowler */}

            <div className="space-y-2">

                <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">

                    Bowling

                </h3>

                <Row
                    name={bowler?.bowlerName}
                    empty="Bowler not selected"
                    sub={bowler ? `Econ ${fmt(bowler.economy)}` : null}
                    right={
                        bowler
                            ? (
                                <>
                                    <span className="block">{bowler.overs} ov</span>
                                    <span className="block text-sm font-normal text-zinc-400">
                                        {bowler.runs}/{bowler.wickets}
                                    </span>
                                </>
                            )
                            : null
                    }
                />

            </div>

        </div>

    );

}

export default CompactScorecard;