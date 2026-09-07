"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Info, LockKeyhole } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { BrandLockup } from "@/components/shared/brand-lockup";
import { ThemeToggle } from "@/components/shared/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { InlineAlert } from "@/components/ui/inline-alert";
import { Input } from "@/components/ui/input";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Enter at least 8 characters"),
});

type LoginForm = z.infer<typeof loginSchema>;

export function AdminLogin() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });
  const continueToWorkspace = handleSubmit(async () => {
    await Promise.resolve();
    router.push("/admin");
  });

  return (
    <div className="page-shell relative grid min-h-svh items-center gap-10 py-8 lg:grid-cols-2">
      <div className="absolute top-4 right-0">
        <ThemeToggle />
      </div>
      <section className="hidden lg:block">
        <BrandLockup href="/" />
        <p className="mt-12 text-xs font-semibold tracking-[0.18em] text-primary uppercase">
          Admin workspace
        </p>
        <h1 className="text-balance mt-4 max-w-xl text-5xl font-bold tracking-[-0.04em]">
          Build clear document requests in minutes.
        </h1>
        <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
          Configure the checklist, choose a short expiry, and move it to a phone
          through a link or QR code.
        </p>
      </section>

      <main className="mx-auto w-full max-w-md">
        <div className="mb-7 lg:hidden">
          <BrandLockup href="/" />
        </div>
        <Card>
          <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/12 text-primary">
            <LockKeyhole className="size-6" />
          </div>
          <h2 className="mt-6 text-2xl font-bold">Admin sign in</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Preview the Phase 1 Admin workspace.
          </p>

          <InlineAlert className="mt-5 flex items-start gap-3 text-xs">
            <Info className="mt-0.5 size-4 shrink-0" />
            This is a UI demonstration only. Credentials are validated in this
            tab, never sent or saved. Secure authentication begins in Phase 2.
          </InlineAlert>

          <form
            aria-label="Admin sign in preview"
            className="mt-6 space-y-5"
            onSubmit={continueToWorkspace}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Email</span>
              <Input
                type="email"
                autoComplete="email"
                placeholder="admin@mbways.com"
                {...register("email")}
                aria-invalid={Boolean(errors.email)}
              />
              {errors.email ? (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.email.message}
                </span>
              ) : null}
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">Password</span>
              <span className="relative block">
                <Input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter at least 8 characters"
                  className="pr-12"
                  {...register("password")}
                  aria-invalid={Boolean(errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" />
                  ) : (
                    <Eye className="size-4" />
                  )}
                </button>
              </span>
              {errors.password ? (
                <span className="mt-1 block text-xs text-destructive">
                  {errors.password.message}
                </span>
              ) : null}
            </label>
            <Button type="submit" loading={isSubmitting} className="w-full">
              Continue to workspace <ArrowRight className="size-4" />
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
