import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export interface LinkedInSearchResult {
    id: string;
    profile_url: string;
    profile_name: string;
    profile_title?: string;
    profile_company?: string;
    profile_location?: string;
    profile_image_url?: string;
    rank: number;
    selected?: boolean;
}

interface LinkedInProfileSelectorProps {
    callId: string;
    onSelect: () => void;
    initialResults?: LinkedInSearchResult[];
}

export function LinkedInProfileSelector({ callId, onSelect, initialResults }: LinkedInProfileSelectorProps) {
    const [results, setResults] = useState<LinkedInSearchResult[]>(initialResults || []);
    const [loading, setLoading] = useState(!initialResults);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (initialResults) return;

        setLoading(true);
        fetch(`/api/linkedin/search-results?callId=${callId}`)
            .then(res => res.json())
            .then(data => {
                if (data.error) throw new Error(data.error);
                setResults(data.data || []);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [callId, initialResults]);

    const handleSelect = async (result: LinkedInSearchResult) => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/linkedin/select-profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callId,
                    action: 'select',
                    profileUrl: result.profile_url,
                    profileName: result.profile_name
                }),
            });
            if (!res.ok) throw new Error('Failed to select');
            onSelect();
        } catch (err) {
            console.error(err);
            alert('Failed to save selection');
        } finally {
            setSubmitting(false);
        }
    };

    const handleNotFound = async () => {
        // Ask for confirmation potentially?
        if (!confirm('Mark as not found? This will stop automation for this call.')) return;
        setSubmitting(true);
        try {
            const res = await fetch('/api/linkedin/select-profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    callId,
                    action: 'not_found'
                }),
            });
            if (!res.ok) throw new Error('Failed');
            onSelect();
        } catch (err) {
            console.error(err);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div className="text-sm text-gray-500 animate-pulse">Loading profiles...</div>;
    if (error) return <div className="text-sm text-red-500">Error loading profiles: {error}</div>;

    if (results.length === 0) {
        return (
            <div className="text-center py-4 bg-gray-50 rounded">
                <p className="text-sm text-muted-foreground mb-2">No profiles found automatically.</p>
                <Button variant="outline" size="sm" onClick={handleNotFound} disabled={submitting}>
                    Mark as Not Found
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map(result => (
                    <div key={result.id} className="flex items-start gap-3 p-3 border rounded-md bg-card hover:border-blue-400 transition-colors">
                        <div className="h-10 w-10 bg-muted rounded-full flex-shrink-0 flex items-center justify-center text-muted-foreground font-bold overflow-hidden border">
                            {result.profile_image_url ? (
                                <img src={result.profile_image_url} alt="" className="h-full w-full object-cover" />
                            ) : (
                                result.profile_name.charAt(0)
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                                <a href={result.profile_url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline truncate block text-foreground">
                                    {result.profile_name}
                                </a>
                                <Badge variant="secondary" className="text-[10px]">Match #{result.rank}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground truncate">{result.profile_title || 'No title'}</p>
                            <p className="text-xs text-muted-foreground truncate">{result.profile_company || ''}</p>

                            <div className="mt-3 flex gap-2">
                                <Button
                                    size="sm"
                                    className="h-7 text-xs flex-1 bg-blue-600 hover:bg-blue-700 text-white"
                                    onClick={() => handleSelect(result)}
                                    disabled={submitting}
                                >
                                    Connect
                                </Button>
                                <a
                                    href={result.profile_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="h-7 px-3 text-xs flex items-center border rounded hover:bg-accent transition-colors"
                                >
                                    View
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-end pt-2">
                <Button variant="ghost" size="sm" className="text-xs text-muted-foreground hover:text-destructive" onClick={handleNotFound} disabled={submitting}>
                    None of these are correct (Stop Automation)
                </Button>
            </div>
        </div>
    );
}
