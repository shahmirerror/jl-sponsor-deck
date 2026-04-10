import Home from '../pages_old/Home';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Home />
    </PublicLayout>
  );
}
