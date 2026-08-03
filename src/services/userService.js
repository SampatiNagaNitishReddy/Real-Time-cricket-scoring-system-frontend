import axios from "../api/axios";

export const searchPlayers = async (keyword) => {

  const response = await axios.get("/user/search", {
    params: {
      keyword,
    },
    withCredentials: true,
  });

  return response.data;
};