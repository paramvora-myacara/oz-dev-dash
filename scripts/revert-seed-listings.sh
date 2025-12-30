#!/bin/bash

# Revert seed listings script - removes all data inserted by seed-listings.sql
# This script is the inverse of seed-custom-data.sh

set -e

echo "Reverting seed listings data..."

# Run the revert script
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres -f scripts/revert-seed-listings.sql

echo "Seed listings data reverted successfully!"
