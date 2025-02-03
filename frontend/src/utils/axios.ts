import axios, { AxiosInstance } from "axios";

const instance: AxiosInstance = axios.create({
  baseURL: process.env.SERVER_URL || "http://localhost:5500",
  headers: {
    "Content-Type": "application/json",
  },
});

export default instance;
