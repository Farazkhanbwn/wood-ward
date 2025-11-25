import { AdminLayout } from "@/components/admin/AdminLayout"
import { ConfirmationProvider } from "@/components/admin/confirmation-provider"
import { SubscriptionStatusBanner } from "@/components/subscription-status-banner"
import { AuthGuard } from "@/components/auth-guard"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['admin']}>
      <ConfirmationProvider>
        <SubscriptionStatusBanner />
        <AdminLayout>{children}</AdminLayout>
      </ConfirmationProvider>
    </AuthGuard>
  )
}
