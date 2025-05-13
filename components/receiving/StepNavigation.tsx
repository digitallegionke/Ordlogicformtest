"use client"

import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

interface StepNavigationProps {
  currentStep: number
  totalSteps: number
  onNext?: () => Promise<boolean> | boolean
  isSubmitting?: boolean
  submitText?: string
}

export default function StepNavigation({
  currentStep,
  totalSteps,
  onNext,
  isSubmitting = false,
  submitText = "Submit"
}: StepNavigationProps) {
  const router = useRouter()

  const handleBack = () => {
    if (currentStep > 1) {
      router.push(`/receiving/step${currentStep - 1}`)
    }
  }

  const handleNext = async () => {
    if (onNext) {
      const canProceed = await onNext()
      if (!canProceed) return
    }

    if (currentStep < totalSteps) {
      router.push(`/receiving/step${currentStep + 1}`)
    }
  }

  const isLastStep = currentStep === totalSteps

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="max-w-2xl mx-auto flex justify-between items-center">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={currentStep === 1 || isSubmitting}
          className="hover:bg-[#F8F5F2]"
        >
          Back
        </Button>
        <div className="text-sm text-[#5C6073]">
          Step {currentStep} of {totalSteps}
        </div>
        <Button
          onClick={handleNext}
          disabled={isSubmitting}
          className="bg-[#97B980] hover:bg-[#7A9968] text-white min-w-[100px]"
        >
          {isSubmitting && isLastStep ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : isLastStep ? (
            submitText
          ) : (
            "Next"
          )}
        </Button>
      </div>
    </div>
  )
} 