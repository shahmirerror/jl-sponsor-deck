import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import AssetRepository from '../../pages_old/sponsor-portal/AssetRepository';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorDocumentsPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <AssetRepository sponsor={sponsor} />} />;
}
