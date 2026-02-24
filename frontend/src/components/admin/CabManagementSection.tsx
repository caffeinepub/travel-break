import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Car, Plus, Trash2, Loader2 } from 'lucide-react';
import { useGetCabTypes, useCreateCabType, useDeleteCabType } from '@/hooks/useOwnerRecords';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

export default function CabManagementSection() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: '',
    pricePerTrip: '',
    offerPrice: '',
    imageUrl: '',
  });

  const { data: cabTypes = [], isLoading } = useGetCabTypes();
  const createCabType = useCreateCabType();
  const deleteCabType = useDeleteCabType();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createCabType.mutateAsync({
        name: formData.name,
        capacity: BigInt(formData.capacity),
        pricePerTrip: BigInt(formData.pricePerTrip),
        offerPrice: BigInt(formData.offerPrice),
        imageUrl: formData.imageUrl,
      });

      toast.success('Cab type created successfully');
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        capacity: '',
        pricePerTrip: '',
        offerPrice: '',
        imageUrl: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create cab type');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteCabType.mutateAsync(name);
      toast.success('Cab type deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete cab type');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Car className="h-5 w-5" />
              Cab Types
            </CardTitle>
            <CardDescription>Manage available cab types and pricing</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Cab
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Cab Type</DialogTitle>
                <DialogDescription>
                  Create a new cab type with pricing and capacity
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Cab Type Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Sedan"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Capacity (passengers) *</Label>
                    <Input
                      id="capacity"
                      type="number"
                      placeholder="4"
                      value={formData.capacity}
                      onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                      required
                      min="1"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerTrip">Price Per Trip (₹) *</Label>
                      <Input
                        id="pricePerTrip"
                        type="number"
                        placeholder="2000"
                        value={formData.pricePerTrip}
                        onChange={(e) => setFormData({ ...formData, pricePerTrip: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerPrice">Offer Price (₹) *</Label>
                      <Input
                        id="offerPrice"
                        type="number"
                        placeholder="1800"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">Image URL *</Label>
                    <Input
                      id="imageUrl"
                      placeholder="/assets/sedan.jpg"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={createCabType.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCabType.isPending}>
                    {createCabType.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Cab Type
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px]">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : cabTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No cab types available. Click "Add Cab" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cab Type</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Price/Trip</TableHead>
                  <TableHead>Offer Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cabTypes.map((cab) => (
                  <TableRow key={cab.name}>
                    <TableCell className="font-medium">{cab.name}</TableCell>
                    <TableCell>{cab.capacity.toString()} passengers</TableCell>
                    <TableCell>{formatCurrency(cab.pricePerTrip)}</TableCell>
                    <TableCell className="text-green-500">{formatCurrency(cab.offerPrice)}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            disabled={deleteCabType.isPending}
                          >
                            {deleteCabType.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will permanently delete the "{cab.name}" cab type. This action cannot be undone.
                              All existing bookings for this cab type will remain unchanged.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(cab.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Cab Type
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
