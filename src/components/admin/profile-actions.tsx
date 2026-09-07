"use client";

import { Download, Eye, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { DemoProfile, Gender } from "@/data/admin-fixtures";

function statusTone(status: DemoProfile["status"]) {
  return status === "Submitted"
    ? "success"
    : status === "In progress"
      ? "brand"
      : "neutral";
}

export function ViewProfileDialog({ profile }: { profile: DemoProfile }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`View submission for ${profile.fullName}`}
        >
          <Eye aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{profile.fullName}</DialogTitle>
          <DialogDescription>
            {profile.reference} · Demonstration submission preview
          </DialogDescription>
        </DialogHeader>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          <dt className="text-muted-foreground">Age</dt>
          <dd className="font-semibold">{profile.age}</dd>
          <dt className="text-muted-foreground">Gender</dt>
          <dd className="font-semibold">{profile.gender}</dd>
          <dt className="text-muted-foreground">Phone</dt>
          <dd className="font-semibold">{profile.phone}</dd>
          <dt className="text-muted-foreground">Status</dt>
          <dd>
            <Badge tone={statusTone(profile.status)}>{profile.status}</Badge>
          </dd>
          <dt className="text-muted-foreground">Permanent address</dt>
          <dd className="col-span-1 font-semibold">
            {profile.permanentAddress}
          </dd>
          <dt className="text-muted-foreground">Residence address</dt>
          <dd className="col-span-1 font-semibold">
            {profile.sameAsPermanentAddress
              ? "Same as permanent address"
              : profile.residenceAddress}
          </dd>
        </dl>

        <div>
          <p className="mb-3 text-sm font-semibold">Documents</p>
          {profile.files.length > 0 ? (
            <div className="space-y-2">
              {profile.files.map((file) => (
                <div
                  key={file.name}
                  className="flex items-center justify-between gap-3 rounded-xl border border-border bg-muted/35 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {file.type} · {file.pages}{" "}
                      {file.pages === 1 ? "page" : "pages"}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled
                    title="Available once Phase 2 persists real submissions"
                  >
                    <Download className="size-4" /> Download
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <InlineAlert tone="warning">
              Links created but data not received. No submission is available
              for this profile yet.
            </InlineAlert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EditProfileDialog({
  profile,
  onSave,
}: {
  profile: DemoProfile;
  onSave: (updated: DemoProfile) => void;
}) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(profile);

  function openWithProfile(nextOpen: boolean) {
    if (nextOpen) setDraft(profile);
    setOpen(nextOpen);
  }

  function updateField<Key extends keyof DemoProfile>(
    key: Key,
    value: DemoProfile[Key],
  ) {
    setDraft((current) => {
      const next = { ...current, [key]: value };
      if (key === "sameAsPermanentAddress" && value === true) {
        next.residenceAddress = next.permanentAddress;
      }
      if (key === "permanentAddress" && next.sameAsPermanentAddress) {
        next.residenceAddress = value as string;
      }
      return next;
    });
  }

  return (
    <Dialog open={open} onOpenChange={openWithProfile}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          aria-label={`Update profile for ${profile.fullName}`}
        >
          <Pencil aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update profile</DialogTitle>
          <DialogDescription>
            Changes apply only to this tab&apos;s demonstration data and reset
            on refresh.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(draft);
            setOpen(false);
          }}
        >
          <div>
            <Label htmlFor={`edit-name-${profile.id}`}>Full name</Label>
            <Input
              id={`edit-name-${profile.id}`}
              className="mt-2"
              value={draft.fullName}
              onChange={(event) =>
                updateField("fullName", event.target.value)
              }
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor={`edit-age-${profile.id}`}>Age</Label>
              <Input
                id={`edit-age-${profile.id}`}
                type="number"
                min={0}
                max={120}
                className="mt-2"
                value={draft.age}
                onChange={(event) =>
                  updateField("age", Number(event.target.value))
                }
                required
              />
            </div>
            <div>
              <Label htmlFor={`edit-gender-${profile.id}`}>Gender</Label>
              <Select
                value={draft.gender}
                onValueChange={(value) =>
                  updateField("gender", value as Gender)
                }
              >
                <SelectTrigger id={`edit-gender-${profile.id}`} className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor={`edit-phone-${profile.id}`}>Phone number</Label>
            <Input
              id={`edit-phone-${profile.id}`}
              type="tel"
              className="mt-2"
              value={draft.phone}
              onChange={(event) => updateField("phone", event.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor={`edit-permanent-${profile.id}`}>
              Permanent address
            </Label>
            <Input
              id={`edit-permanent-${profile.id}`}
              className="mt-2"
              value={draft.permanentAddress}
              onChange={(event) =>
                updateField("permanentAddress", event.target.value)
              }
              required
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id={`edit-same-${profile.id}`}
              checked={draft.sameAsPermanentAddress}
              onCheckedChange={(checked) =>
                updateField("sameAsPermanentAddress", checked === true)
              }
            />
            <Label htmlFor={`edit-same-${profile.id}`} className="font-normal">
              Residence address is the same as permanent address
            </Label>
          </div>
          <div>
            <Label htmlFor={`edit-residence-${profile.id}`}>
              Residence address
            </Label>
            <Input
              id={`edit-residence-${profile.id}`}
              className="mt-2"
              value={draft.residenceAddress}
              disabled={draft.sameAsPermanentAddress}
              onChange={(event) =>
                updateField("residenceAddress", event.target.value)
              }
              required
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
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function DeleteProfileDialog({
  profile,
  onConfirm,
}: {
  profile: DemoProfile;
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
          aria-label={`Delete profile for ${profile.fullName}`}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete this profile?</DialogTitle>
          <DialogDescription>
            This removes {profile.fullName} from this tab&apos;s demonstration
            list only. Nothing is deleted from a server because Phase 1 has no
            backend or database.
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
            <Trash2 className="size-4" /> Delete profile
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function ProfileActionsCell({
  profile,
  onUpdate,
  onDelete,
}: {
  profile: DemoProfile;
  onUpdate: (updated: DemoProfile) => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <ViewProfileDialog profile={profile} />
      <EditProfileDialog profile={profile} onSave={onUpdate} />
      <DeleteProfileDialog profile={profile} onConfirm={onDelete} />
    </div>
  );
}
