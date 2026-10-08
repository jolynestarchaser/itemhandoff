import { Suspense } from 'react';
import HomeDashboard from '@/components/HomeDashboard';
import { getDepartmentStatsMap, getVehicleHandoffStats } from '@/lib/actions';

export const dynamic = 'force-dynamic';

export default async function Home() {
  const [deptStats, overallStats] = await Promise.all([
    getDepartmentStatsMap(),
    getVehicleHandoffStats(),
  ]);

  return (
    <Suspense>
      <HomeDashboard deptStats={deptStats} overallStats={overallStats} />
    </Suspense>
  );
}
