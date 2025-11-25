import { LayoutWrapper } from "@/components/coach/layout-wrapper"
import { AuthGuard } from "@/components/auth-guard"

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard allowedRoles={['coach']}>
      <LayoutWrapper>{children}</LayoutWrapper>
    </AuthGuard>
  )
}
