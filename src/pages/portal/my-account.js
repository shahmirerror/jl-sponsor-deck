import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const MyAccount = dynamic(() => import('../../pages_old/portal/MyAccount'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function PortalMyAccountPage() {
  return <AdminPortalShell renderPage={(user, accountActions) => <MyAccount user={user} accountActions={accountActions} />} />;
}
