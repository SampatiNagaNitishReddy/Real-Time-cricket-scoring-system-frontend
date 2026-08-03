function PlayerCheckbox({
    player,
    checked,
    disabled,
    onChange
}) {

    return (

        <label className="flex items-center justify-between rounded-xl border border-zinc-700 bg-zinc-800 p-3 cursor-pointer">

            <div className="flex items-center gap-3">

                <img
                    src={player.profileImage}
                    alt={player.name}
                    className="w-12 h-12 rounded-full object-cover"
                />

                <div>

                    <div className="flex items-center gap-2">

                        <span className="font-semibold">
                            {player.name}
                        </span>

                        {
                            player.captain &&
                            <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">
                                C
                            </span>
                        }

                        {
                            player.viceCaptain &&
                            <span className="text-xs bg-blue-600 px-2 py-0.5 rounded">
                                VC
                            </span>
                        }

                    </div>

                    <p className="text-sm text-zinc-400">

                        {player.role.replace("_", " ")}

                    </p>

                </div>

            </div>

            <input
                type="checkbox"
                checked={checked}
                disabled={disabled}
                onChange={() => onChange(player.userId)}
                className="w-5 h-5"
            />

        </label>

    );

}

export default PlayerCheckbox;