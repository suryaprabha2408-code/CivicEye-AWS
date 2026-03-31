import axios from 'axios';

// IMPORTANT: Keezha irukura URL-ku pathila unga BACKEND Replit URL-a podunga
// Example: 'https://Civic-Eye-Backend.suryaprabha1234.replit.co'
const API_URL = 'https://64fa2ee4-748d-4573-81c1-c6aaab31ca8f-00-1kpy0qg70a1mo.pike.replit.dev/'; 

const api = axios.create({
  baseURL: API_URL,
});

export default api;