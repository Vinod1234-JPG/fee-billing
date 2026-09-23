"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import Papa from "papaparse"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function processCSV(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    return { error: "Unauthorized" }
  }

  const file = formData.get("file") as File
  if (!file || file.size === 0) {
    return { error: "Please select a valid CSV file" }
  }

  try {
    const text = await file.text()
    
    const result = Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
    })

    if (result.errors.length > 0) {
      return { error: "Failed to parse CSV file: " + result.errors[0].message }
    }

    const rows = result.data as any[]
    let successCount = 0
    let failureCount = 0
    let errors: string[] = []

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      try {
        if (!row.student_id || !row.first_name || !row.last_name || !row.class_name || !row.section || !row.phone) {
          throw new Error("Missing required fields (student_id, first_name, last_name, class_name, section, phone)")
        }

        let classRecord = await prisma.class.findFirst({
          where: { 
            class_name: row.class_name,
            section: row.section 
          }
        })

        if (!classRecord) {
          throw new Error(`Class ${row.class_name} - ${row.section} not found`)
        }

        const existingStudent = await prisma.student.findUnique({
          where: { student_id: row.student_id }
        })

        if (existingStudent) {
          throw new Error(`Student ID ${row.student_id} already exists`)
        }

        await prisma.$transaction(async (tx) => {
          const parent = await tx.parent.create({
            data: {
              father_name: row.father_name || null,
              mother_name: row.mother_name || null,
              phone: row.phone,
              email: row.email || null,
              address: row.address || null,
              city: row.city || null,
              state: row.state || null,
              pin_code: row.pin_code || null,
            }
          })

          const student = await tx.student.create({
            data: {
              student_id: row.student_id,
              first_name: row.first_name,
              last_name: row.last_name,
              gender: row.gender || "Not Specified",
              date_of_birth: row.date_of_birth ? new Date(row.date_of_birth) : new Date("2010-01-01"),
              blood_group: row.blood_group || null,
              admission_date: row.admission_date ? new Date(row.admission_date) : new Date(),
              class_id: classRecord!.id,
              section: row.section,
              academic_year: row.academic_year || new Date().getFullYear().toString(),
              parent_id: parent.id,
              assistant_id: session.user.role === "ASSISTANT" ? session.user.id : null,
            }
          })

          const totalFee = parseFloat(row.total_fee) || 0
          if (totalFee > 0) {
            await tx.fee.create({
              data: {
                student_id: student.id,
                total_amount: totalFee,
                balance_amount: totalFee,
                status: "PENDING",
              }
            })
          }
        })

        successCount++
      } catch (err: any) {
        failureCount++
        errors.push(`Row ${i + 2} (${row.student_id || "Unknown"}): ${err.message}`)
      }
    }

    revalidatePath("/admin/students")
    revalidatePath("/assistant/students")

    if (errors.length > 0) {
      return { 
        success: successCount > 0, 
        message: `Imported ${successCount} students. Failed to import ${failureCount} students.`,
        details: errors 
      }
    }

    return { 
      success: true, 
      message: `Successfully imported all ${successCount} students!`, 
      redirect: true 
    }

  } catch (error: any) {
    return { error: "Server error during import: " + error.message }
  }
}
