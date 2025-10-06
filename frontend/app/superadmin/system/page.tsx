import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, Settings } from "lucide-react"
import { OSImagesManager } from "@/components/system/os-images-manager"
import { NetworkConfiguration } from "@/components/system/network-configuration"
import { ClusterSettings } from "@/components/system/cluster-settings"
import { SystemPolicies } from "@/components/system/system-policies"

export default function SuperadminSystemPage() {
  return (
    <div className="min-h-screen bg-white p-6">
      <div className="container mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">System Configuration</h1>
            <p className="text-gray-600 mt-1">Manage system-wide settings, resources, and policies</p>
          </div>
          <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
            <Settings className="w-4 h-4 mr-2" />
            Advanced Settings
          </Button>
        </div>

        <Tabs defaultValue="images" className="space-y-6">
          <TabsList className="bg-gray-100 border border-gray-200">
            <TabsTrigger value="images" className="data-[state=active]:bg-white data-[state=active]:text-[#032058]">
              OS Images
            </TabsTrigger>
            <TabsTrigger value="network" className="data-[state=active]:bg-white data-[state=active]:text-[#032058]">
              Network
            </TabsTrigger>
            <TabsTrigger value="clusters" className="data-[state=active]:bg-white data-[state=active]:text-[#032058]">
              Clusters
            </TabsTrigger>
            <TabsTrigger value="policies" className="data-[state=active]:bg-white data-[state=active]:text-[#032058]">
              Policies
            </TabsTrigger>
          </TabsList>

          <TabsContent value="images" className="space-y-6">
            <OSImagesManager />
          </TabsContent>

          <TabsContent value="network" className="space-y-6">
            <NetworkConfiguration />
          </TabsContent>

          <TabsContent value="clusters" className="space-y-6">
            <ClusterSettings />
          </TabsContent>

          <TabsContent value="policies" className="space-y-6">
            <SystemPolicies />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
