import dynamic from 'next/dynamic';
import SponsorPortalShell from '../../components/layout/SponsorPortalShell';

const SponsorDashboard = dynamic(() => import('../../pages_old/sponsor-portal/SponsorDashboard'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorDashboardPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <SponsorDashboard sponsor={sponsor} />} />;
}
