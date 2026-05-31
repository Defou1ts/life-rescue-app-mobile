import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export type UpdatePasswordData = {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
};

export const useUpdatePassword = () => {
  return useMutation({
    mutationFn: async (data: UpdatePasswordData) => {
      return (await axiosInstance.put("/profile/password", data)).data;
    },
    onSuccess() {
      Toast.show({
        type: "success",
        text1: "Password updated successfully",
      });
    },
    onError() {
      Toast.show({
        type: "error",
        text1: "Failed to update password",
        text2: "Check your current password and try again",
      });
    },
  });
};
