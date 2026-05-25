import { axiosInstance } from "@/api/axiosInstance";
import { queryClient } from "@/config/queryClient";
import { router } from "expo-router";
import * as SecureStore from "expo-secure-store";

export const logout = async () => {
  try {
    /**
     * GET REFRESH TOKEN
     */
    const refreshToken = await SecureStore.getItemAsync("refresh_token");

    /**
     * BACKEND LOGOUT
     */
    if (refreshToken) {
      await axiosInstance.post("/auth/logout", {
        refreshToken,
      });
    }
  } catch (e) {
    console.log("LOGOUT_REQUEST_ERROR", e);
  } finally {
    /**
     * CLEAR TOKENS
     */
    await SecureStore.deleteItemAsync("access_token");

    await SecureStore.deleteItemAsync("refresh_token");

    /**
     * CLEAR AXIOS AUTH HEADER
     */
    delete axiosInstance.defaults.headers.common.Authorization;

    /**
     * CLEAR REACT QUERY CACHE
     */
    queryClient.clear();

    /**
     * REDIRECT
     */
    router.replace("/signIn");
  }
};
