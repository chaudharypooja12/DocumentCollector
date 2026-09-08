"use client";

import { LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { TemplateBuilderForm } from "@/components/admin/template-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { documentTypeLabel } from "@/lib/request-link";
import {
  useTemplates,
  type DocumentTemplate,
} from "@/providers/templates-provider";

function TemplateFormDialog({
  template,
  trigger,
  onSubmit,
}: {
  template?: DocumentTemplate | undefined;
  trigger: React.ReactNode;
  onSubmit: (template: Omit<DocumentTemplate, "id">) => void;
}) {
  const [open, setOpen] = useState(false);
  const formId = template ? `edit-template-${template.id}` : "new-template";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="flex max-h-[85vh] w-[min(94vw,48rem)] max-w-3xl flex-col overflow-hidden">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit template" : "New document template"}
          </DialogTitle>
        </DialogHeader>

        <div className="-mx-1 flex-1 overflow-y-auto px-1">
          <TemplateBuilderForm
            formId={formId}
            initialTemplate={template}
            onSubmit={(data) => {
              onSubmit(data);
              setOpen(false);
            }}
          />
        </div>

        <DialogFooter className="flex-row justify-end gap-3">
          <Button
            type="button"
            variant="secondary"
            className="flex-1 text-xs sm:flex-none sm:text-sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form={formId}
            className="flex-1 text-xs sm:flex-none sm:text-sm"
          >
            {template ? "Save changes" : "Create template"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function DeleteTemplateDialog({
  template,
  onConfirm,
}: {
  template: DocumentTemplate;
  onConfirm: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="text-destructive hover:bg-destructive/10"
          aria-label={`Delete template ${template.name}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this template?</DialogTitle>
        </DialogHeader>
        <p className="text-sm leading-6 text-muted-foreground">
          {template.name} will no longer be available when creating a new
          request. This only affects this tab&apos;s demonstration data.
        </p>
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm();
              setOpen(false);
            }}
          >
            <Trash2 className="size-4" /> Delete template
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TemplatesPage() {
  const { templates, addTemplate, updateTemplate, removeTemplate } =
    useTemplates();

  const columns: DataTableColumn<DocumentTemplate>[] = [
    {
      id: "name",
      header: "Template name",
      value: (template) => template.name,
      cell: (template) => <span className="font-semibold">{template.name}</span>,
    },
    {
      id: "documents",
      header: "Documents",
      value: (template) =>
        template.documents.map((document) => document.name).join(", "),
      cell: (template) => (
        <div className="flex flex-wrap gap-2">
          {template.documents.map((document) => {
            const typeLabel = documentTypeLabel(document.type);
            return (
              <Badge key={document.id} tone="neutral">
                {document.name}
                {typeLabel ? ` (${typeLabel})` : ""}
              </Badge>
            );
          })}
        </div>
      ),
    },
    {
      id: "count",
      header: "Count",
      value: (template) => template.documents.length,
    },
    {
      id: "actions",
      header: "Actions",
      value: () => "",
      searchable: false,
      exportable: false,
      cell: (template) => (
        <div className="flex items-center gap-1.5">
          <TemplateFormDialog
            template={template}
            trigger={
              <Button
                type="button"
                variant="outline"
                size="icon"
                aria-label={`Edit template ${template.name}`}
              >
                <Pencil aria-hidden="true" />
              </Button>
            }
            onSubmit={(data) => updateTemplate(template.id, data)}
          />
          <DeleteTemplateDialog
            template={template}
            onConfirm={() => removeTemplate(template.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeading
        title="Templates"
        icon={LayoutTemplate}
        demo
        action={
          <TemplateFormDialog
            trigger={
              <Button type="button">
                <Plus className="size-4" /> New template
              </Button>
            }
            onSubmit={(data) => addTemplate(data)}
          />
        }
      />

      <DataTable
        caption="Document templates"
        columns={columns}
        rows={templates}
        rowKey={(template) => template.id}
        searchPlaceholder="Search templates"
        exportFileName="documentcollector-templates.csv"
      />
    </>
  );
}