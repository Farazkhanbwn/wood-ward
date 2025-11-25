import { Layout } from "@/components/sales/layout"
import { AuthGuard } from "@/components/auth-guard"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['sales']}>
      <Layout>{children}</Layout>
    </AuthGuard>
  )
}
