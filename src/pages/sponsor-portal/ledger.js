import dynamic from 'next/dynamic';
import SponsorPortalShell from '../../components/layout/SponsorPortalShell';

const FinancialLedger = dynamic(() => import('../../pages_old/sponsor-portal/FinancialLedger'));

export async function getServerSideProps() {
  return { props: {} };
}

export default function SponsorLedgerPage() {
  return <SponsorPortalShell renderPage={(sponsor) => <FinancialLedger sponsor={sponsor} />} />;
}
