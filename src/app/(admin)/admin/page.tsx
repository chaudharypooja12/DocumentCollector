import Link from "next/link";
import {
  ArrowRight,
  Clock3,
  FileStack,
  LayoutDashboard,
  UserRound,
  Users2,
} from "lucide-react";
import { PageHeading } from "@/components/admin/page-heading";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { demoProfiles } from "@/data/admin-fixtures";

const totalProfiles = demoProfiles.length;
const pendingProfiles = demoProfiles.filter(
  (profile) => profile.status === "Pending",
).length;
const maleUsers = demoProfiles.filter(
  (profile) => profile.gender === "Male",
).length;
const femaleUsers = demoProfiles.filter(
  (profile) => profile.gender === "Female",
).length;

export default function AdminDashboard() {
  return (
    <>
      <PageHeading
        title="Dashboard"
        icon={LayoutDashboard}
        action={
          <Button asChild>
            <Link href="/admin/requests/new">
              Create request <ArrowRight className="size-4" />
            </Link>
          </Button>
        }
      />

      <TooltipProvider>
        <section
          aria-label="Overview"
          className="grid grid-cols-2 gap-4 xl:grid-cols-4"
        >
          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total profiles
                </p>
                <p className="mt-2 text-3xl font-bold">{totalProfiles}</p>
              </div>
              <span className="rounded-xl bg-muted p-2.5 text-primary">
                <Users2 className="size-5" aria-hidden="true" />
              </span>
            </div>
            <Button asChild variant="link" size="sm" className="mt-3 px-0">
              <Link href="/admin/users">
                View <ArrowRight className="size-3.5" />
              </Link>
            </Button>
          </Card>

          <Tooltip>
            <TooltipTrigger asChild>
              <Card className="cursor-help">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="mt-2 text-3xl font-bold">
                      {pendingProfiles}
                    </p>
                  </div>
                  <span className="rounded-xl bg-muted p-2.5 text-warning">
                    <Clock3 className="size-5" aria-hidden="true" />
                  </span>
                </div>
              </Card>
            </TooltipTrigger>
            <TooltipContent>
              Links created but data not received
            </TooltipContent>
          </Tooltip>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Male users</p>
                <p className="mt-2 text-3xl font-bold">{maleUsers}</p>
              </div>
              <span className="rounded-xl bg-muted p-2.5 text-blue-700 dark:text-blue-300">
                <UserRound className="size-5" aria-hidden="true" />
              </span>
            </div>
          </Card>

          <Card>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Female users</p>
                <p className="mt-2 text-3xl font-bold">{femaleUsers}</p>
              </div>
              <span className="rounded-xl bg-muted p-2.5 text-primary">
                <FileStack className="size-5" aria-hidden="true" />
              </span>
            </div>
          </Card>
        </section>
      </TooltipProvider>
    </>
  );
}
