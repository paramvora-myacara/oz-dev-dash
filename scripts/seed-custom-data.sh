#!/bin/bash

# Custom seed data script - run after db reset
# This script seeds custom listing data that depends on migrations being applied

set -e

echo "Running custom seed data..."

# Run the listing seed data
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f scripts/seed-listings.sql

echo "Custom seed data completed successfully!"
