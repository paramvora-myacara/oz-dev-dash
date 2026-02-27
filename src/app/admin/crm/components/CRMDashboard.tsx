'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PeopleTable } from './PeopleTable';
import { CompaniesTable } from './CompaniesTable';
import { PropertiesTable } from './PropertiesTable';
import { EntitySheet } from './EntitySheet';

export function CRMDashboard() {
    const [activeTab, setActiveTab] = useState('people');
    const [sheetStack, setSheetStack] = useState<{ type: string, id: string, data: any }[]>([]);

    const openSheet = (type: string, id: string, data: any) => {
        setSheetStack(prev => [...prev, { type, id, data }]);
    };

    const closeLatestSheet = () => {
        setSheetStack(prev => prev.slice(0, -1));
    };

    const closeAllSheets = () => {
        setSheetStack([]);
    };

    return (
        <div className="w-full">
            <Tabs defaultValue="people" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-4">
                    <TabsTrigger value="people">People</TabsTrigger>
                    <TabsTrigger value="companies">Companies</TabsTrigger>
                    <TabsTrigger value="properties">Properties</TabsTrigger>
                </TabsList>
                <TabsContent value="people" className="w-full">
                    <PeopleTable onRowClick={(data: any) => openSheet('person', data.id, data)} />
                </TabsContent>
                <TabsContent value="companies" className="w-full">
                    <CompaniesTable onRowClick={(data: any) => openSheet('company', data.id, data)} />
                </TabsContent>
                <TabsContent value="properties" className="w-full">
                    <PropertiesTable onRowClick={(data: any) => openSheet('property', data.id, data)} />
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
                />
            ))}
        </div>
    );
}
