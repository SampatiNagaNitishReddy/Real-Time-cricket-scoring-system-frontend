import { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";

import { getMatchDetails, conductToss } from "../../services/matchService";

// Components 
import MatchHeader from "../../components/matchControl/MatchHeader";
import TossCard from "../../components/matchControl/TossCard";
import PlayingXICard from "../../components/matchControl/PlayingXICard";
import StartMatchCard from "../../components/matchControl/StartMatchCard";
import BatsmenSelectionCard from "../../components/matchControl/BatsmenSelectionCard";
import BowlerSelectionCard from "../../components/matchControl/BowlerSelectionCard";
import CompactScorecard from "../../components/scoring/CompactScorecard";
import BallControls from "../../components/scoring/BallControls";
import MatchControlsCard from "../../components/matchControl/MatchControlsCard";
import InningsBreakCard from "../../components/matchControl/InningsBreakCard";

function MatchControlPage() {

    const { matchId } = useParams();

    const [match, setMatch] = useState(null);

    const [playingXI, setPlayingXI] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState({
        toss: false,
        playingXI: false,
        startMatch: false,
        batsmen: false,
        bowler: false,
        endFirstInnings: false,
        secondInnings: false,
        endMatch: false,
    });

    const fetchMatch = useCallback(async () => {

        try {

            const data = await getMatchDetails(matchId);

            setMatch(data);

        } catch (err) {

            console.error(err);

            toast.error("Failed to load match");

        } finally {

            setLoading(false);

        }

    }, [matchId]);

    //handlers
    const handleConductToss = async (winner, decision) => {

        try {

            setSaving((prev) => ({
                ...prev,
                toss: true
            }));

            await conductToss(
                matchId,
                winner,
                decision
            );

            toast.success("Toss conducted successfully.");

            await fetchMatch();

        } catch (err) {

            toast.error(
                err.response?.data?.error ||
                "Failed to conduct toss."
            );

        } finally {

            setSaving((prev) => ({
                ...prev,
                toss: false
            }));

        }

    };
    useEffect(() => {

        fetchMatch();

    }, [fetchMatch]);

    if (loading) {

        return (

            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                Loading Match...

            </div>

        );

    }

    if (!match) {

        return (

            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                Match not found.

            </div>

        );

    }

    const innings =
        match.currentInnings === 1
            ? match.firstInnings
            : match.secondInnings;

    const inningsOvers =
        match.currentInnings === 1
            ? match.firstInningsOvers
            : match.secondInningsOvers;

    const completedOvers =
        inningsOvers?.filter(
            over => over.legalDeliveries >= 6
        ).length ?? 0;

    const inningsCompleted =
        completedOvers >= match.overs ||
        innings?.wickets >= 10;

    const batsmenSelected =
        Boolean(
            innings?.strikerId &&
            innings?.nonStrikerId
        );

    const bowlerSelected =
        Boolean(
            innings?.currentBowlerId
        );

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="max-w-7xl mx-auto p-6 space-y-6">

                <MatchHeader match={match} />

                {/* Scheduled */}
                {
                    match.status === "SCHEDULED" && (

                        <TossCard
                            match={match}
                            loading={saving.toss}
                            onConductToss={handleConductToss}
                        />

                    )
                }

                {/* Toss completed */}
                {
                    match.status === "TOSS_COMPLETED" && (

                        <PlayingXICard
                            match={match}
                            playingXI={playingXI}
                            setPlayingXI={setPlayingXI}
                            refreshMatch={fetchMatch}
                        />

                    )
                }

                {/* Playing XI selected */}
                {
                    match.status === "PLAYING_XI_SELECTED" && (

                        <StartMatchCard
                            match={match}
                            refreshMatch={fetchMatch}
                        />

                    )
                }
                {/* Innings Break */}
                {
                    match.status === "INNINGS_BREAK" && (

                        <InningsBreakCard
                            match={match}
                            refreshMatch={fetchMatch}
                        />

                    )
                }
                {
                    match.status === "COMPLETED" && (

                        <div className="space-y-6">

                            

                            <div className="bg-zinc-900 rounded-2xl p-8 text-center">

                                <p className="text-xl text-zinc-200">
                                    {match.result}
                                </p>

                            </div>

                        </div>

                    )
                }
                {
                    (
                        match.status === "LIVE_FIRST_INNINGS" ||
                        match.status === "LIVE_SECOND_INNINGS"
                    ) && (

                        inningsCompleted ? (

                            <div className="space-y-6">

                                <CompactScorecard
                                    match={match}
                                />

                                <MatchControlsCard
                                    match={match}
                                    refreshMatch={fetchMatch}
                                />

                            </div>

                        ) : !batsmenSelected ? (

                            <BatsmenSelectionCard
                                match={match}
                                refreshMatch={fetchMatch}
                            />

                        ) : !bowlerSelected ? (

                            <BowlerSelectionCard
                                match={match}
                                refreshMatch={fetchMatch}
                            />

                        ) : (

                            <div className="grid lg:grid-cols-3 gap-6">

                                <div className="lg:col-span-1">
                                    <CompactScorecard match={match} />
                                </div>

                                <div className="lg:col-span-2">

                                    <MatchControlsCard
                                        match={match}
                                        refreshMatch={fetchMatch}
                                    />

                                    <BallControls
                                        match={match}
                                        refreshMatch={fetchMatch}
                                    />

                                </div>

                            </div>

                        )

                    )
                }

            </div>

        </div>

    );

}

export default MatchControlPage;