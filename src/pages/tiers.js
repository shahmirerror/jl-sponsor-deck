import Tiers from '../pages_old/Tiers';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Tiers />
    </PublicLayout>
  );
}
