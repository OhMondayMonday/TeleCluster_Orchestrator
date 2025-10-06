"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HardDrive, Upload, Download, Trash2, CheckCircle, Clock, XCircle, Plus } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState } from "react"

const mockImages = [
  {
    id: "img-001",
    name: "Ubuntu 22.04 LTS Server",
    os: "Linux",
    version: "22.04",
    size: "2.4 GB",
    status: "active",
    downloads: 156,
    created: "2025-01-10",
    architecture: "x86_64",
  },
  {
    id: "img-002",
    name: "Windows Server 2022",
    os: "Windows",
    version: "2022",
    size: "8.2 GB",
    status: "active",
    downloads: 89,
    created: "2025-01-08",
    architecture: "x86_64",
  },
  {
    id: "img-003",
    name: "CentOS Stream 9",
    os: "Linux",
    version: "9",
    size: "1.8 GB",
    status: "active",
    downloads: 67,
    created: "2024-12-15",
    architecture: "x86_64",
  },
  {
    id: "img-004",
    name: "Debian 12 Bookworm",
    os: "Linux",
    version: "12",
    size: "1.2 GB",
    status: "active",
    downloads: 43,
    created: "2024-12-10",
    architecture: "x86_64",
  },
  {
    id: "img-005",
    name: "Ubuntu 24.04 LTS",
    os: "Linux",
    version: "24.04",
    size: "2.8 GB",
    status: "uploading",
    downloads: 0,
    created: "2025-01-20",
    architecture: "x86_64",
  },
]

export function OSImagesManager() {
  const [uploadProgress, setUploadProgress] = useState(65)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Images</CardTitle>
            <HardDrive className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">12</div>
            <p className="text-xs text-gray-500 mt-1">4 Linux, 3 Windows, 5 Custom</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Storage Used</CardTitle>
            <HardDrive className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">28.4 GB</div>
            <p className="text-xs text-gray-500 mt-1">of 500 GB available</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
            <Download className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">1,247</div>
            <p className="text-xs text-gray-500 mt-1">across all images</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload New Image Button */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">Available OS Images</h3>
          <p className="text-sm text-gray-600">Manage virtual machine operating system images</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
              <Plus className="w-4 h-4 mr-2" />
              Upload New Image
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-gray-800">Upload New OS Image</DialogTitle>
              <DialogDescription className="text-gray-600">
                Upload a new operating system image to be used in virtual machine deployments
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="image-name" className="text-gray-700">Image Name *</Label>
                  <Input id="image-name" placeholder="e.g., Ubuntu 24.04 LTS" className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="os-type" className="text-gray-700">OS Type *</Label>
                  <Select>
                    <SelectTrigger id="os-type" className="border-gray-300">
                      <SelectValue placeholder="Select OS type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linux">Linux</SelectItem>
                      <SelectItem value="windows">Windows</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-gray-700">Version *</Label>
                  <Input id="version" placeholder="e.g., 24.04" className="border-gray-300" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architecture" className="text-gray-700">Architecture *</Label>
                  <Select>
                    <SelectTrigger id="architecture" className="border-gray-300">
                      <SelectValue placeholder="Select architecture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="x86_64">x86_64</SelectItem>
                      <SelectItem value="arm64">ARM64</SelectItem>
                      <SelectItem value="i386">i386</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Input id="description" placeholder="Brief description of this image" className="border-gray-300" />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Upload Method</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
                    <Upload className="w-4 h-4 mr-2" />
                    Local File
                  </Button>
                  <Button variant="outline" className="flex-1 border-gray-300 hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    From URL
                  </Button>
                </div>
              </div>

              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg text-center hover:border-[#032058] hover:bg-gray-50 transition-colors cursor-pointer">
                <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to browse or drag and drop your image file here
                </p>
                <p className="text-xs text-gray-500 mt-1">Supported formats: ISO, QCOW2, VMDK, VHD (Max 20GB)</p>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-gray-300">
                Cancel
              </Button>
              <Button className="bg-[#032058] text-white hover:bg-[#032058]/90">
                <Upload className="w-4 h-4 mr-2" />
                Start Upload
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images List */}
      <div className="grid gap-4">
        {mockImages.map((image) => (
          <Card key={image.id} className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <HardDrive className="w-6 h-6 text-gray-600" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-gray-800">{image.name}</h3>
                      {image.status === "active" && (
                        <Badge className="bg-green-100 text-green-700 border-green-200">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      )}
                      {image.status === "uploading" && (
                        <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                          <Clock className="w-3 h-3 mr-1" />
                          Uploading
                        </Badge>
                      )}
                      {image.status === "error" && (
                        <Badge className="bg-red-100 text-red-700 border-red-200">
                          <XCircle className="w-3 h-3 mr-1" />
                          Error
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="font-medium">{image.os}</span>
                      <span>•</span>
                      <span>Version {image.version}</span>
                      <span>•</span>
                      <span>{image.architecture}</span>
                      <span>•</span>
                      <span>{image.size}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{image.downloads} downloads</span>
                      <span>•</span>
                      <span>Created {image.created}</span>
                    </div>
                    {image.status === "uploading" && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600">
                          <span>Uploading to headnode...</span>
                          <span className="font-mono">{uploadProgress}%</span>
                        </div>
                        <Progress value={uploadProgress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="border-red-300 hover:bg-red-50 text-red-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
