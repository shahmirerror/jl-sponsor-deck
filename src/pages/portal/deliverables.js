import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const DeliverablesTracker = dynamic(() => import('../../pages_old/portal/DeliverablesTracker'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function PortalDeliverablesPage() {
  return <AdminPortalShell renderPage={(user) => <DeliverablesTracker user={user} />} />;
}
