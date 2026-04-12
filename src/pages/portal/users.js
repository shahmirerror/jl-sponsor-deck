import AdminPortalShell from '../../components/layout/AdminPortalShell';
import UserManagement from '../../pages_old/portal/UserManagement';

export async function getServerSideProps() {
  return { props: {} };
}

export default function UsersPage() {
  return <AdminPortalShell renderPage={(user) => <UserManagement user={user} />} />;
}
