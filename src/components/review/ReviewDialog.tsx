"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { reviewApi } from "@/api";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/Dialog";
import { showSuccess, showError } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

// ─── Zod schema ───────────────────────────────────────────────────────────────

const reviewSchema = z.object({
  rating:  z.number().int().min(1, "Please select a rating").max(5),
  comment: z.string().max(1000, "Max 1000 characters").optional(),
});

type ReviewFormValues = z.infer<typeof reviewSchema>;

// ─── Star picker ──────────────────────────────────────────────────────────────

export function StarPicker({
  value,
  onChange,
  size = "md",
}: {
  value: number;
  onChange: (v: number) => void;
  size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);

  const sizeClass = size === "sm" ? "h-6 w-6" : size === "lg" ? "h-10 w-10" : "h-8 w-8";

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Star rating">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          aria-label={`${star} star${star !== 1 ? "s" : ""}`}
          aria-pressed={value >= star}
          className="transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/40 rounded"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill={(hovered || value) >= star ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            className={cn(
              "transition-colors",
              sizeClass,
              (hovered || value) >= star ? "text-amber-400" : "text-slate-300",
            )}
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        </button>
      ))}
    </div>
  );
}

// ─── Star display (read-only) ─────────────────────────────────────────────────

export function StarDisplay({
  rating,
  max = 5,
  size = "sm",
}: {
  rating: number;
  max?: number;
  size?: "sm" | "md";
}) {
  const sizeClass = size === "sm" ? "h-4 w-4" : "h-5 w-5";
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of ${max} stars`}>
      {Array.from({ length: max }).map((_, i) => {
        const full = i + 1 <= Math.floor(rating);
        const half = !full && i < rating && rating - i >= 0.5;
        return (
          <svg
            key={i}
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            className={cn(sizeClass, full || half ? "text-amber-400" : "text-slate-200")}
            fill={full ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="1.5"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z"
            />
          </svg>
        );
      })}
    </div>
  );
}

// ─── Review dialog ────────────────────────────────────────────────────────────

export interface ReviewDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onClose: () => void;
  /** ID of the gear being reviewed */
  gearId: string;
  /** Name of the gear (shown in dialog subtitle) */
  gearName?: string;
  /** Called after a successful submission so the parent can refresh */
  onSuccess?: () => void;
}

export default function ReviewDialog({
  open,
  onClose,
  gearId,
  gearName,
  onSuccess,
}: ReviewDialogProps) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: 0, comment: "" },
  });

  const rating = watch("rating");

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (data: ReviewFormValues) => {
    try {
      await reviewApi.createReview({
        rating: data.rating,
        comment: data.comment,
        gearId,
      });
      showSuccess("Review submitted!", "Thank you for your feedback.");
      reset();
      onClose();
      onSuccess?.();
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to submit review. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>
            {gearName
              ? `Share your experience with "${gearName}".`
              : "Share your experience to help other adventurers."}
          </DialogDescription>
          <DialogClose />
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-6 px-6 py-5">

            {/* Star picker */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700">
                Your rating <span className="text-red-500">*</span>
              </label>
              <StarPicker
                value={rating}
                onChange={(v) => setValue("rating", v, { shouldValidate: true })}
              />
              {/* Rating label */}
              {rating > 0 && (
                <p className="text-xs text-slate-500">
                  {["", "Poor", "Fair", "Good", "Very good", "Excellent"][rating]}
                </p>
              )}
              {errors.rating && (
                <p role="alert" className="text-xs text-red-600">{errors.rating.message}</p>
              )}
            </div>

            {/* Comment */}
            <div className="space-y-1.5">
              <label
                htmlFor="review-comment"
                className="block text-sm font-semibold text-slate-700"
              >
                Comment{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <Textarea
                id="review-comment"
                placeholder="What did you think of the gear? Condition, pickup experience, accuracy of listing…"
                rows={4}
                invalid={!!errors.comment}
                {...register("comment")}
              />
              {errors.comment && (
                <p role="alert" className="text-xs text-red-600">{errors.comment.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              size="md"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              disabled={rating === 0 || isSubmitting}
            >
              Submit review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ReviewDialog };
