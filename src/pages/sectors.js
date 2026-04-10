import Sectors from '../pages_old/Sectors';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Sectors />
    </PublicLayout>
  );
}
