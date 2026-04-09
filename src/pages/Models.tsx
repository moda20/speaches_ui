import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { modelsService } from '@/services/models';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';
import { LocalModelsTab } from '@/components/features/models/LocalModelsTab';
import { AudioModelsTab } from '@/components/features/models/AudioModelsTab';
import { VoicesTab } from '@/components/features/models/VoicesTab';
import { RemoteModelsTab } from '@/components/features/models/RemoteModelsTab';
import { RunningModelsTab } from '@/components/features/models/RunningModelsTab';
import { TASK_OPTIONS } from '@/components/features/models/constants';
import { useWorkspaceStore } from '@/stores/workspaceStore';

export default function Models() {
  const { currentWorkspaceId } = useWorkspaceStore();
  const [activeTab, setActiveTab] = useState('local');
  const [taskFilter, setTaskFilter] = useState<string>('all');

  const { refetch: refetchLocalModels } = useQuery({
    queryKey: ['models', 'local', taskFilter, currentWorkspaceId],
    queryFn: () => modelsService.getLocalModels(taskFilter === 'all' ? undefined : taskFilter),
    enabled: false,
  });

  const { refetch: refetchAudioModels } = useQuery({
    queryKey: ['models', 'audio', currentWorkspaceId],
    queryFn: () => modelsService.getAudioModels(),
    enabled: false,
  });

  const { refetch: refetchVoices } = useQuery({
    queryKey: ['models', 'voices', currentWorkspaceId],
    queryFn: () => modelsService.getAudioVoices(),
    enabled: false,
  });

  const { refetch: refetchRemoteModels } = useQuery({
    queryKey: ['models', 'remote', taskFilter, currentWorkspaceId],
    queryFn: () => modelsService.getRemoteModels(taskFilter === 'all' ? undefined : taskFilter),
    enabled: false,
  });

  const { refetch: refetchRunningModels } = useQuery({
    queryKey: ['models', 'running', currentWorkspaceId],
    queryFn: () => modelsService.getRunningModels(),
    enabled: false,
  });

  const handleRefresh = () => {
    switch (activeTab) {
      case 'local':
        refetchLocalModels();
        break;
      case 'audio':
        refetchAudioModels();
        break;
      case 'voices':
        refetchVoices();
        break;
      case 'remote':
        refetchRemoteModels();
        break;
      case 'running':
        refetchRunningModels();
        break;
    }
  };

  const getRefreshHandler = (tab: string) => {
    switch (tab) {
      case 'local':
        return refetchLocalModels;
      case 'audio':
        return refetchAudioModels;
      case 'voices':
        return refetchVoices;
      case 'remote':
        return refetchRemoteModels;
      case 'running':
        return refetchRunningModels;
      default:
        return handleRefresh;
    }
  };

  return (
    <div className="p-4 pl-2 space-y-6">
      <PageHeader
        title="Models"
        description="Manage and explore available speech models"
        actions={
          <Button variant="outline" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        }
      />

      <Card className="border-none p-0">
        <CardContent className="p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center mb-4">
                <TabsList className="w-full sm:w-auto">
                  <TabsTrigger value="local">Local Models</TabsTrigger>
                  <TabsTrigger value="audio">Audio Models</TabsTrigger>
                  <TabsTrigger value="voices">Voices</TabsTrigger>
                  <TabsTrigger value="remote">Remote Registry</TabsTrigger>
                  <TabsTrigger value="running">Running</TabsTrigger>
                </TabsList>

                {(activeTab === 'local' || activeTab === 'remote') && (
                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <span className="text-sm text-muted-foreground">Filter by task:</span>
                    <Select value={taskFilter} onValueChange={setTaskFilter}>
                      <SelectTrigger className="w-full sm:w-[200px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Tasks</SelectItem>
                        {TASK_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <TabsContent value="local" className="mt-0">
                <LocalModelsTab taskFilter={taskFilter} onRefresh={getRefreshHandler('local')} />
              </TabsContent>

              <TabsContent value="audio" className="mt-0">
                <AudioModelsTab onRefresh={getRefreshHandler('audio')} />
              </TabsContent>

              <TabsContent value="voices" className="mt-0">
                <VoicesTab onRefresh={getRefreshHandler('voices')} />
              </TabsContent>

              <TabsContent value="remote" className="mt-0">
                <RemoteModelsTab taskFilter={taskFilter} onRefresh={getRefreshHandler('remote')} />
              </TabsContent>

              <TabsContent value="running" className="mt-0">
                <RunningModelsTab onRefresh={getRefreshHandler('running')} />
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
