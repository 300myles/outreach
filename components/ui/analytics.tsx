import { Analytics as VercelAnalytics } from "@vercel/analytics/next"

export function Analytics() {
  return <VercelAnalytics />
}

export { Analytics as default }
