import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default async function AuditLogsPage() {
  const logs = await prisma.auditLog.findMany({
    orderBy: { created_at: 'desc' },
    take: 100 // Show latest 100 for now
  })

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Audit Logs</h2>
        <p className="text-slate-500">Monitor system activity and user actions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest 100 actions recorded in the system.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date & Time</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Entity</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-slate-500">
                      No audit logs found. Start making changes to see them here!
                    </TableCell>
                  </TableRow>
                ) : (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">
                          {log.created_at.toLocaleDateString()}
                        </div>
                        <div className="text-xs text-slate-500">
                          {log.created_at.toLocaleTimeString()}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{log.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          log.action === 'CREATE' ? 'bg-green-50 text-green-700 border-green-200' :
                          log.action === 'UPDATE' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          log.action === 'DELETE' ? 'bg-red-50 text-red-700 border-red-200' :
                          'bg-slate-50 text-slate-700 border-slate-200'
                        }>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-medium text-slate-700">{log.entity}</TableCell>
                      <TableCell className="text-sm text-slate-500 max-w-xs truncate" title={log.details || ""}>
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
