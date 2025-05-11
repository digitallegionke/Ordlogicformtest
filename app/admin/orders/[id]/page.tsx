import { notFound } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import StatusBadge from "@/components/admin/status-badge"
import QualityAssessmentForm from "@/components/quality-assessment-form"

export default async function OrderDetailsPage({ params }: { params: { id: string } }) {
  const supabase = createClient()

  // Fetch order details
  const { data: order } = await supabase
    .from("delivery_schedules")
    .select(
      `
      *,
      clients (
        id,
        name,
        email,
        phone_number
      ),
      farmers (
        id,
        name,
        email,
        phone_number
      ),
      quality_assessments (
        id,
        assessment_date,
        quality_grade,
        moisture_content,
        foreign_matter_content,
        damage_percentage,
        sample_type,
        notes
      )
    `
    )
    .eq("id", params.id)
    .single()

  if (!order) {
    notFound()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button asChild variant="ghost">
          <Link href="/admin/orders">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
        </Button>
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Order Details</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Order ID</dt>
                  <dd className="text-lg font-medium text-[#2D3047]">{order.id}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Status</dt>
                  <dd className="mt-1">
                    <StatusBadge status={order.status} />
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Scheduled Delivery Date</dt>
                  <dd className="text-[#2D3047]">{formatDate(order.scheduled_delivery_date)}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Drop-off Location</dt>
                  <dd className="text-[#2D3047]">{order.dropoff_location}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Produce Details</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Produce Type</dt>
                  <dd className="text-[#2D3047]">{order.produce_type}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Nature</dt>
                  <dd className="text-[#2D3047]">{order.produce_nature}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Expected Quantity</dt>
                  <dd className="text-[#2D3047]">{order.expected_quantity}kg</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Expected Quality Grade</dt>
                  <dd className="text-[#2D3047]">{order.expected_quality_grade}</dd>
                </div>
                {order.special_notes && (
                  <div>
                    <dt className="text-sm font-medium text-[#5C6073]">Special Notes</dt>
                    <dd className="text-[#2D3047]">{order.special_notes}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Client Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Name</dt>
                  <dd className="text-[#2D3047]">{order.clients.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Email</dt>
                  <dd className="text-[#2D3047]">{order.clients.email}</dd>
                </div>
                {order.clients.phone_number && (
                  <div>
                    <dt className="text-sm font-medium text-[#5C6073]">Phone</dt>
                    <dd className="text-[#2D3047]">{order.clients.phone_number}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4">
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Name</dt>
                  <dd className="text-[#2D3047]">{order.farmers.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Email</dt>
                  <dd className="text-[#2D3047]">{order.farmers.email}</dd>
                </div>
                {order.farmers.phone_number && (
                  <div>
                    <dt className="text-sm font-medium text-[#5C6073]">Phone</dt>
                    <dd className="text-[#2D3047]">{order.farmers.phone_number}</dd>
                  </div>
                )}
              </dl>
            </CardContent>
          </Card>
        </div>
      </div>

      {order.status === "shipped" && !order.quality_assessments?.length && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment</CardTitle>
          </CardHeader>
          <CardContent>
            <QualityAssessmentForm orderId={order.id} />
          </CardContent>
        </Card>
      )}

      {order.quality_assessments?.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quality Assessment Results</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Assessment Date</dt>
                <dd className="text-[#2D3047]">
                  {formatDate(order.quality_assessments[0].assessment_date)}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Quality Grade</dt>
                <dd className="text-[#2D3047]">{order.quality_assessments[0].quality_grade}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Moisture Content</dt>
                <dd className="text-[#2D3047]">{order.quality_assessments[0].moisture_content}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Foreign Matter Content</dt>
                <dd className="text-[#2D3047]">{order.quality_assessments[0].foreign_matter_content}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Damage Percentage</dt>
                <dd className="text-[#2D3047]">{order.quality_assessments[0].damage_percentage}%</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-[#5C6073]">Sample Type</dt>
                <dd className="text-[#2D3047]">{order.quality_assessments[0].sample_type}</dd>
              </div>
              {order.quality_assessments[0].notes && (
                <div>
                  <dt className="text-sm font-medium text-[#5C6073]">Notes</dt>
                  <dd className="text-[#2D3047]">{order.quality_assessments[0].notes}</dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 