"use client"

import { useState } from "react"
import { createClient } from "@/utils/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Save, RefreshCw } from "lucide-react"

export default function SettingsPage() {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [settings, setSettings] = useState({
    notifications: {
      emailNotifications: true,
      smsNotifications: false,
      orderUpdates: true,
      qualityReports: true,
      systemAlerts: true,
    },
    quality: {
      minimumQualityGrade: "3",
      maximumMoistureContent: "14",
      maximumForeignMatter: "2",
      maximumDamage: "5",
    },
    system: {
      companyName: "Ordlogic",
      supportEmail: "support@ordlogic.com",
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
    },
  })

  const handleNotificationChange = (key: string) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: !prev.notifications[key as keyof typeof prev.notifications],
      },
    }))
  }

  const handleQualityChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      quality: {
        ...prev.quality,
        [key]: value,
      },
    }))
  }

  const handleSystemChange = (key: string, value: string) => {
    setSettings((prev) => ({
      ...prev,
      system: {
        ...prev.system,
        [key]: value,
      },
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      // Save settings to database
      const { error } = await supabase.from("system_settings").upsert({
        id: 1, // Assuming we have a single settings record
        settings: settings,
      })

      if (error) throw error

      toast({
        title: "Settings saved",
        description: "Your settings have been updated successfully.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving settings",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-serif font-medium text-[#2D3047]">Settings</h1>
        <div className="flex gap-2">
          <Button variant="outline" disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="notifications">
        <TabsList>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="quality">Quality Standards</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-[#5C6073]">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={() => handleNotificationChange("emailNotifications")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>SMS Notifications</Label>
                  <p className="text-sm text-[#5C6073]">Receive updates via SMS</p>
                </div>
                <Switch
                  checked={settings.notifications.smsNotifications}
                  onCheckedChange={() => handleNotificationChange("smsNotifications")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Order Updates</Label>
                  <p className="text-sm text-[#5C6073]">Notifications about order status changes</p>
                </div>
                <Switch
                  checked={settings.notifications.orderUpdates}
                  onCheckedChange={() => handleNotificationChange("orderUpdates")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Quality Reports</Label>
                  <p className="text-sm text-[#5C6073]">Notifications about quality assessments</p>
                </div>
                <Switch
                  checked={settings.notifications.qualityReports}
                  onCheckedChange={() => handleNotificationChange("qualityReports")}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>System Alerts</Label>
                  <p className="text-sm text-[#5C6073]">Important system notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.systemAlerts}
                  onCheckedChange={() => handleNotificationChange("systemAlerts")}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Quality Standards</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Minimum Quality Grade</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={settings.quality.minimumQualityGrade}
                    onChange={(e) => handleQualityChange("minimumQualityGrade", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                  <p className="text-sm text-[#5C6073]">Minimum acceptable quality grade (1-5)</p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Moisture Content (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.quality.maximumMoistureContent}
                    onChange={(e) => handleQualityChange("maximumMoistureContent", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                  <p className="text-sm text-[#5C6073]">Maximum acceptable moisture content</p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Foreign Matter (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.quality.maximumForeignMatter}
                    onChange={(e) => handleQualityChange("maximumForeignMatter", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                  <p className="text-sm text-[#5C6073]">Maximum acceptable foreign matter content</p>
                </div>
                <div className="space-y-2">
                  <Label>Maximum Damage (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={settings.quality.maximumDamage}
                    onChange={(e) => handleQualityChange("maximumDamage", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                  <p className="text-sm text-[#5C6073]">Maximum acceptable damage percentage</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    value={settings.system.companyName}
                    onChange={(e) => handleSystemChange("companyName", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Support Email</Label>
                  <Input
                    type="email"
                    value={settings.system.supportEmail}
                    onChange={(e) => handleSystemChange("supportEmail", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Timezone</Label>
                  <Input
                    value={settings.system.timezone}
                    onChange={(e) => handleSystemChange("timezone", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Date Format</Label>
                  <Input
                    value={settings.system.dateFormat}
                    onChange={(e) => handleSystemChange("dateFormat", e.target.value)}
                    className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 