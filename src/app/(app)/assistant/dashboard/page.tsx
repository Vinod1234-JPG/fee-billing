import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, GraduationCap, IndianRupee, Bus, CheckCircle, AlertCircle } from "lucide-react"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function AssistantDashboard() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/login")
  }

  const assistantId = session.user.id

  const [
    totalStudents,
    feesAggregate,
    busStudentsCount
  ] = await Promise.all([
    prisma.student.count(),
    prisma.fee.aggregate({
      _sum: {
        total_amount: true,
        paid_amount: true,
        balance_amount: true,
      }
    }),
    prisma.student.count({ where: { uses_bus: true } })
  ])

  const paidFees = feesAggregate._sum.paid_amount || 0
  const totalBalance = feesAggregate._sum.balance_amount || 0

  const stats = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600" },
    { title: "Bus Students", value: busStudentsCount, icon: Bus, color: "text-amber-600" },
    { title: "Total Fees Collected", value: `₹${paidFees.toLocaleString()}`, icon: CheckCircle, color: "text-green-600" },
    { title: "Total Pending Balance", value: `₹${totalBalance.toLocaleString()}`, icon: AlertCircle, color: "text-red-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Assistant Overview</h2>
        <p className="text-slate-500">Welcome, {session.user.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat, index) => (
          <Card key={index} className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-600">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-slate-800">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="pt-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Actions</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/assistant/students/new">
            <Card className="border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center space-y-2">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                  <Users className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-800">Add Student</div>
                <p className="text-xs text-slate-500">Register a new student</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/assistant/fees">
            <Card className="border border-slate-200 shadow-sm hover:border-green-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center space-y-2">
                <div className="p-3 bg-green-100 text-green-600 rounded-full">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-800">Add School Fee / Payment</div>
                <p className="text-xs text-slate-500">Record a new school fee or payment</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assistant/bus">
            <Card className="border border-slate-200 shadow-sm hover:border-amber-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center space-y-2">
                <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                  <Bus className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-800">Manage Bus / Add Bus</div>
                <p className="text-xs text-slate-500">View and update transport</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/assistant/students">
            <Card className="border border-slate-200 shadow-sm hover:border-purple-500 hover:shadow-md transition-all cursor-pointer h-full">
              <CardContent className="p-6 flex flex-col items-center text-center justify-center space-y-2">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-full">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="font-semibold text-slate-800">Student Details</div>
                <p className="text-xs text-slate-500">View and edit profiles</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
