function StatusBadge({ status }) {

    const styles = {

        SCHEDULED: "bg-blue-500/20 text-blue-400 border-blue-500/30",

        TOSS_COMPLETED: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",

        PLAYING_XI_SELECTED: "bg-purple-500/20 text-purple-400 border-purple-500/30",

        LIVE_FIRST_INNINGS: "bg-green-500/20 text-green-400 border-green-500/30",

        INNINGS_BREAK: "bg-orange-500/20 text-orange-400 border-orange-500/30",

        LIVE_SECOND_INNINGS: "bg-green-500/20 text-green-400 border-green-500/30",

        COMPLETED: "bg-zinc-700 text-white border-zinc-600",

        CANCELLED: "bg-red-500/20 text-red-400 border-red-500/30",

        ABANDONED: "bg-red-500/20 text-red-400 border-red-500/30"

    };

    return (

        <span
            className={`px-3 py-1 rounded-full border text-sm font-medium ${styles[status] || styles.SCHEDULED}`}
        >
            {status.replaceAll("_", " ")}
        </span>

    );

}

function MatchHeader({ match }) {
   

    return (
        
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">

            <div className="flex justify-between items-start">

                <div>

                    <h1 className="text-3xl font-bold">

                        {match.teamA?.name} vs {match.teamB?.name}

                    </h1>

                    <p className="text-zinc-400 mt-2">

                        {match.venue}

                    </p>

                </div>

                <StatusBadge status={match.status} />

            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-8">

                <div>

                    <p className="text-zinc-500 text-sm">

                        Overs

                    </p>

                    <p className="font-semibold">

                        {match.overs}

                    </p>

                </div>

                <div>

                    <p className="text-zinc-500 text-sm">

                        Max Overs / Bowler

                    </p>

                    <p className="font-semibold">

                        {match.maxOversPerBowler}

                    </p>

                </div>

                <div>

                    <p className="text-zinc-500 text-sm">

                        Scheduled

                    </p>

                    <p className="font-semibold">

                        {new Date(match.startTime).toLocaleString()}

                    </p>

                </div>

                <div>

                    <p className="text-zinc-500 text-sm">

                        Match ID

                    </p>

                    <p className="font-semibold">

                        {match.matchId}

                    </p>

                </div>

            </div>

        </div>

    );

}

export default MatchHeader;