import api from "../api/axios";

export const getAllMatches = async () => {
  const response = await api.get("/matches");
  return response.data;
};

export const getMatchDetails = async (matchId) => {
  const response = await api.get(`/matches/${matchId}/details`);
  return response.data;
};

export const createMatch = async (matchData) => {
  const response = await api.post("/matches", matchData);

  return response.data;
};

export const startMatch = async (matchId) => {

    const response = await api.post(
        `/matches/${matchId}/start`
    );

    return response.data;
};

export const setBatsmen = async (
  matchId,
  batsmenData
) => {

  const response = await api.post(
    `/matches/${matchId}/set-batsmen`,
    batsmenData
  );

  return response.data;
};

export const setBowler = async (
  matchId,
  bowlerData
) => {

  const response = await api.post(
    `/matches/${matchId}/set-bowler`,
    bowlerData
  );

  return response.data;
};
export const addBall = async (matchId, payload) => {

  const response = await api.post(
    `/matches/${matchId}/balls`,
    payload
  );

  return response.data;
};

export const endFirstInnings = async (matchId) => {
  const response = await api.post(`/matches/${matchId}/end-first-innings`);
  return response.data;
};
export const startSecondInnings = async (matchId) => {
  const { data } = await api.post(`/matches/${matchId}/start-second-innings`);
  return data;
};
export const endMatch = async (matchId, reason) => {
  const response = await api.post(
    `/matches/${matchId}/end`,
    null,
    {
      params: {
        reason,
      },
    }
  );

  return response.data;
};
export const getPlayingXI = async (matchId) => {

    const response = await api.get(
        `/matches/${matchId}/playing11`
    );

    return response.data;

};

export const createPlayingXI = async (matchId, data) => {

    console.log("========== MATCH SERVICE ==========");
    console.log("matchId =", matchId);
    console.log("payload =", data);

    const response = await api.post(
        `/matches/${matchId}/playing11`,
        data
    );

    return response.data;

};

export const updatePlayingXI = async (matchId, data) => {

    const response = await api.put(
        `/matches/${matchId}/playing11`,
        data
    );

    return response.data;

};

export const conductToss = async (
    matchId,
    tossWinner,
    tossDecision
) => {

    const response = await api.post(
        `/matches/${matchId}/toss`,
        null,
        {
            params: {
                tossWinner,
                tossDecision,
            },
        }
    );

    return response.data;

};
export const getMyLiveMatches = async () => {

    const response = await api.get("/matches/my-live-matches");

    return response.data;

};
export const undoBall = async (matchId) => {

    const response = await api.put(
        `/matches/${matchId}/undo-last-ball`
    );

    return response.data;
};