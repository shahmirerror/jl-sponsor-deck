import SponsorPortalShell from '../../components/layout/SponsorPortalShell';
import FinancialLedger from '../../pages_old/sponsor-portal/FinancialLedger';

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorLedgerPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <FinancialLedger sponsor={sponsor} />} />;
}
