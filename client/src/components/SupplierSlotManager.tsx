import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus, Edit, Trash2 } from 'lucide-react';

interface ParkingLot {
  id: string;
  name: string;
  address: string;
}

interface ParkingSlot {
  id: string;
  date: string;
  totalSpaces: number;
  availableSpaces: number;
  pricePerDay: string;
  currency: string;
}

interface SupplierSlotManagerProps {
  parkingLots: ParkingLot[];
  onSlotsUpdated: () => void;
  selectedLotId?: string;
}

export default function SupplierSlotManager({ parkingLots, onSlotsUpdated, selectedLotId }: SupplierSlotManagerProps) {
  const { toast } = useToast();
  const [selectedLot, setSelectedLot] = useState<string>('');
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
  });

  // Set selected lot when selectedLotId prop changes
  useEffect(() => {
    console.log('🔍 selectedLotId prop changed:', { selectedLotId, currentSelectedLot: selectedLot });
    if (selectedLotId && selectedLotId !== selectedLot) {
      console.log('🔍 Updating selectedLot from', selectedLot, 'to', selectedLotId);
      setSelectedLot(selectedLotId);
    }
  }, [selectedLotId]);

  // Initial setup - set selectedLot if selectedLotId is provided on mount
  useEffect(() => {
    if (selectedLotId && !selectedLot) {
      console.log('🔍 Initial setup: setting selectedLot to', selectedLotId);
      setSelectedLot(selectedLotId);
    }
  }, []);

  // Debug effect to log state changes
  useEffect(() => {
    console.log('🔍 selectedLot state changed:', selectedLot);
  }, [selectedLot]);

  console.log('🔍 SupplierSlotManager render:', { 
    parkingLots: parkingLots.length, 
    selectedLot, 
    selectedLotId,
    slots: slots.length, 
    dateRange 
  });

  // Bulk creation form state
  const [bulkForm, setBulkForm] = useState({
    lotId: '',
    startDate: '',
    endDate: '',
    totalSpaces: 50,
    pricePerDay: 25,
    currency: 'USD'
  });

  // Edit form state
  const [editForm, setEditForm] = useState({
    totalSpaces: 0,
    availableSpaces: 0,
    pricePerDay: 0,
    currency: 'USD'
  });

  useEffect(() => {
    console.log('🔍 useEffect triggered:', { selectedLot, dateRange });
    if (selectedLot) {
      loadSlots();
    }
  }, [selectedLot, dateRange.startDate, dateRange.endDate]);

  const loadSlots = async () => {
    if (!selectedLot) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem('supplierToken');
      
      if (!token) {
        console.error('🔍 No authentication token found');
        toast({
          title: "Error",
          description: "No authentication token found",
          variant: "destructive",
        });
        return;
      }
      
      const url = `/api/supplier/slots/${selectedLot}?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`;
      console.log('🔍 Loading slots with URL:', url);
      console.log('🔍 Date range:', dateRange);
      console.log('🔍 Token exists:', !!token);

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('🔍 Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 Received slots data:', data);
        setSlots(data || []);
        console.log('🔍 Slots state updated, count:', (data || []).length);
      } else {
        const errorText = await response.text();
        console.error('🔍 Error response:', errorText);
        toast({
          title: "Error",
          description: "Failed to load parking slots",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      toast({
        title: "Error",
        description: "Failed to load parking slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkCreate = async () => {
    try {
      const token = localStorage.getItem('supplierToken');
      const response = await fetch('/api/supplier/slots/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bulkForm),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Success",
          description: data.message,
        });
        setIsBulkDialogOpen(false);
        setBulkForm({
          lotId: '',
          startDate: '',
          endDate: '',
          totalSpaces: 50,
          pricePerDay: 25,
          currency: 'USD'
        });
        onSlotsUpdated();
        loadSlots();
      } else {
        throw new Error('Failed to create slots');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create parking slots",
        variant: "destructive",
      });
    }
  };

  const handleEditSlot = async () => {
    if (!editingSlot) return;

    try {
      const token = localStorage.getItem('supplierToken');
      const response = await fetch(`/api/supplier/slots/${editingSlot.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Slot updated successfully",
        });
        setIsEditDialogOpen(false);
        setEditingSlot(null);
        onSlotsUpdated();
        loadSlots();
      } else {
        throw new Error('Failed to update slot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update parking slot",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSlot = async (slotId: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    try {
      const token = localStorage.getItem('supplierToken');
      const response = await fetch(`/api/supplier/slots/${slotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Slot deleted successfully",
        });
        onSlotsUpdated();
        loadSlots();
      } else {
        throw new Error('Failed to delete slot');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete parking slot",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (slot: ParkingSlot) => {
    setEditingSlot(slot);
    setEditForm({
      totalSpaces: slot.totalSpaces,
      availableSpaces: slot.availableSpaces,
      pricePerDay: parseFloat(slot.pricePerDay),
      currency: slot.currency
    });
    setIsEditDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="space-y-2">
            <Label htmlFor="parking-lot">Select Parking Lot</Label>
            <Select key={selectedLot} value={selectedLot} onValueChange={setSelectedLot}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Choose a parking lot" />
              </SelectTrigger>
              <SelectContent>
                {parkingLots.map((lot) => (
                  <SelectItem key={lot.id} value={lot.id}>
                    {lot.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {selectedLot && (
            <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-end">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => {
                    setDateRange({...dateRange, startDate: e.target.value});
                    setTimeout(loadSlots, 100); // Reload slots after date change
                  }}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => {
                    setDateRange({...dateRange, endDate: e.target.value});
                    setTimeout(loadSlots, 100); // Reload slots after date change
                  }}
                />
              </div>
              <Button 
                variant="outline" 
                onClick={loadSlots}
                className="h-10"
              >
                Refresh
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  console.log('🔍 Manual debug - Current state:', { selectedLot, dateRange, slots: slots.length });
                  loadSlots();
                }}
                className="h-10"
              >
                Debug
              </Button>
            </div>
          )}
        </div>

        <div className="flex gap-2">
          <Dialog open={isBulkDialogOpen} onOpenChange={setIsBulkDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Bulk Create Slots
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Bulk Create Parking Slots</DialogTitle>
                <DialogDescription>
                  Create multiple parking slots for a date range
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="lot">Parking Lot</Label>
                  <Select value={bulkForm.lotId} onValueChange={(value) => setBulkForm({...bulkForm, lotId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parking lot" />
                    </SelectTrigger>
                    <SelectContent>
                      {parkingLots.map((lot) => (
                        <SelectItem key={lot.id} value={lot.id}>
                          {lot.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={bulkForm.startDate}
                      onChange={(e) => setBulkForm({...bulkForm, startDate: e.target.value})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={bulkForm.endDate}
                      onChange={(e) => setBulkForm({...bulkForm, endDate: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="total-spaces">Total Spaces</Label>
                    <Input
                      id="total-spaces"
                      type="number"
                      value={bulkForm.totalSpaces}
                      onChange={(e) => setBulkForm({...bulkForm, totalSpaces: parseInt(e.target.value)})}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="price-per-day">Price per Day</Label>
                    <Input
                      id="price-per-day"
                      type="number"
                      value={bulkForm.pricePerDay}
                      onChange={(e) => setBulkForm({...bulkForm, pricePerDay: parseFloat(e.target.value)})}
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={bulkForm.currency} onValueChange={(value) => setBulkForm({...bulkForm, currency: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsBulkDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleBulkCreate}>
                  Create Slots
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Slots Table */}
      {!selectedLot ? (
        <Card>
          <CardHeader>
            <CardTitle>Parking Slots</CardTitle>
            <CardDescription>Select a parking lot to view and manage slots</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Please select a parking lot from the dropdown above to view parking slots
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Parking Slots ({slots.length})
            </CardTitle>
            <CardDescription>
              Manage parking availability for the selected lot
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No slots found for this parking lot
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">Date</th>
                      <th className="text-left p-3 font-medium">Total Spaces</th>
                      <th className="text-left p-3 font-medium">Available</th>
                      <th className="text-left p-3 font-medium">Reserved</th>
                      <th className="text-left p-3 font-medium">Price/Day</th>
                      <th className="text-left p-3 font-medium">Status</th>
                      <th className="text-left p-3 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.map((slot) => (
                      <tr key={slot.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">{new Date(slot.date).toLocaleDateString()}</td>
                        <td className="p-3">{slot.totalSpaces}</td>
                        <td className="p-3">{slot.availableSpaces}</td>
                        <td className="p-3">{slot.totalSpaces - slot.availableSpaces}</td>
                        <td className="p-3">
                          {slot.currency === 'USD' ? '$' : slot.currency === 'GBP' ? '£' : '€'}
                          {slot.pricePerDay}
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            slot.availableSpaces > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {slot.availableSpaces > 0 ? 'Available' : 'Full'}
                          </span>
                        </td>
                        <td className="p-3">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => openEditDialog(slot)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDeleteSlot(slot.id)}
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Slot Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Parking Slot</DialogTitle>
            <DialogDescription>
              Update slot details for {editingSlot && new Date(editingSlot.date).toLocaleDateString()}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-total-spaces">Total Spaces</Label>
                <Input
                  id="edit-total-spaces"
                  type="number"
                  value={editForm.totalSpaces}
                  onChange={(e) => setEditForm({...editForm, totalSpaces: parseInt(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-available-spaces">Available Spaces</Label>
                <Input
                  id="edit-available-spaces"
                  type="number"
                  value={editForm.availableSpaces}
                  onChange={(e) => setEditForm({...editForm, availableSpaces: parseInt(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price-per-day">Price per Day</Label>
                <Input
                  id="edit-price-per-day"
                  type="number"
                  value={editForm.pricePerDay}
                  onChange={(e) => setEditForm({...editForm, pricePerDay: parseFloat(e.target.value)})}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Select value={editForm.currency} onValueChange={(value) => setEditForm({...editForm, currency: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD ($)</SelectItem>
                    <SelectItem value="GBP">GBP (£)</SelectItem>
                    <SelectItem value="EUR">EUR (€)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditSlot}>
              Update Slot
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 