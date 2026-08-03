function PlayerSelectionCard({
    player,
    selected = false,
    disabled = false,
    badge = "",
    subtitle = "",
    onClick
}) {

    const roleMap = {
        BATTER: "BAT",
        BOWLER: "BOWL",
        ALL_ROUNDER: "AR",
        WICKET_KEEPER: "WK"
    };

    const badgeColor = () => {

        switch (badge) {

            case "STRIKER":
                return "bg-green-600";

            case "NON-STRIKER":
                return "bg-blue-600";

            case "SELECTED":
                return "bg-green-600";

            case "Previous Over":
                return "bg-red-600";

            case "Quota Completed":
                return "bg-orange-600";

            case "BOWLER":
                return "bg-blue-600";

            case "ALL_ROUNDER":
                return "bg-purple-600";

            default:
                return "bg-zinc-700";

        }

    };


    return (

        <div
            onClick={() => {

                if (!disabled) {

                    onClick(player);

                }

            }}
            className={`
                relative
                flex
                items-center
                gap-4
                p-4
                rounded-xl
                border
                transition-all

                ${
                    disabled
                        ? "border-zinc-700 bg-zinc-900 opacity-50 cursor-not-allowed"
                        : selected
                            ? "border-green-500 bg-green-500/10 cursor-pointer"
                            : "border-zinc-700 bg-zinc-900 hover:border-blue-500 hover:bg-zinc-800 cursor-pointer"
                }
            `}
        >

            {/* Avatar */}

            {
                player.profileImage ? (

                    <img
                        src={player.profileImage}
                        alt={player.name}
                        className="w-14 h-14 rounded-full object-cover"
                    />

                ) : (

                    <div className="w-14 h-14 rounded-full bg-zinc-700 flex items-center justify-center font-bold text-lg">

                        {player.name.charAt(0)}

                    </div>

                )
            }

            {/* Player Info */}

            <div className="flex-1 min-w-0">

                <div className="flex items-center gap-2 flex-wrap">

                    <h3 className="font-semibold truncate">

                        {player.name}

                    </h3>

                    {
                        player.captain && (

                            <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded-full">

                                C

                            </span>

                        )
                    }

                    {
                        player.viceCaptain && (

                            <span className="text-xs bg-blue-500 px-2 py-0.5 rounded-full">

                                VC

                            </span>

                        )
                    }

                </div>

                <p className="text-sm text-zinc-400">

                    {player.userId}

                </p>

                {
                    subtitle && (

                        <p className="text-xs text-zinc-500 mt-1">

                            {subtitle}

                        </p>

                    )
                }

            </div>

            {/* Role */}

            <span className="text-xs bg-zinc-800 px-3 py-1 rounded-full">

                {roleMap[player.role]}

            </span>

            {/* Selected */}

            {
                selected && (

                    <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-green-500 text-black flex items-center justify-center font-bold">

                        ✓

                    </div>

                )
            }

            {/* Badge */}

            {
                badge && (

                    <div
                        className={`
                            absolute
                            bottom-2
                            left-4
                            text-xs
                            px-2
                            py-1
                            rounded-full
                            ${badgeColor()}
                        `}
                    >

                        {badge}

                    </div>

                )
            }

        </div>

    );

}

export default PlayerSelectionCard;