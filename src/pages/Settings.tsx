import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useSettingsStore, useWorkspaceStore } from '@/stores';
import { useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { healthService } from '@/services/health';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Loader2, Trash2 } from 'lucide-react';
import { WorkspaceCreateDialog } from '@/components/workspace/WorkspaceCreateDialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Settings() {
  const { language, timezone, dateFormat, density, updateSettings } = useSettingsStore();
  const { workspaces, currentWorkspaceId, setCurrentWorkspaceId, removeWorkspace } =
    useWorkspaceStore();

  const {
    data: healthStatus,
    isLoading: isHealthLoading,
    error: healthError,
  } = useQuery({
    queryKey: ['health'],
    queryFn: () => healthService.getHealthStatus(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const handleLanguageChange = useCallback(
    (value: string) => {
      updateSettings({ language: value });
    },
    [updateSettings]
  );

  const handleTimezoneChange = useCallback(
    (value: string) => {
      updateSettings({ timezone: value });
    },
    [updateSettings]
  );

  const handleDensityChange = useCallback(
    (value: 'comfortable' | 'compact' | 'spacious') => {
      updateSettings({ density: value });
    },
    [updateSettings]
  );

  const handleDateFormatChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      updateSettings({ dateFormat: e.target.value });
    },
    [updateSettings]
  );

  return (
    <div className="p-4 pl-2 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your application preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isHealthLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">Checking health status...</span>
            </div>
          ) : healthError ? (
            <div className="flex items-center gap-2 p-4 bg-destructive/10 text-destructive rounded-lg">
              <XCircle className="h-5 w-5" />
              <div>
                <p className="font-medium">Health Check Failed</p>
                <p className="text-sm opacity-80">Unable to connect to the API server</p>
              </div>
            </div>
          ) : healthStatus ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950 text-green-900 dark:text-green-100 rounded-lg border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5" />
                  <div>
                    <p className="font-medium">System Healthy</p>
                    <p className="text-sm opacity-80">All services are running normally</p>
                  </div>
                </div>
                <Badge variant="default">Online</Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API Status:</span>
                  <span className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="h-4 w-4" />
                    Connected
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">API URL:</span>
                  <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                    {import.meta.env.VITE_API_URL || 'Not configured'}
                  </span>
                </div>
                {healthStatus.version && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Version:</span>
                    <Badge variant="outline">{healthStatus.version}</Badge>
                  </div>
                )}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Last Checked:</span>
                  <span className="text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-950 text-yellow-900 dark:text-yellow-100 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <Clock className="h-5 w-5" />
              <div>
                <p className="font-medium">Health Status Unknown</p>
                <p className="text-sm opacity-80">Unable to determine system health</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Workspaces</CardTitle>
          <WorkspaceCreateDialog />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Target URL</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.map((workspace) => (
                <TableRow key={workspace.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {workspace.name}
                      {workspace.isDefault && (
                        <Badge variant="secondary" className="text-xs">
                          Default
                        </Badge>
                      )}
                      {workspace.id === currentWorkspaceId && (
                        <Badge variant="default" className="text-xs">
                          Current
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs">{workspace.targetUrl}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          workspace.id === currentWorkspaceId ? 'bg-green-500' : 'bg-gray-300'
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {workspace.id === currentWorkspaceId ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    {!workspace.isDefault && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeWorkspace(workspace.id)}
                        disabled={workspace.id === currentWorkspaceId}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>General Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="language">Language</Label>
            <Select value={language} onValueChange={handleLanguageChange}>
              <SelectTrigger id="language">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Spanish</SelectItem>
                <SelectItem value="fr">French</SelectItem>
                <SelectItem value="de">German</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={timezone} onValueChange={handleTimezoneChange}>
              <SelectTrigger id="timezone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="density">Display Density</Label>
            <Select value={density} onValueChange={handleDensityChange}>
              <SelectTrigger id="density">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="compact">Compact</SelectItem>
                <SelectItem value="comfortable">Comfortable</SelectItem>
                <SelectItem value="spacious">Spacious</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="dateformat">Date Format</Label>
            <Input id="dateformat" value={dateFormat} onChange={handleDateFormatChange} />
          </div>

          <div className="pt-4">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
