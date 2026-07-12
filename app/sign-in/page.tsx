"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Password from "@/components/ui/password-input"
import { signIn } from "@/lib/auth-client"
import { type SignInInput, signInSchema } from "@/modules/auth"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import {
  Truck,
  ShieldCheck,
  UserCheck,
  ShieldAlert,
  BarChart3,
} from "lucide-react"

const DEMO_ROLES = [
  {
    slug: "FleetManager",
    label: "Fleet Manager",
    description: "Manage vehicles and drivers",
    icon: Truck,
  },
  {
    slug: "Dispatcher",
    label: "Dispatcher",
    description: "Assign trips and status",
    icon: UserCheck,
  },
  {
    slug: "SafetyOfficer",
    label: "Safety Officer",
    description: "Review driver safety",
    icon: ShieldCheck,
  },
  {
    slug: "FinancialAnalyst",
    label: "Financial Analyst",
    description: "Fuel and expense analytics",
    icon: BarChart3,
  },
]

export default function SignInPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [demoLoading, setDemoLoading] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignInInput) {
    setError(null)
    const result = await signIn(data.email, data.password)

    if (result.error) {
      setError(result.error.message ?? "Invalid email or password")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  async function handleDemoSignIn(roleSlug: string) {
    setError(null)
    setDemoLoading(roleSlug)

    try {
      const res = await fetch("/api/auth/demo-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleSlug }),
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error ?? "Failed to configure demo user")
      }

      const credentials = await res.json()
      setValue("email", credentials.email)
      setValue("password", credentials.password)

      const result = await signIn(credentials.email, credentials.password)
      if (result.error) {
        throw new Error(result.error.message ?? "Failed to sign in demo user")
      }

      router.push("/dashboard")
      router.refresh()
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Something went wrong setting up demo"
      setError(errorMessage)
    } finally {
      setDemoLoading(null)
    }
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-background p-6 md:p-10">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Truck className="h-6 w-6" />
          </div>
          <span>TransitOps</span>
        </div>

        <div className="mx-auto my-8 w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage your fleet operations and compliance.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email address</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                autoComplete="email"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Password
                id="password"
                label="Password"
                placeholder="••••••••"
                autoComplete="current-password"
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="h-10 w-full"
              disabled={isSubmitting || !!demoLoading}
            >
              {(isSubmitting || !!demoLoading) && (
                <Spinner className="mr-2 h-4 w-4" />
              )}
              Sign in
            </Button>
          </form>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="mx-4 flex-shrink text-xs tracking-wider text-muted-foreground uppercase">
              Quick Sandbox Sign-In
            </span>
            <div className="flex-grow border-t border-border"></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {DEMO_ROLES.map((roleInfo) => {
              const IconComp = roleInfo.icon
              const isRoleLoading = demoLoading === roleInfo.slug
              return (
                <button
                  key={roleInfo.slug}
                  onClick={() => handleDemoSignIn(roleInfo.slug)}
                  disabled={isSubmitting || !!demoLoading}
                  type="button"
                  className="group flex flex-col items-start rounded-lg border border-border bg-card p-3 text-left transition-all duration-200 hover:bg-accent hover:text-accent-foreground focus:ring-2 focus:ring-ring focus:outline-none disabled:pointer-events-none disabled:opacity-50"
                >
                  <div className="mb-1 flex w-full items-center justify-between">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary/5 text-primary group-hover:bg-primary/10">
                      <IconComp className="h-4 w-4" />
                    </div>
                    {isRoleLoading && <Spinner className="h-3 w-3" />}
                  </div>
                  <span className="text-xs font-semibold text-card-foreground">
                    {roleInfo.label}
                  </span>
                  <span className="mt-0.5 text-[10px] leading-tight text-muted-foreground">
                    {roleInfo.description}
                  </span>
                </button>
              )
            })}
          </div>

          <p className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link
              href="/sign-up"
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TransitOps. All rights reserved.
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login_bg.png"
          alt="TransitOps Operations"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-black/80 via-transparent to-transparent p-12">
          <blockquote className="space-y-2 text-white">
            <p className="text-lg font-medium">
              &ldquo;TransitOps gives our operations crew real-time fleet
              utilization insights, ensuring absolute driver compliance and
              automated dispatch workflows.&rdquo;
            </p>
            <footer className="text-sm font-semibold opacity-80">
              Fleet Operations Director
            </footer>
          </blockquote>
        </div>
      </div>
    </div>
  )
}
