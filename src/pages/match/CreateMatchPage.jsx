import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createMatch } from "../../services/matchService";

function CreateMatchPage() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    tournamentId: "null",
    teamA: "",
    teamB: "",
    venue: "",
    startTime: "",
    overs: 5,
    maxOversPerBowler: 1,
    scorers: {
      teamA: "",
      teamB: "",
    },
  });

  const handleChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleScorerChange = (e) => {

    const { name, value } = e.target;

    setFormData({
      ...formData,
      scorers: {
        ...formData.scorers,
        [name]: value,
      },
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      const createdMatch = await createMatch(formData);

      navigate(
        `/matches/${createdMatch.matchId}/control`
      );

    } catch (err) {

      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">

      <div className="max-w-2xl mx-auto bg-zinc-900 p-8 rounded-2xl">

        <h1 className="text-3xl font-bold mb-8">
          Create Match
        </h1>

        <form
          onSubmit={handleSubmit}
          className="space-y-5"
        >

          <input
            type="text"
            name="teamA"
            placeholder="Team A ID"
            value={formData.teamA}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="text"
            name="teamB"
            placeholder="Team B ID"
            value={formData.teamB}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="text"
            name="venue"
            placeholder="Venue"
            value={formData.venue}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="datetime-local"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="number"
            name="overs"
            placeholder="Overs"
            value={formData.overs}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="number"
            name="maxOversPerBowler"
            placeholder="Max Overs Per Bowler"
            value={formData.maxOversPerBowler}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="text"
            name="teamA"
            placeholder="Team A Scorer ID"
            value={formData.scorers.teamA}
            onChange={handleScorerChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <input
            type="text"
            name="teamB"
            placeholder="Team B Scorer ID"
            value={formData.scorers.teamB}
            onChange={handleScorerChange}
            className="w-full p-3 rounded-lg bg-zinc-800"
          />

          <button
            type="submit"
            className="w-full bg-blue-600 py-3 rounded-lg font-semibold"
          >
            Create Match
          </button>

        </form>

      </div>

    </div>
  );
}

export default CreateMatchPage;