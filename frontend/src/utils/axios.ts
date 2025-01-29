import axios, { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_SERVER_URL || "http://localhost:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
