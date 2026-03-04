'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleTable } from './PeopleTable';
import { CompaniesTable } from './CompaniesTable';
import { PropertiesTable } from './PropertiesTable';
import { EntitySheet } from './EntitySheet';
import { AddCRMContactModal } from './AddCRMContactModal';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { getCampaigns } from '@/lib/api/campaigns-backend';
import { type Campaign } from '@/types/email-editor';

import { CampaignsTab } from './CampaignsTab';
import { LinkedInOutreachTab } from './LinkedInOutreachTab';
import LeaderboardTab from '@/components/prospects/LeaderboardTab';

export function CRMDashboard() {
    const [activeTab, setActiveTab] = useState('people');
    const [sheetStack, setSheetStack] = useState<{ type: string, id: string, data: any }[]>([]);
    const [currentUser, setCurrentUser] = useState<string | null>(null);
    const [isPasswordVerified, setIsPasswordVerified] = useState(false);
    const [tempSelectedUser, setTempSelectedUser] = useState<string | null>(null);
    const [passwordInput, setPasswordInput] = useState('');
    const [passwordError, setPasswordError] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [showAddContactModal, setShowAddContactModal] = useState(false);
    const [peopleTableKey, setPeopleTableKey] = useState(0);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    useEffect(() => {
        setMounted(true);
        const savedUser = localStorage.getItem('prospect_current_user');
        if (savedUser) {
            setCurrentUser(savedUser);
            setIsPasswordVerified(true);
        }

        // Fetch campaigns for filters
        getCampaigns().then(setCampaigns).catch(err => console.error('Failed to fetch campaigns', err));
    }, []);

    const acquireLock = async (type: string, id: string) => {
        const routeType = type === 'person' ? 'people' : type === 'company' ? 'companies' : 'properties';
        const lockRes = await fetch(`/api/crm/${routeType}/${id}/lock`, {
            method: 'POST',
            body: JSON.stringify({ userName: currentUser }),
        });

        if (!lockRes.ok) {
            if (lockRes.status === 409) {
                const lockError = await lockRes.json().catch(() => ({}));
                alert(lockError.error || 'This record is currently being viewed by another user.');
                return false;
            }
            return false;
        }
        return true;
    };

    const releaseLock = async (type: string, id: string, keepalive = false) => {
        const routeType = type === 'person' ? 'people' : type === 'company' ? 'companies' : 'properties';
        await fetch(`/api/crm/${routeType}/${id}/lock`, {
            method: 'DELETE',
            body: JSON.stringify({ userName: currentUser }),
            keepalive,
        }).catch(() => null);
    };

    const openSheet = async (type: string, id: string, data: any) => {
        if (!currentUser) return;
        const lockOk = await acquireLock(type, id);
        if (!lockOk) return;
        setSheetStack(prev => [...prev, { type, id, data }]);
    };

    const closeLatestSheet = async () => {
        const latest = sheetStack[sheetStack.length - 1];
        if (latest) {
            await releaseLock(latest.type, latest.id);
        }
        setSheetStack(prev => prev.slice(0, -1));
    };

    const closeAllSheets = async () => {
        await Promise.all(sheetStack.map((sheet) => releaseLock(sheet.type, sheet.id)));
        setSheetStack([]);
    };

    useEffect(() => {
        return () => {
            sheetStack.forEach((sheet) => {
                releaseLock(sheet.type, sheet.id, true);
            });
        };
    }, [sheetStack]);

    const handleSelectUser = (user: string) => {
        setTempSelectedUser(user);
        setPasswordInput('');
        setPasswordError(false);
    };

    const handleVerifyPassword = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!tempSelectedUser) return;
        const expectedPassword = tempSelectedUser.toLowerCase();
        if (passwordInput === expectedPassword) {
            setCurrentUser(tempSelectedUser);
            setIsPasswordVerified(true);
            localStorage.setItem('prospect_current_user', tempSelectedUser);
            setTempSelectedUser(null);
            setPasswordInput('');
            setPasswordError(false);
        } else {
            setPasswordError(true);
        }
    };

    return (
        <div className="w-full">
            <div className="mb-4 flex items-center gap-3">
                <h2 className="text-lg font-semibold text-gray-900">
                    {currentUser && isPasswordVerified ? `Calling as ${currentUser}` : 'CRM Directory'}
                </h2>
                {currentUser && isPasswordVerified && (
                    <>
                        <Button
                            variant="link"
                            size="sm"
                            className="text-blue-600 h-auto p-0"
                            onClick={() => {
                                setCurrentUser(null);
                                setIsPasswordVerified(false);
                                localStorage.removeItem('prospect_current_user');
                            }}
                        >
                            (Change)
                        </Button>
                        <Button
                            onClick={() => setShowAddContactModal(true)}
                            className="bg-blue-600 text-white hover:bg-blue-700 h-9 px-4 font-medium rounded-md"
                        >
                            Add Contact
                        </Button>
                    </>
                )}
            </div>
            <Tabs defaultValue="people" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="people">People</TabsTrigger>
                    <TabsTrigger value="companies">Companies</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                    <TabsTrigger value="campaigns">Email Campaigns</TabsTrigger>
                    <TabsTrigger value="linkedin">LinkedIn Outreach</TabsTrigger>
                    <TabsTrigger value="leaderboard">Call Leaderboard</TabsTrigger>
                </TabsList>
                <TabsContent value="people" className="w-full">
                    <PeopleTable
                        key={peopleTableKey}
                        currentUser={currentUser}
                        onRowClick={(data: any) => openSheet('person', data.id, data)}
                        campaigns={campaigns}
                    />
                </TabsContent>
                <TabsContent value="companies" className="w-full">
                    <CompaniesTable currentUser={currentUser} onRowClick={(data: any) => openSheet('company', data.id, data)} />
                </TabsContent>
                <TabsContent value="properties" className="w-full">
                    <PropertiesTable currentUser={currentUser} onRowClick={(data: any) => openSheet('property', data.id, data)} />
                </TabsContent>
                <TabsContent value="campaigns" className="w-full">
                    <CampaignsTab />
                </TabsContent>
                <TabsContent value="linkedin" className="w-full">
                    <LinkedInOutreachTab currentUser={currentUser} />
                </TabsContent>
                <TabsContent value="leaderboard" className="w-full">
                    <div className="bg-white rounded-2xl border shadow-sm p-6">
                        <LeaderboardTab />
                    </div>
                </TabsContent>
            </Tabs>

            {sheetStack.map((sheet, index) => (
                <EntitySheet
                    key={`${sheet.type}-${sheet.id}-${index}`}
                    sheet={sheet}
                    index={index}
                    onClose={index === sheetStack.length - 1 ? closeLatestSheet : undefined}
                    onOpenRelated={openSheet}
                    closeAll={closeAllSheets}
                    currentUser={currentUser}
                />
            ))}

            <AddCRMContactModal
                open={showAddContactModal}
                onOpenChange={setShowAddContactModal}
                onCreated={() => setPeopleTableKey((k) => k + 1)}
            />

            {mounted && (!currentUser || !isPasswordVerified) && (
                <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-card border rounded-lg shadow-lg max-w-md w-full p-6 space-y-6">
                        {!tempSelectedUser ? (
                            <>
                                <div className="space-y-2 text-center">
                                    <h2 className="text-2xl font-bold">Who are you?</h2>
                                    <p className="text-muted-foreground">Select your name to access CRM outreach tools.</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {['Jeff', 'Todd', 'Michael', 'Param', 'Aryan'].map(name => (
                                        <Button key={name} variant="outline" size="lg" className="h-20 text-xl" onClick={() => handleSelectUser(name)}>
                                            {name}
                                        </Button>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="space-y-4">
                                <div className="space-y-2 text-center">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="float-left -ml-2 h-8"
                                        onClick={() => setTempSelectedUser(null)}
                                    >
                                        <ChevronLeft className="h-4 w-4 mr-1" /> Back
                                    </Button>
                                    <div className="clear-both pt-2">
                                        <h2 className="text-2xl font-bold">Hello {tempSelectedUser}</h2>
                                        <p className="text-muted-foreground">Please enter your password to continue.</p>
                                    </div>
                                </div>
                                <form onSubmit={handleVerifyPassword} className="space-y-4">
                                    <div className="space-y-2">
                                        <input
                                            type="password"
                                            className={`w-full p-3 bg-background border rounded-md focus:outline-none focus:ring-2 ${passwordError ? 'border-red-500 focus:ring-red-500' : 'focus:ring-blue-500'}`}
                                            placeholder="Enter password"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            autoFocus
                                        />
                                        {passwordError && (
                                            <p className="text-red-500 text-sm">Incorrect password. Please try again.</p>
                                        )}
                                    </div>
                                    <Button type="submit" className="w-full py-6 text-lg">
                                        Verify & Start
                                    </Button>
                                </form>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
