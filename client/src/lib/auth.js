const KEY = "access_token";

export const getToken = () => localStorage.getItem(KEY);

export const setToken = (t) => {
  localStorage.setItem(KEY, t);
  window.dispatchEvent(new Event("auth:changed"));
};

export const clearToken = () => {
  localStorage.removeItem(KEY);
  localStorage.removeItem("username");
  window.dispatchEvent(new Event("auth:changed"));
};
