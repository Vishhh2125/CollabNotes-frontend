import axios from "axios";

// Optional logout handler injected from app to avoid circular imports
let onLogout = null;
export const setLogoutHandler = (handler) => {
    onLogout = handler;
};

const api = axios.create({
    baseURL: "https://collabnotes-backend-ox8q.onrender.com/api/v1",
    withCredentials: true, 
});


api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("accessToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);


let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach((promise) => {
        if (error) {
            promise.reject(error);
        } else {
            promise.resolve(token);
        }
    });
    failedQueue = [];
};

const redirectToLogin = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");
  
    if (typeof window !== "undefined" && !window.location.pathname.includes("/login")) {
        window.location.assign("/login");
    }
};

// Add response interceptor to handle auth failures globally with refresh retry
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const status = error?.response?.status;
        const originalRequest = error?.config;

        if (status !== 401 || originalRequest?._retry) {
            return Promise.reject(error);
        }

        if (!originalRequest) {
            redirectToLogin();
            return Promise.reject(error);
        }

        originalRequest._retry = true;

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject });
            })
                .then((token) => {
                    if (token) {
                        originalRequest.headers.Authorization = `Bearer ${token}`;
                    }
                    return api(originalRequest);
                })
                .catch((err) => Promise.reject(err));
        }

        isRefreshing = true;

        try {
            const refreshResponse = await axios.get(
                "http://localhost:5000/api/v1/users/refresh-token",
                { withCredentials: true }
            );

            const newAccessToken = refreshResponse?.data?.data?.accessToken;
            if (!newAccessToken) {
                throw new Error("No access token returned from refresh endpoint");
            }

            localStorage.setItem("accessToken", newAccessToken);
            api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
            processQueue(null, newAccessToken);

            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return api(originalRequest);
        } catch (refreshError) {
            processQueue(refreshError, null);
            redirectToLogin();
            return Promise.reject(refreshError);
        } finally {
            isRefreshing = false;
        }
    }
);

export default api;