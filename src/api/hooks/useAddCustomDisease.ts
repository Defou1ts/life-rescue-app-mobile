import { queryClient } from "@/config/queryClient";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
import { Disease } from "./useDiseases";

export const useAddCustomDisease = () => {
  return useMutation({
    mutationKey: ["addCustomDisease"],
    mutationFn: async (diseaseName: string) => {
      const res = await axiosInstance.post("/disease/account", {
        diseaseName,
      });
      return res.data as Disease;
    },
    onSuccess(data, variables) {
      queryClient.setQueryData<Disease[]>(["diseases"], (prev) =>
        prev ? [...prev, data] : [data],
      );
      queryClient.invalidateQueries({
        queryKey: ["diseases"],
      });
      Toast.show({
        type: "success",
        text1: "Disease added",
        text2: `You have successfully added ${variables} to your diseases list.`,
      });
    },
  });
};
