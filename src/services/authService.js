import api from "../api/axios";

export const loginUser = async (loginData) => {
  const response = await api.post("/auth/login", loginData);

  return response.data;
};

export const logoutUser = async () => {

  const response = await api.post("/auth/logout");

  return response.data;
};

export const getCurrentUser = async () => {

  const response = await api.get("/user/me");

  return response.data;
};
export const registerUser = async (formData) => {

    const response = await api.post(
        "/user/register",
        formData,
        {
            headers: {
                "Content-Type": "multipart/form-data"
            }
        }
    );

    return response.data;

};