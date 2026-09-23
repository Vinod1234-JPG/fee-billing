"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export async function processPayment(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    throw new Error("Unauthorized")
  }

  const fee_id = formData.get("fee_id") as string
  const amount = parseFloat(formData.get("amount") as string)
  const payment_method = formData.get("payment_method") as string
  const transaction_id = formData.get("transaction_id") as string
  const notes = formData.get("notes") as string
  
  if (!amount || amount <= 0) {
    throw new Error("Invalid payment amount")
  }

  const fee = await prisma.fee.findUnique({
    where: { id: fee_id },
    include: { student: true }
  })

  if (!fee) throw new Error("Fee record not found")

  if (amount > fee.balance_amount) {
    throw new Error("Payment amount cannot exceed remaining balance")
  }

  const newPaidAmount = fee.paid_amount + amount
  const newBalanceAmount = fee.total_amount - newPaidAmount
  
  let newStatus = "BALANCE"
  if (newBalanceAmount <= 0) {
    newStatus = "COMPLETED"
  }

  // Transaction
  const payment = await prisma.$transaction(async (tx) => {
    // 1. Update Fee record
    await tx.fee.update({
      where: { id: fee_id },
      data: {
        paid_amount: newPaidAmount,
        balance_amount: newBalanceAmount,
        status: newStatus,
      }
    })

    // 2. Create Payment record
    const newPayment = await tx.feePayment.create({
      data: {
        student_id: fee.student_id,
        fee_id: fee.id,
        amount,
        payment_method,
        transaction_id,
        receipt_number: `REC-${Date.now()}`,
        received_by: session.user.name || "Admin",
        notes,
      }
    })

    return newPayment
  })

  revalidatePath("/admin/fees")
  revalidatePath("/assistant/fees")
  revalidatePath(`/admin/students/${fee.student_id}`)
  revalidatePath(`/assistant/students/${fee.student_id}`)
  if (session.user.role === "ADMIN") {
    redirect(`/admin/fees/receipt/${payment.id}`)
  } else {
    redirect(`/assistant/fees/receipt/${payment.id}`)
  }
}

export async function processBusPayment(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.role || (session.user.role !== "ADMIN" && session.user.role !== "ASSISTANT")) {
    throw new Error("Unauthorized")
  }

  const fee_id = formData.get("fee_id") as string
  const amount = parseFloat(formData.get("amount") as string)
  const payment_method = formData.get("payment_method") as string
  const transaction_id = formData.get("transaction_id") as string
  const notes = formData.get("notes") as string
  
  if (!amount || amount <= 0) {
    throw new Error("Invalid payment amount")
  }

  const busFee = await prisma.busFee.findUnique({
    where: { id: fee_id },
    include: { student: true }
  })

  if (!busFee) throw new Error("Bus Fee record not found")

  if (amount > busFee.balance_amount) {
    throw new Error("Payment amount cannot exceed remaining balance")
  }

  const newPaidAmount = busFee.paid_amount + amount
  const newBalanceAmount = busFee.total_amount - newPaidAmount
  
  let newStatus = "BALANCE"
  if (newBalanceAmount <= 0) {
    newStatus = "COMPLETED"
  }

  const payment = await prisma.$transaction(async (tx) => {
    await tx.busFee.update({
      where: { id: fee_id },
      data: {
        paid_amount: newPaidAmount,
        balance_amount: newBalanceAmount,
        status: newStatus,
      }
    })

    const newPayment = await tx.busPayment.create({
      data: {
        student_id: busFee.student_id,
        bus_fee_id: busFee.id,
        amount,
        payment_method,
        transaction_id,
        receipt_number: `BREC-${Date.now()}`,
        received_by: session.user.name || "Admin",
        notes,
      }
    })

    return newPayment
  })

  revalidatePath("/admin/fees")
  revalidatePath("/assistant/fees")
  revalidatePath(`/admin/students/${busFee.student_id}`)
  revalidatePath(`/assistant/students/${busFee.student_id}`)
  if (session.user.role === "ADMIN") {
    redirect(`/admin/fees/receipt/${payment.id}?type=bus`)
  } else {
    redirect(`/assistant/fees/receipt/${payment.id}?type=bus`)
  }
}
