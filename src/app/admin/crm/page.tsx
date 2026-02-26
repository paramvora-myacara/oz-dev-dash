import { Metadata } from 'next';
import { CRMDashboard } from './components/CRMDashboard';

export const metadata: Metadata = {
    title: 'CRM Data Viewer | OZ Listings',
    description: 'Consolidated CRM for People, Companies, and Properties',
};

export default function CRMPage() {
    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">CRM Directory</h2>
                <div className="flex items-center space-x-2">
                    {/* Global Actions can go here in the future */}
                </div>
            </div>
            <CRMDashboard />
        </div>
    );
}
