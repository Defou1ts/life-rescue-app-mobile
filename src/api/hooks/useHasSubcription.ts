import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

export type HasSubscriptionResponse = {
  hasActiveSubscription: boolean;
};

export const hasSubscription = async (): Promise<HasSubscriptionResponse> => {
  try {
    const res = await axiosInstance.get(`/profile/subscription`);
    return res.data;
  } catch {
    return { hasActiveSubscription: false };
  }
};

export const useHasSubscription = () => {
  return useQuery<HasSubscriptionResponse, ServerError>({
    queryKey: ["hasSubscription"],
    queryFn: hasSubscription,
    refetchOnMount: "always",
    staleTime: 30_000,
  });
};
