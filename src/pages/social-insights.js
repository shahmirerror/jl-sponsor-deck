import SocialInsights from '../pages_old/SocialInsights';
import PublicLayout from '../components/layout/PublicLayout';

export async function getServerSideProps() {
  return { props: {} };
}

export default function Page() {
  return (
    <PublicLayout>
      <SocialInsights />
    </PublicLayout>
  );
}
