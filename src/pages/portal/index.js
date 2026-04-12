import AdminPortalShell from '../../components/layout/AdminPortalShell';
import Dashboard from '../../pages_old/portal/Dashboard';

export async function getServerSideProps() {
  return { props: {} };
}

export default function PortalIndexPage() {
  return <AdminPortalShell renderPage={(user) => <Dashboard user={user} />} />;
}
