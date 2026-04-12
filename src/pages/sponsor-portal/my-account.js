import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import MyAccount from '../../pages_old/sponsor-portal/MyAccount';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorMyAccountPage() {
  return <SponsorPortalShell renderPage={(sponsor, accountActions) => <MyAccount sponsor={sponsor} accountActions={accountActions} />} />;
}
