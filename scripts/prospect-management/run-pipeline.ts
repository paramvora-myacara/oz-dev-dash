/**
 * Orchestrator script to run the prospect import pipeline.
 *
 * Sequence:
 * 1. Import prospects from CSV (import-prospects.ts)
 * 2. Migrate prospect phones and link calls (migrate-prospect-phones.ts)
 *
 * Usage: npx tsx scripts/prospect-management/run-pipeline.ts [path-to-csv]
 */

import { importProspects } from './import-prospects.js';
import { migrate } from './migrate-prospect-phones.js';
import path from 'path';
import fs from 'fs';

async function runPipeline() {
    console.log('Starting Prospect Import Pipeline...');

    // 1. Get CSV file path
    const args = process.argv.slice(2);
    const defaultFile = '/Users/aryanjain/Documents/OZL/UsefulDocs/QOZB-Contacts/All QOZB Development Projects USA - 20260126.xlsx - Results.csv';
    const targetFile = args[0] || defaultFile;

    if (!fs.existsSync(targetFile)) {
        console.error(`CSV File not found: ${targetFile}`);
        process.exit(1);
    }

    try {
        // 2. Run Import
        console.log('\n=== STEP 1: IMPORT PROSPECTS ===');
        await importProspects(targetFile);

        // 3. Run Migration
        console.log('\n=== STEP 2: MIGRATE PHONES & LINK CALLS ===');
        await migrate();

        console.log('\n✅ Pipeline completed successfully!');
    } catch (error) {
        console.error('\n❌ Pipeline failed:', error);
        process.exit(1);
    }
}

runPipeline();
