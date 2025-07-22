# Local-to-Cloud Migration Testing

This document describes the comprehensive test suite for the hybrid storage and local-to-cloud migration functionality.

## Test Types

### 1. API Tests (Command Line)

**Location**: `test-cloud-api-fixed.js`
**Run with**: `npm run test:cloud-api`

Tests the backend API directly:

- ✅ User registration & authentication
- ✅ Profile CRUD operations in cloud
- ✅ Dataset management
- ✅ User data isolation & security
- ✅ Authorization checks

### 2. Browser Integration Tests

**Location**: `/cloud-test` page → "Run Tests" button
**Access**: Visit `http://localhost:3000/cloud-test`

Interactive tests that run in the browser:

- ✅ Authentication detection
- ✅ Local storage operations (IndexedDB)
- ✅ Cloud storage operations (PostgreSQL API)
- ✅ Hybrid service routing logic
- ✅ Error handling

### 3. End-to-End Migration Tests (Cypress)

#### Basic Migration Test

**Location**: `cypress/e2e/dataPointAnnotation/migrationBasic.cy.ts`
**Run with**: `npm run cypress:datapoint`

Tests the core migration workflow:

- ✅ Create local data while unauthenticated
- ✅ User registration/authentication
- ✅ Storage mode transition
- ✅ Data migration process
- ✅ Verify migrated data in cloud

#### Comprehensive Migration Test

**Location**: `cypress/e2e/dataPointAnnotation/localToCloudMigration.cy.ts`
**Run with**: `npm run cypress:datapoint`

Extensive test suite covering:

- ✅ Full migration workflow
- ✅ Edge cases (no local data, network errors)
- ✅ Data consistency verification
- ✅ Integration with main app workflow
- ✅ Authentication error handling
- ✅ Multiple profile migration

## Prerequisites

Before running tests:

1. **Backend server running**: `cd projects/llm_backend && uv run uvicorn app.main:app --host 0.0.0.0 --port 8000`
2. **Frontend server running**: `cd projects/frontend && npm run dev`
3. **Database running**: `docker-compose up -d postgres`

## Running Tests

### Quick Validation

```bash
# Test backend API
npm run test:cloud-api

# Test migration flow (included in datapoint tests)
npm run cypress:datapoint
```

### Full Test Suite

```bash
# Run all datapoint tests (includes migration tests)
npm run cypress:datapoint

# Run existing segmentation tests
npm run cypress:segmentation

# Run all tests in parallel
npm run test:parallel
```

### Interactive Testing

1. Visit `http://localhost:3000/cloud-test`
2. Follow the step-by-step demo guide
3. Click "Run Tests" for automated browser tests
4. Test manual migration workflow

## What These Tests Verify

### 🔄 Hybrid Storage Logic

- **Anonymous users** → Data stored in IndexedDB (local browser storage)
- **Authenticated users** → Data stored in PostgreSQL (cloud database)
- **Automatic routing** → Same code routes to correct storage based on auth state

### 🔒 Security & Isolation

- JWT authentication required for cloud operations
- Users can only access their own data
- Invalid/expired tokens properly rejected
- Local data isolated to browser session

### 📊 Complete Data Migration System

- **Profiles & Profile Points**: Creation, relationships, and ordering preserved
- **Datasets & Texts**: All dataset texts migrated with correct relationships
- **Annotated Datasets**: Complex relationships between datasets and profiles maintained
- **User Settings**: Tutorial completion and preferences preserved
- **ID Mapping**: Local IDs correctly mapped to cloud IDs during migration
- **Type Conversion**: Seamless conversion between local and cloud data formats
- **Relationship Preservation**: Foreign key relationships maintained across all entities

### 🚀 User Experience

- Seamless transition from local to cloud
- Clear visual indicators of storage mode
- Graceful error handling for network issues
- No data loss during migration process
- Progress logging for complex migrations

## Complete Migration Implementation

### What Gets Migrated (✅ Implemented)

1. **Profiles & Profile Points**

   - All profiles from both datapoint extraction and text segmentation modes
   - Profile points with correct relationships and ordering
   - Local profile IDs mapped to cloud profile IDs

2. **Datasets & Texts**

   - All datasets with complete metadata
   - All texts within each dataset
   - Local dataset IDs mapped to cloud dataset IDs

3. **Annotated Datasets**

   - All annotated datasets from both modes
   - Relationships to datasets and profiles preserved using ID mapping
   - Complex foreign key relationships maintained

4. **User Settings**

   - Tutorial completion status
   - User preferences and configurations

5. **ID Relationship Mapping**
   - Local IDs correctly mapped to cloud IDs
   - Foreign key relationships preserved across all entities
   - Orphaned records prevented through proper mapping

### Migration Process Flow

```typescript
// Step 1: Migrate profiles and profile points
const profileIdMapping: Record<string, string> = {};
for (const profile of localProfiles) {
  const cloudProfile = await CloudDataService.createProfile(profile);
  profileIdMapping[profile.id] = cloudProfile.id;

  // Migrate profile points with new profile ID
  for (const point of localPoints) {
    await CloudDataService.createProfilePoint({
      ...point,
      profile_id: cloudProfile.id,
    });
  }
}

// Step 2: Migrate datasets and texts
const datasetIdMapping: Record<string, string> = {};
for (const dataset of localDatasets) {
  const cloudDataset = await CloudDataService.createDataset(dataset);
  datasetIdMapping[dataset.id] = cloudDataset.id;

  // Migrate texts with new dataset ID
  for (const text of localTexts) {
    await CloudDataService.createText({
      ...text,
      dataset_id: cloudDataset.id,
    });
  }
}

// Step 3: Migrate annotated datasets with mapped IDs
for (const annotatedDataset of localAnnotatedDatasets) {
  await CloudDataService.createAnnotatedDataset({
    ...annotatedDataset,
    dataset_id: datasetIdMapping[annotatedDataset.datasetId],
    profile_id: profileIdMapping[annotatedDataset.profileId],
  });
}
```

## Test Scenarios Covered

1. **Happy Path**: Create local data → authenticate → migrate → verify cloud data
2. **Empty Migration**: Authenticate without local data → migrate successfully
3. **Complex Relationships**: Multiple profiles, datasets, and relationships preserved
4. **ID Mapping**: Verify foreign key relationships work after migration
5. **Error Handling**: Network failures, invalid authentication, malformed data
6. **Data Consistency**: All data types migrated with relationships intact
7. **Cross-App Integration**: Data created in main app migrated via cloud-test page
8. **Authentication Flows**: Registration, login, logout, token expiration
9. **Isolation**: Local data not visible across sessions

## Debugging Tests

### Common Issues

- **Backend not running**: Ensure `uvicorn` is running on port 8000
- **Database connection**: Check `docker-compose up -d postgres`
- **Port conflicts**: Ensure frontend on 3000, backend on 8000
- **Token expiration**: Tests create fresh users to avoid token issues
- **Relationship mapping**: Check console logs for ID mapping details

### Debugging Commands

```bash
# Check backend health
curl http://localhost:8000/docs

# Check database connection
docker-compose logs postgres

# Run tests with browser visible
npx cypress open

# Verbose test output
npm run test:cloud-api 2>&1 | tee test-output.log
```

## Adding New Tests

When adding new migration tests:

1. **Clear state**: Always clear IndexedDB and localStorage in `beforeEach`
2. **Unique users**: Use timestamps in email addresses
3. **Proper timeouts**: Allow sufficient time for async operations
4. **Error handling**: Test both success and failure scenarios
5. **Data verification**: Verify data integrity before and after migration
6. **Relationship testing**: Verify foreign key relationships are preserved

### Example Test Structure

```typescript
it("should test specific migration scenario", () => {
  // 1. Setup: Clear state, visit page
  cy.visit("http://localhost:3000/cloud-test");

  // 2. Create local data
  cy.contains("Create Local Profile").click();

  // 3. Authenticate
  cy.contains("Sign up").click();
  // ... fill form ...

  // 4. Migrate
  cy.contains("Move to Cloud").click();

  // 5. Verify
  cy.contains("successfully moved").should("be.visible");
});
```

## Continuous Integration

These tests are designed to run in CI environments:

- All tests use headless mode by default
- Database state is cleaned between tests
- Unique user accounts prevent conflicts
- Comprehensive error reporting
- Complete migration verification

The migration test suite provides confidence that the hybrid storage system works reliably across all user scenarios, data types, and relationship complexities. The implementation ensures **zero data loss** and **complete relationship preservation** during the local-to-cloud transition.
