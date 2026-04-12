import AdminPortalShell from '../../components/layout/AdminPortalShell';
import BudgetTracker from '../../pages_old/portal/BudgetTracker';

export async function getServerSideProps() {
  return { props: {} };
}

export default function BudgetPage() {
  return <AdminPortalShell renderPage={(user) => <BudgetTracker user={user} />} />;
}
