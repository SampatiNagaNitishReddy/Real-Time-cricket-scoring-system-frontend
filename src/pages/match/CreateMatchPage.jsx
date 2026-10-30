import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import { createMatch } from "../../services/matchService";
import { Field, Spinner } from "../../components/auth/fields";

function Section({ title, description, children }) {
  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      <h2 className="text-lg font-semibold text-white">{title}</h2>

      {description && (
        <p className="mt-1 text-sm text-zinc-400">{description}</p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">{children}</div>

    </section>
  );
}

function CreateMatchPage() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

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

    const teamA = formData.teamA.trim();
    const teamB = formData.teamB.trim();
    const overs = Number(formData.overs);
    const maxOvers = Number(formData.maxOversPerBowler);

    if (teamA === teamB) {
      toast.error("Team A and Team B must be different.");
      return;
    }

    if (!overs || overs < 1) {
      toast.error("Overs must be at least 1.");
      return;
    }

    if (!maxOvers || maxOvers < 1 || maxOvers > overs) {
      toast.error("Max overs per bowler must be between 1 and the match overs.");
      return;
    }

    try {

      setLoading(true);

      const createdMatch = await createMatch({
        ...formData,
        teamA,
        teamB,
        venue: formData.venue.trim(),
        overs,
        maxOversPerBowler: maxOvers,
        scorers: {
          teamA: formData.scorers.teamA.trim(),
          teamB: formData.scorers.teamB.trim(),
        },
      });

      toast.success("Match created");

      navigate(
        `/matches/${createdMatch.matchId}/control`
      );

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.message ||
        "Failed to create match"
      );

    } finally {

      setLoading(false);
    }
  };

  const summary = `${formData.overs || 0} ${
    Number(formData.overs) === 1 ? "over" : "overs"
  } per side · max ${formData.maxOversPerBowler || 0} per bowler`;

  return (
    <div className="min-h-screen bg-black px-4 py-10 text-white sm:px-6">

      <div className="mx-auto max-w-2xl">

        {/* Back */}
        <Link
          to="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm text-zinc-400 transition hover:text-white"
        >
          <span aria-hidden="true">←</span> Dashboard
        </Link>

        <h1 className="text-3xl font-bold sm:text-4xl">
          Create match
        </h1>

        <p className="mb-8 mt-2 text-zinc-400">
          Pick the teams, set the format and assign a scorer for each side.
        </p>

        <form
          onSubmit={handleSubmit}
          className="space-y-6"
        >

          <Section
            title="Teams"
            description="The two teams playing. Use the team IDs from My Teams."
          >

            <Field
              label="Team A ID"
              id="teamA"
              name="teamA"
              value={formData.teamA}
              onChange={handleChange}
              placeholder="e.g. TEAM3AA90A49"
              required
            />

            <Field
              label="Team B ID"
              id="teamB"
              name="teamB"
              value={formData.teamB}
              onChange={handleChange}
              placeholder="e.g. TEAME19285DE"
              required
            />

          </Section>

          <Section
            title="Match details"
            description="Where and when it's played, and the format."
          >

            <Field
              className="sm:col-span-2"
              label="Venue"
              id="venue"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              placeholder="Ground or city"
              required
            />

            <Field
              className="sm:col-span-2"
              label="Start time"
              id="startTime"
              name="startTime"
              type="datetime-local"
              style={{ colorScheme: "dark" }}
              value={formData.startTime}
              onChange={handleChange}
              required
            />

            <Field
              label="Overs per side"
              id="overs"
              name="overs"
              type="number"
              min="1"
              max="50"
              value={formData.overs}
              onChange={handleChange}
              required
            />

            <Field
              label="Max overs per bowler"
              id="maxOversPerBowler"
              name="maxOversPerBowler"
              type="number"
              min="1"
              value={formData.maxOversPerBowler}
              onChange={handleChange}
              required
            />

          </Section>

          <Section
            title="Scorers"
            description="The user who will score the match for each team."
          >

            <Field
              label="Team A scorer ID"
              id="scorerTeamA"
              name="teamA"
              value={formData.scorers.teamA}
              onChange={handleScorerChange}
              placeholder="e.g. USR154441"
              required
            />

            <Field
              label="Team B scorer ID"
              id="scorerTeamB"
              name="teamB"
              value={formData.scorers.teamB}
              onChange={handleScorerChange}
              placeholder="e.g. USR838774"
              required
            />

          </Section>

          {/* Summary + actions */}
          <div className="space-y-4">

            <p className="text-center text-sm text-zinc-400">{summary}</p>

            <div className="flex flex-col-reverse gap-3 sm:flex-row">

              <Link
                to="/dashboard"
                className="rounded-lg border border-zinc-700 px-6 py-3 text-center font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white"
              >
                Cancel
              </Link>

              <button
                type="submit"
                disabled={loading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-500 py-3 font-semibold text-black transition hover:bg-green-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading && <Spinner />}
                {loading ? "Creating..." : "Create match"}
              </button>

            </div>

          </div>

        </form>

      </div>

    </div>
  );
}

export default CreateMatchPage;