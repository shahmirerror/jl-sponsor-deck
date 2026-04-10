import PreviousSponsors from '../pages_old/PreviousSponsors';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <PreviousSponsors />
    </PublicLayout>
  );
}
