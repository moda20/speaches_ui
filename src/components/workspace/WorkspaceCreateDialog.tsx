import { useState } from 'react';
import { useWorkspaceStore, Workspace } from '@/stores/workspaceStore';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';

interface WorkspaceCreateDialogProps {
  trigger?: React.ReactNode;
}

export function WorkspaceCreateDialog({ trigger }: WorkspaceCreateDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [targetUrl, setTargetUrl] = useState('');
  const [error, setError] = useState('');

  const { workspaces, addWorkspace, setCurrentWorkspaceId } = useWorkspaceStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Workspace name is required');
      return;
    }

    const nameExists = workspaces.some((w) => w.name.toLowerCase() === name.toLowerCase());
    if (nameExists) {
      setError('A workspace with this name already exists');
      return;
    }

    try {
      new URL(targetUrl);
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    addWorkspace({ name, targetUrl });
    setName('');
    setTargetUrl('');
    setOpen(false);
  };

  const handleCancel = () => {
    setName('');
    setTargetUrl('');
    setError('');
    setOpen(false);
  };

  const defaultTrigger = (
    <Button>
      <Plus className="mr-2 h-4 w-4" />
      Create Workspace
    </Button>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger || defaultTrigger}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Workspace</DialogTitle>
          <DialogDescription>
            Add a new workspace with a unique name and API endpoint.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="col-span-3"
                placeholder="My Workspace"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="url" className="text-right">
                Target URL
              </Label>
              <Input
                id="url"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                className="col-span-3"
                placeholder="http://localhost:3000/api"
              />
            </div>
            {error && <div className="col-span-4 text-sm text-destructive">{error}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Create Workspace</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
