import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
export type UpdateProfileData = {
  firstName: string;
  lastName: string;
  isTwoFactorEnabled: boolean;
  phoneNumber: string;
};
export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return (await axiosInstance.put("/profile", data)).data;
    },
    onSuccess(data, variables, onMutateResult, context) {
      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
      });
    },
  });
};
