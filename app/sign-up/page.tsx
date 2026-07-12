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
import { signUp } from "@/lib/auth-client"
import { type SignUpInput, signUpSchema } from "@/modules/auth"
import { useState } from "react"
import { Spinner } from "@/components/ui/spinner"
import { ShieldAlert } from "lucide-react"

export default function SignUpPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: SignUpInput) {
    setError(null)
    const result = await signUp(data.email, data.password, data.name)

    if (result.error) {
      setError(result.error.message ?? "Something went wrong")
      return
    }

    router.push("/dashboard")
    router.refresh()
  }

  return (
    <div className="grid min-h-screen w-full lg:grid-cols-2">
      <div className="flex flex-col justify-between bg-background p-6 md:p-10">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <div className="flex size-12 items-center justify-center rounded-lg overflow-hidden p-1">
            <img src="/light-icon-app.png" alt="TransitOps Logo" className="h-full w-full object-contain block dark:hidden" />
            <img src="/dark-icon-app.png" alt="TransitOps Logo" className="h-full w-full object-contain hidden dark:block" />
          </div>
          <span>TransitOps</span>
        </div>

        <div className="mx-auto my-8 w-full max-w-md space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Register to start setting up and managing your fleet.
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
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Alex Smith"
                autoComplete="name"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

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
                autoComplete="new-password"
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
              disabled={isSubmitting}
            >
              {isSubmitting && <Spinner className="mr-2 h-4 w-4" />}
              Sign up
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link
              href="/sign-in"
              className="font-semibold text-primary hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-muted-foreground">
          &copy; {new Date().getFullYear()} TransitOps. All rights reserved.
        </div>
      </div>

      <div className="relative hidden bg-muted lg:block">
        <Image
          src="/login_bg.jpg"
          alt="TransitOps Operations"
          fill
          priority
          className="object-cover brightness-90 grayscale dark:brightness-50"
        />
        <div className="absolute inset-0 flex flex-col justify-end bg-linear-to-t from-background/80 via-transparent to-transparent p-12">
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
