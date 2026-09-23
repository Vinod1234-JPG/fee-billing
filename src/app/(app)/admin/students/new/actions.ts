"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function createStudent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    throw new Error("Unauthorized")
  }

  // Basic Validation (you could add Zod here for stronger validation)
  const student_id = formData.get("student_id") as string
  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const gender = formData.get("gender") as string
  const date_of_birth = formData.get("date_of_birth") as string
  const admission_date = formData.get("admission_date") as string
  const blood_group = formData.get("blood_group") as string

  // Parent Info
  const father_name = formData.get("father_name") as string
  const mother_name = formData.get("mother_name") as string
  const phone = formData.get("phone") as string
  const alternate_phone = formData.get("alternate_phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const pin_code = formData.get("pin_code") as string

  // Academic Info
  const class_id = formData.get("class_id") as string
  const section = formData.get("section") as string
  const roll_number = formData.get("roll_number") as string
  const academic_year = formData.get("academic_year") as string

  // Bus Info
  const uses_bus = formData.get("uses_bus") === "on"
  const bus_id = formData.get("bus_id") as string | null
  const pickup_point = formData.get("pickup_point") as string
  const total_bus_fee = parseFloat(formData.get("total_bus_fee") as string) || 20000

  // Fee Info
  const total_amount = parseFloat(formData.get("total_fee") as string) || 0
  const paid_amount = parseFloat(formData.get("paid_amount") as string) || 0
  
  // Verify student_id doesn't already exist
  const existingStudent = await prisma.student.findUnique({
    where: { student_id }
  })
  
  if (existingStudent) {
    return { error: "Student ID already exists. Please use a different ID." }
  }

  // Create Parent
  const parent = await prisma.parent.create({
    data: {
      father_name,
      mother_name,
      phone,
      alternate_phone,
      email,
      address,
      city,
      state,
      pin_code,
    }
  })

  // Create Student
  const student = await prisma.student.create({
    data: {
      student_id,
      first_name,
      last_name,
      gender,
      date_of_birth: new Date(date_of_birth),
      blood_group,
      admission_date: new Date(admission_date),
      class_id,
      section,
      roll_number,
      academic_year,
      parent_id: parent.id,
      assistant_id: session.user.role === "ASSISTANT" ? session.user.id : null,
      uses_bus,
      bus_id: uses_bus && bus_id ? bus_id : null,
      pickup_point: uses_bus ? pickup_point : null,
    }
  })

  // Create Fee Record
  const balance_amount = total_amount - paid_amount
  let status = "PENDING"
  if (paid_amount >= total_amount && total_amount > 0) {
    status = "COMPLETED"
  } else if (paid_amount > 0 && paid_amount < total_amount) {
    status = "BALANCE"
  }

  const fee = await prisma.fee.create({
    data: {
      student_id: student.id,
      total_amount,
      paid_amount,
      balance_amount,
      status,
    }
  })

  if (paid_amount > 0) {
    await prisma.feePayment.create({
      data: {
        student_id: student.id,
        fee_id: fee.id,
        amount: paid_amount,
        payment_method: "Initial Payment",
        receipt_number: `REC-${Date.now()}`,
        received_by: session.user.name || "Admin",
      }
    })
  }

  // Create Bus Fee Record if applicable
  if (uses_bus && bus_id) {
    await prisma.busFee.create({
      data: {
        student_id: student.id,
        bus_id: bus_id,
        total_amount: total_bus_fee,
        paid_amount: 0,
        balance_amount: total_bus_fee,
        status: "PENDING",
      }
    })
  }

  revalidatePath("/admin/students")
  revalidatePath("/assistant/students")
  if (session.user.role === "ADMIN") {
    redirect("/admin/students")
  } else {
    redirect("/assistant/students")
  }
}
