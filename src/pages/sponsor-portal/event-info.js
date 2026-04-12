import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import SponsorDashboard from '../../pages_old/sponsor-portal/SponsorDashboard';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorEventInfoPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <SponsorDashboard sponsor={sponsor} />} />;
}
