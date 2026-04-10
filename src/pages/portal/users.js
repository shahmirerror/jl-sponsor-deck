import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const UserManagement = dynamic(() => import('../../pages_old/portal/UserManagement'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function UsersPage() {
  return <AdminPortalShell renderPage={(user) => <UserManagement user={user} />} />;
}
