import api from "../api/axios";

export const getTeamSquad = async (teamId) => {
  const response = await api.get(`/teams/${teamId}/squad`);
  return response.data;
};
export const createTeam = async (formData) => {

  const response = await api.post(
    "/teams",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    }
  );

  return response.data;
};

export const getMyTeams = async () => {
  const res = await api.get("/teams/my");
  return res.data;
};

export const addPlayer = async (teamId, playerId) => {
  const res = await api.post(
    `/teams/${teamId}/add-player`,
    null,
    {
      params: {
        playerId,
      },
    }
  );

  return res.data;
};
export const addMultiplePlayers = async (teamId, playerIds) => {
  const res = await api.post(
    `/teams/${teamId}/add-players`,
    playerIds
  );

  return res.data;
};
export const getTeamDetails = async (teamId) => {
  const res = await api.get(`/teams/${teamId}/details`);
  return res.data;
};
export const updateTeam = async (teamId, formData) => {

    const res = await api.put(
        `/teams/${teamId}`,
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return res.data;
};
export const removePlayer = async (teamId, playerId) => {

    const res = await api.post(
        `/teams/${teamId}/remove-player`,
        null,
        {
            params: {
                playerId
            }
        }
    );

    return res.data;

};