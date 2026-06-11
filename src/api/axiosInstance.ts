import { tokenStorage } from "@/store/tokenStorage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";

export const axiosInstance = axios.create({
  baseURL: "http://87.232.65.208:5032/api/v1",
});

type FailedRequest = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

let isRefreshing = false;
let failedQueue: FailedRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

axiosInstance.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenStorage.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(axiosInstance(originalRequest));
            },
            reject,
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenStorage.getRefreshToken();

        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          "http://87.232.65.208:5032/api/v1/auth/refresh",
          {
            refreshToken,
          },
        );

        const { access_token, refresh_token } = response.data;

        await tokenStorage.setTokens(access_token, refresh_token);

        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        await tokenStorage.clearTokens();

        router.replace("/signIn");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);
