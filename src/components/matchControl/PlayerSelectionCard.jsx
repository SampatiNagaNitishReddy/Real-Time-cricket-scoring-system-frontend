import { useState } from "react";

const ROLE_MAP = {
    BATTER: "BAT",
    BOWLER: "BOWL",
    ALL_ROUNDER: "AR",
    WICKET_KEEPER: "WK"
};

const BADGE_COLORS = {
    "STRIKER": "bg-green-600",
    "NON-STRIKER": "bg-blue-600",
    "SELECTED": "bg-green-600",
    "Previous Over": "bg-red-600",
    "Quota Completed": "bg-orange-600",
    "BOWLER": "bg-blue-600",
    "ALL_ROUNDER": "bg-purple-600"
};

const prettyName = (n = "") => n.replace(/_/g, " ");

function Avatar({ src, name }) {

    const [failed, setFailed] = useState(false);

    if (!src || failed) {

        return (

            <span
                aria-hidden="true"
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-500/15 text-lg font-bold text-green-400"
            >

                {name?.charAt(0)?.toUpperCase() || "?"}

            </span>

        );

    }

    return (

        <img
            src={src}
            alt=""
            loading="lazy"
            onError={() => setFailed(true)}
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-zinc-700"
        />

    );

}

function PlayerSelectionCard({
    player,
    selected = false,
    disabled = false,
    badge = "",
    subtitle = "",
    onClick
}) {

    const role = ROLE_MAP[player.role];

    return (

        <button
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => {

                if (!disabled) {

                    onClick?.(player);

                }

            }}
            className={`
                flex min-h-16 w-full touch-manipulation items-center gap-3
                rounded-xl border p-3 text-left transition
                focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500

                ${
                    disabled
                        ? "cursor-not-allowed border-zinc-800 bg-zinc-900 opacity-50"
                        : selected
                            ? "border-green-500 bg-green-500/10"
                            : "border-zinc-700 bg-zinc-900 hover:border-green-500/60 hover:bg-zinc-800"
                }
            `}
        >

            {/* Avatar */}

            <Avatar src={player.profileImage} name={player.name} />

            {/* Player Info */}

            <div className="min-w-0 flex-1">

                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">

                    <h3 className="truncate font-semibold text-white">

                        {prettyName(player.name) || "Unknown player"}

                    </h3>

                    {
                        player.captain && (

                            <span className="rounded bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-black">

                                C

                            </span>

                        )
                    }

                    {
                        player.viceCaptain && (

                            <span className="rounded bg-zinc-600 px-1.5 py-0.5 text-[10px] font-bold text-white">

                                VC

                            </span>

                        )
                    }

                </div>

                {
                    player.userId && (

                        <p className="truncate text-xs text-zinc-500">

                            {player.userId}

                        </p>

                    )
                }

                {
                    subtitle && (

                        <p className="mt-0.5 text-sm text-zinc-400">

                            {subtitle}

                        </p>

                    )
                }

                {
                    badge && (

                        <span
                            className={`
                                mt-1.5 inline-block rounded-full px-2 py-0.5
                                text-xs font-medium text-white
                                ${BADGE_COLORS[badge] ?? "bg-zinc-700"}
                            `}
                        >

                            {badge.replace(/_/g, " ")}

                        </span>

                    )
                }

            </div>

            {/* Role */}

            {
                role && (

                    <span className="shrink-0 rounded-full bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300">

                        {role}

                    </span>

                )
            }

            {/* Selected */}

            {
                selected && (

                    <span
                        aria-hidden="true"
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-500 text-sm font-bold text-black"
                    >

                        ✓

                    </span>

                )
            }

        </button>

    );

}

export default PlayerSelectionCard;