import type { Config } from 'drizzle-kit';

// A type-only import lets the migration runner load this config before local dependencies are installed.
export default { dialect: 'postgresql', schema: './db/schema.ts', out: 'netlify/database/migrations' } satisfies Config;
