"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useCategories } from "@/hooks/useGear";
import { useCreateGear, useUpdateGear } from "@/hooks/useProvider";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Input";
import { Button, LinkButton } from "@/components/ui/Button";
import { Select, SelectItem } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { gearItemSchema, type GearItemSchemaInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import type { GearItem } from "@/types";

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p role="alert" className="mt-1.5 text-xs font-medium text-red-600">{message}</p>;
}

export interface GearFormProps {
  /** Existing gear to edit — omit for create mode */
  gear?: GearItem;
}

export default function GearForm({ gear }: GearFormProps) {
  const router   = useRouter();
  const isEdit   = Boolean(gear);

  const createGear = useCreateGear();
  const updateGear = useUpdateGear();
  const { data: categories = [], isLoading: catsLoading } = useCategories();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<GearItemSchemaInput>({
    resolver: zodResolver(gearItemSchema),
    defaultValues: {
      name:        gear?.name        ?? "",
      description: gear?.description ?? "",
      brand:       gear?.brand       ?? "",
      categoryId:  gear?.categoryId  ?? "",
      price:       gear?.price       ?? 0,
      stock:       gear?.stock       ?? 1,
      images:      gear?.images?.length ? gear.images : [""],
      isAvailable: gear?.isAvailable ?? true,
    },
  });

  // Reset when gear prop changes (edit navigation)
  useEffect(() => {
    if (gear) {
      reset({
        name:        gear.name,
        description: gear.description ?? "",
        brand:       gear.brand       ?? "",
        categoryId:  gear.categoryId,
        price:       gear.price,
        stock:       gear.stock,
        images:      gear.images.length ? gear.images : [""],
        isAvailable: gear.isAvailable,
      });
    }
  }, [gear, reset]);

  const { fields: imageFields, append, remove } = useFieldArray({
    control,
    // @ts-expect-error useFieldArray expects object fields; images is string[]
    name: "images",
  });

  const isAvailable = watch("isAvailable");

  const onSubmit = async (data: GearItemSchemaInput) => {
    // Strip empty image strings
    const cleanImages = data.images.filter((url) => url.trim().length > 0);
    const payload = { ...data, images: cleanImages };

    if (isEdit && gear) {
      await updateGear.mutateAsync({ id: gear.id, data: payload });
    } else {
      await createGear.mutateAsync(payload);
    }
    router.push("/dashboard/provider/gear");
  };

  const isPending = isSubmitting || createGear.isPending || updateGear.isPending;
  const apiError  = isEdit ? updateGear.error : createGear.error;
  const isApiError = isEdit ? updateGear.isError : createGear.isError;

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">

      {/* ── Name ──────────────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="gear-name" className="block text-sm font-semibold text-slate-700">
          Gear name <span className="text-red-500">*</span>
        </label>
        <Input
          id="gear-name"
          placeholder="e.g. Trek Mountain Bike 7.4"
          invalid={!!errors.name}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* ── Description ───────────────────────────────────────────── */}
      <div className="space-y-1.5">
        <label htmlFor="gear-desc" className="block text-sm font-semibold text-slate-700">
          Description <span className="font-normal text-slate-400">(optional)</span>
        </label>
        <Textarea
          id="gear-desc"
          rows={4}
          placeholder="Describe condition, included accessories, pickup instructions…"
          invalid={!!errors.description}
          {...register("description")}
        />
        <FieldError message={errors.description?.message as string | undefined} />
      </div>

      {/* ── Brand + Category ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="gear-brand" className="block text-sm font-semibold text-slate-700">
            Brand <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <Input
            id="gear-brand"
            placeholder="e.g. Trek, Black Diamond"
            invalid={!!errors.brand}
            {...register("brand")}
          />
          <FieldError message={errors.brand?.message as string | undefined} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gear-category" className="block text-sm font-semibold text-slate-700">
            Category <span className="text-red-500">*</span>
          </label>
          {catsLoading ? (
            <Skeleton className="h-10 rounded-lg" />
          ) : (
            <Select
              id="gear-category"
              placeholder="Select a category"
              value={watch("categoryId")}
              onValueChange={(v) => setValue("categoryId", v, { shouldValidate: true })}
              invalid={!!errors.categoryId}
            >
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </Select>
          )}
          <FieldError message={errors.categoryId?.message} />
        </div>
      </div>

      {/* ── Price + Stock ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="gear-price" className="block text-sm font-semibold text-slate-700">
            Price per day (৳) <span className="text-red-500">*</span>
          </label>
          <Input
            id="gear-price"
            type="number"
            min={0}
            step="0.01"
            placeholder="e.g. 500"
            invalid={!!errors.price}
            {...register("price")}
          />
          <FieldError message={errors.price?.message} />
        </div>

        <div className="space-y-1.5">
          <label htmlFor="gear-stock" className="block text-sm font-semibold text-slate-700">
            Stock quantity <span className="text-red-500">*</span>
          </label>
          <Input
            id="gear-stock"
            type="number"
            min={0}
            step={1}
            placeholder="e.g. 3"
            invalid={!!errors.stock}
            {...register("stock")}
          />
          <FieldError message={errors.stock?.message} />
        </div>
      </div>

      {/* ── Images ────────────────────────────────────────────────── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-slate-700">
            Image URLs <span className="text-red-500">*</span>{" "}
            <span className="font-normal text-slate-400">(1–5 images)</span>
          </label>
          {imageFields.length < 5 && (
            <button
              type="button"
              onClick={() => append("" as unknown as Record<string, unknown>)}
              className="text-xs font-semibold text-indigo-700 hover:text-indigo-800 transition-colors"
            >
              + Add image
            </button>
          )}
        </div>
        <div className="space-y-2">
          {imageFields.map((field, idx) => (
            <div key={field.id} className="flex items-center gap-2">
              <Input
                type="url"
                placeholder={`Image ${idx + 1} URL (https://…)`}
                invalid={!!errors.images?.[idx]}
                {...register(`images.${idx}` as const)}
                className="flex-1"
              />
              {imageFields.length > 1 && (
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  aria-label={`Remove image ${idx + 1}`}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                    className="h-4 w-4" aria-hidden="true">
                    <path d="M3 6h18"/><path d="M8 6V4h8v2"/>
                    <path d="M19 6l-1 14H6L5 6"/>
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
        {errors.images?.root && (
          <FieldError message={errors.images.root?.message} />
        )}
        {errors.images && !Array.isArray(errors.images) && (
          <FieldError message={(errors.images as { message?: string }).message} />
        )}
      </div>

      {/* ── Availability toggle ───────────────────────────────────── */}
      <label className="flex cursor-pointer items-center gap-3">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            checked={isAvailable}
            onChange={(e) => setValue("isAvailable", e.target.checked, { shouldDirty: true })}
          />
          <div className={cn(
            "h-6 w-11 rounded-full transition-colors",
            isAvailable ? "bg-indigo-600" : "bg-slate-300",
          )} />
          <div className={cn(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform",
            isAvailable ? "translate-x-5" : "translate-x-0",
          )} />
        </div>
        <div>
          <span className="text-sm font-semibold text-slate-700">Available for rental</span>
          <p className="text-xs text-slate-400">
            {isAvailable
              ? "This item is visible and bookable on the marketplace."
              : "This item is hidden from the marketplace."}
          </p>
        </div>
        {isAvailable
          ? <Badge tone="emerald" size="sm" className="ml-auto">Available</Badge>
          : <Badge tone="suspended" size="sm" className="ml-auto">Unlisted</Badge>
        }
      </label>

      {/* ── API error ─────────────────────────────────────────────── */}
      {isApiError && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span className="font-semibold">{isEdit ? "Update" : "Create"} failed: </span>
          {apiError?.message ?? "Please try again."}
        </div>
      )}

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row">
        <LinkButton
          href="/dashboard/provider/gear"
          variant="outline"
          size="lg"
          className={isPending ? "pointer-events-none opacity-60" : ""}
        >
          Cancel
        </LinkButton>
        <Button
          type="submit"
          variant="primary"
          size="lg"
          block
          isLoading={isPending}
          disabled={isPending || (!isDirty && isEdit)}
        >
          {isEdit ? "Save changes" : "Add to inventory"}
        </Button>
      </div>
    </form>
  );
}

export { GearForm };
