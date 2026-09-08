import axios from "axios";

// Helper to resolve the correct backend API endpoint
const getInitialBaseURL = () => {
  // 1. Manual user override if set
  if (typeof localStorage !== "undefined") {
    const custom = localStorage.getItem("custom_backend_url");
    if (custom) return custom;
  }

  // 2. Vite environment variable if provided
  if (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  // 3. Android platform detection (Capacitor or Android userAgent)
  if (typeof window !== "undefined") {
    const isCapacitor = !!(
      window.Capacitor &&
      window.Capacitor.isNativePlatform &&
      window.Capacitor.isNativePlatform()
    );
    const isAndroid = /android/i.test(navigator.userAgent);

    if (isCapacitor || isAndroid) {
      // 10.0.2.2 maps to the host machine inside the Android Studio Emulator
      return "http://10.0.2.2:5000/api";
    }
  }

  // 4. Default for Web browser
  return "http://localhost:5000/api";
};

const API = axios.create({
  baseURL: getInitialBaseURL(),
  timeout: 15000,
});

// Request interceptor: attach token
API.interceptors.request.use(
  (config) => {
    if (typeof localStorage !== "undefined") {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor: Automatic failover between 10.0.2.2 (emulator) and 172.20.10.3 (physical device)
API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    const currentBase = API.defaults.baseURL || "";

    // If 10.0.2.2 failed with a network error on Android, switch to host LAN IP (for physical devices)
    if (
      (error.code === "ERR_NETWORK" || error.message === "Network Error" || error.code === "ECONNABORTED") &&
      currentBase.includes("10.0.2.2")
    ) {
      originalRequest._retry = true;
      const lanUrl = "http://172.20.10.3:5000/api";
      console.warn(`[API] 10.0.2.2 unreachable, switching to LAN IP: ${lanUrl}`);
      API.defaults.baseURL = lanUrl;
      originalRequest.baseURL = lanUrl;
      return API(originalRequest);
    }

    return Promise.reject(error);
  }
);

export default API;