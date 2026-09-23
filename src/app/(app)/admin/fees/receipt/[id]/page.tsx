import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Printer, Download, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { PrintButton } from "@/components/print-button"

export default async function ReceiptPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>,
  searchParams: Promise<{ type?: string }>
}) {
  const id = (await params).id
  const type = (await searchParams).type

  let payment: any = null

  if (type === "bus") {
    payment = await prisma.busPayment.findUnique({
      where: { id },
      include: {
        student: { include: { class: true } },
        bus_fee: true,
      }
    })
  } else {
    payment = await prisma.feePayment.findUnique({
      where: { id },
      include: {
        student: { include: { class: true } },
        fee: true,
      }
    })
  }

  if (!payment) notFound()

  const feeData = type === "bus" ? payment.bus_fee : payment.fee
  const receiptTitle = type === "bus" ? "Bus Fee Payment" : "Tuition Fee Payment"

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="flex justify-between items-center">
        <Link href={`/admin/students/${payment.student_id}`}>
          <Button variant="ghost" className="text-slate-500">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Student
          </Button>
        </Link>
        <div className="flex gap-2">
          <PrintButton />
        </div>
      </div>

      <div className="bg-white p-8 sm:p-12 border rounded-lg shadow-sm print:shadow-none print:border-none print:m-0 print:p-0">
        {/* Receipt Header */}
        <div className="flex justify-between items-start border-b pb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 tracking-tight">SchoolAdmin Institute</h1>
            <p className="text-slate-500 mt-1">123 Education Lane, Knowledge City</p>
            <p className="text-slate-500">Phone: +1 234 567 8900 | Email: accounts@school.com</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-blue-600 mb-1">FEE RECEIPT</h2>
            <div className="text-slate-600">
              <span className="font-semibold">Receipt No:</span> {payment.receipt_number}
            </div>
            <div className="text-slate-600">
              <span className="font-semibold">Date:</span> {payment.payment_date.toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Student Info */}
        <div className="py-8 grid grid-cols-2 gap-8">
          <div>
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Student Details</h3>
            <div className="text-lg font-bold text-slate-800">
              {payment.student.first_name} {payment.student.last_name}
            </div>
            <div className="text-slate-600">ID: {payment.student.student_id}</div>
            <div className="text-slate-600">Class: {payment.student.class.class_name} - {payment.student.section}</div>
            <div className="text-slate-600">Roll No: {payment.student.roll_number || "N/A"}</div>
          </div>
          <div className="text-right">
            <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2">Payment Details</h3>
            <div className="text-slate-600"><span className="font-medium">Method:</span> {payment.payment_method}</div>
            {payment.transaction_id && (
              <div className="text-slate-600"><span className="font-medium">Txn ID:</span> {payment.transaction_id}</div>
            )}
            <div className="text-slate-600"><span className="font-medium">Received By:</span> {payment.received_by}</div>
          </div>
        </div>

        {/* Payment Amount Table */}
        <div className="border rounded-md overflow-hidden mb-8">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b">
              <tr>
                <th className="py-3 px-4 font-semibold text-slate-700">Description</th>
                <th className="py-3 px-4 font-semibold text-slate-700 text-right">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="py-4 px-4 text-slate-800">{receiptTitle} (Academic Year {payment.student.academic_year})</td>
                <td className="py-4 px-4 text-right font-bold text-slate-800 text-lg">₹{payment.amount.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end mb-12">
          <div className="w-1/2 space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>Total Annual Fee:</span>
              <span>₹{feeData.total_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>Total Paid (Including this):</span>
              <span>₹{feeData.paid_amount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-slate-800 border-t pt-2 mt-2">
              <span>Remaining Balance:</span>
              <span>₹{feeData.balance_amount.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t pt-8 flex justify-between items-end text-slate-500 text-sm">
          <div>
            <p className="italic">"Education is the passport to the future."</p>
            <p className="mt-1">This is a computer-generated receipt.</p>
          </div>
          <div className="text-center">
            <div className="border-b border-slate-400 w-48 mb-2"></div>
            <p>Authorized Signatory</p>
          </div>
        </div>
      </div>
      
      {/* Script to enable print styling only for the component */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:m-0, .print\\:m-0 * {
            visibility: visible;
          }
          .print\\:m-0 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  )
}
