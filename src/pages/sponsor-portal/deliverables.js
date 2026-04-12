import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import DeliverablePipeline from '../../pages_old/sponsor-portal/DeliverablePipeline';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorDeliverablesPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <DeliverablePipeline sponsor={sponsor} />} />;
}
