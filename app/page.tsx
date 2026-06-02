import DashboardClient from '@/components/DashboardClient';

// Dashboard is fully client-interactive (entrance animation, cursor tracking);
// no SEO benefit to static prerender.
export const dynamic = 'force-dynamic';

export default function Page() {
  return <DashboardClient />;
}
