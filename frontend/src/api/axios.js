import axios from 'axios';
import auth from '../firebase/auth';

const api = axios.create({
  baseURL: `http://${window.location.hostname}:5000/api`,
});

api.interceptors.request.use(
  async (config) => {
    // If Authorization is already set (e.g. manually in routeByRole), don't overwrite it
    if (config.headers.Authorization) return config;

    const currentUser = auth.currentUser;
    if (currentUser) {
      const token = await currentUser.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      const customToken = localStorage.getItem('token');
      if (customToken) {
        config.headers.Authorization = `Bearer ${customToken}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
