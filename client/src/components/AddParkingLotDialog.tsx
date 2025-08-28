import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Plus } from 'lucide-react';
import AirportAutocomplete from './AirportAutocomplete';

interface AddParkingLotDialogProps {
  onParkingLotAdded: () => void;
}

export default function AddParkingLotDialog({ onParkingLotAdded }: AddParkingLotDialogProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    airportId: '',
    airportCode: '',
    selectedAirport: null as any,
    totalSpaces: 100,
    distanceToTerminal: 1.0,
    shuttleFrequencyMinutes: 15,
    pricePerDay: 25,
    currency: 'USD',
    isShuttleIncluded: true,
    isCovered: false,
    hasEvCharging: false,
    hasCarWash: false,
    hasSecurityPatrol: true,
    hasCctv: true,
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('supplierToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Validate that airport is selected
      if (!formData.selectedAirport) {
        throw new Error('Please select an airport');
      }

      // Prepare the data for the API
      const parkingLotData = {
        name: formData.name,
        description: formData.description || null,
        address: formData.address,
        airportId: formData.selectedAirport.id,
        totalSpaces: formData.totalSpaces,
        distanceToTerminal: formData.distanceToTerminal.toString(),
        shuttleFrequencyMinutes: formData.shuttleFrequencyMinutes,
        isShuttleIncluded: formData.isShuttleIncluded,
        isCovered: formData.isCovered,
        hasEvCharging: formData.hasEvCharging,
        hasCarWash: formData.hasCarWash,
        hasSecurityPatrol: formData.hasSecurityPatrol,
        hasCctv: formData.hasCctv,
        isActive: true,
        rating: null,
        reviewCount: null,
        imageUrl: null,
        latitude: formData.selectedAirport.latitude || null,
        longitude: formData.selectedAirport.longitude || null,
        // Include pricing data
        pricePerDay: formData.pricePerDay,
        currency: formData.currency,
      };

      const response = await fetch('/api/supplier/parking-lots', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parkingLotData),
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Success",
          description: "Parking lot added successfully",
        });
        setIsOpen(false);
        setFormData({
          name: '',
          description: '',
          address: '',
          airportId: '',
          airportCode: '',
          selectedAirport: null,
          totalSpaces: 100,
          distanceToTerminal: 1.0,
          shuttleFrequencyMinutes: 15,
          pricePerDay: 25,
          currency: 'USD',
          isShuttleIncluded: true,
          isCovered: false,
          hasEvCharging: false,
          hasCarWash: false,
          hasSecurityPatrol: true,
          hasCctv: true,
        });
        onParkingLotAdded();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add parking lot');
      }
    } catch (error: any) {
      console.error('Error adding parking lot:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add parking lot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Parking Lot
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Parking Lot</DialogTitle>
          <DialogDescription>
            Create a new parking lot for your airport parking business
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Basic Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Parking Lot Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="e.g., Premium Airport Parking"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="totalSpaces">Total Spaces *</Label>
                <Input
                  id="totalSpaces"
                  type="number"
                  value={formData.totalSpaces}
                  onChange={(e) => setFormData({...formData, totalSpaces: parseInt(e.target.value)})}
                  min="1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Brief description of the parking lot"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Full address of the parking lot"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="airport">Airport *</Label>
              <AirportAutocomplete
                value={formData.airportCode}
                onChange={(value) => setFormData({...formData, airportCode: value})}
                onSelect={(airport) => {
                  setFormData({
                    ...formData, 
                    airportCode: airport.code,
                    selectedAirport: airport,
                    // Auto-fill address if not provided
                    address: formData.address || `${airport.name}, ${airport.city}, ${airport.state || airport.country}`
                  });
                }}
                placeholder="Search airports (e.g., Los Angeles, LAX)"
              />
              {formData.selectedAirport && (
                <div className="text-sm text-gray-600 mt-1">
                  Selected: {formData.selectedAirport.city} ({formData.selectedAirport.code}) - {formData.selectedAirport.name}
                </div>
              )}
            </div>
          </div>

          {/* Location & Distance */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Location & Distance</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="distanceToTerminal">Distance to Terminal (miles)</Label>
                <Input
                  id="distanceToTerminal"
                  type="number"
                  step="0.1"
                  value={formData.distanceToTerminal}
                  onChange={(e) => setFormData({...formData, distanceToTerminal: parseFloat(e.target.value)})}
                  min="0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shuttleFrequencyMinutes">Shuttle Frequency (minutes)</Label>
                <Input
                  id="shuttleFrequencyMinutes"
                  type="number"
                  value={formData.shuttleFrequencyMinutes}
                  onChange={(e) => setFormData({...formData, shuttleFrequencyMinutes: parseInt(e.target.value)})}
                  min="5"
                />
              </div>
            </div>
          </div>

          {/* Pricing */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Pricing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          {/* Amenities */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Amenities & Services</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isShuttleIncluded"
                  checked={formData.isShuttleIncluded}
                  onCheckedChange={(checked) => setFormData({...formData, isShuttleIncluded: checked as boolean})}
                />
                <Label htmlFor="isShuttleIncluded">Shuttle Service</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="isCovered"
                  checked={formData.isCovered}
                  onCheckedChange={(checked) => setFormData({...formData, isCovered: checked as boolean})}
                />
                <Label htmlFor="isCovered">Covered Parking</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasEvCharging"
                  checked={formData.hasEvCharging}
                  onCheckedChange={(checked) => setFormData({...formData, hasEvCharging: checked as boolean})}
                />
                <Label htmlFor="hasEvCharging">EV Charging</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCarWash"
                  checked={formData.hasCarWash}
                  onCheckedChange={(checked) => setFormData({...formData, hasCarWash: checked as boolean})}
                />
                <Label htmlFor="hasCarWash">Car Wash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasSecurityPatrol"
                  checked={formData.hasSecurityPatrol}
                  onCheckedChange={(checked) => setFormData({...formData, hasSecurityPatrol: checked as boolean})}
                />
                <Label htmlFor="hasSecurityPatrol">Security Patrol</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="hasCctv"
                  checked={formData.hasCctv}
                  onCheckedChange={(checked) => setFormData({...formData, hasCctv: checked as boolean})}
                />
                <Label htmlFor="hasCctv">CCTV Surveillance</Label>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Parking Lot'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 