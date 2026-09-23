import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AssistantStudentsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const query = (await searchParams).q || ""
  
  const students = await prisma.student.findMany({
    where: {
      OR: [
        { first_name: { contains: query } },
        { last_name: { contains: query } },
        { student_id: { contains: query } },
      ]
    },
    include: {
      class: true,
      fees: true,
    },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Students</h2>
          <p className="text-slate-500">View and manage all students</p>
        </div>
        <Link href="/assistant/students/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Student
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <form className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              name="q"
              defaultValue={query}
              placeholder="Search by name or ID..." 
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </form>
        </div>
        
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Gender</TableHead>
                <TableHead>Fee Status</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No students found.
                  </TableCell>
                </TableRow>
              ) : (
                students.map((student) => {
                  const feeStatus = student.fees[0]?.status || "PENDING"
                  return (
                    <TableRow key={student.id}>
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-sm text-slate-500">{student.student_id}</div>
                      </TableCell>
                      <TableCell>
                        {student.class.class_name} - {student.section}
                      </TableCell>
                      <TableCell>{student.gender}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={feeStatus === "COMPLETED" ? "default" : feeStatus === "BALANCE" ? "secondary" : "destructive"}
                          className={
                            feeStatus === "COMPLETED" ? "bg-green-100 text-green-800 hover:bg-green-100" :
                            feeStatus === "BALANCE" ? "bg-orange-100 text-orange-800 hover:bg-orange-100" :
                            "bg-red-100 text-red-800 hover:bg-red-100"
                          }
                        >
                          {feeStatus}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {student.uses_bus ? (
                          <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">Yes</Badge>
                        ) : (
                          <span className="text-slate-400 text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Link href={`/assistant/students/${student.id}`}>
                          <Button variant="outline" size="sm">View</Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
