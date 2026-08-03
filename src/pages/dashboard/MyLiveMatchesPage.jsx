import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import MatchCard from "../../components/match/MatchCard";
import { getMyLiveMatches } from "../../services/matchService";

function MyLiveMatchesPage() {

    const [matches, setMatches] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {

        loadMatches();

    }, []);

    const loadMatches = async () => {

        try {

            const data = await getMyLiveMatches();

            setMatches(data);

        } catch (err) {

            console.error(err);

            toast.error(
                err.response?.data?.error ||
                "Failed to load live matches."
            );

        } finally {

            setLoading(false);

        }

    };

    if (loading) {

        return (

            <div className="min-h-screen bg-black text-white flex items-center justify-center">

                Loading  Matches...

            </div>

        );

    }

    return (

        <div className="min-h-screen bg-black text-white">

            <div className="max-w-7xl mx-auto p-6">

                <h1 className="text-3xl font-bold mb-8">

                    My  Matches

                </h1>

                {
                    matches.length === 0 ? (

                        <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-10 text-center">

                            <p className="text-zinc-400 text-lg">

                                No live matches assigned.

                            </p>

                        </div>

                    ) : (

                        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">

                            {
                                matches.map(match => (

                                    <MatchCard
                                        key={match.matchId}
                                        match={match}
                                        controlPage={true}
                                    />

                                ))
                            }

                        </div>

                    )
                }

            </div>

        </div>

    );

}

export default MyLiveMatchesPage;