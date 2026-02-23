'use client'

import React, { useState, useMemo } from 'react'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import Link from 'next/link'
import {
    ArrowLeft,
    Search,
    Users,
    Building2,
    ListTodo,
    CheckCircle2,
    XCircle,
    PauseCircle,
    PlayCircle,
    ExternalLink,
    Info,
    UserCheck,
    Zap
} from 'lucide-react'

// --- Mock Data ---

const MOCK_FIRMS = [
    { id: 'f1', name: 'Cascade Investment', aum: '$50B+', investmentPrefs: 'Real Estate, Tech, Sustainability', status: 'active' },
    { id: 'f2', name: 'Willett Advisors', aum: '$25B+', investmentPrefs: 'Diversified, Philanthropy', status: 'active' },
    { id: 'f3', name: 'Emerson Collective', aum: '$10B+', investmentPrefs: 'Impact, Education, Climate', status: 'active' },
    { id: 'f4', name: 'Blue Haven Initiative', aum: '$1B+', investmentPrefs: 'OZ, Clean Energy', status: 'blocked' },
    { id: 'f5', name: 'Bayshore Global Management', aum: '$30B+', investmentPrefs: 'Real Estate, Venture', status: 'active' },
    { id: 'f6', name: 'Vulcan Inc.', aum: '$20B+', investmentPrefs: 'CRE, Oceans, Science', status: 'active' },
    { id: 'f7', name: 'Soros Fund Management', aum: '$25B+', investmentPrefs: 'Global Macro, Social Change', status: 'active' },
]

const MOCK_CONTACTS = [
    { id: 'c1', firmId: 'f1', firstName: 'Michael', lastName: 'Larson', title: 'Chief Investment Officer', linkedinUrl: 'https://linkedin.com/in/larson' },
    { id: 'c2', firmId: 'f1', firstName: 'Sarah', lastName: 'Chen', title: 'VP Real Estate', linkedinUrl: 'https://linkedin.com/in/schen' },
    { id: 'c3', firmId: 'f2', firstName: 'Steven', lastName: 'Rattner', title: 'CEO', linkedinUrl: 'https://linkedin.com/in/srattner' },
    { id: 'c4', firmId: 'f3', firstName: 'Laurene', lastName: 'Powell Jobs', title: 'Founder', linkedinUrl: 'https://linkedin.com/in/lpjobs' },
    { id: 'c5', firmId: 'f5', firstName: 'Sergey', lastName: 'Brin', title: 'Principal', linkedinUrl: 'https://linkedin.com/in/sbrin' },
    { id: 'c6', firmId: 'f6', firstName: 'Jody', lastName: 'Allen', title: 'Chair', linkedinUrl: 'https://linkedin.com/in/jallen' },
    { id: 'c7', firmId: 'f7', firstName: 'George', lastName: 'Soros', title: 'Founder', linkedinUrl: 'https://linkedin.com/in/gsoros' },
    { id: 'c8', firmId: 'f1', firstName: 'David', lastName: 'Thompson', title: 'Director of Tax', linkedinUrl: '#' },
    { id: 'c9', firmId: 'f2', firstName: 'Elena', lastName: 'Rodriguez', title: 'Family Office Manager', linkedinUrl: '#' },
    { id: 'c10', firmId: 'f3', firstName: 'Marcus', lastName: 'Wong', title: 'Investment Associate', linkedinUrl: '#' },
]

const MOCK_TASKS = [
    { id: 't1', contactId: 'c1', firmId: 'f1', accountName: 'Jeff', status: 'queued', message: "Hi Michael - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies. After 25 years in CRE, I'm now working with leading OZ sponsors and startups in the US. I’d love to hear your thoughts on OZ investing and share what I’ve learned as well." },
    { id: 't2', contactId: 'c3', firmId: 'f2', accountName: 'Jeff', status: 'queued', message: "Hi Steven - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies..." },
    { id: 't3', contactId: 'c4', firmId: 'f3', accountName: 'Todd', status: 'queued', message: "Hi Laurene - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies..." },
    { id: 't4', contactId: 'c5', firmId: 'f5', accountName: 'Todd', status: 'queued', message: "Hi Sergey - I work with multiple family offices on Opportunity Zone legal, tax, and curated deal flow strategies..." },
    { id: 't5', contactId: 'c6', firmId: 'f6', accountName: 'Jeff', status: 'invited', executedAt: '2024-05-23T10:00:00Z' },
    { id: 't6', contactId: 'c7', firmId: 'f7', accountName: 'Todd', status: 'failed', executedAt: '2024-05-23T10:05:00Z' },
]

// --- Components ---

const StatusBadge = ({ status }: { status: string }) => {
    const variants: Record<string, { label: string, color: string, icon: any }> = {
        pending: { label: 'Pending', color: 'bg-slate-100 text-slate-700 border-slate-200', icon: PauseCircle },
        queued: { label: 'Queued', color: 'bg-blue-50 text-blue-700 border-blue-200', icon: ListTodo },
        connecting: { label: 'Connecting', color: 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse', icon: Zap },
        invited: { label: 'Invited', color: 'bg-green-50 text-green-700 border-green-200', icon: CheckCircle2 },
        failed: { label: 'Failed', color: 'bg-red-50 text-red-700 border-red-200', icon: XCircle },
        stopped: { label: 'Stopped', color: 'bg-gray-100 text-gray-500 border-gray-200', icon: PauseCircle },
    }

    const { label, color, icon: Icon } = variants[status] || variants.pending

    return (
        <Badge variant="outline" className={`flex w-fit items-center gap-1 font-medium ${color}`}>
            <Icon className="h-3 w-3" />
            {label}
        </Badge>
    )
}

export default function LinkedInDashboard() {
    const [firms, setFirms] = useState(MOCK_FIRMS)
    const [searchQuery, setSearchQuery] = useState('')
    const [activeTab, setActiveTab] = useState('batch')
    const [expandedFirmId, setExpandedFirmId] = useState<string | null>(null)
    const [selectedTask, setSelectedTask] = useState<any | null>(null)

    // --- Derived State ---
    const filteredFirms = useMemo(() => {
        return firms.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [firms, searchQuery])

    const queuedTasks = useMemo(() => {
        return MOCK_TASKS.filter(t => t.status === 'queued')
    }, [])



    // --- Handlers ---
    const toggleFirmStatus = (firmId: string) => {
        setFirms(prev => prev.map(f => {
            if (f.id === firmId) {
                return { ...f, status: f.status === 'active' ? 'blocked' : 'active' }
            }
            return f
        }))
    }

    return (
        <div className="flex min-h-screen flex-col bg-[#F9FAFB] p-4 md:p-8">
            {/* Header */}
            <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div className="flex flex-col gap-2">
                    <Link
                        href="/admin"
                        className="flex items-center text-sm text-slate-500 hover:text-slate-800 transition-colors w-fit"
                    >
                        <ArrowLeft className="mr-1 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900">LinkedIn Outreach</h1>
                    <p className="text-slate-500">Manage and monitor family office automation</p>
                </div>
                <div className="flex gap-3">
                    <Badge variant="secondary" className="bg-white px-3 py-1 text-xs font-semibold shadow-sm text-slate-600">
                        Next Batch: 6:00 PM
                    </Badge>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="mb-8 grid gap-4 grid-cols-1 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Sent</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">842</div>
                        <p className="text-xs text-slate-400 mt-1">Total connection requests sent</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Daily Batch</CardTitle>
                        <Zap className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">20</div>
                        <p className="text-xs text-slate-400 mt-1">Contacts per day per account</p>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-white">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500 uppercase tracking-wider">Firms Covered</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">412 / 2,150</div>
                        <p className="text-xs text-slate-400 mt-1">Firms with ≥ 1 connection sent</p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="batch" className="w-full" onValueChange={setActiveTab}>
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <TabsList className="bg-slate-200/50 p-1">
                        <TabsTrigger value="batch" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Zap className="mr-2 h-4 w-4" />
                            Tonight's Batch
                        </TabsTrigger>
                        <TabsTrigger value="firms" className="data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Building2 className="mr-2 h-4 w-4" />
                            Firm Management
                        </TabsTrigger>

                    </TabsList>

                    {activeTab === 'firms' && (
                        <div className="relative w-full md:w-80">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                            <Input
                                placeholder="Search firms..."
                                className="pl-9 bg-white border-slate-200 focus-visible:ring-indigo-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                {/* --- Tonight's Batch --- */}
                <TabsContent value="batch">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Daily Batch Preview</CardTitle>
                                    <CardDescription>Review the 40 contacts selected for today's outreach across Jeff and Todd's accounts.</CardDescription>
                                </div>
                                <div className="flex gap-2">
                                    <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 font-normal">
                                        Review window closes in 24m
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="w-[200px]">Contact</TableHead>
                                        <TableHead>Firm</TableHead>
                                        <TableHead>Account</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {queuedTasks.map((task) => {
                                        const contact = MOCK_CONTACTS.find(c => c.id === task.contactId)
                                        const firm = MOCK_FIRMS.find(f => f.id === task.firmId)
                                        return (
                                            <TableRow key={task.id} className="hover:bg-slate-50/50 transition-colors">
                                                <TableCell className="font-medium">
                                                    <div className="flex flex-col">
                                                        <span>{contact?.firstName} {contact?.lastName}</span>
                                                        <span className="text-xs text-slate-400 font-normal">{contact?.title}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{firm?.name}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="font-normal border-slate-200">
                                                        {task.accountName}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <StatusBadge status={task.status} />
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex justify-end gap-2 text-slate-400">
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 hover:text-indigo-600"
                                                            onClick={() => setSelectedTask(task)}
                                                        >
                                                            <Info className="h-4 w-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-slate-600">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        )
                                    })}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* --- Firm Management --- */}
                <TabsContent value="firms">
                    <Card className="border-none shadow-sm bg-white overflow-hidden">
                        <CardHeader className="bg-slate-50/50 border-b border-slate-100 px-6 py-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Family Office Directory</CardTitle>
                                    <CardDescription>Manage firm-level blocks and view investment preferences.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-slate-50/30">
                                    <TableRow>
                                        <TableHead className="px-6">Firm Name</TableHead>
                                        <TableHead>AUM</TableHead>
                                        <TableHead>Investment Preferences</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right px-6">Outreach Toggle</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredFirms.map((firm) => (
                                        <React.Fragment key={firm.id}>
                                            <TableRow
                                                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                                                onClick={() => setExpandedFirmId(expandedFirmId === firm.id ? null : firm.id)}
                                            >
                                                <TableCell className="px-6 font-medium text-slate-900">
                                                    <div className="flex items-center gap-2">
                                                        <Building2 className={`h-4 w-4 transition-colors ${expandedFirmId === firm.id ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                        {firm.name}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 font-normal">
                                                        {firm.aum}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-sm text-slate-500">{firm.investmentPrefs}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${firm.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-none font-medium`}>
                                                        {firm.status === 'active' ? 'Active' : 'Blocked'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right px-6">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <Button
                                                            variant={firm.status === 'active' ? 'outline' : 'destructive'}
                                                            size="sm"
                                                            className="h-8 gap-2"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                toggleFirmStatus(firm.id)
                                                            }}
                                                        >
                                                            {firm.status === 'active' ? (
                                                                <>
                                                                    <XCircle className="h-4 w-4" />
                                                                    Stop Firm
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <PlayCircle className="h-4 w-4" />
                                                                    Unblock
                                                                </>
                                                            )}
                                                        </Button>
                                                        <ArrowLeft className={`h-4 w-4 text-slate-300 transition-transform ${expandedFirmId === firm.id ? '-rotate-90' : 'rotate-180'}`} />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                            {expandedFirmId === firm.id && (
                                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-t-0">
                                                    <TableCell colSpan={5} className="p-0">
                                                        <div className="px-12 py-4 bg-white/50 border-y border-slate-100">
                                                            <div className="mb-3 flex items-center justify-between">
                                                                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Associated Contacts</h4>
                                                                <span className="text-xs text-slate-400">Targeting {MOCK_CONTACTS.filter(c => c.firmId === firm.id).length} individuals</span>
                                                            </div>
                                                            <div className="grid gap-2">
                                                                {MOCK_CONTACTS.filter(c => c.firmId === firm.id).map(contact => (
                                                                    <div key={contact.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100">
                                                                        <div className="flex items-center gap-3">
                                                                            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold">
                                                                                {contact.firstName[0]}{contact.lastName[0]}
                                                                            </div>
                                                                            <div className="flex flex-col">
                                                                                <span className="text-sm font-medium text-slate-900">{contact.firstName} {contact.lastName}</span>
                                                                                <span className="text-xs text-slate-500">{contact.title}</span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="flex items-center gap-2">
                                                                            <a href={contact.linkedinUrl} target="_blank" rel="noreferrer">
                                                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50">
                                                                                    View LinkedIn
                                                                                </Button>
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>


            </Tabs>

            {/* Message Preview Dialog */}
            <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Info className="h-5 w-5 text-indigo-500" />
                            Message Preview
                        </DialogTitle>
                        <DialogDescription>
                            Review the connection message targeting {
                                MOCK_CONTACTS.find(c => c.id === selectedTask?.contactId)?.firstName
                            } {
                                MOCK_CONTACTS.find(c => c.id === selectedTask?.contactId)?.lastName
                            }.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-100 italic text-slate-700 leading-relaxed">
                        "{selectedTask?.message || 'No custom message generated for this contact.'}"
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            variant="secondary"
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                            onClick={() => setSelectedTask(null)}
                        >
                            Close Preview
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
