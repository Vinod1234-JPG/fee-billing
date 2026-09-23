"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createBus(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    throw new Error("Unauthorized")
  }

  const bus_number = formData.get("bus_number") as string
  const vehicle_number = formData.get("vehicle_number") as string
  const driver_name = formData.get("driver_name") as string
  const driver_phone = formData.get("driver_phone") as string
  const route = formData.get("route") as string
  const capacity = parseInt(formData.get("capacity") as string) || 40

  await prisma.bus.create({
    data: {
      bus_number,
      vehicle_number,
      driver_name,
      driver_phone,
      route,
      capacity,
    }
  })

  revalidatePath("/admin/bus")
  revalidatePath("/assistant/bus")
  
  if (session.user.role === "ADMIN") {
    redirect("/admin/bus")
  } else {
    redirect("/assistant/bus")
  }
}
