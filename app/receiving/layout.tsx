import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Receiving | Cold Room Management",
  description: "Manage produce receiving and quality control",
}

export default function ReceivingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <main className="flex-1 flex flex-col max-w-2xl mx-auto w-full p-4 sm:p-6">
        {children}
      </main>
    </div>
  )
} 