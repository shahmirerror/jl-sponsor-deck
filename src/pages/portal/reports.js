import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const Reports = dynamic(() => import('../../pages_old/portal/Reports'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function ReportsPage() {
  return <AdminPortalShell renderPage={(user) => <Reports user={user} />} />;
}
