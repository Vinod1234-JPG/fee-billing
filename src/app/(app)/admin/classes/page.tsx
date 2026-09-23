import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Users } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function ClassesPage() {
  const classes = await prisma.class.findMany({
    include: {
      assistant: true,
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
          <p className="text-slate-500">Manage school classes and sections</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
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
                <TableHead>Assigned Assistant</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No classes found.
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
                    <TableCell>
                      {c.assistant ? c.assistant.name : <span className="text-slate-400 italic">Unassigned</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={c.status === "ACTIVE" ? "default" : "secondary"} className={c.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                        {c.status}
                      </Badge>
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
