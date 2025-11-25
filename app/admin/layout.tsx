import { AdminLayout } from "@/components/admin/AdminLayout"
import { ConfirmationProvider } from "@/components/admin/confirmation-provider"
import { SubscriptionStatusBanner } from "@/components/subscription-status-banner"

export default function AdminLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ConfirmationProvider>
      <SubscriptionStatusBanner />
      <AdminLayout>{children}</AdminLayout>
    </ConfirmationProvider>
  )
}
