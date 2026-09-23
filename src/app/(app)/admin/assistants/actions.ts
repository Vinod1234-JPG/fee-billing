"use server"

import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"

export async function createAssistant(formData: FormData) {
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const status = formData.get("status") as string

  let password_hash = "DUMMY_HASH"
  try {
    password_hash = await hash("password123", 10)
  } catch (error) {
    console.warn("bcryptjs hash failed, using dummy hash", error)
  }

  await prisma.user.create({
    data: {
      name,
      email,
      phone,
      status: status || "ACTIVE",
      role: "ASSISTANT",
      password_hash,
    },
  })

  redirect("/admin/assistants")
}

export async function updateAssistant(formData: FormData) {
  const id = formData.get("id") as string
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const phone = formData.get("phone") as string
  const status = formData.get("status") as string

  await prisma.user.update({
    where: { id },
    data: {
      name,
      email,
      phone,
      status,
    },
  })

  redirect("/admin/assistants")
}
