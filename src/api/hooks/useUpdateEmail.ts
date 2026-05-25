import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";

export const useUpdateEmail = () => {
  return useMutation({
    mutationFn: async (data: { email: string }) => {
      return (await axiosInstance.put("/profile/email", data)).data;
    },
    onSuccess(data, variables, onMutateResult, context) {
      Toast.show({
        type: "success",
        text1: "Email updated successfully",
      });
    },
  });
};
