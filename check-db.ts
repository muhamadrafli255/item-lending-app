
import { prisma } from "./app/_lib/prisma"

async function checkSync() {
    try {
        const userCount = await prisma.user.count()
        const accountCount = await prisma.account.count()
        const sessionCount = await prisma.session.count()

        console.log("TABLE_STATUS: OK")
        console.log(`User count: ${userCount}`)
        console.log(`Account count: ${accountCount}`)
        console.log(`Session count: ${sessionCount}`)
    } catch (error) {
        console.error("TABLE_STATUS: ERROR")
        console.error(error)
    } finally {
        await prisma.$disconnect()
    }
}

checkSync()
