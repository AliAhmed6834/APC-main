import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  MapPin, 
  Car, 
  Star, 
  Calendar,
  DollarSign,
  Settings,
  Eye
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface ParkingLot {
  id: string;
  name: string;
  description?: string;
  address: string;
  airportId: string;
  airportName?: string;
  latitude?: number;
  longitude?: number;
  distanceToTerminal?: number;
  shuttleFrequencyMinutes?: number;
  isShuttleIncluded: boolean;
  isCovered: boolean;
  hasEvCharging: boolean;
  hasCarWash: boolean;
  hasSecurityPatrol: boolean;
  hasCctv: boolean;
  totalSpaces?: number;
  imageUrl?: string;
  rating?: number;
  reviewCount: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Airport {
  id: string;
  code: string;
  name: string;
  city: string;
  country: string;
}

const ParkingLotManager: React.FC = () => {
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [airports, setAirports] = useState<Airport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLot, setEditingLot] = useState<ParkingLot | null>(null);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    address: '',
    airportId: '',
    latitude: '',
    longitude: '',
    distanceToTerminal: '',
    shuttleFrequencyMinutes: '',
    isShuttleIncluded: true,
    isCovered: false,
    hasEvCharging: false,
    hasCarWash: false,
    hasSecurityPatrol: false,
    hasCctv: false,
    totalSpaces: '',
    imageUrl: '',
  });

  useEffect(() => {
    fetchParkingLots();
    fetchAirports();
  }, []);

  const fetchParkingLots = async () => {
    try {
      const response = await fetch('/api/supplier/parking-lots', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setParkingLots(data);
      }
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      toast({
        title: "Error",
        description: "Failed to fetch parking lots",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAirports = async () => {
    try {
      const response = await fetch('/api/supplier/airports', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setAirports(data);
      }
    } catch (error) {
      console.error('Error fetching airports:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingLot 
        ? `/api/supplier/parking-lots/${editingLot.id}`
        : '/api/supplier/parking-lots';
      
      const method = editingLot ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          latitude: formData.latitude ? parseFloat(formData.latitude) : undefined,
          longitude: formData.longitude ? parseFloat(formData.longitude) : undefined,
          distanceToTerminal: formData.distanceToTerminal ? parseFloat(formData.distanceToTerminal) : undefined,
          shuttleFrequencyMinutes: formData.shuttleFrequencyMinutes ? parseInt(formData.shuttleFrequencyMinutes) : undefined,
          totalSpaces: formData.totalSpaces ? parseInt(formData.totalSpaces) : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingLot ? "Parking lot updated successfully" : "Parking lot created successfully",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchParkingLots();
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save parking lot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving parking lot:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (lot: ParkingLot) => {
    setEditingLot(lot);
    setFormData({
      name: lot.name,
      description: lot.description || '',
      address: lot.address,
      airportId: lot.airportId,
      latitude: lot.latitude?.toString() || '',
      longitude: lot.longitude?.toString() || '',
      distanceToTerminal: lot.distanceToTerminal?.toString() || '',
      shuttleFrequencyMinutes: lot.shuttleFrequencyMinutes?.toString() || '',
      isShuttleIncluded: lot.isShuttleIncluded,
      isCovered: lot.isCovered,
      hasEvCharging: lot.hasEvCharging,
      hasCarWash: lot.hasCarWash,
      hasSecurityPatrol: lot.hasSecurityPatrol,
      hasCctv: lot.hasCctv,
      totalSpaces: lot.totalSpaces?.toString() || '',
      imageUrl: lot.imageUrl || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (lotId: string) => {
    if (!confirm('Are you sure you want to delete this parking lot?')) {
      return;
    }

    try {
      const response = await fetch(`/api/supplier/parking-lots/${lotId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Parking lot deleted successfully",
        });
        fetchParkingLots();
      } else {
        toast({
          title: "Error",
          description: "Failed to delete parking lot",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting parking lot:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      address: '',
      airportId: '',
      latitude: '',
      longitude: '',
      distanceToTerminal: '',
      shuttleFrequencyMinutes: '',
      isShuttleIncluded: true,
      isCovered: false,
      hasEvCharging: false,
      hasCarWash: false,
      hasSecurityPatrol: false,
      hasCctv: false,
      totalSpaces: '',
      imageUrl: '',
    });
    setEditingLot(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading parking lots...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Parking Lots</h2>
          <p className="text-gray-600">Manage your parking facilities</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Parking Lot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLot ? 'Edit Parking Lot' : 'Add New Parking Lot'}
              </DialogTitle>
              <DialogDescription>
                {editingLot ? 'Update your parking lot information' : 'Create a new parking lot for your customers'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Parking Lot Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Premium Parking - Terminal 1"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="airportId">Airport *</Label>
                  <Select value={formData.airportId} onValueChange={(value) => setFormData({ ...formData, airportId: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select airport" />
                    </SelectTrigger>
                    <SelectContent>
                      {airports.map((airport) => (
                        <SelectItem key={airport.id} value={airport.id}>
                          {airport.code} - {airport.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your parking facility..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Full address of the parking lot"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input
                    id="latitude"
                    type="number"
                    step="any"
                    value={formData.latitude}
                    onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                    placeholder="e.g., 51.5074"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input
                    id="longitude"
                    type="number"
                    step="any"
                    value={formData.longitude}
                    onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                    placeholder="e.g., -0.1278"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="distanceToTerminal">Distance to Terminal (miles)</Label>
                  <Input
                    id="distanceToTerminal"
                    type="number"
                    step="0.1"
                    value={formData.distanceToTerminal}
                    onChange={(e) => setFormData({ ...formData, distanceToTerminal: e.target.value })}
                    placeholder="e.g., 2.5"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="shuttleFrequencyMinutes">Shuttle Frequency (minutes)</Label>
                  <Input
                    id="shuttleFrequencyMinutes"
                    type="number"
                    value={formData.shuttleFrequencyMinutes}
                    onChange={(e) => setFormData({ ...formData, shuttleFrequencyMinutes: e.target.value })}
                    placeholder="e.g., 15"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="totalSpaces">Total Parking Spaces</Label>
                  <Input
                    id="totalSpaces"
                    type="number"
                    value={formData.totalSpaces}
                    onChange={(e) => setFormData({ ...formData, totalSpaces: e.target.value })}
                    placeholder="e.g., 500"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imageUrl">Image URL</Label>
                <Input
                  id="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                  placeholder="https://example.com/parking-lot-image.jpg"
                />
              </div>

              {/* Amenities */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Amenities</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isShuttleIncluded"
                      checked={formData.isShuttleIncluded}
                      onCheckedChange={(checked) => setFormData({ ...formData, isShuttleIncluded: checked })}
                    />
                    <Label htmlFor="isShuttleIncluded">Shuttle Included</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="isCovered"
                      checked={formData.isCovered}
                      onCheckedChange={(checked) => setFormData({ ...formData, isCovered: checked })}
                    />
                    <Label htmlFor="isCovered">Covered Parking</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasEvCharging"
                      checked={formData.hasEvCharging}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasEvCharging: checked })}
                    />
                    <Label htmlFor="hasEvCharging">EV Charging</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasCarWash"
                      checked={formData.hasCarWash}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCarWash: checked })}
                    />
                    <Label htmlFor="hasCarWash">Car Wash</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasSecurityPatrol"
                      checked={formData.hasSecurityPatrol}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasSecurityPatrol: checked })}
                    />
                    <Label htmlFor="hasSecurityPatrol">Security Patrol</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="hasCctv"
                      checked={formData.hasCctv}
                      onCheckedChange={(checked) => setFormData({ ...formData, hasCctv: checked })}
                    />
                    <Label htmlFor="hasCctv">CCTV</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingLot ? 'Update Parking Lot' : 'Create Parking Lot'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Parking Lots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parkingLots.map((lot) => (
          <Card key={lot.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <CardTitle className="text-lg">{lot.name}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    {lot.address}
                  </CardDescription>
                </div>
                <div className="flex space-x-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(lot)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(lot.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {lot.imageUrl && (
                  <img
                    src={lot.imageUrl}
                    alt={lot.name}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                )}
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Star className="h-4 w-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {lot.rating ? lot.rating.toFixed(1) : 'N/A'}
                    </span>
                    <span className="text-sm text-gray-500">
                      ({lot.reviewCount} reviews)
                    </span>
                  </div>
                  <Badge className={lot.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                    {lot.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center space-x-1">
                    <Car className="h-4 w-4 text-gray-400" />
                    <span>{lot.totalSpaces || 'N/A'} spaces</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{lot.distanceToTerminal ? `${lot.distanceToTerminal} miles` : 'N/A'}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {lot.isShuttleIncluded && <Badge variant="secondary" className="text-xs">Shuttle</Badge>}
                  {lot.isCovered && <Badge variant="secondary" className="text-xs">Covered</Badge>}
                  {lot.hasEvCharging && <Badge variant="secondary" className="text-xs">EV</Badge>}
                  {lot.hasSecurityPatrol && <Badge variant="secondary" className="text-xs">Security</Badge>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {parkingLots.length === 0 && (
        <div className="text-center py-12">
          <Car className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No parking lots yet</h3>
          <p className="text-gray-600 mb-4">
            Get started by adding your first parking lot to the platform.
          </p>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Add Your First Parking Lot
          </Button>
        </div>
      )}
    </div>
  );
};

export default ParkingLotManager; 