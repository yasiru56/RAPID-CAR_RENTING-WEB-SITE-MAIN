import axios from "axios";

const API_BASE_URL = "http://localhost:5001/api";
const VEHICLES_API = `${API_BASE_URL}/vehicles`;

export const getMyVehicles = () => {
  const token = localStorage.getItem('token');
  return axios.get(VEHICLES_API, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const createVehicle = async (formData) => {
  const token = localStorage.getItem('token');
  
  // Debugging - log what we're sending
  console.log("Creating vehicle with data:");
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  return await axios.post(VEHICLES_API, formData, {
    headers: {
      // Don't set Content-Type for FormData
      "Authorization": `Bearer ${token}`
    },
  });
};

export const getVehicleById = (id) => {
  const token = localStorage.getItem('token');
  return axios.get(`${VEHICLES_API}/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

export const updateVehicle = (id, formData) => {
  const token = localStorage.getItem('token');
  
  // Debugging - log what we're sending
  console.log(`Updating vehicle ${id} with data:`);
  for (let [key, value] of formData.entries()) {
    console.log(`${key}: ${value}`);
  }
  
  return axios.put(`${VEHICLES_API}/${id}`, formData, {
    headers: {
      // Don't set Content-Type for FormData
      "Authorization": `Bearer ${token}`
    },
  });
};

export const deleteVehicle = (id) => {
  const token = localStorage.getItem('token');
  return axios.delete(`${VEHICLES_API}/${id}`, {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  });
};

