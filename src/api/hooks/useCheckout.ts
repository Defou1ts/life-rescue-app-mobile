import { queryClient } from "@/config/queryClient";
import { useMutation } from "@tanstack/react-query";
import { router } from "expo-router";
import * as Linking from "expo-linking";
import * as WebBrowser from "expo-web-browser";
import { axiosInstance } from "../axiosInstance";
import { ServerError } from "../types";

const monthslyPriceId = "price_1RpuzoC1kCMVK5zzyvDmEdY5";

const successPath = "/subscription-success";
const failurePath = "/subscription-cancel";
const successUrl = Linking.createURL(successPath);
const failureUrl = Linking.createURL(failurePath);

export type CheckoutResponse = {
  url: string;
};

export const checkout = async (): Promise<CheckoutResponse> => {
  const res = await axiosInstance.post(
    `/subscriptions/checkout/${monthslyPriceId}`,
    { failureUrl: failureUrl, successUrl: successUrl },
  );
  return res.data;
};

export const useCheckout = () => {
  return useMutation<CheckoutResponse, ServerError>({
    mutationKey: ["checkout"],
    mutationFn: checkout,
    onSuccess: async (data) => {
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        successUrl,
      );

      if (result.type === "success") {
        await queryClient.invalidateQueries({ queryKey: ["hasSubscription"] });
        router.replace("/(tabs)");
      }
    },
  });
};
