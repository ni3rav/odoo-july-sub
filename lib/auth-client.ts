import { createAuthClient } from "better-auth/react"
import { tryCatch } from "./try-catch"

const authClient = createAuthClient()

export async function signIn(email: string, password: string) {
  return tryCatch(
    authClient.signIn.email({
      email,
      password,
      callbackURL: "/",
    })
  )
}

export async function signUp(email: string, password: string, name: string) {
  return tryCatch(
    authClient.signUp.email({
      email,
      password,
      name,
      callbackURL: "/",
    })
  )
}

export async function signOut() {
  return tryCatch(authClient.signOut())
}

export function useSession() {
  return authClient.useSession()
}
