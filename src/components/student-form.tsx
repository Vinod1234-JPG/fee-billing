"use client"

import { useActionState } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { useFormStatus } from "react-dom"

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={pending}>
      {pending ? "Saving..." : "Save Student"}
    </Button>
  )
}

export function StudentForm({ 
  action, 
  children,
  cancelHref
}: { 
  action: any, 
  children: React.ReactNode,
  cancelHref: string
}) {
  const [state, formAction] = useActionState<{ error?: string } | null, FormData>(action, null)

  return (
    <form action={formAction} className="space-y-6">
      {state?.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md flex items-center text-red-800">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          <p>{state.error}</p>
        </div>
      )}
      
      {children}
      
      <div className="flex justify-end space-x-4">
        <Link href={cancelHref}>
          <Button variant="outline" type="button">Cancel</Button>
        </Link>
        <SubmitButton />
      </div>
    </form>
  )
}
