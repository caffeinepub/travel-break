import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Hotel, Plus, Trash2, Loader2 } from 'lucide-react';
import { useGetRoomTypes, useCreateRoomType, useDeleteRoomType } from '@/hooks/useOwnerRecords';
import { formatCurrency } from '@/utils/format';
import { toast } from 'sonner';

export default function HotelManagementSection() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pricePerNight: '',
    offerPrice: '',
    features: '',
    imageUrls: '',
  });

  const { data: roomTypes = [], isLoading } = useGetRoomTypes();
  const createRoomType = useCreateRoomType();
  const deleteRoomType = useDeleteRoomType();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const featuresArray = formData.features.split(',').map(f => f.trim()).filter(f => f);
      const imageUrlsArray = formData.imageUrls.split(',').map(u => u.trim()).filter(u => u);

      await createRoomType.mutateAsync({
        name: formData.name,
        pricePerNight: BigInt(formData.pricePerNight),
        offerPrice: BigInt(formData.offerPrice),
        features: featuresArray,
        imageUrls: imageUrlsArray,
      });

      toast.success('Hotel room type created successfully');
      setIsAddDialogOpen(false);
      setFormData({
        name: '',
        pricePerNight: '',
        offerPrice: '',
        features: '',
        imageUrls: '',
      });
    } catch (error: any) {
      toast.error(error.message || 'Failed to create room type');
    }
  };

  const handleDelete = async (name: string) => {
    try {
      await deleteRoomType.mutateAsync(name);
      toast.success('Hotel room type deleted successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room type');
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Hotel className="h-5 w-5" />
              Hotel Room Types
            </CardTitle>
            <CardDescription>Manage available hotel room types and pricing</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Hotel
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Hotel Room Type</DialogTitle>
                <DialogDescription>
                  Create a new hotel room type with pricing and features
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Room Type Name *</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Deluxe Suite"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="pricePerNight">Price Per Night (₹) *</Label>
                      <Input
                        id="pricePerNight"
                        type="number"
                        placeholder="5000"
                        value={formData.pricePerNight}
                        onChange={(e) => setFormData({ ...formData, pricePerNight: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="offerPrice">Offer Price (₹) *</Label>
                      <Input
                        id="offerPrice"
                        type="number"
                        placeholder="4500"
                        value={formData.offerPrice}
                        onChange={(e) => setFormData({ ...formData, offerPrice: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="features">Features (comma-separated) *</Label>
                    <Input
                      id="features"
                      placeholder="King Bed, Ocean View, Free WiFi, Mini Bar"
                      value={formData.features}
                      onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="imageUrls">Image URLs (comma-separated) *</Label>
                    <Input
                      id="imageUrls"
                      placeholder="/assets/room1.jpg, /assets/room2.jpg"
                      value={formData.imageUrls}
                      onChange={(e) => setFormData({ ...formData, imageUrls: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    disabled={createRoomType.isPending}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoomType.isPending}>
                    {createRoomType.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Room Type
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
          ) : roomTypes.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hotel room types available. Click "Add Hotel" to create one.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Type</TableHead>
                  <TableHead>Price/Night</TableHead>
                  <TableHead>Offer Price</TableHead>
                  <TableHead>Features</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {roomTypes.map((room) => (
                  <TableRow key={room.name}>
                    <TableCell className="font-medium">{room.name}</TableCell>
                    <TableCell>{formatCurrency(room.pricePerNight)}</TableCell>
                    <TableCell className="text-green-500">{formatCurrency(room.offerPrice)}</TableCell>
                    <TableCell>
                      <div className="max-w-xs truncate">{room.features.join(', ')}</div>
                    </TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="destructive"
                            size="sm"
                            className="gap-2"
                            disabled={deleteRoomType.isPending}
                          >
                            {deleteRoomType.isPending ? (
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
                              This will permanently delete the "{room.name}" room type. This action cannot be undone.
                              All existing bookings for this room type will remain unchanged.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(room.name)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete Room Type
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
