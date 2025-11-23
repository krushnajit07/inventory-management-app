import axios from "axios";

const API = axios.create({
  baseURL: "https://inventory-management-app-uo9n.onrender.com/api",
});

export default API;
