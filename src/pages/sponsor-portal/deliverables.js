import dynamic from 'next/dynamic';
import SponsorPortalShell from '../../components/layout/SponsorPortalShell';

const DeliverablePipeline = dynamic(() => import('../../pages_old/sponsor-portal/DeliverablePipeline'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorDeliverablesPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <DeliverablePipeline sponsor={sponsor} />} />;
}
