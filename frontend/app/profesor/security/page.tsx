import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Plus, Edit, Trash2, Lock, Unlock, AlertTriangle } from "lucide-react"

export default function ProfesorSecurityPage() {
  const securityRules = [
    { id: 1, name: "Allow HTTP", protocol: "TCP", port: "80", source: "0.0.0.0/0", action: "allow", enabled: true },
    { id: 2, name: "Allow HTTPS", protocol: "TCP", port: "443", source: "0.0.0.0/0", action: "allow", enabled: true },
    { id: 3, name: "Allow SSH", protocol: "TCP", port: "22", source: "10.0.0.0/8", action: "allow", enabled: true },
    { id: 4, name: "Block Telnet", protocol: "TCP", port: "23", source: "0.0.0.0/0", action: "deny", enabled: true },
    {
      id: 5,
      name: "Allow MySQL",
      protocol: "TCP",
      port: "3306",
      source: "10.60.0.0/16",
      action: "allow",
      enabled: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Security Rules</h1>
          <p className="text-muted-foreground mt-1">Manage firewall and access control policies</p>
        </div>
        <Button variant="cyan">
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-[#10b981]/50 bg-[#10b981]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Shield className="h-4 w-4 text-[#10b981]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#10b981]">4</div>
            <p className="text-xs text-muted-foreground mt-1">Currently enforced</p>
          </CardContent>
        </Card>

        <Card className="border-[#00b4d8]/50 bg-[#00b4d8]/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Allow Rules</CardTitle>
            <Unlock className="h-4 w-4 text-[#00b4d8]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#00b4d8]">4</div>
            <p className="text-xs text-muted-foreground mt-1">Permissive policies</p>
          </CardContent>
        </Card>

        <Card className="border-red-500/50 bg-red-500/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deny Rules</CardTitle>
            <Lock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">1</div>
            <p className="text-xs text-muted-foreground mt-1">Restrictive policies</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Firewall Rules</CardTitle>
          <CardDescription>Configure network access policies for your slices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {securityRules.map((rule) => (
              <div
                key={rule.id}
                className="flex items-center justify-between p-4 rounded-lg border border-border/50 bg-secondary/20 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex items-center gap-4 flex-1">
                  <Switch checked={rule.enabled} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{rule.name}</h4>
                      {rule.action === "allow" ? (
                        <Badge className="bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50">
                          <Unlock className="w-3 h-3 mr-1" />
                          Allow
                        </Badge>
                      ) : (
                        <Badge className="bg-red-500/20 text-red-500 border-red-500/50">
                          <Lock className="w-3 h-3 mr-1" />
                          Deny
                        </Badge>
                      )}
                      {!rule.enabled && (
                        <Badge variant="outline" className="text-muted-foreground">
                          Disabled
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="font-mono">{rule.protocol}</span>
                      <span>
                        Port: <span className="font-mono">{rule.port}</span>
                      </span>
                      <span>
                        Source: <span className="font-mono">{rule.source}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Add New Security Rule</CardTitle>
          <CardDescription>Create a custom firewall rule</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="rule-name">Rule Name</Label>
              <Input id="rule-name" placeholder="e.g., Allow PostgreSQL" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Select defaultValue="tcp">
                <SelectTrigger id="protocol">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tcp">TCP</SelectItem>
                  <SelectItem value="udp">UDP</SelectItem>
                  <SelectItem value="icmp">ICMP</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="port">Port</Label>
              <Input id="port" placeholder="e.g., 5432" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="source">Source IP/CIDR</Label>
              <Input id="source" placeholder="e.g., 10.0.0.0/8" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select defaultValue="allow">
                <SelectTrigger id="action">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="allow">Allow</SelectItem>
                  <SelectItem value="deny">Deny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button className="w-full" variant="cyan">
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-yellow-500/50 bg-yellow-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-yellow-500">Security Best Practices</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>Always restrict SSH access to known IP ranges</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>Use deny rules for unused or insecure protocols</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>Regularly review and update security rules</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-yellow-500 mt-0.5">•</span>
              <span>Test rules in a development environment before applying to production</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
