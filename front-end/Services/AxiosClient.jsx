import axios from "axios";
import React from "react";

const AxiosClient = axios.create({
  baseURL: `${import.meta.env.VITE_BASE_URL}`,
});

export default AxiosClient;
