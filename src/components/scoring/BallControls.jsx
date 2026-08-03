import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "../matchControl/PlayerSelectionCard";

import {
  addBall, undoBall
} from "../../services/matchService";

import {
  getTeamSquad
} from "../../services/teamService";

// --------------------------------------------------
// Dismissal Types
// --------------------------------------------------

const DISMISSAL_TYPES = [
  {
    value: "bowled",
    label: "Bowled",
    needsFielder: false
  },
  {
    value: "caught",
    label: "Caught",
    needsFielder: true
  },
  {
    value: "lbw",
    label: "LBW",
    needsFielder: false
  },
  {
    value: "runOut",
    label: "Run Out",
    needsFielder: true
  },
  {
    value: "stumped",
    label: "Stumped",
    needsFielder: true
  },
  {
    value: "hitWicket",
    label: "Hit Wicket",
    needsFielder: false
  }
];

const WIDE_DISMISSALS = DISMISSAL_TYPES.filter(d =>
  ["runOut", "stumped"].includes(d.value)
);

const NO_BALL_DISMISSALS = DISMISSAL_TYPES.filter(d =>
  d.value === "runOut"
);

const ZERO_RUN_DISMISSALS = [
  "bowled",
  "lbw",
  "hitWicket"
];

const DELIVERY_TYPES = [
  {
    value: "normal",
    label: "Normal"
  },
  {
    value: "wide",
    label: "Wide"
  },
  {
    value: "noBall",
    label: "No Ball"
  },
  {
    value: "bye",
    label: "Bye"
  },
  {
    value: "legBye",
    label: "Leg Bye"
  }
];

const RUN_OPTIONS = [
  0,
  1,
  2,
  3,
  4,
  6
];


// --------------------------------------------------
// Helpers
// --------------------------------------------------

function SectionTitle({ children }) {

  return (

    <h3 className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-3">

      {children}

    </h3>

  );

}

function DeliveryButton({
  active,
  label,
  onClick
}) {

  return (

    <button
      onClick={onClick}
      className={`
                px-4
                py-2
                rounded-lg
                font-medium
                transition

                ${active
          ? "bg-blue-600 text-white"
          : "bg-zinc-800 hover:bg-zinc-700"
        }
            `}
    >

      {label}

    </button>

  );

}
function BallControls({
  match,
  refreshMatch
}) {

  //Handlers
  const handleUndoBall = async () => {

    try {

      setUndoLoading(true);

      await undoBall(match.matchId);

      toast.success("Last ball undone");

      refreshMatch();

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Failed to undo ball"
      );

    } finally {

      setUndoLoading(false);

    }

  };

  // --------------------------------------------------
  // State
  // --------------------------------------------------

  const [loading, setLoading] = useState(false);

  const [deliveryType, setDeliveryType] = useState(null);

  const [runs, setRuns] = useState(null);

  const [showWicketForm, setShowWicketForm] = useState(false);

  const [dismissalType, setDismissalType] = useState("");

  const [selectedFielder, setSelectedFielder] = useState(null);

  const [selectedOutBatsman, setSelectedOutBatsman] = useState(null);

  const [undoLoading, setUndoLoading] = useState(false);

  const [bowlingSquad, setBowlingSquad] = useState([]);
  useEffect(() => {

    const loadSquad = async () => {

      if (!match?.currentBowlingTeam) return;

      try {

        const squad = await getTeamSquad(
          match.currentBowlingTeam
        );

        setBowlingSquad(squad);

      } catch (err) {

        console.error(err);

      }

    };

    loadSquad();

  }, [match]);

  // --------------------------------------------------
  // Reset Draft
  // --------------------------------------------------

  const resetDraft = () => {

    setDeliveryType(null);

    setRuns(null);

    setShowWicketForm(false);

    setDismissalType("");

    setSelectedFielder(null);

    setSelectedOutBatsman(null);

  };
  // --------------------------------------------------
  // Current Innings
  // --------------------------------------------------

  const innings =
    match?.currentInnings === 2
      ? match?.secondInnings
      : match?.firstInnings;

  if (!innings) {

    return null;

  }



  // --------------------------------------------------
  // Current Players
  // --------------------------------------------------

  const striker = innings?.batting?.find(

    player => player.batsmanId === innings?.strikerId

  );

  const nonStriker = innings?.batting?.find(

    player => player.batsmanId === innings?.nonStrikerId

  );
  const currentBowler = innings?.bowling?.find(

    player => player.bowlerId === innings?.currentBowlerId

  );

  // --------------------------------------------------
  // Free Hit
  // --------------------------------------------------

  const isFreeHit =
    innings?.nextBallIsFreeHit === true;

  // --------------------------------------------------
  // Available Dismissals
  // --------------------------------------------------

  const availableDismissals = useMemo(() => {

    if (deliveryType === "wide") {

      return WIDE_DISMISSALS;

    }

    if (deliveryType === "noBall") {

      return NO_BALL_DISMISSALS;

    }

    return DISMISSAL_TYPES;

  }, [deliveryType]);

  // --------------------------------------------------
  // Selected Dismissal
  // --------------------------------------------------

  const dismissal = availableDismissals.find(

    d => d.value === dismissalType

  );

  const needsFielder =
    dismissal?.needsFielder || false;

  const isRunOut =
    dismissalType === "runOut";

  const zeroRunDismissal =
    ZERO_RUN_DISMISSALS.includes(dismissalType);

  // --------------------------------------------------
  // Validation
  // --------------------------------------------------

  const missingBatsman =
    !innings?.strikerId ||
    !innings?.nonStrikerId;

  const missingBowler =
    !innings?.currentBowlerId;

  const canConfirmWicket =
    dismissalType &&
    (!needsFielder || selectedFielder) &&
    (!isRunOut || selectedOutBatsman);

  const isReady =
    deliveryType !== null &&
    runs !== null &&
    !missingBatsman &&
    !missingBowler &&
    (
      !showWicketForm ||
      canConfirmWicket
    );
  const handleSubmit = async () => {

    if (!isReady || loading) return;

    try {

      setLoading(true);

      const payload = {
        runs,
        wide: deliveryType === "wide",
        noBall: deliveryType === "noBall",
        bye: deliveryType === "bye",
        legBye: deliveryType === "legBye"
      };

      if (dismissalType) {

        payload.wicket = {
          out: true,
          dismissalType,
          fielderId: selectedFielder?.userId || undefined,
          outBatsmanId: selectedOutBatsman?.batsmanId || undefined,
        };

      }

      await addBall(match.matchId, payload);

      toast.success("Ball added successfully.");

      resetDraft();

      await refreshMatch();

    } catch (err) {

      console.error(err);

      toast.error(
        err.response?.data?.error ||
        "Failed to add ball."
      );

    } finally {

      setLoading(false);

    }

  };


  return (

    <div className="bg-zinc-900 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">

        <h2 className="text-xl font-bold mb-6">

          Ball Controls

        </h2>
        <button
          onClick={handleUndoBall}
          disabled={loading}
          className="
        px-4 py-2
        rounded-lg
        bg-red-600
        hover:bg-red-700
        transition
        disabled:opacity-50
      "
        >
          ↶ Undo Last Ball
        </button>
      </div>
      {/* -------------------------------------------------- */}
      {/* Free Hit Banner */}
      {/* -------------------------------------------------- */}

      {
        isFreeHit && (

          <div className="mb-6 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-4 py-3">

            <p className="font-semibold text-yellow-400">

              🔥 FREE HIT

            </p>

            <p className="text-sm text-yellow-300 mt-1">

              Only Run Out can dismiss the batter.

            </p>

          </div>

        )
      }

      {/* -------------------------------------------------- */}
      {/* Delivery Type */}
      {/* -------------------------------------------------- */}

      <div className="mb-8">

        <SectionTitle>

          Delivery Type

        </SectionTitle>

        <div className="flex flex-wrap gap-3">

          {
            DELIVERY_TYPES.map((delivery) => (

              <DeliveryButton
                key={delivery.value}
                label={delivery.label}
                active={deliveryType === delivery.value}
                onClick={() => {

                  setDeliveryType(delivery.value);

                  setRuns(
                    delivery.value === "wide" ||
                      delivery.value === "noBall"
                      ? 0
                      : null
                  );

                  setShowWicketForm(false);

                  setDismissalType("");

                  setSelectedFielder(null);

                  setSelectedOutBatsman(null);

                }}
              />

            ))
          }

        </div>
        {/* -------------------------------------------------- */}
        {/* Runs */}
        {/* -------------------------------------------------- */}

        {
          deliveryType && (

            <div className="mb-8">

              <SectionTitle>

                {
                  deliveryType === "wide"
                    ? "Wide Runs"
                    : deliveryType === "noBall"
                      ? "Runs Off No Ball"
                      : deliveryType === "bye"
                        ? "Bye Runs"
                        : deliveryType === "legBye"
                          ? "Leg Bye Runs"
                          : "Runs"
                }

              </SectionTitle>

              {
                zeroRunDismissal && (

                  <div className="mb-3 rounded-lg bg-zinc-800 px-3 py-2 text-sm text-yellow-400">

                    Runs are locked to <strong>0</strong> for this dismissal.

                  </div>

                )
              }

              <div className="grid grid-cols-6 gap-3">

                {
                  RUN_OPTIONS.map((value) => (

                    <button
                      key={value}
                      disabled={zeroRunDismissal}
                      onClick={() => setRuns(value)}
                      className={`
                                            h-12
                                            rounded-xl
                                            font-bold
                                            transition

                                            ${runs === value
                          ? "bg-blue-600 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700"
                        }

                                            ${zeroRunDismissal
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                        }
                                        `}
                    >

                      {value}

                    </button>

                  ))
                }

              </div>

            </div>

          )
        }
        {/* -------------------------------------------------- */}
        {/* Wicket */}
        {/* -------------------------------------------------- */}

        {
          deliveryType &&
          runs !== null && (

            <div className="mb-8">

              <SectionTitle>

                Wicket

              </SectionTitle>

              {
                dismissalType ? (

                  <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 flex items-center justify-between">

                    <div>

                      <p className="text-red-400 font-semibold">

                        Wicket Added

                      </p>

                      <p className="text-sm text-zinc-300 mt-1">

                        {
                          availableDismissals.find(
                            d => d.value === dismissalType
                          )?.label
                        }

                      </p>

                    </div>

                    <button
                      onClick={() => {

                        setDismissalType("");

                        setSelectedFielder(null);

                        setSelectedOutBatsman(null);

                        setShowWicketForm(false);

                      }}
                      className="text-sm text-red-400 hover:text-red-300"
                    >

                      Remove

                    </button>

                  </div>

                ) : (

                  <button
                    onClick={() => setShowWicketForm(true)}
                    className="
                                        w-full
                                        py-3
                                        rounded-xl
                                        border
                                        border-dashed
                                        border-zinc-700
                                        hover:border-red-500
                                        hover:text-red-400
                                        transition
                                    "
                  >

                    + Add Wicket (Optional)

                  </button>

                )

              }

            </div>

          )
        }
        {/* -------------------------------------------------- */}
        {/* Dismissal Type */}
        {/* -------------------------------------------------- */}

        {
          showWicketForm && (

            <div className="mb-8">

              <SectionTitle>

                Dismissal Type

              </SectionTitle>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

                {
                  availableDismissals.map((dismissal) => (

                    <button
                      key={dismissal.value}
                      onClick={() => {

                        setDismissalType(
                          dismissal.value
                        );

                        setSelectedFielder(null);

                        setSelectedOutBatsman(null);

                        if (
                          ZERO_RUN_DISMISSALS.includes(
                            dismissal.value
                          )
                        ) {

                          setRuns(0);

                        }

                      }}
                      className={`
                                            rounded-xl
                                            p-3
                                            font-medium
                                            transition

                                            ${dismissalType === dismissal.value
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700"
                        }
                                        `}
                    >

                      {dismissal.label}

                    </button>

                  ))
                }

              </div>

              {
                needsFielder && (

                  <>
                    <SectionTitle>

                      Select Fielder

                    </SectionTitle>

                    <div className="space-y-3">

                      {
                        bowlingSquad.map(player => (

                          <PlayerSelectionCard
                            key={player.userId}
                            player={player}
                            selected={
                              selectedFielder?.userId === player.userId
                            }
                            onClick={setSelectedFielder}
                          />

                        ))
                      }

                    </div>

                  </>

                )
              }
              {
                isRunOut && (

                  <>
                    <SectionTitle>
                      Who got out?
                    </SectionTitle>

                    <div className="space-y-3">

                      <PlayerSelectionCard
                        player={{
                          userId: striker?.batsmanId,
                          name: striker?.batsmanName,
                          role: "BATTER",
                          profileImage: null,
                          captain: false,
                          viceCaptain: false
                        }}
                        subtitle={`${striker?.runs} (${striker?.balls})`}
                        selected={
                          selectedOutBatsman?.batsmanId === striker?.batsmanId
                        }
                        onClick={() => setSelectedOutBatsman(striker)}
                      />

                      <PlayerSelectionCard
                        player={{
                          userId: nonStriker?.batsmanId,
                          name: nonStriker?.batsmanName,
                          role: "BATTER",
                          profileImage: null,
                          captain: false,
                          viceCaptain: false
                        }}
                        subtitle={`${nonStriker?.runs} (${nonStriker?.balls})`}
                        selected={
                          selectedOutBatsman?.batsmanId === nonStriker?.batsmanId
                        }
                        onClick={() => setSelectedOutBatsman(nonStriker)}
                      />

                    </div>

                  </>

                )
              }
            </div>

          )
        }

      </div>
      {
        isReady && (

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="
                w-full
                h-14
                rounded-xl
                bg-green-600
                hover:bg-green-700
                font-bold
                transition
                disabled:opacity-50
            "
          >

            {
              loading
                ? "Recording..."
                : "Record Ball"
            }

          </button>

        )
      }

    </div>

  );

}

export default BallControls;