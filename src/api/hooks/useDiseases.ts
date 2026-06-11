import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../axiosInstance";

export type Disease = {
  id: string;
  name: string;
};

export type DiseasesResponse = Array<Disease>;


export const useDiseases = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["diseases"],
    queryFn: async () => {
      const res = await axiosInstance.get("/disease/account");
      return res.data as DiseasesResponse;
    },
    enabled: options?.enabled ?? true,
  });
};
