import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import dotenv from 'dotenv'

dotenv.config()

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)
const prisma = new PrismaClient({ adapter })

async function main() {
    const categories = await prisma.blogCategory.findMany()
    console.log(categories.map(c => c.name).join(', '))
}

main()
