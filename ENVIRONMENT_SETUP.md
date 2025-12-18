# Environment Configuration Guide

This document explains how to configure and switch between development and production environments in the Angular application, particularly for Supabase database connections.

## Quick Start

### Development Environment

1. **Configure development Supabase credentials:**
   
   Edit `src/environments/environment.ts` and replace the placeholder values:

   ```typescript
   supabase: {
     url: 'https://YOUR-PROJECT-ID.supabase.co',
     anonKey: 'YOUR_ANON_KEY',
   },
   ```

2. **Run the development server:**

   ```bash
   npm start
   # or
   ng serve
   ```

   This uses `environment.ts` (development configuration).

### Production Environment

1. **Verify production credentials:**
   
   Check that `src/environments/environment.prod.ts` contains the correct production Supabase credentials.

2. **Build for production:**

   ```bash
   npm run build
   # or
   ng build --configuration production
   ```

   This replaces `environment.ts` with `environment.prod.ts` during the build.

## Environment Files

| File | Purpose | When Used |
|------|---------|-----------|
| `src/environments/environment.ts` | Development config | `ng serve`, `ng build --configuration development` |
| `src/environments/environment.prod.ts` | Production config | `ng build --configuration production` |
| `src/environments/environment.interface.ts` | TypeScript interface | Type checking only |

## Angular CLI Commands

| Command | Configuration | Environment File |
|---------|---------------|------------------|
| `npm start` | development | `environment.ts` |
| `ng serve` | development | `environment.ts` |
| `ng serve --configuration production` | production | `environment.prod.ts` |
| `npm run build` | production | `environment.prod.ts` |
| `ng build` | production | `environment.prod.ts` |
| `ng build --configuration development` | development | `environment.ts` |

## Getting Supabase Credentials

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL**: The API URL (e.g., `https://xxxx.supabase.co`)
   - **anon/public key**: The anonymous API key (safe for client-side use)

## Verifying Environment Configuration

When the application starts in development mode, you'll see a console log indicating which Supabase project is connected:

```
[SupabaseService] Connected to Supabase (DEVELOPMENT): your-project-id
```

If the configuration is missing or invalid, you'll see an error:

```
Error: Supabase URL is not configured. Please update src/environments/environment.ts...
```

## Security Notes

- **Never commit** real production credentials to version control if the repository is public
- The `anonKey` is safe for client-side use (it only allows operations permitted by RLS policies)
- Consider using environment variables for CI/CD pipelines
- The `.gitignore` file excludes `environment.local.ts` for local overrides if needed

## Database Schema Synchronization

When using separate development and production databases, ensure both databases have the same schema:

1. Apply all migrations from `supabase/migrations/` to both databases
2. Use the Supabase CLI or Dashboard SQL Editor to run migrations
3. Test data operations in development before deploying to production

See `supabase/README.md` for detailed migration instructions.

