import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateStudent } from "../actions"
import { StudentForm } from "@/components/student-form"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function EditStudentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params
  const session = await getServerSession(authOptions)
  const role = session?.user?.role || "ADMIN"
  const basePath = role === "ADMIN" ? "/admin" : "/assistant"
  const cancelHref = `${basePath}/students/${resolvedParams.id}`

  const student = await prisma.student.findUnique({
    where: { id: resolvedParams.id },
    include: { parent: true, class: true, fees: true, bus: true, bus_fees: true }
  })

  if (!student) {
    notFound()
  }

  const classes = await prisma.class.findMany({
    orderBy: { class_name: 'asc' }
  })

  const buses = await prisma.bus.findMany({
    orderBy: { bus_number: 'asc' }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Student</h1>
        <p className="text-muted-foreground mt-2">
          {student.first_name} {student.last_name}
        </p>
      </div>

      <StudentForm action={updateStudent} cancelHref={cancelHref}>
        <input type="hidden" name="student_db_id" value={student.id} />
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Personal Details */}
          <Card>
            <CardHeader>
              <CardTitle>Personal Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" name="first_name" defaultValue={student.first_name} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input id="last_name" name="last_name" defaultValue={student.last_name} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  <select
                    id="gender"
                    name="gender"
                    defaultValue={student.gender}
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="date_of_birth">Date of Birth</Label>
                  <Input 
                    id="date_of_birth" 
                    name="date_of_birth" 
                    type="date" 
                    defaultValue={student.date_of_birth.toISOString().split('T')[0]} 
                    required 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="blood_group">Blood Group</Label>
                <Input id="blood_group" name="blood_group" defaultValue={student.blood_group || ''} />
              </div>
            </CardContent>
          </Card>

          {/* Academic Details */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admission_date">Admission Date</Label>
                <Input 
                  id="admission_date" 
                  name="admission_date" 
                  type="date" 
                  defaultValue={student.admission_date.toISOString().split('T')[0]} 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="class_id">Class</Label>
                  <select
                    id="class_id"
                    name="class_id"
                    defaultValue={student.class_id}
                    className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.class_name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="section">Section</Label>
                  <Input id="section" name="section" defaultValue={student.section} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roll_number">Roll Number</Label>
                  <Input id="roll_number" name="roll_number" defaultValue={student.roll_number || ""} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="academic_year">Academic Year</Label>
                  <Input id="academic_year" name="academic_year" defaultValue={student.academic_year} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Parent Details */}
          <Card>
            <CardHeader>
              <CardTitle>Parent Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="father_name">Father's Name</Label>
                  <Input id="father_name" name="father_name" defaultValue={student.parent?.father_name || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mother_name">Mother's Name</Label>
                  <Input id="mother_name" name="mother_name" defaultValue={student.parent?.mother_name || ''} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" name="phone" defaultValue={student.parent?.phone || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="alternate_phone">Alternate Phone</Label>
                  <Input id="alternate_phone" name="alternate_phone" defaultValue={student.parent?.alternate_phone || ''} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" defaultValue={student.parent?.email || ''} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" defaultValue={student.parent?.address || ''} required />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" name="city" defaultValue={student.parent?.city || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input id="state" name="state" defaultValue={student.parent?.state || ''} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="pin_code">PIN Code</Label>
                  <Input id="pin_code" name="pin_code" defaultValue={student.parent?.pin_code || ''} required />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transportation Details */}
          <Card>
            <CardHeader>
              <CardTitle>Transportation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input 
                  type="checkbox" 
                  id="uses_bus" 
                  name="uses_bus" 
                  defaultChecked={student.uses_bus}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" 
                />
                <Label htmlFor="uses_bus">Uses School Bus</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus_id">Bus Number</Label>
                <select 
                  id="bus_id" 
                  name="bus_id" 
                  defaultValue={student.bus_id || ""}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Select Bus</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.bus_number} - {b.route}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_point">Pickup Point</Label>
                <Input id="pickup_point" name="pickup_point" defaultValue={student.pickup_point || ""} />
              </div>
            </CardContent>
          </Card>

          {/* Fees */}
          <Card>
            <CardHeader>
              <CardTitle>Fees Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total_fee">Total Annual School Fee</Label>
                <Input 
                  id="total_fee" 
                  name="total_fee" 
                  type="number" 
                  step="0.01" 
                  defaultValue={student.fees?.[0]?.total_amount || 0} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_bus_fee">Total Annual Bus Fee</Label>
                <Input 
                  id="total_bus_fee" 
                  name="total_bus_fee" 
                  type="number" 
                  step="0.01" 
                  defaultValue={student.bus_fees?.[0]?.total_amount || 0} 
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </StudentForm>
    </div>
  )
}
