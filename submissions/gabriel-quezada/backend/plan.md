# Lead Scorer - Architecture Plan

## Overview
This document outlines the initial architectural decisions for the Lead Scorer backend application. The goal is to ingest four main CSV files containing sales data, load them into memory, and provide RESTful APIs to serve and analyze this data.

## Technology Stack
- **Node.js**: JavaScript runtime environment.
- **Express.js**: Fast, unopinionated, minimalist web framework for Node.js used to build the API endpoints.
- **Cors**: Middleware to enable Cross-Origin Resource Sharing.
- **csv-parser**: Fast and reliable CSV parsing library.

## Data Model & Structure
The data is currently loaded in-memory to ensure fast read access. The data structure is split into four primary collections:
1. **Accounts (`accounts.csv`)**: Details about the client companies.
2. **Products (`products.csv`)**: Information regarding the products sold.
3. **Sales Teams (`sales_teams.csv`)**: Details of the sales representatives and managers.
4. **Sales Pipeline (`sales_pipeline.csv`)**: The central transactional table tying opportunities with accounts, products, and sales agents.

## Implementation Details

### Initialization
Upon server start, the application reads the CSV files from the `data/` directory. By utilizing Node.js Streams alongside `csv-parser`, the app asynchronously parses the files and loads each row into its respective array in the global `db` object.

### API Architecture
- `GET /api/health`: Provides a simple health check returning server status and the number of records loaded in memory for each dataset. This validates the parsing and loading mechanism.

## Next Steps
1. **Data Indexing & Relationships**: Create mappings/indices in memory (e.g., hash maps by `account_id`, `product_id`, `sales_agent`) to facilitate quick O(1) lookups instead of O(n) array scans.
2. **Scoring Logic Implementation**: Develop the algorithm to score leads based on the sales pipeline data, account revenue, and other pertinent metrics.
3. **Advanced API Endpoints**: Add endpoints to list, filter, and score leads.
4. **Database Migration (Optional)**: If data size grows beyond memory limits, plan to migrate from an in-memory approach to a persistent store like PostgreSQL or MongoDB.
