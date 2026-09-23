import { prisma } from "./prisma"

export async function logAction(
  userId: string,
  userName: string,
  action: 'CREATE' | 'UPDATE' | 'DELETE',
  entity: string,
  entityId: string,
  details: string
) {
  try {
    await prisma.auditLog.create({
      data: {
        user_id: userId,
        user_name: userName,
        action,
        entity,
        entity_id: entityId,
        details
      }
    })
  } catch (error) {
    console.error("Failed to write audit log", error)
  }
}
