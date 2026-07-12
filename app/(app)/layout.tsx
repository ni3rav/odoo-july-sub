import { AppShell } from "@/components/app-shell"
import { requireSession } from "@/lib/auth-guard"
import { getUserPermissions } from "@/modules/rbac/rbac.service"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await requireSession()
  const permissions = await getUserPermissions(session.user.id)

  return (
    <AppShell user={session.user} initialPermissions={permissions}>
      {children}
    </AppShell>
  )
}
