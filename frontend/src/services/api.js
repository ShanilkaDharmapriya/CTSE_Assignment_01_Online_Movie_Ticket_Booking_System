// frontend/src/services/api.js

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3000" // API Gateway
});

export default API;