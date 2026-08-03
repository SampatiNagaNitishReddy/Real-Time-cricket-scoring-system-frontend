import { commentaryTemplates } from "./commentaryTemplates";

const recentlyUsed = {};

function getRandomLine(type, overNumber) {
  const lines = commentaryTemplates[type];

  if (!lines || lines.length === 0) {
    return "Interesting delivery.";
  }

  // Initialize over history
  if (!recentlyUsed[overNumber]) {
    recentlyUsed[overNumber] = [];
  }

  // Filter already used in same over
  const available = lines.filter(
    line => !recentlyUsed[overNumber].includes(line)
  );

  // If all used, reset for this over
  const finalPool = available.length > 0 ? available : lines;

  const randomLine =
    finalPool[Math.floor(Math.random() * finalPool.length)];

  // Store recently used
  recentlyUsed[overNumber].push(randomLine);

  // Prevent memory growing
  if (recentlyUsed[overNumber].length > 5) {
    recentlyUsed[overNumber].shift();
  }

  return randomLine;
}

export function generateCommentary(ball, overNumber) {
  // Wicket
  if (ball.wicket) {
    return getRandomLine("wicket", overNumber);
  }

  // Wide
  if (ball.extras?.wides > 0) {
    return getRandomLine("wide", overNumber);
  }

  // No Ball
  if (ball.extras?.noBalls > 0) {
    return getRandomLine("noBall", overNumber);
  }

  // Runs
  return getRandomLine(ball.runs, overNumber);
}