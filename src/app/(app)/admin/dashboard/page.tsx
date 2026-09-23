import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserSquare2, GraduationCap, IndianRupee, Bus, CheckCircle, Clock, AlertCircle } from "lucide-react"

export default async function AdminDashboard() {
  const [
    totalStudents,
    totalAssistants,
    totalClasses,
    feesAggregate,
    pendingFeesCount,
    busStudentsCount
  ] = await Promise.all([
    prisma.student.count(),
    prisma.user.count({ where: { role: "ASSISTANT" } }),
    prisma.class.count(),
    prisma.fee.aggregate({
      _sum: {
        total_amount: true,
        paid_amount: true,
        balance_amount: true,
      }
    }),
    prisma.fee.count({ where: { status: "PENDING" } }),
    prisma.student.count({ where: { uses_bus: true } })
  ])

  const totalFees = feesAggregate._sum.total_amount || 0
  const paidFees = feesAggregate._sum.paid_amount || 0
  const totalBalance = feesAggregate._sum.balance_amount || 0

  const stats = [
    { title: "Total Students", value: totalStudents, icon: Users, color: "text-blue-600" },
    { title: "Total Assistants", value: totalAssistants, icon: UserSquare2, color: "text-indigo-600" },
    { title: "Total Classes", value: totalClasses, icon: GraduationCap, color: "text-purple-600" },
    { title: "Students on Bus", value: busStudentsCount, icon: Bus, color: "text-amber-600" },
    { title: "Total Fees", value: `₹${totalFees.toLocaleString()}`, icon: IndianRupee, color: "text-slate-600" },
    { title: "Paid Fees", value: `₹${paidFees.toLocaleString()}`, icon: CheckCircle, color: "text-green-600" },
    { title: "Total Balance", value: `₹${totalBalance.toLocaleString()}`, icon: AlertCircle, color: "text-red-600" },
    { title: "Pending Fees (Count)", value: pendingFeesCount, icon: Clock, color: "text-orange-600" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Admin Overview</h2>
        <p className="text-slate-500">Welcome to the School Management System</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
      
      {/* Additional dashboard content can go here, like charts or recent activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-500">Activity stream will appear here.</p>
          </CardContent>
        </Card>
        <Card className="col-span-3 border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
             <p className="text-sm text-slate-500">Quick actions will appear here.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
