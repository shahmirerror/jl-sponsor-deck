import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import SupportChannel from '../../pages_old/sponsor-portal/SupportChannel';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorSupportPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <SupportChannel sponsor={sponsor} />} />;
}
