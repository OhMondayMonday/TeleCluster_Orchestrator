"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Network, Globe, Server, Plus, Edit, Trash2 } from "lucide-react"

const networkConfigs = [
  {
    id: "net-001",
    name: "Student VMs Network",
    subnet: "10.60.0.0/16",
    gateway: "10.60.0.1",
    dns: ["8.8.8.8", "8.8.4.4"],
    vlan: 100,
    ipRange: "10.60.1.1 - 10.60.255.254",
    status: "active",
    assignedIPs: 234,
    totalIPs: 65534,
  },
  {
    id: "net-002",
    name: "Management Network",
    subnet: "192.168.100.0/24",
    gateway: "192.168.100.1",
    dns: ["192.168.100.10"],
    vlan: 200,
    ipRange: "192.168.100.10 - 192.168.100.254",
    status: "active",
    assignedIPs: 45,
    totalIPs: 244,
  },
  {
    id: "net-003",
    name: "Storage Network",
    subnet: "172.16.0.0/16",
    gateway: "172.16.0.1",
    dns: ["172.16.0.10"],
    vlan: 300,
    ipRange: "172.16.1.1 - 172.16.255.254",
    status: "active",
    assignedIPs: 12,
    totalIPs: 65534,
  },
]

export function NetworkConfiguration() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Networks</CardTitle>
            <Network className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <p className="text-xs text-gray-500 mt-1">Active network segments</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">IP Addresses</CardTitle>
            <Globe className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">291</div>
            <p className="text-xs text-gray-500 mt-1">of 131,312 available</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">VLANs</CardTitle>
            <Server className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">3</div>
            <p className="text-xs text-gray-500 mt-1">Configured VLANs</p>
          </CardContent>
        </Card>
      </div>

      {/* DNS Configuration */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800">Global DNS Settings</CardTitle>
              <CardDescription className="text-gray-600">Primary and secondary DNS servers for all VMs</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-gray-700">Primary DNS Server</Label>
              <Input value="8.8.8.8" disabled className="bg-gray-50 border-gray-300" />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Secondary DNS Server</Label>
              <Input value="8.8.4.4" disabled className="bg-gray-50 border-gray-300" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Network Segments */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Network Segments</h3>
          <p className="text-sm text-gray-600">Configure IP ranges and VLANs for VM networks</p>
        </div>
        <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
          <Plus className="w-4 h-4 mr-2" />
          Add Network
        </Button>
      </div>

      <div className="grid gap-4">
        {networkConfigs.map((network) => (
          <Card key={network.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Network className="w-6 h-6 text-gray-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-800">{network.name}</h3>
                      <Badge className="bg-green-100 text-green-700 border-green-200">Active</Badge>
                      <Badge variant="outline" className="border-gray-300 text-gray-600">
                        VLAN {network.vlan}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {network.assignedIPs.toLocaleString()} / {network.totalIPs.toLocaleString()} IPs assigned
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 hover:bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Subnet</p>
                  <p className="font-mono text-gray-800">{network.subnet}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Gateway</p>
                  <p className="font-mono text-gray-800">{network.gateway}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">IP Range</p>
                  <p className="font-mono text-gray-800 text-xs">{network.ipRange}</p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">DNS Servers</p>
                  <p className="font-mono text-gray-800 text-xs">{network.dns.join(", ")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
