import Events from '../pages_old/Events';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Events />
    </PublicLayout>
  );
}
