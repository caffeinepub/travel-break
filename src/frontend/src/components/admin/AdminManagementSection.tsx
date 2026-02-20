import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAddAdmin } from '@/hooks/useOwnerRecords';
import { Shield, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useInternetIdentity } from '@/hooks/useInternetIdentity';

export default function AdminManagementSection() {
  const [principalInput, setPrincipalInput] = useState('');
  const addAdmin = useAddAdmin();
  const { identity } = useInternetIdentity();

  const currentPrincipal = identity?.getPrincipal().toString() || '';

  const handleAddAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!principalInput.trim()) {
      toast.error('Please enter a principal ID');
      return;
    }

    try {
      await addAdmin.mutateAsync(principalInput.trim());
      toast.success('Admin access granted successfully');
      setPrincipalInput('');
    } catch (error: any) {
      console.error('Failed to add admin:', error);
      toast.error(error.message || 'Failed to grant admin access');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <CardTitle>Admin Management</CardTitle>
        </div>
        <CardDescription>
          Manage authorized administrators who can access the admin dashboard
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Admin Info */}
        <Alert>
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <p className="font-medium">You are currently logged in as an admin</p>
              <p className="text-xs text-muted-foreground font-mono break-all">{currentPrincipal}</p>
            </div>
          </AlertDescription>
        </Alert>

        {/* Add New Admin Form */}
        <form onSubmit={handleAddAdmin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="principal-input">Add New Admin</Label>
            <div className="flex gap-2">
              <Input
                id="principal-input"
                type="text"
                placeholder="Enter principal ID (e.g., xxxxx-xxxxx-xxxxx-xxxxx-cai)"
                value={principalInput}
                onChange={(e) => setPrincipalInput(e.target.value)}
                className="font-mono text-sm"
                disabled={addAdmin.isPending}
              />
              <Button type="submit" disabled={addAdmin.isPending || !principalInput.trim()} className="gap-2">
                <UserPlus className="h-4 w-4" />
                {addAdmin.isPending ? 'Adding...' : 'Add Admin'}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the principal ID of the user you want to grant admin access to
            </p>
          </div>
        </form>

        {/* Information Alert */}
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <p className="font-medium mb-1">Important Notes:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>Only authorized admins can access the admin dashboard</li>
              <li>The system owner (first deployer) is automatically granted admin access</li>
              <li>New admins will have full access to all admin operations</li>
              <li>Users can find their principal ID by logging in and checking their account details</li>
            </ul>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
}
