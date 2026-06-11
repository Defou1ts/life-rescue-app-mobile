import { queryClient } from "@/config/queryClient";
import { useMutation } from "@tanstack/react-query";
import Toast from "react-native-toast-message";
import { axiosInstance } from "../axiosInstance";
import { Allergy } from "./useAllergies";

export const useAddCustomAllergy = () => {
  return useMutation({
    mutationKey: ["addCustomAllergy"],
    mutationFn: async (allergyName: string) => {
      const res = await axiosInstance.post("/allergy/account", {
        allergyName,
      });
      return res.data as Allergy;
    },
    onSuccess(data, variables) {
      queryClient.setQueryData<Allergy[]>(["allergies"], (prev) =>
        prev ? [...prev, data] : [data],
      );
      queryClient.invalidateQueries({
        queryKey: ["allergies"],
      });
      Toast.show({
        type: "success",
        text1: "Allergy added",
        text2: `You have successfully added ${variables} to your allergies list.`,
      });
    },
  });
};
