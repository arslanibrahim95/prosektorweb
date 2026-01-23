import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'
import { createPool } from 'mariadb'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prismaBase = globalForPrisma.prisma || new PrismaClient({ adapter })

export const prisma = prismaBase.$extends({
    query: {
        $allModels: {
            async findMany({ model, args, query }) {
                if (['Company', 'User', 'Invoice', 'WebProject'].includes(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async findFirst({ model, args, query }) {
                if (['Company', 'User', 'Invoice', 'WebProject'].includes(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async delete({ model, args, query }) {
                if (['Company', 'User', 'Invoice', 'WebProject'].includes(model)) {
                    return (prismaBase as any)[model.toLowerCase()].update({
                        ...args,
                        data: { deletedAt: new Date() }
                    })
                }
                return query(args)
            },
            async deleteMany({ model, args, query }) {
                if (['Company', 'User', 'Invoice', 'WebProject'].includes(model)) {
                    return (prismaBase as any)[model.toLowerCase()].updateMany({
                        ...args,
                        data: { deletedAt: new Date() }
                    })
                }
                return query(args)
            }
        }
    }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase
