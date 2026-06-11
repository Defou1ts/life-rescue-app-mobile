import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type ProfileResponse = {
  name: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  isTwoFactorEnabled: boolean;
  isNeedToChangePassword: boolean;
};

const getProfile = async () => {
  const res = await axiosInstance.get<ProfileResponse>(`/profile`);
  return res.data;
};

export const useProfile = () => {
  return useQuery<ProfileResponse>({
    queryKey: ["profile"],
    queryFn: getProfile,
    retry: 1,
  });
};
