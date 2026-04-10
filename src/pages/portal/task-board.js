import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const TaskBoard = dynamic(() => import('../../pages_old/portal/SponsorsTable'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function TaskBoardPage() {
  return <AdminPortalShell renderPage={(user) => <TaskBoard user={user} />} />;
}
