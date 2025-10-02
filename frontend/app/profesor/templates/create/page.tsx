import { CreateTemplateForm } from "@/components/templates/create-template-form"

export default function CreateTemplatePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-balance">Create Slice Template</h1>
        <p className="text-muted-foreground mt-1">Save a reusable configuration for future slice deployments</p>
      </div>
      <CreateTemplateForm />
    </div>
  )
}
