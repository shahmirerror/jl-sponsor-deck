import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const Settings = dynamic(() => import('../../pages_old/portal/Settings'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SettingsPage() {
  return <AdminPortalShell renderPage={(user) => <Settings user={user} />} />;
}
