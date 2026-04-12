import AdminPortalShell from '../../components/layout/AdminPortalShell';
import DeliverablesTracker from '../../pages_old/portal/DeliverablesTracker';

export async function getServerSideProps() {
  return { props: {} };
}

export default function PortalDeliverablesPage() {
  return <AdminPortalShell renderPage={(user) => <DeliverablesTracker user={user} />} />;
}
