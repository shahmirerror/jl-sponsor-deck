import Contact from '../pages_old/Contact';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <Contact />
    </PublicLayout>
  );
}
