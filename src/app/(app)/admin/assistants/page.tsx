import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Plus, Check, X } from "lucide-react"
import Link from "next/link"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AssistantsPage() {
  const assistants = await prisma.user.findMany({
    where: { role: "ASSISTANT" },
    include: {
      _count: {
        select: { students: true, classes: true }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Assistants</h2>
          <p className="text-slate-500">Manage assistant accounts and permissions</p>
        </div>
        <Link href="/admin/assistants/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            Add Assistant
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Assigned Classes</TableHead>
                <TableHead>Assigned Students</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {assistants.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-slate-500">
                    No assistants found.
                  </TableCell>
                </TableRow>
              ) : (
                assistants.map((assistant) => (
                  <TableRow key={assistant.id}>
                    <TableCell className="font-medium text-slate-900">
                      {assistant.name}
                    </TableCell>
                    <TableCell>
                      <div>{assistant.email}</div>
                      <div className="text-sm text-slate-500">{assistant.phone || "No phone"}</div>
                    </TableCell>
                    <TableCell>{assistant._count.classes}</TableCell>
                    <TableCell>{assistant._count.students}</TableCell>
                    <TableCell>
                      <Badge variant={assistant.status === "ACTIVE" ? "default" : "secondary"} className={assistant.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                        {assistant.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link href={`/admin/assistants/${assistant.id}/edit`}>
                        <Button variant="outline" size="sm">Edit</Button>
                      </Link>
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
