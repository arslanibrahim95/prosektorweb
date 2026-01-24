import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import 'dotenv/config'

const connectionString = process.env.DATABASE_URL || 'mysql://root:password@127.0.0.1:3306/prosektorweb'
// Note: In verify context, if creating pool fails, we catch it.
// Mimicking src/lib/prisma.ts simple form:
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log('🔄 Verifying Database Connection...')
    console.log(`📍 URL: ${process.env.DATABASE_URL || 'Not Set'}`)

    try {
        await prisma.$connect()
        console.log('✅ Connection Successful!')

        const count = await prisma.user.count()
        console.log(`📊 Found ${count} users in database.`)

        console.log('✅ Database is responsive.')
    } catch (error) {
        console.error('❌ Connection Failed!')
        if (error instanceof Error) {
            console.error('Error:', error.message)
        } else {
            console.error('Error:', error)
        }
        console.log('\n💡 Troubleshooting Tips:')
        console.log('1. Ensure MariaDB is running (brew services start mariadb)')
        console.log('2. Check DATABASE_URL in .env')
        console.log('3. Ensure port 3306 is matching your DB config')
    } finally {
        await prisma.$disconnect()
    }
}

main()
