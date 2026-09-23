import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Phone, MapPin, Bus, FileText, CreditCard, Calendar, Pencil, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { DeleteStudentButton } from "@/components/delete-student-button"
import { deleteStudent } from "./actions"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function StudentProfilePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const id = (await params).id
  const session = await getServerSession(authOptions)
  const student = await prisma.student.findUnique({
    where: { id },
    include: {
      parent: true,
      class: true,
      bus: true,
      fees: {
        include: {
          payments: { orderBy: { payment_date: 'desc' } }
        }
      },
      bus_fees: {
        include: {
          payments: { orderBy: { payment_date: 'desc' } }
        }
      }
    }
  })

  if (!student) {
    notFound()
  }

  const fee = student.fees[0]
  const feeStatus = fee?.status || "PENDING"

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header Profile Summary */}
      <Card className="border-0 shadow-sm overflow-hidden">
        <div className="h-32 bg-slate-900 w-full relative"></div>
        <div className="px-6 pb-6 relative">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end -mt-12 sm:-mt-16 mb-4 sm:mb-0 gap-4">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full border-4 border-white bg-slate-200 overflow-hidden shadow-sm flex items-center justify-center">
                <User className="w-12 h-12 text-slate-400" />
              </div>
              <div className="pb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
                  {student.first_name} {student.last_name}
                </h1>
                <p className="text-slate-500 font-medium">ID: {student.student_id}</p>
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 pb-2">
              <div className="flex gap-2">
                <Badge variant="secondary" className="px-3 py-1 text-sm font-medium">
                  {student.class.class_name} - {student.section}
                </Badge>
                <Badge 
                  variant="outline" 
                  className={
                    feeStatus === "COMPLETED" ? "bg-green-100 text-green-800 border-green-200" :
                    feeStatus === "BALANCE" ? "bg-orange-100 text-orange-800 border-orange-200" :
                    "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {feeStatus}
                </Badge>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/students/${student.id}/edit`}>
                  <Button size="sm" variant="outline" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                    <Pencil className="w-3 h-3 mr-1" /> Edit
                  </Button>
                </Link>
                <DeleteStudentButton studentId={student.id} action={deleteStudent} />
              </div>
            </div>
          </div>
        </div>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="parent">Parent</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="fees">Fees</TabsTrigger>
          <TabsTrigger value="bus">Bus</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Class Details</CardTitle>
                <FileText className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.class.class_name}</div>
                <p className="text-xs text-slate-500">Section {student.section} • Roll No: {student.roll_number || "N/A"}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
                <CreditCard className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{fee?.balance_amount?.toLocaleString() || 0}</div>
                <p className="text-xs text-slate-500">Out of ₹{fee?.total_amount?.toLocaleString() || 0}</p>
              </CardContent>
            </Card>
            <Card className="shadow-sm border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Emergency Contact</CardTitle>
                <Phone className="w-4 h-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{student.parent.phone}</div>
                <p className="text-xs text-slate-500">{student.parent.father_name || student.parent.mother_name}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PERSONAL DETAILS TAB */}
        <TabsContent value="personal">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 border-b pb-4">
                <div>
                  <div className="text-sm text-slate-500">Gender</div>
                  <div className="font-medium">{student.gender}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Date of Birth</div>
                  <div className="font-medium">{student.date_of_birth.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Blood Group</div>
                  <div className="font-medium">{student.blood_group || "N/A"}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* PARENT DETAILS TAB */}
        <TabsContent value="parent">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Parent / Guardian Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-b pb-6">
                <div>
                  <div className="text-sm text-slate-500">Father's Name</div>
                  <div className="font-medium">{student.parent.father_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Mother's Name</div>
                  <div className="font-medium">{student.parent.mother_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Primary Phone</div>
                  <div className="font-medium">{student.parent.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Alternate Phone</div>
                  <div className="font-medium">{student.parent.alternate_phone || "N/A"}</div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Email</div>
                  <div className="font-medium">{student.parent.email || "N/A"}</div>
                </div>
              </div>
              <div>
                <div className="text-sm text-slate-500 mb-1 flex items-center gap-1">
                  <MapPin className="w-4 h-4" /> Address
                </div>
                <div className="font-medium">
                  {student.parent.address ? (
                    <>
                      {student.parent.address}, {student.parent.city}, {student.parent.state} - {student.parent.pin_code}
                    </>
                  ) : "No address provided."}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ACADEMIC DETAILS TAB */}
        <TabsContent value="academic">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Academic Records</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-slate-500">Admission Date</div>
                  <div className="font-medium flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    {student.admission_date.toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-slate-500">Academic Year</div>
                  <div className="font-medium">{student.academic_year}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* FEES TAB */}
        <TabsContent value="fees">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Fee Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* School Fee Section */}
              <div>
                <h3 className="font-semibold text-lg text-slate-800 mb-4 border-b pb-2">School Fees</h3>
                {fee ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 p-4 bg-slate-50 rounded-lg border">
                      <div>
                        <div className="text-sm text-slate-500">Total Fee</div>
                        <div className="text-xl font-bold text-slate-800">₹{fee.total_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Paid Amount</div>
                        <div className="text-xl font-bold text-green-600">₹{fee.paid_amount.toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Balance</div>
                        <div className="text-xl font-bold text-red-600">₹{fee.balance_amount.toLocaleString()}</div>
                      </div>
                    </div>

                    {fee.payments.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm text-slate-500 mb-2 uppercase tracking-wide">Payment History</h4>
                        <div className="border rounded-md divide-y">
                          {fee.payments.map(payment => (
                            <div key={payment.id} className="p-4 flex justify-between items-center">
                              <div>
                                <div className="font-medium text-slate-800">₹{payment.amount.toLocaleString()}</div>
                                <div className="text-sm text-slate-500">{payment.payment_date.toLocaleDateString()} • {payment.payment_method}</div>
                              </div>
                              <div className="text-right">
                                <div className="text-sm font-medium">{payment.receipt_number}</div>
                                <div className="text-xs text-slate-400">By {payment.received_by}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed">No school fee records found.</div>
                )}
              </div>

              {/* Bus Fee Section */}
              {student.uses_bus && (
                <div>
                  <h3 className="font-semibold text-lg text-slate-800 mb-4 border-b pb-2">Bus Fees</h3>
                  {student.bus_fees && student.bus_fees.length > 0 ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-4 p-4 bg-amber-50 rounded-lg border border-amber-100">
                        <div>
                          <div className="text-sm text-slate-500">Total Bus Fee</div>
                          <div className="text-xl font-bold text-slate-800">₹{student.bus_fees[0].total_amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Paid Amount</div>
                          <div className="text-xl font-bold text-green-600">₹{student.bus_fees[0].paid_amount.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-sm text-slate-500">Balance</div>
                          <div className="text-xl font-bold text-red-600">₹{student.bus_fees[0].balance_amount.toLocaleString()}</div>
                        </div>
                      </div>

                      {student.bus_fees[0].payments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-sm text-slate-500 mb-2 uppercase tracking-wide">Bus Payment History</h4>
                          <div className="border rounded-md divide-y">
                            {student.bus_fees[0].payments.map(payment => (
                              <div key={payment.id} className="p-4 flex justify-between items-center">
                                <div>
                                  <div className="font-medium text-slate-800">₹{payment.amount.toLocaleString()}</div>
                                  <div className="text-sm text-slate-500">{payment.payment_date.toLocaleDateString()} • {payment.payment_method}</div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-medium">{payment.receipt_number}</div>
                                  <div className="text-xs text-slate-400">By {payment.received_by}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center p-6 text-slate-500 bg-slate-50 rounded-lg border border-dashed">No bus fee records found. Edit student to set up bus fees.</div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* BUS DETAILS TAB */}
        <TabsContent value="bus">
          <Card className="shadow-sm border-0">
            <CardHeader>
              <CardTitle>Transportation</CardTitle>
            </CardHeader>
            <CardContent>
              {student.uses_bus ? (
                student.bus ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center">
                        <Bus className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-xl font-bold text-slate-800">{student.bus.bus_number}</div>
                        <div className="text-sm text-slate-500">Route: {student.bus.route}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                      <div>
                        <div className="text-sm text-slate-500">Pickup Point</div>
                        <div className="font-medium">{student.pickup_point || "Not specified"}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Driver Name</div>
                        <div className="font-medium">{student.bus.driver_name}</div>
                      </div>
                      <div>
                        <div className="text-sm text-slate-500">Driver Phone</div>
                        <div className="font-medium">{student.bus.driver_phone}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-8 bg-amber-50 rounded-lg border border-amber-200 border-dashed">
                    <Bus className="w-8 h-8 text-amber-300 mx-auto mb-2" />
                    <p className="text-amber-700 font-medium">Student uses the bus, but no route is assigned yet.</p>
                    <p className="text-sm text-amber-600/80 mt-1">Please edit the student profile to select a bus route.</p>
                  </div>
                )
              ) : (
                <div className="text-center p-8 bg-slate-50 rounded-lg border border-dashed">
                  <Bus className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-slate-500">Student does not use the school bus.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
