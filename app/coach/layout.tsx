import { LayoutWrapper } from "@/components/coach/layout-wrapper"

export default function CoachLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <LayoutWrapper>{children}</LayoutWrapper>
}
