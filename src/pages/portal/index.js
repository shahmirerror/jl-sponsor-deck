import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const Dashboard = dynamic(() => import('../../pages_old/portal/Dashboard'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function PortalIndexPage() {
  return <AdminPortalShell renderPage={(user) => <Dashboard user={user} />} />;
}
