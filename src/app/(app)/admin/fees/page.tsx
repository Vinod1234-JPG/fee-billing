import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default async function FeesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const query = (await searchParams).q || ""

  const fees = await prisma.fee.findMany({
    where: {
      OR: [
        { student: { first_name: { contains: query } } },
        { student: { last_name: { contains: query } } },
        { student: { student_id: { contains: query } } },
      ]
    },
    include: {
      student: {
        include: { class: true }
      },
    },
    orderBy: { updated_at: 'desc' }
  })

  const busFees = await prisma.busFee.findMany({
    where: {
      OR: [
        { student: { first_name: { contains: query } } },
        { student: { last_name: { contains: query } } },
        { student: { student_id: { contains: query } } },
      ]
    },
    include: {
      student: {
        include: { class: true, fees: true }
      },
      bus: true
    },
    orderBy: { updated_at: 'desc' }
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Fees Management</h2>
          <p className="text-slate-500">Track and manage student fee collections</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between gap-4">
          <form className="relative w-full max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <Input 
              name="q"
              defaultValue={query}
              placeholder="Search by student name or ID..." 
              className="pl-9 bg-slate-50 border-slate-200"
            />
          </form>
          <div className="flex gap-2">
             <Button variant="outline">Export CSV</Button>
          </div>
        </div>
        
        <Tabs defaultValue="school" className="w-full">
          <div className="px-4 pt-4">
            <TabsList>
              <TabsTrigger value="school">School Fees</TabsTrigger>
              <TabsTrigger value="bus">Bus Fees</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="school" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-slate-500">
                        No school fee records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    fees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {fee.student.first_name} {fee.student.last_name}
                          </div>
                          <div className="text-sm text-slate-500">{fee.student.student_id}</div>
                        </TableCell>
                        <TableCell>
                          {fee.student.class.class_name} - {fee.student.section}
                        </TableCell>
                        <TableCell className="text-right">₹{fee.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">₹{fee.paid_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">₹{fee.balance_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              fee.status === "COMPLETED" ? "bg-green-100 text-green-800 border-green-200" :
                              fee.status === "BALANCE" ? "bg-orange-100 text-orange-800 border-orange-200" :
                              "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Link href={`/admin/fees/payment?fee_id=${fee.id}`}>
                            <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Add Payment</Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
          
          <TabsContent value="bus" className="m-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Bus Route</TableHead>
                    <TableHead className="text-right">Total Fee</TableHead>
                    <TableHead className="text-right">Paid</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {busFees.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="h-24 text-center text-slate-500">
                        No bus fee records found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    busFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell>
                          <div className="font-medium text-slate-900">
                            {fee.student.first_name} {fee.student.last_name}
                          </div>
                          <div className="text-sm text-slate-500">{fee.student.student_id}</div>
                        </TableCell>
                        <TableCell>
                          {fee.student.class.class_name} - {fee.student.section}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium text-slate-900">{fee.bus.bus_number}</div>
                          <div className="text-sm text-slate-500">{fee.bus.route}</div>
                        </TableCell>
                        <TableCell className="text-right">₹{fee.total_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-green-600 font-medium">₹{fee.paid_amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right text-red-600 font-medium">₹{fee.balance_amount.toLocaleString()}</TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={
                              fee.status === "COMPLETED" ? "bg-green-100 text-green-800 border-green-200" :
                              fee.status === "BALANCE" ? "bg-orange-100 text-orange-800 border-orange-200" :
                              "bg-red-100 text-red-800 border-red-200"
                            }
                          >
                            {fee.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          {fee.student.fees && fee.student.fees.length > 0 ? (
                            <Link href={`/admin/fees/payment?fee_id=${fee.student.fees[0].id}`}>
                              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">Add Payment</Button>
                            </Link>
                          ) : (
                            <Button size="sm" disabled>No School Fee</Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
