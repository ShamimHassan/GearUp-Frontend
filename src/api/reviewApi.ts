import { apiPost } from "@/api/axios";
import type { Review, ReviewFormData } from "@/types";

export const reviewApi = {
  createReview: (data: ReviewFormData) =>
    apiPost<Review>("/api/reviews", data),
};

export default reviewApi;
