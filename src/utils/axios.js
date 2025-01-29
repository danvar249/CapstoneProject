import axios from 'axios';

const API_BASE_URL = process.env.SERVER_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: process.env.TIMEOUT,
    headers: { 'Content-Type': 'application/json' }
});

export default axiosInstance;