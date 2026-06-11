import { queryClient } from "@/config/queryClient";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
import { DiseasesResponse } from "./useDiseases";

export const useDeleteAccountDisease = () => {
  return useMutation({
    mutationKey: ["deleteAccountDisease"],
    mutationFn: async (diseaseId: string) => {
      await axiosInstance.delete(`/disease/account/${diseaseId}`);
    },
    onSuccess(_data, diseaseId) {
      queryClient.setQueryData<DiseasesResponse>(["diseases"], (prev) =>
        prev ? prev.filter((disease) => disease.id !== diseaseId) : prev,
      );
      queryClient.invalidateQueries({
        queryKey: ["diseases"],
      });
      Toast.show({
        type: "success",
        text1: "Disease deleted",
        text2: `You have successfully deleted the disease from your diseases list.`,
      });
    },
  });
};
