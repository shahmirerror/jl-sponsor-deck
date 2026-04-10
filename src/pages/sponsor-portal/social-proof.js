import dynamic from 'next/dynamic';
import SponsorPortalShell from '../../components/layout/SponsorPortalShell';

const ProofOfExecution = dynamic(() => import('../../pages_old/sponsor-portal/ProofOfExecution'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorSocialProofPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <ProofOfExecution sponsor={sponsor} />} />;
}
