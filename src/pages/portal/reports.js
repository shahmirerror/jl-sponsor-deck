import AdminPortalShell from '../../components/layout/AdminPortalShell';
import Reports from '../../pages_old/portal/Reports';

export async function getServerSideProps() {
  return { props: {} };
}

export default function ReportsPage() {
  return <AdminPortalShell renderPage={(user) => <Reports user={user} />} />;
}
