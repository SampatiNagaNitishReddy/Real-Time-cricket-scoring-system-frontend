import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";

import PlayerSelectionCard from "../matchControl/PlayerSelectionCard";
import { Spinner } from "../auth/fields";

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

const prettyName = (n = "") => n.replace(/_/g, " ");

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-500";

function SectionTitle({ children, hint }) {

  return (

    <h3 className="mb-3 flex items-baseline gap-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">

      {children}

      {hint && (
        <span className="font-normal normal-case tracking-normal text-zinc-600">
          {hint}
        </span>
      )}

    </h3>

  );

}

function DeliveryButton({
  active,
  label,
  onClick,
  extra = false,
  disabled = false
}) {

  const activeStyle = extra
    ? "bg-amber-500 text-black"
    : "bg-green-500 text-black";

  return (

    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`
        touch-manipulation rounded-xl px-3 py-3 font-semibold transition
        disabled:cursor-not-allowed disabled:opacity-50
        ${focusRing}
        ${active
          ? activeStyle
          : "bg-zinc-800 text-white hover:bg-zinc-700"
        }
      `}
    >

      {label}

    </button>

  );

}

function PlayerChip({ label, name, detail, active = false }) {

  return (

    <div className="rounded-xl bg-zinc-800 px-4 py-3">

      <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-zinc-500">

        {active && (
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
        )}

        {label}

      </p>

      <p className="truncate font-semibold text-white">
        {name ? prettyName(name) : "—"}
      </p>

      <p className="text-sm text-zinc-400">
        {detail}
      </p>

    </div>

  );

}

function ConfirmModal({
  title,
  children,
  confirmLabel,
  busyLabel,
  busy,
  onConfirm,
  onClose
}) {

  useEffect(() => {

    const onKey = (e) => {
      if (e.key === "Escape" && !busy) onClose();
    };

    document.addEventListener("keydown", onKey);

    return () => document.removeEventListener("keydown", onKey);

  }, [onClose, busy]);

  return (

    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-md rounded-2xl border border-zinc-700 bg-zinc-900 p-6 shadow-2xl"
      >

        <h2 className="text-xl font-bold text-white">
          {title}
        </h2>

        <div className="mt-3 text-zinc-300">
          {children}
        </div>

        <div className="mt-6 flex gap-3">

          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className={`flex-1 rounded-lg border border-zinc-700 py-3 font-medium text-zinc-300 transition hover:border-zinc-500 hover:text-white disabled:opacity-50 ${focusRing}`}
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={busy}
            className={`flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-600 py-3 font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60 ${focusRing}`}
          >
            {busy && <Spinner />}
            {busy ? busyLabel : confirmLabel}
          </button>

        </div>

      </div>

    </div>

  );

}

function BallControls({
  match,
  refreshMatch
}) {

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

  const [showUndoConfirm, setShowUndoConfirm] = useState(false);

  const [bowlingSquad, setBowlingSquad] = useState([]);

  const [squadStatus, setSquadStatus] = useState("loading");

  const [squadAttempt, setSquadAttempt] = useState(0);

  // Anything in flight locks every control, so a double-tap can't
  // record a ball (or undo one) twice.
  const busy = loading || undoLoading;

  // --------------------------------------------------
  // Bowling squad (fielders)
  // --------------------------------------------------

  const bowlingTeamId = match?.currentBowlingTeam;

  useEffect(() => {

    if (!bowlingTeamId) return;

    let ignore = false;

    setSquadStatus("loading");

    getTeamSquad(bowlingTeamId)

      .then((squad) => {

        if (ignore) return;

        setBowlingSquad(squad ?? []);
        setSquadStatus("ready");

      })

      .catch((err) => {

        console.error(err);

        if (!ignore) setSquadStatus("error");

      });

    return () => {
      ignore = true;
    };

  }, [bowlingTeamId, squadAttempt]);

  // --------------------------------------------------
  // Available Dismissals
  // (this hook must stay above the early return below)
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

  // Steps unlock one after the other (the layout itself never moves)
  const runsUnlocked = deliveryType !== null;
  const wicketUnlocked = deliveryType !== null && runs !== null;

  // --------------------------------------------------
  // What the scorer sees above the Record button
  // --------------------------------------------------

  const deliveryLabel = DELIVERY_TYPES.find(
    d => d.value === deliveryType
  )?.label;

  const hint =
    missingBatsman ? "Set the batsmen first."
      : missingBowler ? "Set the bowler first."
        : !deliveryType ? "Choose the delivery type."
          : runs === null ? "Choose the runs."
            : showWicketForm && !dismissalType ? "Choose the dismissal type."
              : showWicketForm && needsFielder && !selectedFielder ? "Select the fielder."
                : showWicketForm && isRunOut && !selectedOutBatsman ? "Select who got out."
                  : null;

  const summary = [
    deliveryLabel,
    runs !== null ? `${runs} ${runs === 1 ? "run" : "runs"}` : null,
    dismissal ? `Wicket (${dismissal.label})` : null
  ].filter(Boolean).join(" · ");

  // --------------------------------------------------
  // Handlers
  // --------------------------------------------------

  const handleUndoBall = async () => {

    if (busy) return;

    try {

      setUndoLoading(true);

      await undoBall(match.matchId);

      toast.success("Last ball undone");

      await refreshMatch();

    } catch (err) {

      toast.error(
        err.response?.data?.error ||
        "Failed to undo ball"
      );

    } finally {

      setUndoLoading(false);

      setShowUndoConfirm(false);

    }

  };

  const handleSubmit = async () => {

    if (!isReady || busy) return;

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

    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">

      {/* -------------------------------------------------- */}
      {/* Header */}
      {/* -------------------------------------------------- */}

      <div className="mb-5 flex items-center justify-between gap-3">

        <h2 className="text-xl font-bold text-white">

          Ball Controls

        </h2>

        <button
          type="button"
          onClick={() => setShowUndoConfirm(true)}
          disabled={busy}
          className={`
            touch-manipulation rounded-lg border border-red-500/40 px-4 py-2
            text-sm font-medium text-red-400 transition
            hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50
            ${focusRing}
          `}
        >
          ↶ Undo Last Ball
        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* Who this ball is for */}
      {/* -------------------------------------------------- */}

      <div className="mb-6 grid gap-2 sm:grid-cols-3">

        <PlayerChip
          active
          label="On strike"
          name={striker?.batsmanName}
          detail={striker ? `${striker.runs} (${striker.balls})` : ""}
        />

        <PlayerChip
          label="Non-striker"
          name={nonStriker?.batsmanName}
          detail={nonStriker ? `${nonStriker.runs} (${nonStriker.balls})` : ""}
        />

        <PlayerChip
          label="Bowler"
          name={currentBowler?.bowlerName}
          detail={
            currentBowler
              ? `${currentBowler.overs} ov · ${currentBowler.runs}/${currentBowler.wickets}`
              : ""
          }
        />

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

            <p className="mt-1 text-sm text-yellow-300">

              Only Run Out can dismiss the batter.

            </p>

          </div>

        )
      }

      {/* -------------------------------------------------- */}
      {/* 1. Delivery Type */}
      {/* -------------------------------------------------- */}

      <section className="mb-7">

        <SectionTitle>

          Delivery Type

        </SectionTitle>

        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">

          {
            DELIVERY_TYPES.map((delivery) => (

              <DeliveryButton
                key={delivery.value}
                label={delivery.label}
                extra={delivery.value !== "normal"}
                disabled={busy}
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

      </section>

      {/* -------------------------------------------------- */}
      {/* 2. Runs */}
      {/* -------------------------------------------------- */}

      <section
        aria-disabled={!runsUnlocked}
        className={`mb-7 transition ${runsUnlocked ? "" : "opacity-40"}`}
      >

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

        <div className="grid grid-cols-6 gap-2">

          {
            RUN_OPTIONS.map((value) => (

              <button
                key={value}
                type="button"
                disabled={!runsUnlocked || zeroRunDismissal || busy}
                onClick={() => setRuns(value)}
                className={`
                  h-14 touch-manipulation rounded-xl text-xl font-bold transition
                  disabled:cursor-not-allowed
                  ${focusRing}

                  ${runs === value
                    ? "bg-green-500 text-black"
                    : `bg-zinc-800 hover:bg-zinc-700 ${value === 4
                      ? "text-blue-400"
                      : value === 6
                        ? "text-green-400"
                        : "text-white"
                    }`
                  }

                  ${zeroRunDismissal && runs !== value ? "opacity-50" : ""}
                `}
              >

                {value}

              </button>

            ))
          }

        </div>

      </section>

      {/* -------------------------------------------------- */}
      {/* 3. Wicket */}
      {/* -------------------------------------------------- */}

      <section
        aria-disabled={!wicketUnlocked}
        className={`transition ${wicketUnlocked ? "" : "opacity-40"}`}
      >

        <SectionTitle hint="optional">

          Wicket

        </SectionTitle>

        {
          dismissalType ? (

            <div className="flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4">

              <div>

                <p className="font-semibold text-red-400">

                  Wicket Added

                </p>

                <p className="mt-1 text-sm text-zinc-300">

                  {
                    availableDismissals.find(
                      d => d.value === dismissalType
                    )?.label
                  }

                </p>

              </div>

              <button
                type="button"
                disabled={busy}
                onClick={() => {

                  setDismissalType("");

                  setSelectedFielder(null);

                  setSelectedOutBatsman(null);

                  setShowWicketForm(false);

                }}
                className={`touch-manipulation rounded-lg px-3 py-2 text-sm text-red-400 hover:text-red-300 disabled:opacity-50 ${focusRing}`}
              >

                Remove

              </button>

            </div>

          ) : !showWicketForm ? (

            <button
              type="button"
              disabled={!wicketUnlocked || busy}
              onClick={() => setShowWicketForm(true)}
              className={`
                w-full touch-manipulation rounded-xl border border-dashed
                border-zinc-700 py-3 transition
                hover:border-red-500 hover:text-red-400
                disabled:cursor-not-allowed
                ${focusRing}
              `}
            >

              + Add Wicket (Optional)

            </button>

          ) : null

        }

        {/* ------------------------------------------------ */}
        {/* Dismissal Type */}
        {/* ------------------------------------------------ */}

        {
          showWicketForm && (

            <div className="mt-4 rounded-xl border border-red-500/20 bg-zinc-950/40 p-4">

              <div className="mb-3 flex items-center justify-between">

                <SectionTitle>

                  Dismissal Type

                </SectionTitle>

                {!dismissalType && (

                  <button
                    type="button"
                    onClick={() => setShowWicketForm(false)}
                    className={`-mt-3 rounded px-2 py-1 text-sm text-zinc-400 hover:text-white ${focusRing}`}
                  >

                    Cancel

                  </button>

                )}

              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-3">

                {
                  availableDismissals.map((d) => (

                    <button
                      key={d.value}
                      type="button"
                      disabled={busy}
                      onClick={() => {

                        setDismissalType(
                          d.value
                        );

                        setSelectedFielder(null);

                        setSelectedOutBatsman(null);

                        if (
                          ZERO_RUN_DISMISSALS.includes(
                            d.value
                          )
                        ) {

                          setRuns(0);

                        }

                      }}
                      className={`
                        touch-manipulation rounded-xl p-3 font-medium transition
                        disabled:cursor-not-allowed
                        ${focusRing}

                        ${dismissalType === d.value
                          ? "bg-red-600 text-white"
                          : "bg-zinc-800 hover:bg-zinc-700"
                        }
                      `}
                    >

                      {d.label}

                    </button>

                  ))
                }

              </div>

              {
                needsFielder && (

                  <div className="mt-6">

                    <SectionTitle>

                      Select Fielder

                    </SectionTitle>

                    {squadStatus === "loading" && (
                      <p className="text-sm text-zinc-400">
                        Loading fielders…
                      </p>
                    )}

                    {squadStatus === "error" && (
                      <p className="text-sm text-red-400">
                        Couldn't load the fielders.{" "}
                        <button
                          type="button"
                          onClick={() => setSquadAttempt((n) => n + 1)}
                          className="font-medium underline"
                        >
                          Try again
                        </button>
                      </p>
                    )}

                    {squadStatus === "ready" && bowlingSquad.length === 0 && (
                      <p className="text-sm text-zinc-400">
                        No players found in the fielding team.
                      </p>
                    )}

                    <div className="grid gap-2 sm:grid-cols-2">

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

                  </div>

                )
              }

              {
                isRunOut && (

                  <div className="mt-6">

                    <SectionTitle>
                      Who got out?
                    </SectionTitle>

                    <div className="grid gap-2 sm:grid-cols-2">

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

                  </div>

                )
              }

            </div>

          )
        }

      </section>

      {/* -------------------------------------------------- */}
      {/* Record bar (stays in view while scrolling) */}
      {/* -------------------------------------------------- */}

      <div className="sticky bottom-0 -mx-5 -mb-5 mt-7 rounded-b-2xl border-t border-zinc-800 bg-zinc-900/95 px-5 py-4 backdrop-blur sm:-mx-6 sm:-mb-6 sm:px-6">

        <p
          aria-live="polite"
          className={`mb-3 min-h-5 text-center text-sm ${hint ? "text-zinc-500" : "font-medium text-white"}`}
        >

          {hint ?? summary}

        </p>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isReady || busy}
          className={`
            flex h-14 w-full touch-manipulation items-center justify-center gap-2
            rounded-xl bg-green-500 text-lg font-bold text-black transition
            hover:bg-green-400
            disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-500
            ${focusRing}
          `}
        >

          {loading && <Spinner />}

          {
            loading
              ? "Recording..."
              : "Record Ball"
          }

        </button>

      </div>

      {/* -------------------------------------------------- */}
      {/* Undo confirmation */}
      {/* -------------------------------------------------- */}

      {
        showUndoConfirm && (

          <ConfirmModal
            title="Undo the last ball?"
            confirmLabel="Undo ball"
            busyLabel="Undoing..."
            busy={undoLoading}
            onConfirm={handleUndoBall}
            onClose={() => setShowUndoConfirm(false)}
          >

            <p>
              This removes the most recently recorded ball. Live scores
              update for everyone watching.
            </p>

          </ConfirmModal>

        )
      }

    </div>

  );

}

export default BallControls;