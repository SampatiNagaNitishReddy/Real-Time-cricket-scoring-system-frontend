import { commentaryTemplates } from "./commentaryTemplates";

const FALLBACK = "Interesting delivery.";

// Which template pool a ball belongs to
export function getCommentaryType(ball) {
  if (ball.wicket) {
    const key =
      "wicket_" + (ball.dismissalType ?? "").toLowerCase().replace(/[^a-z]/g, "");
    return commentaryTemplates[key] ? key : "wicket";
  }

  if (ball.extras?.wides > 0) return "wide";
  if (ball.extras?.noBalls > 0) return "noBall";
  if (ball.extras?.byes > 0) return "bye";
  if (ball.extras?.legByes > 0) return "legBye";

  return ball.runs;
}

// Deterministic: the same ball always gets the same line, so the text doesn't
// change when the page refreshes. `occurrence` is how many balls of this same
// type already happened earlier in the over, so repeats get different lines.
export function generateCommentary(ball, overNumber, occurrence = 0) {
  const lines = commentaryTemplates[getCommentaryType(ball)];

  if (!lines || lines.length === 0) return FALLBACK;

  return lines[(overNumber + occurrence) % lines.length];
}