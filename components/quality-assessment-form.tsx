"use client"

import type React from "react"

import { useState } from "react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { v4 as uuidv4 } from "uuid"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"

const QualityAssessmentForm = () => {
  const [formData, setFormData] = useState({
    clientName: "",
    clientEmail: "",
    clientOrganization: "",
    produceType: "",
    maturityStage: "",
    qualityGrade: "",
    sampleType: "",
    notes: "",
  })
  const [coloringRate, setColoringRate] = useState<number | null>(null)
  const [externalImage, setExternalImage] = useState<File | null>(null)
  const [internalImage, setInternalImage] = useState<File | null>(null)
  const [externalImagePath, setExternalImagePath] = useState<string | null>(null)
  const [internalImagePath, setInternalImagePath] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()
  const router = useRouter()

  const handleInputChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleExternalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }
    setExternalImage(e.target.files[0])
  }

  const handleInternalImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) {
      return
    }
    setInternalImage(e.target.files[0])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading) {
      return
    }

    if (!externalImage || !internalImage) {
      toast({
        title: "Error",
        description: "Please upload both external and internal images.",
        variant: "destructive",
      })
      return
    }

    // Upload images to Supabase storage
    const externalImageName = `${uuidv4()}-${externalImage.name}`
    const internalImageName = `${uuidv4()}-${internalImage.name}`

    const { error: externalImageError } = await supabase.storage
      .from("quality-assessment-images")
      .upload(externalImageName, externalImage, {
        cacheControl: "3600",
        upsert: false,
      })

    const { error: internalImageError } = await supabase.storage
      .from("quality-assessment-images")
      .upload(internalImageName, internalImage, {
        cacheControl: "3600",
        upsert: false,
      })

    if (externalImageError || internalImageError) {
      toast({
        title: "Error",
        description: externalImageError?.message || internalImageError?.message || "Failed to upload images.",
        variant: "destructive",
      })
      return
    }

    // Get public URLs for the images
    const externalImageUrl = supabase.storage.from("quality-assessment-images").getPublicUrl(externalImageName)
      .data.publicUrl
    const internalImageUrl = supabase.storage.from("quality-assessment-images").getPublicUrl(internalImageName)
      .data.publicUrl

    setExternalImagePath(externalImageUrl)
    setInternalImagePath(internalImageUrl)

    // Insert assessment data
    const { error } = await supabase.from("quality_assessments").insert([
      {
        client_name: formData.clientName,
        client_email: formData.clientEmail,
        client_organization: formData.clientOrganization,
        produce_type: formData.produceType,
        maturity_stage: formData.maturityStage,
        coloring_rate: coloringRate,
        external_image_path: externalImageUrl,
        internal_image_path: internalImageUrl,
        quality_grade: formData.qualityGrade,
        sample_type: formData.sampleType,
        notes: formData.notes,
      },
    ])

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Success",
      description: "Quality assessment submitted successfully!",
    })

    // Reset form
    setFormData({
      clientName: "",
      clientEmail: "",
      clientOrganization: "",
      produceType: "",
      maturityStage: "",
      qualityGrade: "",
      sampleType: "",
      notes: "",
    })
    setColoringRate(null)
    setExternalImage(null)
    setInternalImage(null)
    setExternalImagePath(null)
    setInternalImagePath(null)

    router.push("/")
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      {/* Client Information Section */}
      <div className="bg-[#f0f5eb] p-4 rounded-md mb-4">
        <h3 className="text-[#3c5a28] font-medium mb-3">Client Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="clientName">Name</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => handleInputChange("clientName", e.target.value)}
              placeholder="Your name"
              className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientEmail">Email Address</Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange("clientEmail", e.target.value)}
              placeholder="your.email@example.com"
              className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="clientOrganization">Organization</Label>
            <Input
              id="clientOrganization"
              value={formData.clientOrganization}
              onChange={(e) => handleInputChange("clientOrganization", e.target.value)}
              placeholder="Your organization"
              className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
            />
          </div>
        </div>
      </div>

      {/* Produce Information Section */}
      <div className="space-y-2">
        <Label htmlFor="produceType">Produce Type</Label>
        <Input
          id="produceType"
          value={formData.produceType}
          onChange={(e) => handleInputChange("produceType", e.target.value)}
          placeholder="e.g., Tomato, Apple, etc."
          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="maturityStage">Maturity Stage</Label>
        <Input
          id="maturityStage"
          value={formData.maturityStage}
          onChange={(e) => handleInputChange("maturityStage", e.target.value)}
          placeholder="e.g., Green, Ripe, Overripe"
          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="coloringRate">Coloring Rate (%)</Label>
        <Input
          id="coloringRate"
          type="number"
          value={coloringRate !== null ? coloringRate.toString() : ""}
          onChange={(e) => {
            const value = e.target.value
            setColoringRate(value === "" ? null : Number(value))
          }}
          placeholder="e.g., 80"
          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="externalImage">External Image</Label>
          <Input
            id="externalImage"
            type="file"
            accept="image/*"
            onChange={handleExternalImageChange}
            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
            required
          />
          {externalImage && <p className="text-sm text-gray-500">Selected: {externalImage.name}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="internalImage">Internal Image</Label>
          <Input
            id="internalImage"
            type="file"
            accept="image/*"
            onChange={handleInternalImageChange}
            className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
            required
          />
          {internalImage && <p className="text-sm text-gray-500">Selected: {internalImage.name}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="qualityGrade">Quality Grade</Label>
        <Select
          onValueChange={(value) => handleInputChange("qualityGrade", value)}
          defaultValue={formData.qualityGrade}
        >
          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
            <SelectValue placeholder="Select a grade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Grade A">Grade A</SelectItem>
            <SelectItem value="Grade B">Grade B</SelectItem>
            <SelectItem value="Grade C">Grade C</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sampleType">Sample Type</Label>
        <Select onValueChange={(value) => handleInputChange("sampleType", value)} defaultValue={formData.sampleType}>
          <SelectTrigger className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]">
            <SelectValue placeholder="Select a sample type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Random">Random</SelectItem>
            <SelectItem value="Representative">Representative</SelectItem>
            <SelectItem value="Specific">Specific</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          placeholder="Any additional notes about the quality assessment"
          className="border-[#E8E4E0] focus:ring-[#97B980] focus:border-[#97B980]"
          value={formData.notes}
          onChange={(e) => handleInputChange("notes", e.target.value)}
        />
      </div>

      <Button disabled={isLoading} className="bg-[#3c5a28] text-white hover:bg-[#5a7c44]">
        Submit Assessment
      </Button>
    </form>
  )
}

export default QualityAssessmentForm
