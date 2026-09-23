import { prisma } from "@/lib/prisma"
import { Users } from "lucide-react"
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

export default async function AssistantClassesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/login")

  const classes = await prisma.class.findMany({
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: [
      { class_name: 'asc' },
      { section: 'asc' }
    ]
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Classes</h2>
          <p className="text-slate-500">View all school classes</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Section</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Students</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">
                    No classes assigned.
                  </TableCell>
                </TableRow>
              ) : (
                classes.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium text-slate-900">
                      {c.class_name}
                    </TableCell>
                    <TableCell>{c.section}</TableCell>
                    <TableCell>{c.academic_year}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span>{c._count.students}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
