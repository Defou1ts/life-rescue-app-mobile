import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export const useRequestPasswordRecovery = () => {
  return useMutation({
    mutationFn: async (email: string) => {
      return (
        await axiosInstance.put("/profile/password/recovery", null, {
          params: { email },
        })
      ).data;
    },
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "Verification code sent",
      });
    },
    onError() {
      Toast.show({
        type: "error",
        text1: "Failed to send verification code",
      });
    },
  });
};
