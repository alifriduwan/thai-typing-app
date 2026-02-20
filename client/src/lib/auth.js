const KEY = "access_token";

export const getToken = () => {
  return localStorage.getItem(KEY);
};

export const setToken = (token) => {
  localStorage.setItem(KEY, token);
  window.dispatchEvent(new Event("auth:changed"));
};

export const clearToken = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:changed"));
};
