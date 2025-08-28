import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Plus } from 'lucide-react';

interface BulkCreateSlotsDialogProps {
  onSlotsCreated: () => void;
}

export default function BulkCreateSlotsDialog({ onSlotsCreated }: BulkCreateSlotsDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    lotId: '',
    startDate: '',
    endDate: '',
    totalSpaces: 100,
    pricePerDay: 25,
    currency: 'USD',
    skipWeekends: false,
    skipHolidays: false,
  });

  const [parkingLots, setParkingLots] = useState<any[]>([]);

  // Load parking lots on component mount
  React.useEffect(() => {
    const loadParkingLots = async () => {
      try {
        const token = localStorage.getItem('supplierToken');
        if (!token) return;

        const response = await fetch('/api/supplier/parking-lots', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          setParkingLots(data);
        }
      } catch (error) {
        console.error('Error loading parking lots:', error);
      }
    };
    loadParkingLots();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch('/api/supplier/slots/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: `Successfully created ${result.totalCreated} parking slots`,
        });
        setIsOpen(false);
        setFormData({
          lotId: '',
          startDate: '',
          endDate: '',
          totalSpaces: 100,
          pricePerDay: 25,
          currency: 'USD',
          skipWeekends: false,
          skipHolidays: false,
        });
        onSlotsCreated();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create parking slots');
      }
    } catch (error: any) {
      console.error('Error creating parking slots:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create parking slots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate the number of days between start and end date
  const calculateDays = () => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    let actualDays = diffDays;
    
    // Subtract weekends if skipping weekends
    if (formData.skipWeekends) {
      let weekendDays = 0;
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 0 || d.getDay() === 6) {
          weekendDays++;
        }
      }
      actualDays -= weekendDays;
    }
    
    return actualDays;
  };

  const totalDays = calculateDays();
  const totalSlots = totalDays * formData.totalSpaces;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Calendar className="w-4 h-4 mr-2" />
          Bulk Create Slots
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Create Parking Slots</DialogTitle>
          <DialogDescription>
            Create multiple parking slots for a date range
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Parking Lot Selection */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Parking Lot</h3>
            <div className="space-y-2">
              <Label htmlFor="lotId">Select Parking Lot *</Label>
              <Select value={formData.lotId} onValueChange={(value) => setFormData({...formData, lotId: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a parking lot" />
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
          </div>

          {/* Date Range */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Date Range</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date *</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                  required
                />
              </div>
            </div>
            
            {/* Date Summary */}
            {totalDays > 0 && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Summary:</strong> {totalDays} days, {totalSlots.toLocaleString()} total slots
                </p>
              </div>
            )}
          </div>

          {/* Slot Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Slot Configuration</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalSpaces">Spaces per Day *</Label>
                <Input
                  id="totalSpaces"
                  type="number"
                  value={formData.totalSpaces}
                  onChange={(e) => setFormData({...formData, totalSpaces: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pricePerDay">Price per Day</Label>
                <Input
                  id="pricePerDay"
                  type="number"
                  step="0.01"
                  value={formData.pricePerDay}
                  onChange={(e) => setFormData({...formData, pricePerDay: parseFloat(e.target.value)})}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select value={formData.currency} onValueChange={(value) => setFormData({...formData, currency: value})}>
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

          {/* Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Options</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipWeekends"
                  checked={formData.skipWeekends}
                  onCheckedChange={(checked) => setFormData({...formData, skipWeekends: checked as boolean})}
                />
                <Label htmlFor="skipWeekends">Skip weekends (Saturday & Sunday)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="skipHolidays"
                  checked={formData.skipHolidays}
                  onCheckedChange={(checked) => setFormData({...formData, skipHolidays: checked as boolean})}
                />
                <Label htmlFor="skipHolidays">Skip holidays (New Year's Day, Independence Day, Christmas)</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : `Create ${totalDays > 0 ? totalDays : ''} Slots`}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 