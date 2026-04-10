import CareerFair from '../pages_old/CareerFair';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <CareerFair />
    </PublicLayout>
  );
}
