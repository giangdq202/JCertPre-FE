import axios from "axios";

const api = axios.create({
  //   baseURL: "https://api.jcertpre.com/",
  withCredentials: true,
});

export default api;
