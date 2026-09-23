"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CardContent, CardFooter } from "@/components/ui/card"
import Link from "next/link"
import { useFormStatus } from "react-dom"

function SubmitButton({ disabled }: { disabled: boolean }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={disabled || pending}>
      {pending ? "Processing..." : "Record Payment & Generate Receipt"}
    </Button>
  )
}

type FeeOption = {
  id: string
  label: string
  totalAmount: number
  paidAmount: number
  balanceAmount: number
  type: "school" | "bus"
}

export function CombinedPaymentForm({ 
  fees,
  cancelHref,
  schoolFeeAction,
  busFeeAction,
}: { 
  fees: FeeOption[]
  cancelHref: string
  schoolFeeAction: (formData: FormData) => void
  busFeeAction?: (formData: FormData) => void
}) {
  const [selectedFeeIndex, setSelectedFeeIndex] = useState(0)
  const [method, setMethod] = useState("Cash")
  const [amount, setAmount] = useState(fees[0]?.balanceAmount.toString() || "0")

  const selectedFee = fees[selectedFeeIndex]
  const balanceAmount = selectedFee?.balanceAmount || 0
  const isOverpaid = parseFloat(amount) > balanceAmount
  const isDisabled = balanceAmount <= 0 || isOverpaid || parseFloat(amount) <= 0 || isNaN(parseFloat(amount))

  const currentAction = selectedFee?.type === "bus" && busFeeAction ? busFeeAction : schoolFeeAction

  const handleFeeChange = (index: number) => {
    setSelectedFeeIndex(index)
    setAmount(fees[index].balanceAmount.toString())
  }

  return (
    <form action={currentAction}>
      <input type="hidden" name="fee_id" value={selectedFee?.id || ""} />
      <CardContent className="space-y-4">
        {/* Fee Type Selector */}
        {fees.length > 1 && (
          <div className="space-y-2">
            <Label>Fee Type</Label>
            <div className="flex flex-col gap-3">
              {fees.map((fee, index) => (
                <button
                  key={fee.id}
                  type="button"
                  onClick={() => handleFeeChange(index)}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    selectedFeeIndex === index 
                      ? fee.type === "bus" 
                        ? "border-amber-500 bg-amber-50" 
                        : "border-blue-500 bg-blue-50"
                      : "border-slate-200 bg-white hover:border-slate-300"
                  }`}
                >
                  <div className={`text-sm font-semibold ${
                    selectedFeeIndex === index 
                      ? fee.type === "bus" ? "text-amber-700" : "text-blue-700"
                      : "text-slate-700"
                  }`}>
                    {fee.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    Balance: <span className="font-medium text-red-600">₹{fee.balanceAmount.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Fee Summary for selected type */}
        <div className={`rounded-lg p-3 space-y-1 text-sm ${
          selectedFee?.type === "bus" ? "bg-amber-50 border border-amber-200" : "bg-blue-50 border border-blue-200"
        }`}>
          <div className="flex justify-between">
            <span className="text-slate-600">Total {selectedFee?.label}</span>
            <span className="font-medium">₹{selectedFee?.totalAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-600">Paid so far</span>
            <span className="text-green-600 font-medium">₹{selectedFee?.paidAmount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-200">
            <span className="font-semibold text-slate-800">Remaining</span>
            <span className="font-bold text-red-600">₹{balanceAmount.toLocaleString()}</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount (₹)</Label>
          <Input 
            id="amount" 
            name="amount" 
            type="number" 
            max={balanceAmount} 
            required 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${isOverpaid ? 'text-red-500' : 'text-slate-500'}`}>
              Maximum allowed is ₹{balanceAmount.toLocaleString()}
            </p>
            {!isOverpaid && amount && parseFloat(amount) > 0 && (
              <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Balance after payment: ₹{(balanceAmount - parseFloat(amount)).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <select 
            id="payment_method" 
            name="payment_method" 
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            required
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {method !== "Cash" && (
          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction ID / Reference (Required for {method})</Label>
            <Input id="transaction_id" name="transaction_id" placeholder={`e.g. ${method} Ref No.`} required />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes (Optional)</Label>
          <Input id="notes" name="notes" placeholder="Any remarks regarding this payment" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Link href={cancelHref}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <SubmitButton disabled={isDisabled} />
      </CardFooter>
    </form>
  )
}

// Keep old PaymentForm for backwards compat (bus-fees standalone page)
export function PaymentForm({ 
  feeId, 
  balanceAmount, 
  cancelHref,
  action 
}: { 
  feeId: string, 
  balanceAmount: number, 
  cancelHref: string,
  action: (formData: FormData) => void 
}) {
  const [method, setMethod] = useState("Cash")
  const [amount, setAmount] = useState(balanceAmount.toString())

  const isOverpaid = parseFloat(amount) > balanceAmount
  const isDisabled = balanceAmount <= 0 || isOverpaid || parseFloat(amount) <= 0

  return (
    <form action={action}>
      <input type="hidden" name="fee_id" value={feeId} />
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="amount">Payment Amount (₹)</Label>
          <Input 
            id="amount" 
            name="amount" 
            type="number" 
            max={balanceAmount} 
            required 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-lg font-semibold"
          />
          <div className="flex justify-between items-center mt-2">
            <p className={`text-xs ${isOverpaid ? 'text-red-500' : 'text-slate-500'}`}>
              Maximum allowed is ₹{balanceAmount.toLocaleString()}
            </p>
            {!isOverpaid && amount && parseFloat(amount) > 0 && (
              <p className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                Balance after payment: ₹{(balanceAmount - parseFloat(amount)).toLocaleString()}
              </p>
            )}
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="payment_method">Payment Method</Label>
          <select 
            id="payment_method" 
            name="payment_method" 
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" 
            required
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Bank Transfer">Bank Transfer</option>
            <option value="Card">Credit/Debit Card</option>
            <option value="Cheque">Cheque</option>
          </select>
        </div>

        {method !== "Cash" && (
          <div className="space-y-2">
            <Label htmlFor="transaction_id">Transaction ID / Reference (Required for {method})</Label>
            <Input id="transaction_id" name="transaction_id" placeholder={`e.g. ${method} Ref No.`} required />
          </div>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="notes">Internal Notes (Optional)</Label>
          <Input id="notes" name="notes" placeholder="Any remarks regarding this payment" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-6">
        <Link href={cancelHref}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <SubmitButton disabled={isDisabled} />
      </CardFooter>
    </form>
  )
}
