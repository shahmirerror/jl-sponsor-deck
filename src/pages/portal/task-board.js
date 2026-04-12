import AdminPortalShell from '../../components/layout/AdminPortalShell';
import TaskBoard from '../../pages_old/portal/SponsorsTable';

export async function getServerSideProps() {
  return { props: {} };
}

export default function TaskBoardPage() {
  return <AdminPortalShell renderPage={(user) => <TaskBoard user={user} />} />;
}
