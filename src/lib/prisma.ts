import { PrismaClient } from '@prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const connectionString = process.env.DATABASE_URL!
const adapter = new PrismaMariaDb(connectionString)

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

const prismaBase = globalForPrisma.prisma || new PrismaClient({ adapter })

// Type-safe soft delete model delegates
const softDeleteModels = {
    Company: prismaBase.company,
    User: prismaBase.user,
    Invoice: prismaBase.invoice,
    WebProject: prismaBase.webProject,
    Payment: prismaBase.payment,
    Domain: prismaBase.domain,
    Workplace: prismaBase.workplace,
} as const

type SoftDeleteModelName = keyof typeof softDeleteModels

function isSoftDeleteModel(model: string): model is SoftDeleteModelName {
    return model in softDeleteModels
}

export const prisma = prismaBase.$extends({
    query: {
        $allModels: {
            async findMany({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async findFirst({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async delete({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    const delegate = softDeleteModels[model]
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                    return (delegate.update as Function)({
                        ...args,
                        data: { deletedAt: new Date() }
                    })
                }
                return query(args)
            },
            async deleteMany({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    const delegate = softDeleteModels[model]
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
                    return (delegate.updateMany as Function)({
                        ...args,
                        data: { deletedAt: new Date() }
                    })
                }
                return query(args)
            },
            async count({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async aggregate({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async groupBy({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    args.where = { deletedAt: null, ...args.where }
                }
                return query(args)
            },
            async findUnique({ model, args, query }) {
                if (isSoftDeleteModel(model)) {
                    // findUnique does not strictly support arbitrary where clauses for non-unique fields in type definition,
                    // but extensions allow modifying args.
                    // However, safe practice is to route via findFirst if we want to filter specific fields not in the unique key.
                    args.where = { deletedAt: null, ...args.where }
                    return query(args)
                }
                return query(args)
            }
        }
    }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismaBase
