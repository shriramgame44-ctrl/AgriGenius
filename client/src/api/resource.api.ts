import { useQuery } from "@tanstack/react-query";
import { apiClient } from "./client";
import { CattleSanctuary } from "../types";

export interface SanctuariesResponse {
  success: boolean;
  count: number;
  data: CattleSanctuary[];
}

export const useSanctuaries = (region?: string, search?: string) => {
  return useQuery({
    queryKey: ["sanctuaries", region, search],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (region) params.append("state_region", region);
      if (search) params.append("search", search);

      return apiClient<SanctuariesResponse>(`/resources/sanctuaries?${params.toString()}`);
    },
  });
};
