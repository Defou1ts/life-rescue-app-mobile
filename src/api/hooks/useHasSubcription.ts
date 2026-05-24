import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type HasSubscriptionResponse = {
  hasSubscription: boolean;
};

export const hasSubscription = async (): Promise<HasSubscriptionResponse> => {
  const res = await axiosInstance.get(`/profile/hasSubscription`);
  return res.data;
};

export const useHasSubscription = () => {
  return useQuery<HasSubscriptionResponse, ServerError>({
    queryKey: ["hasSubscription"],
    queryFn: hasSubscription,
  });
};
