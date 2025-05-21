import axios from 'axios';

// Use environment variable if available, otherwise fallback to default backend URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://cypherscanner-api.vercel.app/api/';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_BASE_URL
});

// Set auth token for any request if it exists in localStorage
const token = localStorage.getItem('auth_token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Request interceptor for API calls
api.interceptors.request.use(
  config => {
    // Get updated token before each request
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

// Response interceptor for API calls
api.interceptors.response.use(
  response => response,
  error => {
    // Handle unauthorized errors
    if (error.response && error.response.status === 401) {
      // Clear token if it's invalid or expired
      localStorage.removeItem('auth_token');
    }
    return Promise.reject(error);
  }
);

// Fetch all passes
export const fetchPasses = async () => {
  try {
    console.log('Fetching passes from:', API_BASE_URL);
    const response = await api.get('/passes');
    return response;
  } catch (error) {
    throw error;
  }
};

// Fetch pass by ID
export const fetchPassById = async (id) => {
  try {
    const response = await api.get(`/passes/${id}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Create a new pass
export const createPass = async (passData) => {
  try {
    const response = await api.post('/passes', passData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update a pass
export const updatePass = async (idOrData, updateData) => {
  try {
    // Handle both usage patterns:
    // 1. updatePass({ id: '123', events: [...], isSold: true })
    // 2. updatePass('123', { events: [...], isSold: true })
    
    let requestData;
    
    if (typeof idOrData === 'object' && idOrData !== null) {
      // Pattern 1: Single object with id and data
      requestData = idOrData;
    } else {
      // Pattern 2: Separate id and data
      requestData = {
        id: idOrData,
        ...updateData
      };
    }
    
    const response = await api.patch(`/passes/`, requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Update an event
export const updateEvent = async (idOrData, updateData) => {
  try {
    // Handle both usage patterns:
    // 1. updateEvent({ id: '123', events: [...] })
    // 2. updateEvent('123', { events: [...] })
    
    let requestData;
    
    if (typeof idOrData === 'object' && idOrData !== null) {
      // Pattern 1: Single object with id and data
      requestData = idOrData;
    } else {
      // Pattern 2: Separate id and data
      requestData = {
        id: idOrData,
        ...updateData
      };
    }
    
    const response = await api.patch(`/passes/event/`, requestData);
    return response;
  } catch (error) {
    throw error;
  }
};

// Fetch pass by barcode
export const fetchPassByBarcode = async (barcode) => {
  try {
    const response = await api.get(`/passes/barcode/${barcode}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Scan a pass
export const scanPass = async (barcode) => {
  try {
    const response = await api.post(`/passes/scan/${barcode}`);
    return response;
  } catch (error) {
    throw error;
  }
};

// Delete a pass
export const deletePass = async (passId) => {
  try {
    const response = await api.delete(`/passes/${passId}`);
    return response;
  } catch (error) {
    throw error;
  }
};

export default api; 