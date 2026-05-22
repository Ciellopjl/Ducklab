import path from 'node:path'
import dotenv from 'dotenv'
import { defineConfig, env } from 'prisma/config'

dotenv.config({ path: path.join(__dirname, '.env.local') })
dotenv.config()

export default defineConfig({
    schema: path.join(__dirname, 'prisma', 'schema.prisma'),
    datasource: {
        url: process.env.DIRECT_URL || process.env.DATABASE_URL, // CLI usa DIRECT_URL ou fallback
    },
    migrations: {
        seed: 'npx tsx prisma/seed.ts',
    },
})
