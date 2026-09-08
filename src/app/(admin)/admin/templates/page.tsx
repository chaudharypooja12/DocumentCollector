"use client";

import { LayoutTemplate, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { PageHeading } from "@/components/admin/page-heading";
import { TemplateBuilderForm } from "@/components/admin/template-builder";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { InlineAlert } from "@/components/ui/inline-alert";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {template ? "Edit template" : "New document template"}
          </DialogTitle>
          <DialogDescription>
            Templates are reused when creating a request. Changes apply only
            to this tab and reset on refresh.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[60vh] overflow-y-auto pr-1">
          <TemplateBuilderForm
            formId={formId}
            initialTemplate={template}
            onSubmit={(data) => {
              onSubmit(data);
              setOpen(false);
            }}
          />
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" form={formId}>
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
          <DialogDescription>
            {template.name} will no longer be available when creating a new
            request. This only affects this tab&apos;s demonstration data.
          </DialogDescription>
        </DialogHeader>
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

      {templates.length === 0 ? (
        <InlineAlert tone="warning">
          No templates yet. Create one to reuse its document checklist when
          building a request.
        </InlineAlert>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id}>
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-bold">{template.name}</h2>
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
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {template.documents.map((document) => (
                  <Badge key={document.id} tone="neutral">
                    {document.name}
                    {document.type === "FRONT_BACK" ? " (Front + Back)" : ""}
                  </Badge>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
