import PlayerCheckbox from "./PlayerCheckbox";

function TeamPlayingXI({
    teamName,
    players,
    selectedPlayers,
    onTogglePlayer
}) {

    return (

        <div className="rounded-xl border border-zinc-700 bg-zinc-900 p-5">

            <div className="flex justify-between items-center mb-5">

                <h3 className="text-lg font-semibold">

                    {teamName}

                </h3>

                <span className="text-sm text-zinc-400">

                    {selectedPlayers.length} / 11 Selected

                </span>

            </div>

            <div className="space-y-3">

                {
                    players.map(player => {

                        const checked =
                            selectedPlayers.includes(player.userId);

                        const disabled =
                            !checked &&
                            selectedPlayers.length >= 11;

                        return (

                            <PlayerCheckbox
                                key={player.userId}
                                player={player}
                                checked={checked}
                                disabled={disabled}
                                onChange={onTogglePlayer}
                            />

                        );

                    })
                }

            </div>

        </div>

    );

}

export default TeamPlayingXI;