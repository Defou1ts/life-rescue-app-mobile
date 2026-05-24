import { tokenStorage } from "@/store/tokenStorage";
import { useMutation } from "@tanstack/react-query";
import { AxiosResponse } from "axios";
import { useRouter } from "expo-router";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type SignInRequestData = {
  email: string;
  password: string;
  token?: string;
};

export interface SignInResponseData {
  access_token: string;
  expires_in: number;
  refresh_token: string;
  refresh_expires_in: number;
  createdAt: string;
}

export const signIn = async (data: SignInRequestData) => {
  return axiosInstance.post<SignInResponseData>("/auth/login", data);
};

export const useSignIn = () => {
  const router = useRouter();

  return useMutation<
    AxiosResponse<SignInResponseData>,
    ServerError,
    SignInRequestData
  >({
    mutationKey: ["sign-in"],
    mutationFn: signIn,

    onSuccess: async (data, { email, password }) => {
      if (data.status === 202) {
        router.push({
          pathname: `/verification`,
          params: {
            email,
            password,
          },
        });

        return;
      }

      if (data.status === 200) {
        const { access_token, refresh_token } = data.data;

        await tokenStorage.setTokens(access_token, refresh_token);

        router.replace("/(tabs)");
      }
    },
  });
};
