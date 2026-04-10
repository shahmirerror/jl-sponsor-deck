import Privacy from '../pages_old/Privacy';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Privacy />
    </PublicLayout>
  );
}
