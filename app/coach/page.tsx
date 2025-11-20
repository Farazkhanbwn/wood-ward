import { redirect } from "next/navigation"

export default function HomePage() {
  // Redirect to the default tab (performance analytics)
  redirect("/coach/performance-analytics")
}
