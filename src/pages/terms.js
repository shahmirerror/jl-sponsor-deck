import Terms from '../pages_old/Terms';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Terms />
    </PublicLayout>
  );
}
