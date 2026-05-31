import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export type ResetPasswordData = {
  email: string;
  token: string;
  newPassword: string;
  confirmPassword: string;
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: async (data: ResetPasswordData) => {
      return (await axiosInstance.post("/profile/password", data)).data;
    },
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "Password reset successfully",
      });
    },
    onError() {
      Toast.show({
        type: "error",
        text1: "Failed to reset password",
        text2: "Check the verification code and try again",
      });
    },
  });
};
