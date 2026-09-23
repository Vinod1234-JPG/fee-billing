import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { createBus } from "./actions"
import Link from "next/link"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"

export default async function AddBusPage() {
  const session = await getServerSession(authOptions)

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-slate-800">Add New Bus</h2>
        <p className="text-slate-500">Register a new school bus to the fleet</p>
      </div>

      <Card className="border-0 shadow-sm">
        <form action={createBus}>
          <CardHeader>
            <CardTitle>Bus Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bus_number">Bus Number / Identifier</Label>
                <Input id="bus_number" name="bus_number" placeholder="Bus 101" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="vehicle_number">Vehicle Registration Number</Label>
                <Input id="vehicle_number" name="vehicle_number" placeholder="MH 12 AB 1234" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_name">Driver Name</Label>
                <Input id="driver_name" name="driver_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="driver_phone">Driver Phone</Label>
                <Input id="driver_phone" name="driver_phone" required />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="route">Route Name</Label>
                <Input id="route" name="route" placeholder="e.g. City Center Route" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="capacity">Seating Capacity</Label>
                <Input id="capacity" name="capacity" type="number" defaultValue="40" required />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Link href={session?.user?.role === "ADMIN" ? "/admin/bus" : "/assistant/bus"}>
              <Button variant="outline" type="button">Cancel</Button>
            </Link>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Save Bus</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
