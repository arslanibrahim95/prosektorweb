const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Starting Admin User Migration...')

    // 1. Fetch all users with role 'ADMIN'
    const admins = await prisma.user.findMany({
        where: { role: 'ADMIN' }
    })

    console.log(`Found ${admins.length} admin users to migrate.`)

    for (const admin of admins) {
        console.log(`Processing: ${admin.email}`)

        // 2. Check if already exists in SystemUser
        const existing = await prisma.systemUser.findUnique({
            where: { email: admin.email }
        })

        if (existing) {
            console.log(`Skipping: ${admin.email} (Already exists)`)
            continue
        }

        // 3. Create SystemUser
        await prisma.systemUser.create({
            data: {
                email: admin.email,
                password: admin.password,
                name: admin.name,
                role: 'ADMIN', // Mapping to UserRole.ADMIN
                isActive: true,
                createdAt: admin.createdAt,
                updatedAt: admin.updatedAt
            }
        })

        console.log(`✅ Migrated: ${admin.email}`)

        // 4. Delete from User table? 
        // Safer to keep for now and delete manually later, or delete here if confident.
        // Let's keep it but mark for deletion if soft delete exists.
        // admin.deletedAt is available.

        await prisma.user.update({
            where: { id: admin.id },
            data: { deletedAt: new Date() }
        })
        console.log(`🗑️ Soft Deleted from User table: ${admin.email}`)
    }

    console.log('🎉 Migration Complete!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
