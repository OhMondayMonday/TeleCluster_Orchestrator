"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock, Bell, Shield, Zap, Save } from "lucide-react"

export function SystemPolicies() {
  return (
    <div className="space-y-6">
      {/* Auto-shutdown Policies */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Auto-shutdown Policies</CardTitle>
              <CardDescription className="text-gray-600">Automatically stop idle VMs to save resources</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Enable Auto-shutdown</p>
              <p className="text-xs text-gray-600 mt-1">Stop VMs after period of inactivity</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Idle Timeout (hours)</Label>
              <Select defaultValue="4">
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="8">8 hours</SelectItem>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-700">Warning Before Shutdown (minutes)</Label>
              <Select defaultValue="15">
                <SelectTrigger className="border-gray-300">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutes</SelectItem>
                  <SelectItem value="10">10 minutes</SelectItem>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Auto-shutdown at Night</p>
              <p className="text-xs text-gray-600 mt-1">Stop all VMs during off-hours (11 PM - 6 AM)</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>

      {/* Resource Limits */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Zap className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Resource Allocation Policies</CardTitle>
              <CardDescription className="text-gray-600">Define default and maximum resource limits</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Default VM Resources</h4>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">CPU (vCPUs)</Label>
                <Input type="number" defaultValue="2" className="border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Memory (GB)</Label>
                <Input type="number" defaultValue="4" className="border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Storage (GB)</Label>
                <Input type="number" defaultValue="20" className="border-gray-300" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Student Limits</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Max Slices per Student</Label>
                <Input type="number" defaultValue="5" className="border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Max VMs per Slice</Label>
                <Input type="number" defaultValue="10" className="border-gray-300" />
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3">Professor Limits</h4>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-gray-700">Max Templates per Professor</Label>
                <Input type="number" defaultValue="20" className="border-gray-300" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-700">Max Slices per Course</Label>
                <Input type="number" defaultValue="100" className="border-gray-300" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Notification Settings</CardTitle>
              <CardDescription className="text-gray-600">Configure system alerts and notifications</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Resource Usage Alerts</p>
              <p className="text-xs text-gray-600 mt-1">Notify when cluster usage exceeds threshold</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Alert Threshold (%)</Label>
            <Input type="number" defaultValue="85" className="border-gray-300" />
            <p className="text-xs text-gray-500">Send alerts when resource usage exceeds this percentage</p>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Failed VM Notifications</p>
              <p className="text-xs text-gray-600 mt-1">Alert admins when VM creation fails</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Maintenance Reminders</p>
              <p className="text-xs text-gray-600 mt-1">Weekly maintenance window notifications</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Security Policies */}
      <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-gray-800">Security Policies</CardTitle>
              <CardDescription className="text-gray-600">Configure security and access control settings</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Require SSH Keys</p>
              <p className="text-xs text-gray-600 mt-1">Disable password authentication for VMs</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Enable Firewall by Default</p>
              <p className="text-xs text-gray-600 mt-1">Apply default firewall rules to new VMs</p>
            </div>
            <Switch defaultChecked />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Session Timeout (minutes)</Label>
            <Select defaultValue="30">
              <SelectTrigger className="border-gray-300">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes</SelectItem>
                <SelectItem value="30">30 minutes</SelectItem>
                <SelectItem value="60">60 minutes</SelectItem>
                <SelectItem value="120">120 minutes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-800">Audit Logging</p>
              <p className="text-xs text-gray-600 mt-1">Log all administrative actions</p>
            </div>
            <Switch defaultChecked />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
          <Save className="w-4 h-4 mr-2" />
          Save All Changes
        </Button>
      </div>
    </div>
  )
}
