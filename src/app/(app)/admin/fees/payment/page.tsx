import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { processPayment, processBusPayment } from "./actions"
import { CombinedPaymentForm } from "@/components/payment-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function AddPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{ fee_id?: string }>
}) {
  const session = await getServerSession(authOptions)
  const fee_id = (await searchParams).fee_id

  if (!fee_id) notFound()

  const fee = await prisma.fee.findUnique({
    where: { id: fee_id },
    include: {
      student: { include: { class: true } }
    }
  })

  if (!fee) notFound()

  // Also fetch bus fee for same student
  const busFee = await prisma.busFee.findFirst({
    where: { student_id: fee.student_id },
    include: { bus: true }
  })

  // Build fee options
  const fees = [
    {
      id: fee.id,
      label: "School Fee",
      totalAmount: fee.total_amount,
      paidAmount: fee.paid_amount,
      balanceAmount: fee.balance_amount,
      type: "school" as const,
    },
  ]

  if (busFee) {
    fees.push({
      id: busFee.id,
      label: "Bus Fee",
      totalAmount: busFee.total_amount,
      paidAmount: busFee.paid_amount,
      balanceAmount: busFee.balance_amount,
      type: "bus" as const,
    })
  }

  const cancelHref = session?.user?.role === "ADMIN" ? "/admin/fees" : "/assistant/fees"

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Record Fee Payment</h2>
        <p className="text-slate-500">
          Add a new payment for <span className="font-medium text-slate-700">{fee.student.first_name} {fee.student.last_name}</span>
          <span className="text-xs ml-2 text-slate-400">({fee.student.student_id}) &middot; {fee.student.class.class_name} - {fee.student.section}</span>
        </p>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
          <CardDescription>Select fee type, enter amount and payment method.</CardDescription>
        </CardHeader>
        <CombinedPaymentForm
          fees={fees}
          cancelHref={cancelHref}
          schoolFeeAction={processPayment}
          busFeeAction={busFee ? processBusPayment : undefined}
        />
      </Card>
    </div>
  )
}
