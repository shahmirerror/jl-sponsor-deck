import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';
import SponsorPortalShell from '../components/layout/SponsorPortalShell';

// Dynamic imports for sponsor portal pages
const SponsorDashboard = dynamic(() => import('./sponsor-portal/SponsorDashboard'));
const DeliverablePipeline = dynamic(() => import('./sponsor-portal/DeliverablePipeline'));
const AssetRepository = dynamic(() => import('./sponsor-portal/AssetRepository'));
const FinancialLedger = dynamic(() => import('./sponsor-portal/FinancialLedger'));
const ProofOfExecution = dynamic(() => import('./sponsor-portal/ProofOfExecution'));
const SupportChannel = dynamic(() => import('./sponsor-portal/SupportChannel'));

const SponsorPortal = () => {
    const router = useRouter();
    const renderPage = (sponsor) => {
        if (router.pathname === '/sponsor-portal/deliverables') {
            return <DeliverablePipeline sponsor={sponsor} />;
        }
        if (router.pathname === '/sponsor-portal/documents') {
            return <AssetRepository sponsor={sponsor} />;
        }
        if (router.pathname === '/sponsor-portal/ledger') {
            return <FinancialLedger sponsor={sponsor} />;
        }
        if (router.pathname === '/sponsor-portal/social-proof') {
            return <ProofOfExecution sponsor={sponsor} />;
        }
        if (router.pathname === '/sponsor-portal/support') {
            return <SupportChannel sponsor={sponsor} />;
        }
        return <SponsorDashboard sponsor={sponsor} />;
    };

    return <SponsorPortalShell renderPage={renderPage} />;
};

export default SponsorPortal;
