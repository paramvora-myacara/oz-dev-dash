import React from 'react';
import { Zap } from 'lucide-react';

interface EventEditorProps {
    data: any;
    onChange: (data: any) => void;
}

export default function EventEditor({ data, onChange }: EventEditorProps) {
    const eventCategories = {
        'OZ Checking': [
            { label: 'OZ Check Performed', value: 'oz_check_performed' },
            { label: 'OZ Check Completed', value: 'oz_check_completed' },
        ],
        'Listings & Properties': [
            { label: 'Viewed Listings', value: 'viewed_listings' },
            { label: 'Listing Clicked', value: 'listing_clicked' },
            { label: 'Listing Inquiry Started', value: 'listing_inquiry_started' },
            { label: 'Listing Inquiry Submitted', value: 'listing_inquiry_submitted' },
        ],
        'User Engagement & Conversion': [
            { label: 'Community Interest Expressed', value: 'community_interest_expressed' },
            { label: 'Schedule Call Page View', value: 'schedule_call_page_view' },
            { label: 'Dashboard Accessed', value: 'dashboard_accessed' },
            { label: 'Investor Qualification Submitted', value: 'investor_qualification_submitted' },
        ],
        'Investment Page': [
            { label: 'Viewed Invest Page', value: 'viewed_invest_page' },
            { label: 'Invest Page Button Clicked', value: 'invest_page_button_clicked' },
            { label: 'Invest Reason Clicked', value: 'invest_reason_clicked' },
        ],
        'Financial Tools': [
            { label: 'Tax Calculator Used', value: 'tax_calculator_used' },
            { label: 'Tax Calculator Button Clicked', value: 'tax_calculator_button_clicked' },
            { label: 'OZ Check Button Clicked', value: 'oz_check_button_clicked' },
        ],
        'Dev / Partner': [
            { label: 'User Signed In', value: 'page_view' },
            { label: 'Request Vault Access', value: 'request_vault_access' },
        ],
        'Book & Lead Magnet': [
            { label: 'Book Purchase Click', value: 'book_purchase_click' },
            { label: 'Book Secondary CTA Click', value: 'book_secondary_cta_click' },
            { label: 'Book Lead Magnet Click', value: 'book_lead_magnet_click' },
        ],
        'Webinar': [
            { label: 'Webinar Navigation', value: 'webinar_navigation' },
            { label: 'Webinar Scroll to Final CTA', value: 'webinar_scroll_to_final_cta' },
            { label: 'Webinar Registration Click', value: 'webinar_registration_click' },
            { label: 'Webinar Signup', value: 'webinar_signup' },
        ]
    };

    const handleEventChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedValue = e.target.value;
        let selectedLabel = selectedValue;

        // Find the label for the selected value
        for (const category of Object.values(eventCategories)) {
            const found = category.find(t => t.value === selectedValue);
            if (found) {
                selectedLabel = found.label;
                break;
            }
        }

        onChange({
            ...data,
            label: selectedLabel,
            eventType: selectedValue
        });
    };

    return (
        <div className="p-4 overflow-auto h-full">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-green-100">
                    <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                    <h2 className="text-lg font-bold text-gray-900">Event Configuration</h2>
                    <p className="text-sm text-gray-500">Configure the event for this node.</p>
                </div>
            </div>

            <div className="space-y-4 max-w-2xl">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Select Event Type
                    </label>
                    <select
                        value={data.eventType || ''}
                        onChange={handleEventChange}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm p-2 border bg-white"
                    >
                        <option value="" disabled>Select an event...</option>
                        {Object.entries(eventCategories).map(([category, triggers]) => (
                            <optgroup key={category} label={category}>
                                {triggers.map((trigger) => (
                                    <option key={trigger.value} value={trigger.value}>
                                        {trigger.label} ({trigger.value})
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-100 rounded-lg text-sm text-gray-600 space-y-2">
                    <p className="font-semibold text-gray-700">How it works:</p>
                    <p>In a batch campaign, event nodes are used to check if a user has performed a specific action. You can connect this node to a <span className="font-medium text-purple-700">Switch</span> node to branch the flow based on whether the action was taken.</p>
                </div>
            </div>
        </div>
    );
}
