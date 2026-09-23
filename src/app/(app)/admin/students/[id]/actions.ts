"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function updateStudent(prevState: any, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    return { error: "Unauthorized" }
  }

  const student_db_id = formData.get("student_db_id") as string
  if (!student_db_id) return { error: "Student ID missing" }

  const first_name = formData.get("first_name") as string
  const last_name = formData.get("last_name") as string
  const gender = formData.get("gender") as string
  const date_of_birth = formData.get("date_of_birth") as string
  const blood_group = formData.get("blood_group") as string
  const admission_date = formData.get("admission_date") as string
  const class_id = formData.get("class_id") as string
  const section = formData.get("section") as string
  const roll_number = formData.get("roll_number") as string
  const academic_year = formData.get("academic_year") as string

  const father_name = formData.get("father_name") as string
  const mother_name = formData.get("mother_name") as string
  const phone = formData.get("phone") as string
  const alternate_phone = formData.get("alternate_phone") as string
  const email = formData.get("email") as string
  const address = formData.get("address") as string
  const city = formData.get("city") as string
  const state = formData.get("state") as string
  const pin_code = formData.get("pin_code") as string

  const total_fee = parseFloat(formData.get("total_fee") as string)
  const total_bus_fee = parseFloat(formData.get("total_bus_fee") as string)

  const uses_bus = formData.get("uses_bus") === "on"
  const bus_id = formData.get("bus_id") as string
  const pickup_point = formData.get("pickup_point") as string

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: student_db_id },
      include: { parent: true, fees: true, bus_fees: true }
    })

    if (!existingStudent) return { error: "Student not found" }

    await prisma.student.update({
      where: { id: student_db_id },
      data: {
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
        uses_bus,
        bus_id: uses_bus && bus_id ? bus_id : null,
        pickup_point: uses_bus ? pickup_point : null,
      }
    })

    if (existingStudent.parent_id) {
      await prisma.parent.update({
        where: { id: existingStudent.parent_id },
        data: {
          father_name,
          mother_name,
          phone,
          alternate_phone,
          email,
          address,
          city,
          state,
          pin_code
        }
      })
    }

    if (existingStudent.fees && existingStudent.fees.length > 0 && !isNaN(total_fee)) {
      const fee = existingStudent.fees[0]
      const balance_amount = total_fee - fee.paid_amount
      const status = balance_amount <= 0 ? "COMPLETED" : balance_amount === total_fee ? "PENDING" : "BALANCE"
      
      await prisma.fee.update({
        where: { id: fee.id },
        data: {
          total_amount: total_fee,
          balance_amount,
          status
        }
      })
    }

    if (uses_bus && bus_id && !isNaN(total_bus_fee)) {
      if (existingStudent.bus_fees && existingStudent.bus_fees.length > 0) {
        const busFee = existingStudent.bus_fees[0]
        const balance_amount = total_bus_fee - busFee.paid_amount
        const status = balance_amount <= 0 ? "COMPLETED" : balance_amount === total_bus_fee ? "PENDING" : "BALANCE"
        
        await prisma.busFee.update({
          where: { id: busFee.id },
          data: {
            bus_id,
            total_amount: total_bus_fee,
            balance_amount,
            status
          }
        })
      } else {
        await prisma.busFee.create({
          data: {
            student_id: student_db_id,
            bus_id,
            total_amount: total_bus_fee,
            balance_amount: total_bus_fee,
            status: "PENDING"
          }
        })
      }
    } else if (!uses_bus && existingStudent.bus_fees && existingStudent.bus_fees.length > 0) {
       // If they untick 'uses_bus', maybe we shouldn't delete the fee if they already paid something, but we can delete if 0 paid.
       // Actually it's safer to just let it be, or delete if no payments.
       const busFee = existingStudent.bus_fees[0]
       if (busFee.paid_amount === 0) {
         await prisma.busFee.delete({ where: { id: busFee.id } })
       }
    }

  } catch (error: any) {
    console.error("Update error", error)
    return { error: error.message || "Failed to update student" }
  }

  revalidatePath("/admin/students", "layout")
  revalidatePath("/assistant/students", "layout")

  const basePath = session.user.role === "ADMIN" ? "/admin" : "/assistant"
  redirect(`${basePath}/students/${student_db_id}`)
}

export async function deleteStudent(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    return { error: "Unauthorized" }
  }

  const student_db_id = formData.get("student_db_id") as string
  if (!student_db_id) return { error: "Student ID missing" }

  try {
    const existingStudent = await prisma.student.findUnique({
      where: { id: student_db_id }
    })
    if (!existingStudent) return { error: "Student not found" }

    await prisma.feePayment.deleteMany({ where: { student_id: student_db_id } })
    await prisma.fee.deleteMany({ where: { student_id: student_db_id } })
    
    try {
      // @ts-ignore
      await prisma.busPayment.deleteMany({ where: { busFee: { student_id: student_db_id } } })
    } catch(e) {}
    try {
      // @ts-ignore
      await prisma.busFee.deleteMany({ where: { student_id: student_db_id } })
    } catch(e) {}

    await prisma.student.delete({ where: { id: student_db_id } })
    if (existingStudent.parent_id) {
      await prisma.parent.delete({ where: { id: existingStudent.parent_id } })
    }

  } catch (error: any) {
    return { error: "Failed to delete student" }
  }

  revalidatePath("/admin/students")
  revalidatePath("/assistant/students")
  
  const basePath = session.user.role === "ADMIN" ? "/admin" : "/assistant"
  redirect(`${basePath}/students`)
}
