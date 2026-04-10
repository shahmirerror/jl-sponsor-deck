import dynamic from 'next/dynamic';
import AdminPortalShell from '../../components/layout/AdminPortalShell';

const Expenditures = dynamic(() => import('../../pages_old/portal/Expenditures'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function ExpendituresPage() {
  return <AdminPortalShell renderPage={(user) => <Expenditures user={user} />} />;
}
