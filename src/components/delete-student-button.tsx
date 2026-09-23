"use client"

import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { useState } from "react"

export function DeleteStudentButton({ studentId, action }: { studentId: string, action: (formData: FormData) => void }) {
  const [confirming, setConfirming] = useState(false)
  
  if (confirming) {
    return (
      <form action={action} className="inline-flex gap-1">
        <input type="hidden" name="student_db_id" value={studentId} />
        <Button type="submit" size="sm" variant="destructive" className="text-xs">
          Confirm Delete
        </Button>
        <Button type="button" size="sm" variant="outline" className="text-xs" onClick={() => setConfirming(false)}>
          Cancel
        </Button>
      </form>
    )
  }
  
  return (
    <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => setConfirming(true)}>
      <Trash2 className="w-3 h-3 mr-1" />
      Delete
    </Button>
  )
}
