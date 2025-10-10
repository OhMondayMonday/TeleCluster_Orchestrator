"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Network, ZoomIn, ZoomOut, RotateCcw, Upload, Download, Link2, Plus, Trash2, CheckCircle2, Monitor, Server, Square } from "lucide-react"

type NodeType = "pc" | "router" | "switch" | "server"

type TopologyType = "Personalizada" | "Múltiple" | "Importada"

interface TopologyNode {
  id: string
  name: string
  type: NodeType
  image: string
  cpu: number
  memory: number
  disk: number
  internet: number
  x: number
  y: number
  interfaces: string[]
}

interface TopologyConnection {
  id: string
  name: string
  from: string
  to: string
}

const SLICE_MANAGER_CONFIG = {
  url: "http://localhost:5000/api/topology",
  apiKey: "",
}

export function CreateTemplateForm() {
  // Core state
  const [nodes, setNodes] = useState<TopologyNode[]>([])
  const [connections, setConnections] = useState<TopologyConnection[]>([])
  const nodeIdCounter = useRef(0)
  const connectionIdCounter = useRef(0)

  // UI state
  const [topologyName, setTopologyName] = useState("Mi Topología")
  const [topologyDescription, setTopologyDescription] = useState("")
  const [topologyType, setTopologyType] = useState<TopologyType>("Personalizada")

  // Linking and dragging
  const [linkMode, setLinkMode] = useState(false)
  const [linkSourceId, setLinkSourceId] = useState<string | null>(null)
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const dragOffset = useRef<{ dx: number; dy: number }>({ dx: 0, dy: 0 })

  // Zoom and viewport
  const [zoomLevel, setZoomLevel] = useState(1)
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Context menu
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const [menuNodeId, setMenuNodeId] = useState<string | null>(null)

  // Node modal
  const [nodeModalOpen, setNodeModalOpen] = useState(false)
  const [editNodeId, setEditNodeId] = useState<string | null>(null)
  const [editNodeData, setEditNodeData] = useState<
    { name: string; type: NodeType; image: string; cpu: number; memory: number; disk: number; internet: number } | null
  >(
    null,
  )

  // Topology modal
  const [topologyModalOpen, setTopologyModalOpen] = useState(false)
  const [topologyPreset, setTopologyPreset] = useState<"star" | "tree" | "ring" | "mesh" | "bus" | "fullmesh" | null>(
    null,
  )
  const [topoParams, setTopoParams] = useState<{ nodes?: number; levels?: number; rows?: number; cols?: number }>({
    nodes: 5,
    levels: 3,
    rows: 3,
    cols: 3,
  })

  // Helpers
  const visibleArea = useMemo(() => {
    const cont = canvasContainerRef.current
    if (!cont) return { x: 0, y: 0, w: 0, h: 0 }
    return { x: cont.scrollLeft / zoomLevel, y: cont.scrollTop / zoomLevel, w: cont.clientWidth, h: cont.clientHeight }
  }, [zoomLevel])

  // Effects: close menus on Escape / outside click
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false)
        setTopologyModalOpen(false)
        setNodeModalOpen(false)
        if (linkMode) {
          setLinkMode(false)
          setLinkSourceId(null)
        }
      }
      if (e.ctrlKey && e.key.toLowerCase() === "s") {
        e.preventDefault()
        exportJSON()
      }
    }
    const onClick = (e: MouseEvent) => {
      const menu = document.getElementById("topology-node-menu")
      if (menu && !menu.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("click", onClick)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("click", onClick)
    }
  }, [linkMode])

  // Actions
  const addNode = useCallback(() => {
    const vx = visibleArea.x
    const vy = visibleArea.y
    createNodeAt(vx + 250, vy + 250)
  }, [visibleArea])

  const createNodeAt = useCallback(
    (x: number, y: number, config?: Partial<Omit<TopologyNode, "id" | "x" | "y" | "interfaces">>) => {
      const id = `node-${nodeIdCounter.current++}`
      const node: TopologyNode = {
        id,
        name: config?.name ?? `Nodo ${nodes.length}`,
        type: (config?.type as NodeType) ?? "pc",
        image: config?.image ?? "cirros",
        cpu: config?.cpu ?? 2,
        memory: config?.memory ?? 4,
        disk: config?.disk ?? 20,
        internet: typeof config?.internet === "number" ? config!.internet : 0,
        x: x - 30,
        y: y - 40,
        interfaces: [],
      }
      setNodes((prev) => [...prev, node])
      return node
    },
    [nodes.length],
  )

  const enableLinkMode = useCallback(() => {
    setLinkMode(true)
    setLinkSourceId(null)
  }, [])

  const createConnection = useCallback(
    (fromId: string, toId: string) => {
      setConnections((prev) => {
        const exists = prev.find(
          (c) => (c.from === fromId && c.to === toId) || (c.from === toId && c.to === fromId),
        )
        if (exists) return prev
        const id = `link-${connectionIdCounter.current++}`
        const conn: TopologyConnection = { id, name: `Enlace ${prev.length}`, from: fromId, to: toId }
        // also update node interfaces
        setNodes((nodesPrev) =>
          nodesPrev.map((n) =>
            n.id === fromId || n.id === toId ? { ...n, interfaces: [...n.interfaces, id] } : n,
          ),
        )
        return [...prev, conn]
      })
    },
    [],
  )

  const onNodeClick = useCallback(
    (e: React.MouseEvent, nodeId: string) => {
      e.stopPropagation()
      if (linkMode) {
        if (!linkSourceId) {
          setLinkSourceId(nodeId)
        } else if (linkSourceId !== nodeId) {
          createConnection(linkSourceId, nodeId)
          setLinkSourceId(null)
          setLinkMode(false)
        }
        return
      }
      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return
      setEditNodeId(node.id)
      setEditNodeData({ name: node.name, type: node.type, image: node.image, cpu: node.cpu, memory: node.memory, disk: node.disk, internet: node.internet })
      // Do not open modal on single click anymore; reserved for linking/selecting
    },
    [linkMode, linkSourceId, nodes, createConnection],
  )

  const onNodeDoubleClick = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setEditNodeId(node.id)
    setEditNodeData({ name: node.name, type: node.type, image: node.image, cpu: node.cpu, memory: node.memory, disk: node.disk, internet: node.internet })
    setNodeModalOpen(true)
  }, [nodes])

  // Dragging
  const onNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    if (linkMode) return
    e.preventDefault()
    e.stopPropagation()
    const node = nodes.find((n) => n.id === nodeId)
    if (!node) return
    setDraggingId(nodeId)
    dragOffset.current = { dx: e.clientX - node.x, dy: e.clientY - node.y }
  }, [nodes, linkMode])

  useEffect(() => {
    if (!draggingId) return
    const onMove = (e: MouseEvent) => {
      setNodes((prev) =>
        prev.map((n) => (n.id === draggingId ? { ...n, x: e.clientX - dragOffset.current.dx, y: e.clientY - dragOffset.current.dy } : n)),
      )
    }
    const onUp = () => setDraggingId(null)
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
  }, [draggingId])

  // Menu actions
  const editNodeFromMenu = useCallback(() => {
    if (!menuNodeId) return
    const node = nodes.find((n) => n.id === menuNodeId)
    if (!node) return
    setEditNodeId(node.id)
    setEditNodeData({ name: node.name, type: node.type, image: node.image, cpu: node.cpu, memory: node.memory, disk: node.disk, internet: node.internet })
    setNodeModalOpen(true)
    setMenuOpen(false)
  }, [menuNodeId, nodes])

  const deleteNodeFromMenu = useCallback(() => {
    if (!menuNodeId) return
    setConnections((prev) => prev.filter((c) => c.from !== menuNodeId && c.to !== menuNodeId))
    setNodes((prev) => prev.filter((n) => n.id !== menuNodeId))
    setMenuOpen(false)
  }, [menuNodeId])

  const saveNode = useCallback(() => {
    if (!editNodeId || !editNodeData) return
    setNodes((prev) =>
      prev.map((n) =>
        n.id === editNodeId
          ? {
              ...n,
              name: editNodeData.name,
              type: editNodeData.type,
              image: editNodeData.image,
              cpu: Number(editNodeData.cpu) || 1,
              memory: Number(editNodeData.memory) || 1,
              disk: Number(editNodeData.disk) || 10,
              internet: Number(editNodeData.internet) === 1 ? 1 : 0,
            }
          : n,
      ),
    )
    setNodeModalOpen(false)
    setEditNodeId(null)
  }, [editNodeData, editNodeId])

  const deleteNodeFromModal = useCallback(() => {
    if (!editNodeId) return
    setConnections((prev) => prev.filter((c) => c.from !== editNodeId && c.to !== editNodeId))
    setNodes((prev) => prev.filter((n) => n.id !== editNodeId))
    setNodeModalOpen(false)
    setEditNodeId(null)
  }, [editNodeId])

  // Topology presets
  const showTopologyModal = useCallback((type: typeof topologyPreset) => {
    setTopologyPreset(type)
    setTopologyModalOpen(true)
  }, [])

  const createTopology = useCallback(() => {
    if (!canvasContainerRef.current) return
    const cont = canvasContainerRef.current
    const vx = cont.scrollLeft / zoomLevel
    const vy = cont.scrollTop / zoomLevel

    // offset to place new group to the right of current view content
    let offsetX = 0
    if (nodes.length > 0) {
      const nodesInView = nodes.filter((n) => n.x >= vx && n.x <= vx + 500 && n.y >= vy && n.y <= vy + 500)
      if (nodesInView.length > 0) {
        const maxX = Math.max(...nodesInView.map((n) => n.x))
        offsetX = maxX - vx + 250
      }
    }

    const cx = vx + offsetX + 250
    const cy = vy + 250

    const localCreate = (x: number, y: number, name: string) => createNodeAt(x, y, { name, type: "pc" })

    const connByNodes = (a: TopologyNode, b: TopologyNode) => createConnection(a.id, b.id)

    switch (topologyPreset) {
      case "star": {
        const n = topoParams.nodes ?? 5
        const radius = 150
        const center = createNodeAt(cx, cy, { name: "PC0-t0", type: "pc" })
        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i) / n
          const x = cx + radius * Math.cos(angle)
          const y = cy + radius * Math.sin(angle)
          const nn = createNodeAt(x, y, { name: `PC${i + 1}-t0`, type: "pc" })
          connByNodes(center, nn)
        }
        break
      }
      case "tree": {
        const levels = topoParams.levels ?? 3
        let currentY = cy - 100
        let levelNodes: TopologyNode[] = []
        let nodeIndex = 0
        for (let level = 0; level < levels; level++) {
          const nodesInLevel = Math.pow(2, level)
          const spacing = 300 / (nodesInLevel + 1)
          const newLevel: TopologyNode[] = []
          for (let i = 0; i < nodesInLevel; i++) {
            const x = cx - 150 + spacing * (i + 1)
            const y = currentY
            const nn = createNodeAt(x, y, { name: `PC${nodeIndex++}-t${level}`, type: "pc" })
            newLevel.push(nn)
            if (level > 0) {
              const parentIndex = Math.floor(i / 2)
              connByNodes(levelNodes[parentIndex], nn)
            }
          }
          levelNodes = newLevel
          currentY += 100
        }
        break
      }
      case "ring": {
        const n = topoParams.nodes ?? 5
        const radius = 150
        const ringNodes: TopologyNode[] = []
        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i) / n
          const x = cx + radius * Math.cos(angle)
          const y = cy + radius * Math.sin(angle)
          const nn = createNodeAt(x, y, { name: `PC${i}-t0`, type: "pc" })
          ringNodes.push(nn)
        }
        for (let i = 0; i < ringNodes.length; i++) {
          connByNodes(ringNodes[i], ringNodes[(i + 1) % ringNodes.length])
        }
        break
      }
      case "bus": {
        const n = topoParams.nodes ?? 5
        const spacing = 120
        const startX = cx - ((n - 1) * spacing) / 2
        const busNodes: TopologyNode[] = []
        for (let i = 0; i < n; i++) {
          const x = startX + i * spacing
          const nn = createNodeAt(x, cy, { name: `PC${i}-t0`, type: "pc" })
          busNodes.push(nn)
        }
        for (let i = 0; i < busNodes.length - 1; i++) {
          connByNodes(busNodes[i], busNodes[i + 1])
        }
        break
      }
      case "mesh": {
        const rows = topoParams.rows ?? 3
        const cols = topoParams.cols ?? 3
        const spacing = 100
        const startX = cx - ((cols - 1) * spacing) / 2
        const startY = cy - ((rows - 1) * spacing) / 2
        const grid: TopologyNode[][] = []
        for (let r = 0; r < rows; r++) {
          grid[r] = []
          for (let c = 0; c < cols; c++) {
            const x = startX + c * spacing
            const y = startY + r * spacing
            const nn = createNodeAt(x, y, { name: `PC${r}-${c}`, type: "pc" })
            grid[r][c] = nn
          }
        }
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (c < cols - 1) connByNodes(grid[r][c], grid[r][c + 1])
            if (r < rows - 1) connByNodes(grid[r][c], grid[r + 1][c])
          }
        }
        break
      }
      case "fullmesh": {
        const n = topoParams.nodes ?? 4
        const radius = 150
        const arr: TopologyNode[] = []
        for (let i = 0; i < n; i++) {
          const angle = (2 * Math.PI * i) / n
          const x = cx + radius * Math.cos(angle)
          const y = cy + radius * Math.sin(angle)
          const nn = createNodeAt(x, y, { name: `PC${i}-t0`, type: "pc" })
          arr.push(nn)
        }
        for (let i = 0; i < arr.length; i++) {
          for (let j = i + 1; j < arr.length; j++) {
            connByNodes(arr[i], arr[j])
          }
        }
        break
      }
    }

    setTopologyType("Múltiple")
    setTopologyModalOpen(false)
  }, [canvasContainerRef, zoomLevel, nodes.length, topologyPreset, topoParams, createNodeAt, createConnection])

  // Import/Export/Validate/Send
  const exportJSON = useCallback(() => {
    const sequence = connections.map((c) => {
      const n1 = nodes.find((n) => n.id === c.from)
      const n2 = nodes.find((n) => n.id === c.to)
      return `(${n1?.name},${n2?.name})`
    })
    const data = {
      name: topologyName,
      description: topologyDescription,
      topology_type: topologyType.toLowerCase(),
  nodes: nodes.map((n) => ({ id: n.id, name: n.name, type: n.type, image: n.image, cpu: n.cpu, memory: n.memory, disk: n.disk, internet: n.internet, x: n.x, y: n.y, interfaces: n.interfaces })),
      connections: connections.map((c) => ({ id: c.id, name: c.name, from: c.from, to: c.to })),
      sequence: `Seq = [${sequence.join(", ")}]`,
      metadata: { node_count: nodes.length, connection_count: connections.length, created: new Date().toISOString() },
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${topologyName.replace(/\s+/g, "_")}.json`
    a.click()
    URL.revokeObjectURL(url)
    alert("JSON exportado exitosamente")
  }, [connections, nodes, topologyDescription, topologyName, topologyType])

  const fileInputRef = useRef<HTMLInputElement>(null)
  const importJSON = useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(String(e.target?.result))
        clearAll(false)
        const mapFromFlavor = (flavor: string) => {
          switch (flavor) {
            case "2GBRAM_2VCPUS_10GBRoot":
              return { cpu: 2, memory: 2, disk: 10 }
            case "4GBRAM_2VCPUS_20GBRoot":
              return { cpu: 2, memory: 4, disk: 20 }
            case "8GBRAM_4VCPUS_40GBRoot":
              return { cpu: 4, memory: 8, disk: 40 }
            default:
              return { cpu: 2, memory: 4, disk: 20 }
          }
        }
        const importedNodes: TopologyNode[] = (data.nodes || []).map((nd: any) => ({
          id: nd.id,
          name: nd.name,
          type: (nd.type || "pc") as NodeType,
          image: nd.image || "cirros",
          cpu: typeof nd.cpu === "number" ? nd.cpu : (nd.flavor ? mapFromFlavor(nd.flavor).cpu : 2),
          memory: typeof nd.memory === "number" ? nd.memory : (nd.flavor ? mapFromFlavor(nd.flavor).memory : 4),
          disk: typeof nd.disk === "number" ? nd.disk : (nd.flavor ? mapFromFlavor(nd.flavor).disk : 20),
          internet: typeof nd.internet === "number" ? (nd.internet === 1 ? 1 : 0) : 0,
          x: nd.x,
          y: nd.y,
          interfaces: nd.interfaces || [],
        }))
        const importedConns: TopologyConnection[] = (data.connections || []).map((cd: any) => ({
          id: cd.id,
          name: cd.name,
          from: cd.from,
          to: cd.to,
        }))
        setNodes(importedNodes)
        setConnections(importedConns)
        setTopologyName(data.name || "")
        setTopologyDescription(data.description || "")
        setTopologyType((data.topology_type || "Importada").charAt(0).toUpperCase() + (data.topology_type || "Importada").slice(1))
        alert("Topología importada exitosamente")
      } catch (err: any) {
        alert("Error al importar: " + err.message)
      }
    }
    reader.readAsText(file)
  }, [])

  const validateTopology = useCallback(() => {
    const errors: string[] = []
    if (nodes.length === 0) errors.push("La topología debe tener al menos un nodo")
    const isolated = nodes.filter((n) => n.interfaces.length === 0)
    if (isolated.length > 0 && nodes.length > 1) errors.push(`Hay ${isolated.length} nodo(s) sin conexión`)
    if (!topologyName) errors.push("El nombre es requerido")
    if (errors.length > 0) {
      alert("Errores:\n" + errors.join("\n"))
      return false
    }
    alert("Topología válida")
    return true
  }, [nodes, topologyName])

  const buildSliceManagerJSON = useCallback(() => {
    return {
      name: topologyName,
      description: topologyDescription,
      topology_type: topologyType.toLowerCase(),
  nodes: nodes.map((n) => ({ id: n.name, name: n.name, type: n.type, image: n.image, resources: { cpu: n.cpu, memory: n.memory, disk: n.disk }, internet: n.internet, position: { x: n.x, y: n.y } })),
      links: connections.map((c) => {
        const n1 = nodes.find((n) => n.id === c.from)
        const n2 = nodes.find((n) => n.id === c.to)
        return { id: c.name, source: n1?.name, target: n2?.name, bandwidth: "1Gbps" }
      }),
      metadata: { node_count: nodes.length, link_count: connections.length, created: new Date().toISOString(), editor_version: "1.0" },
    }
  }, [connections, nodes, topologyDescription, topologyName, topologyType])

  const sendToSliceManager = useCallback(async () => {
    if (!validateTopology()) return
    const payload = buildSliceManagerJSON()
    try {
      const res = await fetch(SLICE_MANAGER_CONFIG.url, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(SLICE_MANAGER_CONFIG.apiKey && { Authorization: `Bearer ${SLICE_MANAGER_CONFIG.apiKey}` }) },
        body: JSON.stringify(payload),
      })
      if (res.ok) {
        await res.json().catch(() => null)
        alert("Topología enviada exitosamente")
      } else {
        throw new Error(`Error ${res.status}`)
      }
    } catch (e: any) {
      alert(`Error: ${e.message}\n\nVerifica la URL del Slice Manager.`)
    }
  }, [buildSliceManagerJSON, validateTopology])

  // Zoom
  const applyZoom = useCallback((z: number) => {
    setZoomLevel(Math.max(0.5, Math.min(2, z)))
  }, [])
  const zoomIn = () => applyZoom(zoomLevel + 0.1)
  const zoomOut = () => applyZoom(zoomLevel - 0.1)
  const resetZoom = () => applyZoom(1)

  // Clear
  const clearAll = useCallback((ask = true) => {
    if (ask && nodes.length > 0) {
      if (!window.confirm("¿Seguro de limpiar todo?")) return
    }
    setNodes([])
    setConnections([])
    nodeIdCounter.current = 0
    connectionIdCounter.current = 0
    setTopologyType("Personalizada")
  }, [nodes.length])

  // Derived stats
  const nodeCount = nodes.length
  const linkCount = connections.length

  // Connection segments for SVG
  const connectionSegments = useMemo(() => {
    return connections
      .map((c) => {
        const a = nodes.find((n) => n.id === c.from)
        const b = nodes.find((n) => n.id === c.to)
        if (!a || !b) return null
        const x1 = a.x + 30
        const y1 = a.y + 30
        const x2 = b.x + 30
        const y2 = b.y + 30
        const midX = (x1 + x2) / 2
        const midY = (y1 + y2) / 2
        return { id: c.id, name: c.name, x1, y1, x2, y2, midX, midY }
      })
      .filter(Boolean) as { id: string; name: string; x1: number; y1: number; x2: number; y2: number; midX: number; midY: number }[]
  }, [connections, nodes])

  const NodeIcon = ({ type }: { type: NodeType }) => {
    switch (type) {
      case "router":
        return <Network className="w-5 h-5 text-white" />
      case "switch":
        return <Square className="w-5 h-5 text-white" />
      case "server":
        return <Server className="w-5 h-5 text-white" />
      default:
        return <Monitor className="w-5 h-5 text-white" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header / Controls */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-800">Editor de Topologías de Red</CardTitle>
          <CardDescription className="text-gray-600">Crea y administra la topología visual del slice</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Nombre</Label>
              <Input value={topologyName} onChange={(e) => setTopologyName(e.target.value)} placeholder="Mi Topología" />
            </div>
            <div className="space-y-2 md:col-span-2 xl:col-span-1">
              <Label className="text-gray-700">Descripción</Label>
              <Input value={topologyDescription} onChange={(e) => setTopologyDescription(e.target.value)} placeholder="Descripción del slice" />
            </div>
            {/* Top toolbar slimmed down; main controls moved near canvas */}
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="orange" onClick={exportJSON}><Download className="w-4 h-4 mr-2" /> Exportar JSON</Button>
              <input ref={fileInputRef} type="file" className="hidden" accept=".json" onChange={(e) => e.target.files?.[0] && importJSON(e.target.files[0])} />
              <Button variant="purple" onClick={() => fileInputRef.current?.click()}><Upload className="w-4 h-4 mr-2" /> Importar</Button>
              <Button variant="destructive" onClick={() => clearAll(true)}><Trash2 className="w-4 h-4 mr-2" /> Limpiar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Predefined templates */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <CardTitle className="text-gray-800">Topologías Predefinidas</CardTitle>
          <CardDescription className="text-gray-600">Inserta una plantilla en el lienzo</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => showTopologyModal("star")}>Estrella</Button>
            <Button variant="outline" onClick={() => showTopologyModal("tree")}>Árbol</Button>
            <Button variant="outline" onClick={() => showTopologyModal("ring")}>Anillo</Button>
            <Button variant="outline" onClick={() => showTopologyModal("mesh")}>Malla</Button>
            <Button variant="outline" onClick={() => showTopologyModal("bus")}>Bus</Button>
            <Button variant="outline" onClick={() => showTopologyModal("fullmesh")}>Full Mesh</Button>
          </div>
        </CardContent>
      </Card>

      {/* Canvas */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-gray-800">Lienzo</CardTitle>
              <CardDescription className="text-gray-600">Arrastra y conecta nodos libremente</CardDescription>
            </div>
            <Badge variant="outline" className="bg-[#00b4d8]/10 text-[#00b4d8] border-[#00b4d8]/50">
              <Network className="w-3 h-3 mr-1" /> Interactivo
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative border border-border/50 rounded-md bg-muted/20 overflow-auto" ref={canvasContainerRef} style={{ height: 500 }}>
            <div
              ref={canvasRef}
              className="relative bg-white"
              style={{ width: 3000, height: 3000, transform: `scale(${zoomLevel})`, transformOrigin: "0 0", backgroundImage: "linear-gradient(0deg, transparent 24%, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.02) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.02) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(0,0,0,0.02) 25%, rgba(0,0,0,0.02) 26%, transparent 27%, transparent 74%, rgba(0,0,0,0.02) 75%, rgba(0,0,0,0.02) 76%, transparent 77%, transparent)", backgroundSize: "50px 50px" }}
              onClick={() => setMenuOpen(false)}
            >
              {/* Connections (SVG) */}
              <svg className="absolute left-0 top-0 w-[3000px] h-[3000px] pointer-events-none">
                {connectionSegments.map((seg) => (
                  <g key={seg.id} className="opacity-90">
                    <line x1={seg.x1} y1={seg.y1} x2={seg.x2} y2={seg.y2} stroke="#06a77d" strokeWidth={2} />
                    <circle cx={seg.midX} cy={seg.midY} r={12} fill="#1e4e7b" stroke="#06a77d" strokeWidth={2} />
                    <text x={seg.midX} y={seg.midY + 4} fill="#06a77d" fontSize={10} fontWeight={700} textAnchor="middle">
                      {seg.name.split(" ")[1]}
                    </text>
                  </g>
                ))}
              </svg>

              {/* Nodes */}
              {nodes.map((n) => (
                <div
                  key={n.id}
                  className={`absolute flex flex-col items-center select-none ${linkMode && linkSourceId === n.id ? "drop-shadow-[0_0_5px_#FF9800]" : ""}`}
                  style={{ left: n.x, top: n.y, width: 60, height: 80, cursor: draggingId === n.id ? "grabbing" : "grab" }}
                  onMouseDown={(e) => onNodeMouseDown(e, n.id)}
                  onClick={(e) => onNodeClick(e, n.id)}
                  onDoubleClick={(e) => onNodeDoubleClick(e, n.id)}
                >
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 shadow bg-[#1e4e7b] border-[#06a77d]">
                    <NodeIcon type={n.type} />
                  </div>
                  <div className="mt-1 text-[11px] bg-white px-2 py-0.5 rounded border text-gray-700 font-medium">{n.name}</div>
                </div>
              ))}

              {/* Context menu (opcional) */}
              {menuOpen && menuNodeId && (
                <div
                  id="topology-node-menu"
                  className="absolute bg-white border rounded shadow-md min-w-[140px] z-50"
                  style={{ left: menuPos.x, top: menuPos.y }}
                >
                  <button className="w-full text-left px-4 py-2 hover:bg-accent" onClick={editNodeFromMenu}>
                    Editar
                  </button>
                  <button className="w-full text-left px-4 py-2 hover:bg-accent" onClick={deleteNodeFromMenu}>
                    Eliminar
                  </button>
                </div>
              )}
            </div>

            {/* Zoom controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-white border rounded shadow p-1 z-10">
              <Button size="icon" variant="outline" onClick={zoomOut}>
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="px-2 text-xs text-gray-600">{Math.round(zoomLevel * 100)}%</span>
              <Button size="icon" variant="outline" onClick={zoomIn}>
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button size="icon" variant="outline" onClick={resetZoom}>
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>

            {/* Floating canvas toolbar near interactive area */}
            <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 bg-white/95 backdrop-blur border rounded shadow p-2 z-10">
              <Button variant="cyan" onClick={addNode}><Plus className="w-4 h-4 mr-2" /> Añadir Nodo</Button>
              <Button variant="teal" onClick={enableLinkMode} aria-pressed={linkMode}><Link2 className="w-4 h-4 mr-2" /> Conectar Nodos</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info / Actions */}
      <Card className="bg-white border-gray-200 shadow-md">
        <CardContent className="py-4 flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><span>Nodos:</span><strong className="text-gray-800">{nodeCount}</strong></div>
            <div className="flex items-center gap-2"><span>Enlaces:</span><strong className="text-gray-800">{linkCount}</strong></div>
            <div className="flex items-center gap-2"><span>Topología:</span><strong className="text-gray-800">{topologyType}</strong></div>
          </div>
          <div className="flex gap-2">
            <Button variant="success" onClick={validateTopology}><CheckCircle2 className="w-4 h-4 mr-2" /> Validar</Button>
            <Button variant="success" onClick={sendToSliceManager}>Enviar a Slice Manager</Button>
          </div>
        </CardContent>
      </Card>

      {/* Node Modal */}
      <Dialog open={nodeModalOpen} onOpenChange={setNodeModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Configurar Nodo</DialogTitle>
          </DialogHeader>
          {editNodeData && (
            <div className="space-y-3 py-2">
              <div className="space-y-1">
                <Label>Nombre</Label>
                <Input value={editNodeData.name} onChange={(e) => setEditNodeData({ ...editNodeData, name: e.target.value })} />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={editNodeData.type} onValueChange={(v: NodeType) => setEditNodeData({ ...editNodeData, type: v })}>
                  <SelectTrigger><SelectValue placeholder="Tipo" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pc">PC/Host</SelectItem>
                    <SelectItem value="router">Router</SelectItem>
                    <SelectItem value="switch">Switch</SelectItem>
                    <SelectItem value="server">Server</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Imagen</Label>
                <Select value={editNodeData.image} onValueChange={(v) => setEditNodeData({ ...editNodeData, image: v })}>
                  <SelectTrigger><SelectValue placeholder="Imagen" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cirros">cirros</SelectItem>
                    <SelectItem value="ubuntu">ubuntu</SelectItem>
                    <SelectItem value="centos">centos</SelectItem>
                    <SelectItem value="debian">debian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* Flavor removed per request to avoid repetition */}
              <div className="grid grid-cols-4 gap-3">
                <div className="space-y-1">
                  <Label>CPU (vCPUs)</Label>
                  <Input type="number" min={1} value={editNodeData.cpu} onChange={(e) => setEditNodeData({ ...editNodeData, cpu: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>RAM (GB)</Label>
                  <Input type="number" min={1} value={editNodeData.memory} onChange={(e) => setEditNodeData({ ...editNodeData, memory: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Disco (GB)</Label>
                  <Input type="number" min={1} value={editNodeData.disk} onChange={(e) => setEditNodeData({ ...editNodeData, disk: Number(e.target.value) })} />
                </div>
                <div className="space-y-1">
                  <Label>Internet</Label>
                  <div className="flex items-center gap-2">
                    <Switch checked={editNodeData.internet === 1} onCheckedChange={(v) => setEditNodeData({ ...editNodeData, internet: v ? 1 : 0 })} />
                    <span className="text-sm text-gray-600">{editNodeData.internet === 1 ? "Sí (1)" : "No (0)"}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="destructive" onClick={deleteNodeFromModal}>Eliminar</Button>
            <Button variant="outline" onClick={() => setNodeModalOpen(false)}>Cancelar</Button>
            <Button variant="success" onClick={saveNode}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Topology Modal */}
      <Dialog open={topologyModalOpen} onOpenChange={setTopologyModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Agregar Topología {topologyPreset ? `(${topologyPreset})` : ""}</DialogTitle>
          </DialogHeader>
          {topologyPreset && (
            <div className="space-y-3 py-2">
              {(topologyPreset === "star" || topologyPreset === "ring" || topologyPreset === "bus" || topologyPreset === "fullmesh") && (
                <div className="space-y-1">
                  <Label>Número de nodos</Label>
                  <Input type="number" min={2} max={20} value={topoParams.nodes ?? 5} onChange={(e) => setTopoParams((p) => ({ ...p, nodes: Number(e.target.value) }))} />
                </div>
              )}
              {topologyPreset === "tree" && (
                <div className="space-y-1">
                  <Label>Niveles</Label>
                  <Input type="number" min={2} max={5} value={topoParams.levels ?? 3} onChange={(e) => setTopoParams((p) => ({ ...p, levels: Number(e.target.value) }))} />
                </div>
              )}
              {topologyPreset === "mesh" && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>Filas</Label>
                    <Input type="number" min={2} max={10} value={topoParams.rows ?? 3} onChange={(e) => setTopoParams((p) => ({ ...p, rows: Number(e.target.value) }))} />
                  </div>
                  <div className="space-y-1">
                    <Label>Columnas</Label>
                    <Input type="number" min={2} max={10} value={topoParams.cols ?? 3} onChange={(e) => setTopoParams((p) => ({ ...p, cols: Number(e.target.value) }))} />
                  </div>
                </div>
              )}
          </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setTopologyModalOpen(false)}>Cancelar</Button>
            <Button variant="success" onClick={createTopology}>Crear</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
