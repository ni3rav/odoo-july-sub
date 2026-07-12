import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function getSession() {
  const hdrs = await headers()
  const session = await auth.api.getSession({
    headers: hdrs,
  })
  return session
}

export async function requireSession() {
  const session = await getSession()
  if (!session) {
    redirect("/sign-in")
  }
  return session
}

export async function optionalSession() {
  const session = await getSession()
  return session
}
