"use client";

import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from "lucide-react";
import {
  Controller,
  useFieldArray,
  useForm,
  type Control,
  type FieldErrors,
  type UseFormRegister,
} from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MAX_DOCUMENTS, MAX_DOCUMENT_NAME_LENGTH } from "@/lib/request-link";
import type { DocumentTemplate } from "@/providers/templates-provider";

const templateDocumentSchema = z.object({
  id: z.string().uuid(),
  name: z
    .string()
    .trim()
    .min(1, "Enter a document name")
    .max(MAX_DOCUMENT_NAME_LENGTH),
  type: z.enum(["SINGLE", "FRONT_BACK", "PDF_UPLOAD"]),
});

const templateFormSchema = z
  .object({
    name: z.string().trim().min(1, "Enter a template name").max(80),
    documents: z.array(templateDocumentSchema).min(1).max(MAX_DOCUMENTS),
  })
  .superRefine((data, context) => {
    const names = new Set<string>();
    data.documents.forEach((document, index) => {
      const name = document.name.trim().toLocaleLowerCase();
      if (names.has(name)) {
        context.addIssue({
          code: "custom",
          message: "Document names must be unique",
          path: ["documents", index, "name"],
        });
      }
      names.add(name);
    });
  });

type TemplateForm = z.infer<typeof templateFormSchema>;

function newDocument(): TemplateForm["documents"][number] {
  return { id: crypto.randomUUID(), name: "", type: "SINGLE" };
}

function SortableTemplateDocument({
  id,
  index,
  count,
  control,
  register,
  errors,
  onMove,
  onRemove,
}: {
  id: string;
  index: number;
  count: number;
  control: Control<TemplateForm>;
  register: UseFormRegister<TemplateForm>;
  errors: FieldErrors<TemplateForm>;
  onMove: (from: number, to: number) => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-border bg-muted/35 p-4 ${
        isDragging ? "relative z-10 border-primary/60 shadow-xl" : ""
      }`}
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[44px_1fr_180px_auto] sm:items-start">
        <button
          type="button"
          className="hidden size-11 cursor-grab items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground sm:inline-flex"
          aria-label={`Drag document ${index + 1}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <label>
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">
            Document {index + 1}
          </span>
          <Input
            placeholder="e.g. Passport"
            {...register(`documents.${index}.name`)}
            aria-invalid={Boolean(errors.documents?.[index]?.name)}
          />
          {errors.documents?.[index]?.name?.message ? (
            <span className="mt-1 block text-xs text-destructive">
              {errors.documents[index]?.name?.message}
            </span>
          ) : null}
        </label>
        <label>
          <span className="mb-2 block text-xs font-semibold text-muted-foreground">
            Capture type
          </span>
          <Controller
            control={control}
            name={`documents.${index}.type`}
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger className="min-h-11 rounded-xl">
                  <SelectValue aria-label={field.value} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SINGLE">Single side</SelectItem>
                  <SelectItem value="FRONT_BACK">Front + back side</SelectItem>
                  <SelectItem value="PDF_UPLOAD">Upload PDF</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
        </label>
        <div className="flex items-center justify-end gap-1 sm:items-end sm:justify-start sm:pt-6">
          <button
            type="button"
            onClick={() => onMove(index, index - 1)}
            disabled={index === 0}
            className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
            aria-label={`Move document ${index + 1} up`}
          >
            <ArrowUp className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => onMove(index, index + 1)}
            disabled={index === count - 1}
            className="inline-flex size-11 items-center justify-center rounded-xl text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-25"
            aria-label={`Move document ${index + 1} down`}
          >
            <ArrowDown className="size-4" />
          </button>
          <button
            type="button"
            onClick={onRemove}
            disabled={count === 1}
            className="inline-flex size-11 items-center justify-center rounded-xl text-destructive hover:bg-destructive/10 disabled:opacity-25"
            aria-label={`Remove document ${index + 1}`}
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function TemplateBuilderForm({
  formId,
  initialTemplate,
  onSubmit,
}: {
  formId: string;
  initialTemplate?: DocumentTemplate | undefined;
  onSubmit: (template: Omit<DocumentTemplate, "id">) => void;
}) {
  const {
    control,
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TemplateForm>({
    resolver: zodResolver(templateFormSchema),
    defaultValues: initialTemplate
      ? { name: initialTemplate.name, documents: initialTemplate.documents }
      : {
          name: "",
          documents: [newDocument()],
        },
  });
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "documents",
    keyName: "fieldKey",
  });
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  function reorder(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return;
    const from = fields.findIndex((field) => field.id === event.active.id);
    const to = fields.findIndex((field) => field.id === event.over?.id);
    if (from >= 0 && to >= 0) move(from, to);
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit((data) => onSubmit(data))}
      className="space-y-5"
    >
      <div>
        <Label htmlFor="template-name">Template name</Label>
        <Input
          id="template-name"
          className="mt-2"
          placeholder="e.g. Passport & Photograph"
          {...register("name")}
          aria-invalid={Boolean(errors.name)}
        />
        {errors.name?.message ? (
          <span className="mt-1 block text-xs text-destructive">
            {errors.name.message}
          </span>
        ) : null}
      </div>

      <div className="flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold">Documents in this template</h3>
        <span className="text-xs text-muted-foreground">
          {fields.length}/{MAX_DOCUMENTS}
        </span>
      </div>

      <DndContext
        id="template-document-order"
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={reorder}
      >
        <SortableContext
          items={fields.map((field) => field.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {fields.map((field, index) => (
              <SortableTemplateDocument
                key={field.id}
                id={field.id}
                index={index}
                count={fields.length}
                control={control}
                register={register}
                errors={errors}
                onMove={(from, to) => {
                  if (to >= 0 && to < fields.length) move(from, to);
                }}
                onRemove={() => remove(index)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Button
        type="button"
        variant="secondary"
        disabled={fields.length >= MAX_DOCUMENTS}
        onClick={() => append(newDocument())}
      >
        <Plus className="size-4" /> Add document
      </Button>
    </form>
  );
}
