import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
import { ProfileResponse } from "./useProfile";

export type UpdateProfileData = {
  firstName: string;
  lastName: string;
  isTwoFactorEnabled: boolean;
  phoneNumber: string;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      return (await axiosInstance.put("/profile", data)).data;
    },
    onSuccess(_data, variables) {
      queryClient.setQueryData<ProfileResponse>(["profile"], (prev) =>
        prev
          ? {
              ...prev,
              name: variables.firstName,
              lastName: variables.lastName,
              phoneNumber: variables.phoneNumber,
              isTwoFactorEnabled: variables.isTwoFactorEnabled,
            }
          : prev,
      );
      queryClient.invalidateQueries({ queryKey: ["profile"] });

      Toast.show({
        type: "success",
        text1: "Profile updated successfully",
      });
    },
  });
};
