"use client";

import { UserRound } from "lucide-react";
import { useMemo, useState } from "react";
import { DataTable, type DataTableColumn } from "@/components/admin/data-table";
import { PageHeading } from "@/components/admin/page-heading";
import { ProfileActionsCell } from "@/components/admin/profile-actions";
import { ReactivationDemo } from "@/components/admin/reactivation-demo";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  demoProfiles,
  type DemoProfile,
  type Gender,
  type ProfileStatus,
} from "@/data/admin-fixtures";

const statusFilters: Array<ProfileStatus | "All"> = [
  "All",
  "Pending",
  "In progress",
  "Submitted",
];
const genderFilters: Array<Gender | "All"> = ["All", "Male", "Female"];

function statusTone(status: ProfileStatus) {
  return status === "Submitted"
    ? "success"
    : status === "In progress"
      ? "brand"
      : "neutral";
}

export default function UsersPage() {
  const [profiles, setProfiles] = useState<DemoProfile[]>(demoProfiles);
  const [statusFilter, setStatusFilter] = useState<ProfileStatus | "All">(
    "All",
  );
  const [genderFilter, setGenderFilter] = useState<Gender | "All">("All");

  const filteredProfiles = useMemo(
    () =>
      profiles.filter(
        (profile) =>
          (statusFilter === "All" || profile.status === statusFilter) &&
          (genderFilter === "All" || profile.gender === genderFilter),
      ),
    [profiles, statusFilter, genderFilter],
  );

  const columns: DataTableColumn<DemoProfile>[] = useMemo(
    () => [
      {
        id: "fullName",
        header: "Full name",
        value: (profile) => profile.fullName,
        cell: (profile) => (
          <span className="font-semibold">{profile.fullName}</span>
        ),
      },
      { id: "age", header: "Age", value: (profile) => profile.age },
      { id: "gender", header: "Gender", value: (profile) => profile.gender },
      { id: "phone", header: "Phone", value: (profile) => profile.phone },
      { id: "country", header: "Country", value: (profile) => profile.country },
      {
        id: "documents",
        header: "Documents",
        value: (profile) => profile.documentsRequired,
      },
      {
        id: "status",
        header: "Status",
        value: (profile) => profile.status,
        cell: (profile) => (
          <Badge tone={statusTone(profile.status)}>{profile.status}</Badge>
        ),
      },
      { id: "updated", header: "Updated", value: (profile) => profile.updatedAt },
      {
        id: "actions",
        header: "Actions",
        value: () => "",
        searchable: false,
        exportable: false,
        cell: (profile) => (
          <ProfileActionsCell
            profile={profile}
            onUpdate={(updated) =>
              setProfiles((current) =>
                current.map((item) =>
                  item.id === updated.id ? updated : item,
                ),
              )
            }
            onDelete={() =>
              setProfiles((current) =>
                current.filter((item) => item.id !== profile.id),
              )
            }
          />
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeading title="Users" icon={UserRound} demo />

      <DataTable
        caption="Profiles"
        columns={columns}
        rows={filteredProfiles}
        rowKey={(profile) => profile.id}
        searchPlaceholder="Search profiles"
        exportFileName="documentcollector-demo-profiles.csv"
        filters={
          <>
            <Select
              value={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as ProfileStatus | "All")
              }
            >
              <SelectTrigger className="min-h-11 w-full rounded-xl sm:w-44">
                <SelectValue aria-label="Status filter" />
              </SelectTrigger>
              <SelectContent>
                {statusFilters.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status === "All" ? "All statuses" : status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={genderFilter}
              onValueChange={(value) =>
                setGenderFilter(value as Gender | "All")
              }
            >
              <SelectTrigger className="min-h-11 w-full rounded-xl sm:w-44">
                <SelectValue aria-label="Gender filter" />
              </SelectTrigger>
              <SelectContent>
                {genderFilters.map((gender) => (
                  <SelectItem key={gender} value={gender}>
                    {gender === "All" ? "All genders" : gender}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </>
        }
      />

      <ReactivationDemo />
    </>
  );
}
