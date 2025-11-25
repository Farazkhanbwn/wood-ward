import { Layout } from "@/components/sales/layout"

export default function SalesLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <Layout>{children}</Layout>
}
