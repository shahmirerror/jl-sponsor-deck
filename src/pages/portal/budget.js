import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const BudgetTracker = dynamic(() => import('../../pages_old/portal/BudgetTracker'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function BudgetPage() {
  return <AdminPortalShell renderPage={(user) => <BudgetTracker user={user} />} />;
}
