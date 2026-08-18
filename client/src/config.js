const getApiBaseUrl = () => {
  // Production pe REACT_APP_API_URL use hoga
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  
  const hostname = window.location.hostname;
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return 'http://localhost:5001/api';
  }
  
  // Same domain pe deploy hone par
  return `https://${hostname}/api`;
};

const config = {
  API_BASE_URL: getApiBaseUrl()
};

export default config;
