import { queryClient } from "@/config/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import "react-native-gesture-handler";
import Toast from "react-native-toast-message";
export const ROOT_SCREEN_NAMES = {
  INDEX: "index",
  SIGN_IN: "signIn",
  SIGN_UP: "signUp",
  RESET_PASSWORD: "resetPassword",
  VERIFY_EMAIL: "verify/[email]",
  NEW_PASSWORD: "newPassword",
  REQUEST: "request",
  TABS: "(tabs)",
  SUBSCRIPTION_SUCCESS: "subscription-success",
  SUBSCRIPTION_CANCEL: "subscription-cancel",
  SUBSCRIPTION: "subscription",
} as const;

export default function RootLayout() {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Stack
          initialRouteName={ROOT_SCREEN_NAMES.INDEX}
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: "#EBF1F5" },
          }}
        >
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.INDEX}
            options={{ title: "Home" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SIGN_IN}
            options={{ title: "SignIn" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SIGN_UP}
            options={{ title: "SignUp" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.RESET_PASSWORD}
            options={{ title: "Reset Password" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.VERIFY_EMAIL}
            options={{ title: "Verify Email" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.NEW_PASSWORD}
            options={{ title: "New Password" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.REQUEST}
            options={{ title: "Request" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.TABS}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SUBSCRIPTION}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SUBSCRIPTION_SUCCESS}
            options={{ title: "Subscription Success" }}
          />
          <Stack.Screen
            name={ROOT_SCREEN_NAMES.SUBSCRIPTION_CANCEL}
            options={{ title: "Subscription Canceled" }}
          />
        </Stack>
      </QueryClientProvider>
      <Toast />
    </>
  );
}
