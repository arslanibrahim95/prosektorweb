import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient()

async function main() {
    const categories = await prisma.blogCategory.findMany()
    console.log(categories.map(c => c.name).join(', '))
}

main()
