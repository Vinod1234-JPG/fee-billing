import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createStudent } from "./actions"
import { StudentForm } from "@/components/student-form"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function NewStudentPage() {
  const session = await getServerSession(authOptions)
  const classes = await prisma.class.findMany({ orderBy: { class_name: 'asc' } })
  const buses = await prisma.bus.findMany({ orderBy: { bus_number: 'asc' } })

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Add New Student</h2>
        <p className="text-slate-500">Register a new student into the system</p>
      </div>

      <StudentForm 
        action={createStudent} 
        cancelHref={session?.user?.role === "ADMIN" ? "/admin/students" : "/assistant/students"}
      >
        {/* Personal Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Personal Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="student_id">Student ID</Label>
              <Input id="student_id" name="student_id" placeholder="STU-001" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="first_name">First Name</Label>
              <Input id="first_name" name="first_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last_name">Last Name</Label>
              <Input id="last_name" name="last_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="gender">Gender</Label>
              <select id="gender" name="gender" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date_of_birth">Date of Birth</Label>
              <Input id="date_of_birth" name="date_of_birth" type="date" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="blood_group">Blood Group</Label>
              <Input id="blood_group" name="blood_group" placeholder="O+" />
            </div>
          </CardContent>
        </Card>

        {/* Academic Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Academic Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="admission_date">Admission Date</Label>
              <Input id="admission_date" name="admission_date" type="date" required defaultValue={new Date().toISOString().split('T')[0]} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="class_id">Class</Label>
              <select id="class_id" name="class_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50" required>
                <option value="">Select Class</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.class_name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="section">Section</Label>
              <Input id="section" name="section" placeholder="A" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="roll_number">Roll Number</Label>
              <Input id="roll_number" name="roll_number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="academic_year">Academic Year</Label>
              <Input id="academic_year" name="academic_year" defaultValue="2023-2024" required />
            </div>
          </CardContent>
        </Card>

        {/* Parent Details */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Parent Details</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="father_name">Father's Name</Label>
              <Input id="father_name" name="father_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_name">Mother's Name</Label>
              <Input id="mother_name" name="mother_name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input id="phone" name="phone" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alternate_phone">Alternate Phone</Label>
              <Input id="alternate_phone" name="alternate_phone" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" />
            </div>
            <div className="col-span-2 space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" name="address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input id="city" name="city" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input id="state" name="state" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pin_code">PIN Code</Label>
              <Input id="pin_code" name="pin_code" />
            </div>
          </CardContent>
        </Card>

        {/* Transportation & Fees */}
        <div className="grid gap-6 sm:grid-cols-2">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Transportation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <input type="checkbox" id="uses_bus" name="uses_bus" className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                <Label htmlFor="uses_bus">Uses School Bus</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bus_id">Bus Number</Label>
                <select id="bus_id" name="bus_id" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select Bus</option>
                  {buses.map(b => (
                    <option key={b.id} value={b.id}>{b.bus_number} - {b.route}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pickup_point">Pickup Point</Label>
                <Input id="pickup_point" name="pickup_point" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="total_bus_fee">Total Bus Fee Limit (₹)</Label>
                <Input id="total_bus_fee" name="total_bus_fee" type="number" defaultValue="20000" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Initial Fees Setup</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="total_fee">Total Annual Fee</Label>
                <Input id="total_fee" name="total_fee" type="number" defaultValue="10000" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paid_amount">Initial Paid Amount</Label>
                <Input id="paid_amount" name="paid_amount" type="number" defaultValue="0" />
              </div>
            </CardContent>
          </Card>
        </div>

      </StudentForm>
    </div>
  )
}
