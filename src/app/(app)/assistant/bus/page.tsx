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

export default async function BusPage() {
  const buses = await prisma.bus.findMany({
    include: {
      _count: {
        select: { students: true }
      }
    },
    orderBy: { bus_number: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Bus Management</h2>
          <p className="text-slate-500">Manage school transportation</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Bus
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bus Number</TableHead>
                <TableHead>Vehicle Number</TableHead>
                <TableHead>Driver Info</TableHead>
                <TableHead>Route</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Assigned Students</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                    No buses found.
                  </TableCell>
                </TableRow>
              ) : (
                buses.map((bus) => (
                  <TableRow key={bus.id}>
                    <TableCell className="font-bold text-slate-900">
                      {bus.bus_number}
                    </TableCell>
                    <TableCell>{bus.vehicle_number}</TableCell>
                    <TableCell>
                      <div>{bus.driver_name}</div>
                      <div className="text-sm text-slate-500">{bus.driver_phone}</div>
                    </TableCell>
                    <TableCell>{bus.route}</TableCell>
                    <TableCell>{bus.capacity} seats</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-medium">
                        <Users className="w-4 h-4 text-slate-400" />
                        <span className={bus._count.students > bus.capacity ? "text-red-600" : ""}>
                          {bus._count.students} / {bus.capacity}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={bus.status === "ACTIVE" ? "default" : "secondary"} className={bus.status === "ACTIVE" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""}>
                        {bus.status}
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
