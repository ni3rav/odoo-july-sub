"use client"

import { useQuery } from "@tanstack/react-query"
import { api } from "@/lib/server"
import type { UserPermissionGrant } from "@/lib/nav-permissions"

export const USER_PERMISSIONS_QUERY_KEY = ["user-permissions"] as const

async function fetchUserPermissions() {
  const { data, error } = await api.api.rbac.me.permissions.get()
  if (error) {
    throw new Error("Failed to load permissions")
  }
  return (data.permissions ?? []) as UserPermissionGrant[]
}

export function useUserPermissions(initialPermissions: UserPermissionGrant[]) {
  return useQuery({
    queryKey: USER_PERMISSIONS_QUERY_KEY,
    queryFn: fetchUserPermissions,
    initialData: initialPermissions,
    staleTime: 0,
    refetchOnWindowFocus: true,
  })
}
