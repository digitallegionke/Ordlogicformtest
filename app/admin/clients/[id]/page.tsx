"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { createClient } from "@/utils/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Mail, Phone, MapPin, Edit, Trash } from "lucide-react"
import StatusBadge from "@/components/admin/status-badge"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Client {
  id: string
  name: string
  email: string
  phone_number: string
  address: string
  created_at: string
  delivery_schedules: Array<{
    id: string
    scheduled_delivery_date: string
    produce_type: string
    expected_quantity: number
    status: string
    farmers: {
      name: string
    }
  }>
}

export default function ClientDetailsPage({ params }: { params: { id: string } }) {
  const [client, setClient] = useState<Client | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const { data: client, error } = await supabase
          .from("clients")
          .select(`
            *,
            delivery_schedules (
              id,
              scheduled_delivery_date,
              produce_type,
              expected_quantity,
              status,
              farmers (
                name
              )
            )
          `)
          .eq("id", params.id)
          .single()

        if (error) throw error
        setClient(client)
      } catch (error) {
        console.error("Error fetching client:", error)
        toast({
          title: "Error",
          description: "Failed to load client details",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [params.id, supabase])

  const handleDelete = async () => {
    try {
      const { error } = await supabase.from("clients").delete().eq("id", params.id)
      if (error) throw error

      toast({
        title: "Success",
        description: "Client deleted successfully",
      })
      window.location.href = "/admin/clients"
    } catch (error) {
      console.error("Error deleting client:", error)
      toast({
        title: "Error",
        description: "Failed to delete client",
        variant: "destructive",
      })
    }
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!client) {
    return <div>Client not found</div>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const calculateTotalSpent = () => {
    return client.delivery_schedules
      .filter((order) => order.status === "delivered")
      .reduce((total, order) => total + order.expected_quantity * 100, 0) // Assuming $100 per kg
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost">
            <Link href="/admin/clients">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Clients
            </Link>
          </Button>
          <h1 className="text-3xl font-serif font-medium text-[#2D3047]">{client.name}</h1>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/admin/clients/${client.id}/edit`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <Trash className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the client and all associated data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Client Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-[#5C6073] w-32">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </dt>
                <dd className="text-[#2D3047]">{client.email}</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-[#5C6073] w-32">
                  <Phone className="h-4 w-4 mr-2" />
                  Phone
                </dt>
                <dd className="text-[#2D3047]">{client.phone_number}</dd>
              </div>
              <div className="flex items-center">
                <dt className="flex items-center text-sm font-medium text-[#5C6073] w-32">
                  <MapPin className="h-4 w-4 mr-2" />
                  Address
                </dt>
                <dd className="text-[#2D3047]">{client.address}</dd>
              </div>
              <div className="flex items-center">
                <dt className="text-sm font-medium text-[#5C6073] w-32">Member Since</dt>
                <dd className="text-[#2D3047]">{formatDate(client.created_at)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Total Orders</dt>
                <dd className="text-3xl font-medium text-[#2D3047]">{client.delivery_schedules.length}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Active Orders</dt>
                <dd className="text-3xl font-medium text-[#2D3047]">
                  {client.delivery_schedules.filter((order) => order.status !== "delivered" && order.status !== "cancelled").length}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Total Spent</dt>
                <dd className="text-3xl font-medium text-[#2D3047]">
                  ${calculateTotalSpent().toLocaleString()}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Order History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#E8E4E0]">
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Order ID</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Delivery Date</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Farmer</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Produce</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Quantity</th>
                    <th className="px-4 py-3 text-left font-medium text-[#5C6073]">Status</th>
                    <th className="px-4 py-3 text-right font-medium text-[#5C6073]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {client.delivery_schedules
                    .sort((a, b) => new Date(b.scheduled_delivery_date).getTime() - new Date(a.scheduled_delivery_date).getTime())
                    .map((order) => (
                      <tr key={order.id} className="border-b border-[#E8E4E0] hover:bg-[#F8F5F2]">
                        <td className="px-4 py-3 font-medium text-[#2D3047]">{order.id.substring(0, 8)}</td>
                        <td className="px-4 py-3">{formatDate(order.scheduled_delivery_date)}</td>
                        <td className="px-4 py-3">{order.farmers.name}</td>
                        <td className="px-4 py-3">{order.produce_type}</td>
                        <td className="px-4 py-3">{order.expected_quantity}kg</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={order.status} />
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button asChild size="sm" variant="ghost">
                            <Link href={`/admin/orders/${order.id}`}>View Order</Link>
                          </Button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 