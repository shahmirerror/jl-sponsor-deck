import AdminPortalShell from '../../components/layout/AdminPortalShell';
import Expenditures from '../../pages_old/portal/Expenditures';

export async function getServerSideProps() {
  return { props: {} };
}

export default function ExpendituresPage() {
  return <AdminPortalShell renderPage={(user) => <Expenditures user={user} />} />;
}
