# Code Quality Guidelines

This project uses ESLint and TypeScript to maintain code quality and consistency.

## Available Scripts

- `npm run lint:check` - Check for linting errors without auto-fixing
- `npm run lint:fix` - Automatically fix linting errors where possible
- `npm run typecheck` - Run TypeScript type checking

## Pre-commit Hooks

This project includes a pre-commit hook that automatically runs:

1. TypeScript type checking (`npm run typecheck`)
2. ESLint checking (`npm run lint:check`)

If either check fails, the commit will be blocked. You can fix issues by running:

- `npm run lint:fix` - to automatically fix linting issues
- Fix TypeScript errors manually

## ESLint Rules

Key rules enforced:

- **No `any` types** - Use proper TypeScript types instead
- **No unused variables** - Prefix with `_` if intentionally unused
- **No empty blocks** - Add proper error handling or comments
- **React hooks rules** - Proper dependency arrays and hook usage
- **Import ordering** - Consistent import organization

## VS Code Integration

The `.vscode/settings.json` file is configured to:

- Format code on save
- Run ESLint auto-fix on save
- Show linting errors in real-time
- Enable TypeScript suggestions

## Recommended Extensions

Install the recommended extensions by opening the Command Palette (`Ctrl+Shift+P`) and running:

```bash
Extensions: Show Recommended Extensions
```

## Troubleshooting

If you encounter linting errors:

1. **TypeScript errors**: Fix the type issues in your code
2. **ESLint errors**: Run `npm run lint:fix` first, then fix remaining issues manually
3. **Pre-commit hook fails**: Ensure all checks pass before committing

### Common Fixes

**Replace `any` types:**

```typescript
// ❌ Bad
const data: any = response.data;

// ✅ Good
interface ApiResponse {
  success: boolean;
  data: unknown;
  error?: string;
}
const data: ApiResponse = response.data;
```

**Handle unused variables:**

```typescript
// ❌ Bad
const handleClick = (event, data) => {
  console.log(data);
};

// ✅ Good
const handleClick = (_event: MouseEvent, data: unknown) => {
  console.log(data);
};
```

**Fix empty blocks:**

```typescript
// ❌ Bad
try {
  riskyOperation();
} catch (error) {}

// ✅ Good
try {
  riskyOperation();
} catch (error) {
  console.error('Operation failed:', error);
  // or handle appropriately
}
```
