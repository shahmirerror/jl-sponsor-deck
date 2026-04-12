import AdminPortalShell from '../../components/layout/AdminPortalShell';
import Settings from '../../pages_old/portal/Settings';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SettingsPage() {
  return <AdminPortalShell renderPage={(user) => <Settings user={user} />} />;
}
