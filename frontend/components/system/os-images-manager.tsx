"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { HardDrive, Upload, Download, Trash2, CheckCircle, Clock, XCircle, Plus, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"

// Backend API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001"

interface OSImage {
  id: string
  name: string
  os: string
  version: string
  architecture: string
  description?: string
  filename: string
  file_path: string
  size: string
  size_bytes: number
  extension: string
  status: string
  downloads: number
  created: string
  uploaded_by: string
}

interface ApiStats {
  total_images: number
  total_size_bytes: number
  total_downloads: number
  by_os: Record<string, number>
}

export function OSImagesManager() {
  const [images, setImages] = useState<OSImage[]>([])
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const { toast } = useToast()

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    os_type: "",
    version: "",
    architecture: "x86_64",
    description: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Fetch images from API
  const fetchImages = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/images`)
      const data = await response.json()
      
      if (data.success) {
        setImages(data.images)
      }
    } catch (error) {
      console.error("Error fetching images:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar las imágenes",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch stats from API
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/v1/stats`)
      const data = await response.json()
      
      if (data.success) {
        setStats(data.stats)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    }
  }

  // Load data on mount
  useEffect(() => {
    fetchImages()
    fetchStats()
  }, [])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: "Error",
        description: "Por favor selecciona un archivo",
        variant: "destructive",
      })
      return
    }

    if (!formData.name || !formData.os_type || !formData.version) {
      toast({
        title: "Error",
        description: "Por favor completa todos los campos requeridos",
        variant: "destructive",
      })
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append("file", selectedFile)
      formDataToSend.append("name", formData.name)
      formDataToSend.append("os_type", formData.os_type)
      formDataToSend.append("version", formData.version)
      formDataToSend.append("architecture", formData.architecture)
      if (formData.description) {
        formDataToSend.append("description", formData.description)
      }

      const xhr = new XMLHttpRequest()

      // Track upload progress
      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100)
          setUploadProgress(percentComplete)
        }
      })

      // Handle completion
      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText)
          
          toast({
            title: "¡Éxito!",
            description: "Imagen subida correctamente",
          })

          // Reset form
          setFormData({
            name: "",
            os_type: "",
            version: "",
            architecture: "x86_64",
            description: "",
          })
          setSelectedFile(null)
          setIsDialogOpen(false)

          // Refresh images list
          fetchImages()
          fetchStats()
        } else {
          throw new Error("Upload failed")
        }
        setIsUploading(false)
      })

      // Handle errors
      xhr.addEventListener("error", () => {
        toast({
          title: "Error",
          description: "Error al subir la imagen",
          variant: "destructive",
        })
        setIsUploading(false)
      })

      xhr.open("POST", `${API_URL}/api/v1/images/upload`)
      xhr.send(formDataToSend)

    } catch (error) {
      console.error("Upload error:", error)
      toast({
        title: "Error",
        description: "Error al subir la imagen",
        variant: "destructive",
      })
      setIsUploading(false)
    }
  }

  // Handle delete
  const handleDelete = async (imageId: string) => {
    try {
      const response = await fetch(`${API_URL}/api/v1/images/${imageId}`, {
        method: "DELETE",
      })
      
      const data = await response.json()
      
      if (data.success) {
        toast({
          title: "¡Éxito!",
          description: "Imagen eliminada correctamente",
        })
        fetchImages()
        fetchStats()
      } else {
        throw new Error("Delete failed")
      }
    } catch (error) {
      console.error("Delete error:", error)
      toast({
        title: "Error",
        description: "Error al eliminar la imagen",
        variant: "destructive",
      })
    }
  }

  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#032058]" />
      </div>
    )
  }

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
            <div className="text-2xl font-bold text-gray-800">{stats?.total_images || images.length}</div>
            <p className="text-xs text-gray-500 mt-1">
              {stats && stats.by_os ? Object.entries(stats.by_os).map(([os, count]) => `${count} ${os}`).join(", ") : "Cargando..."}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Storage Used</CardTitle>
            <HardDrive className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">
              {stats ? formatSize(stats.total_size_bytes) : "0 GB"}
            </div>
            <p className="text-xs text-gray-500 mt-1">de 500 GB disponibles</p>
          </CardContent>
        </Card>

        <Card className="bg-white border-gray-200 shadow-md hover:shadow-lg transition-all duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Downloads</CardTitle>
            <Download className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-800">{stats?.total_downloads || 0}</div>
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
                  <Input 
                    id="image-name" 
                    placeholder="e.g., Ubuntu 24.04 LTS" 
                    className="border-gray-300"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="os-type" className="text-gray-700">OS Type *</Label>
                  <Select 
                    value={formData.os_type}
                    onValueChange={(value) => setFormData({ ...formData, os_type: value })}
                    disabled={isUploading}
                  >
                    <SelectTrigger id="os-type" className="border-gray-300">
                      <SelectValue placeholder="Select OS type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Linux">Linux</SelectItem>
                      <SelectItem value="Windows">Windows</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="version" className="text-gray-700">Version *</Label>
                  <Input 
                    id="version" 
                    placeholder="e.g., 24.04" 
                    className="border-gray-300"
                    value={formData.version}
                    onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                    disabled={isUploading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="architecture" className="text-gray-700">Architecture *</Label>
                  <Select 
                    value={formData.architecture}
                    onValueChange={(value) => setFormData({ ...formData, architecture: value })}
                    disabled={isUploading}
                  >
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
                <Input 
                  id="description" 
                  placeholder="Brief description of this image" 
                  className="border-gray-300"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  disabled={isUploading}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Select File *</Label>
                <div className="relative">
                  <Input
                    type="file"
                    accept=".iso,.qcow2,.vmdk,.vhd,.img"
                    onChange={handleFileChange}
                    className="border-gray-300"
                    disabled={isUploading}
                  />
                </div>
                {selectedFile && (
                  <p className="text-sm text-gray-600">
                    Archivo seleccionado: {selectedFile.name} ({formatSize(selectedFile.size)})
                  </p>
                )}
                <p className="text-xs text-gray-500">Supported formats: ISO, QCOW2, VMDK, VHD, IMG (Max 20GB)</p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Uploading...</span>
                    <span className="font-mono">{uploadProgress}%</span>
                  </div>
                  <Progress value={uploadProgress} className="h-2" />
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)} 
                className="border-gray-300"
                disabled={isUploading}
              >
                Cancel
              </Button>
              <Button 
                className="bg-[#032058] text-white hover:bg-[#032058]/90"
                onClick={handleUpload}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Start Upload
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Images List */}
      <div className="grid gap-4">
        {images.length === 0 ? (
          <Card className="bg-white border-gray-200 shadow-md">
            <CardContent className="p-12 text-center">
              <HardDrive className="w-12 h-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No images yet</h3>
              <p className="text-gray-600 mb-4">Upload your first OS image to get started</p>
              <Button 
                className="bg-[#032058] text-white hover:bg-[#032058]/90"
                onClick={() => setIsDialogOpen(true)}
              >
                <Plus className="w-4 h-4 mr-2" />
                Upload Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          images.map((image) => (
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
                        <span>Created {new Date(image.created).toLocaleDateString()}</span>
                        <span>•</span>
                        <span className="font-mono">{image.filename}</span>
                      </div>
                      {image.description && (
                        <p className="text-sm text-gray-600">{image.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 hover:bg-red-50 text-red-600"
                      onClick={() => {
                        if (confirm("¿Estás seguro de que quieres eliminar esta imagen?")) {
                          handleDelete(image.id)
                        }
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
