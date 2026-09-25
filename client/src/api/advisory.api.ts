import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "./client";
import {
  AdvisoryRecord,
  CropInput,
  LivestockInput,
  CropAdvisoryResponse,
  LivestockWelfareResponse,
} from "../types";

export interface AdvisoriesResponse {
  success: boolean;
  data: AdvisoryRecord[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
  };
}

export const useAdvisories = (page = 1, limit = 10, type?: string) => {
  return useQuery({
    queryKey: ["advisories", page, limit, type],
    queryFn: async () => {
      const searchParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (type) searchParams.append("type", type);

      return apiClient<AdvisoriesResponse>(`/advisory?${searchParams.toString()}`);
    },
  });
};

export const useAdvisory = (id: string | undefined) => {
  return useQuery({
    queryKey: ["advisory", id],
    queryFn: async () => {
      if (!id) throw new Error("Advisory ID is required");
      const res = await apiClient<{ success: boolean; data: AdvisoryRecord }>(`/advisory/${id}`);
      return res.data;
    },
    enabled: !!id,
  });
};

export const useCreateCropAdvisory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: CropInput) => {
      const res = await apiClient<{ success: boolean; message: string; data: AdvisoryRecord<CropAdvisoryResponse> }>(
        "/advisory/crop",
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisories"] });
    },
  });
};

export const useCreateLivestockAdvisory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: LivestockInput) => {
      const res = await apiClient<{ success: boolean; message: string; data: AdvisoryRecord<LivestockWelfareResponse> }>(
        "/advisory/livestock",
        {
          method: "POST",
          body: JSON.stringify(input),
        }
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisories"] });
    },
  });
};

export const useDeleteAdvisory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      return apiClient<{ success: boolean; message: string }>(`/advisory/${id}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["advisories"] });
    },
  });
};

export const downloadPdfReport = async (id: string, title: string) => {
  const token = localStorage.getItem("agrigenius_token");
  const headers = new Headers();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`/api/advisory/${id}/pdf`, {
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    throw new Error("Failed to download PDF report");
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};
