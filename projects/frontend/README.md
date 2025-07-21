# Frontend

This is the frontend application for Raki, built with Next.js and TypeScript.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build
```

## Testing

### Cypress E2E Tests

```bash
# Open Cypress interactive mode
yarn cypress:open

# Run all tests (sequential)
yarn test
# or
yarn cypress:run

# Run tests in parallel (recommended - ~2x faster)
yarn test:parallel
# or
yarn cypress:parallel

# Run specific feature tests
yarn cypress:datapoint      # Only datapoint extraction tests
yarn cypress:segmentation   # Only text segmentation tests
```

### Performance

- **Sequential**: ~60-90 seconds for full test suite
- **Parallel**: ~30-45 seconds for full test suite (2x faster!)

The parallel execution splits tests by feature area:

- `dataPointAnnotation/**` tests run in parallel with
- `textSegmentation/**` tests

## Architecture

The frontend uses a unified architecture with mode-specific configurations:

- **Layout Components**: `src/components/layout/` - Main app structure and navigation
- **Annotation Features**: `src/components/annotation/` - Core annotation functionality
- **AI Features**: `src/components/annotation/ai/` - AI-assisted annotation
- **Shared Components**: `src/components/shared/` - Reusable utilities
