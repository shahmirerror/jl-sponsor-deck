import Partners from '../pages_old/Partners';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Partners />
    </PublicLayout>
  );
}
