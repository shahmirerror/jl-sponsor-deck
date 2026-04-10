import dynamic from 'next/dynamic';
import SponsorPortalShell from '../../components/layout/SponsorPortalShell';

const MyAccount = dynamic(() => import('../../pages_old/sponsor-portal/MyAccount'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorMyAccountPage() {
  return <SponsorPortalShell renderPage={(sponsor, accountActions) => <MyAccount sponsor={sponsor} accountActions={accountActions} />} />;
}
