export const prettyName = (n = "") => n.replace(/_/g, " ");



// Total runs the ball added to the score.
// Assumes ball.runs does NOT already include extras.
export const ballTotal = (ball) => (ball.runs ?? 0);

const EXTRA_STYLE = "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40";

// Text and color for one ball circle
export const describeBall = (ball) => {
  if (ball.wicket) return { label: "W", style: "bg-red-500 text-white" };

  const tag =
    ball.extras?.wides > 0
      ? "Wd"
      : ball.extras?.noBalls > 0
      ? "Nb"
      : ball.extras?.byes > 0
      ? "B"
      : ball.extras?.legByes > 0
      ? "Lb"
      : null;

  if (tag) {
    const total = ballTotal(ball);
    return { label: total > 1 ? `${total}${tag}` : tag, style: EXTRA_STYLE };
  }

  if (ball.runs === 6) return { label: "6", style: "bg-green-500 text-black" };
  if (ball.runs === 4) return { label: "4", style: "bg-blue-500 text-white" };
  if (ball.runs === 0) return { label: "•", style: "bg-zinc-800 text-zinc-500" };

  return { label: String(ball.runs), style: "bg-zinc-700 text-white" };
};