"use client";

import {
  useMutation,
  useQueryClient,
  type UseMutationOptions,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { reviewApi } from "@/api";
import type { Review, ReviewFormData } from "@/types";

export function useCreateReview(
  options?: UseMutationOptions<Review, Error, ReviewFormData>,
) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ReviewFormData) => reviewApi.createReview(data),
    onSuccess: (_result, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["gear", "reviews", variables.gearId],
      });
      queryClient.invalidateQueries({
        queryKey: ["gear", "details", variables.gearId],
      });
      toast.success("Thank you! Your review has been submitted.");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to submit review.");
    },
    ...options,
  });
}
