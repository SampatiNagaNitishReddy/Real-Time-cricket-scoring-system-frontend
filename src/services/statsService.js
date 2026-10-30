import axios from "../api/axios";

// Backend returns a plain top-20 list, so there is no page param.
const fetchStats = async (path) => {
  const response = await axios.get(`/stats/${path}`, { withCredentials: true });
  return response.data;
};

// 🏏 Batters
export const getTopRunScorers = () => fetchStats("batters/top-runs");
export const getHighestStrikeRate = () => fetchStats("batters/strike-rate");
export const getHighestAverage = () => fetchStats("batters/average");
export const getMostFours = () => fetchStats("batters/fours");
export const getMostSixes = () => fetchStats("batters/sixes");

// 🎯 Bowlers
export const getTopWicketTakers = () => fetchStats("bowlers/wickets");
export const getLowestEconomy = () => fetchStats("bowlers/economy");
export const getLowestBowlingStrikeRate = () => fetchStats("bowlers/strike-rate");
export const getLowestBowlingAverage = () => fetchStats("bowlers/average");