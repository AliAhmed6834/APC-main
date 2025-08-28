import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Switch } from '../ui/switch';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp,
  Calendar,
  MapPin
} from 'lucide-react';
import { useToast } from '../../hooks/use-toast';

interface Pricing {
  id: string;
  lotId: string;
  priceType: 'daily' | 'weekly' | 'monthly';
  basePrice: number;
  currency: string;
  localizedPrice: number;
  taxRate: number;
  region: string;
  discountedPrice?: number;
  validFrom: string;
  validTo?: string;
  isActive: boolean;
  createdAt: string;
}

interface ParkingLot {
  id: string;
  name: string;
  airportName?: string;
}

const PricingManager: React.FC = () => {
  const [pricing, setPricing] = useState<Pricing[]>([]);
  const [parkingLots, setParkingLots] = useState<ParkingLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPricing, setEditingPricing] = useState<Pricing | null>(null);
  const [selectedLotId, setSelectedLotId] = useState<string>('');
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    lotId: '',
    priceType: 'daily' as 'daily' | 'weekly' | 'monthly',
    basePrice: '',
    currency: 'USD',
    localizedPrice: '',
    taxRate: '0',
    region: 'US',
    discountedPrice: '',
    validFrom: '',
    validTo: '',
  });

  useEffect(() => {
    fetchParkingLots();
  }, []);

  useEffect(() => {
    if (selectedLotId) {
      fetchPricing(selectedLotId);
    }
  }, [selectedLotId]);

  const fetchParkingLots = async () => {
    try {
      const response = await fetch('/api/supplier/parking-lots', {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setParkingLots(data);
        if (data.length > 0) {
          setSelectedLotId(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching parking lots:', error);
    }
  };

  const fetchPricing = async (lotId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/supplier/parking-lots/${lotId}/pricing`, {
        credentials: 'include',
      });
      if (response.ok) {
        const data = await response.json();
        setPricing(data);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
      toast({
        title: "Error",
        description: "Failed to fetch pricing data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingPricing 
        ? `/api/supplier/parking-lots/${selectedLotId}/pricing/${editingPricing.id}`
        : `/api/supplier/parking-lots/${selectedLotId}/pricing`;
      
      const method = editingPricing ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          ...formData,
          basePrice: parseFloat(formData.basePrice),
          localizedPrice: parseFloat(formData.localizedPrice),
          taxRate: parseFloat(formData.taxRate),
          discountedPrice: formData.discountedPrice ? parseFloat(formData.discountedPrice) : undefined,
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: editingPricing ? "Pricing updated successfully" : "Pricing created successfully",
        });
        setIsDialogOpen(false);
        resetForm();
        fetchPricing(selectedLotId);
      } else {
        const error = await response.json();
        toast({
          title: "Error",
          description: error.message || "Failed to save pricing",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error saving pricing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const handleEdit = (pricingItem: Pricing) => {
    setEditingPricing(pricingItem);
    setFormData({
      lotId: pricingItem.lotId,
      priceType: pricingItem.priceType,
      basePrice: pricingItem.basePrice.toString(),
      currency: pricingItem.currency,
      localizedPrice: pricingItem.localizedPrice.toString(),
      taxRate: pricingItem.taxRate.toString(),
      region: pricingItem.region,
      discountedPrice: pricingItem.discountedPrice?.toString() || '',
      validFrom: pricingItem.validFrom.split('T')[0],
      validTo: pricingItem.validTo?.split('T')[0] || '',
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (pricingId: string) => {
    if (!confirm('Are you sure you want to delete this pricing?')) {
      return;
    }

    try {
      const response = await fetch(`/api/supplier/parking-lots/${selectedLotId}/pricing/${pricingId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Pricing deleted successfully",
        });
        fetchPricing(selectedLotId);
      } else {
        toast({
          title: "Error",
          description: "Failed to delete pricing",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error deleting pricing:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      lotId: selectedLotId,
      priceType: 'daily',
      basePrice: '',
      currency: 'USD',
      localizedPrice: '',
      taxRate: '0',
      region: 'US',
      discountedPrice: '',
      validFrom: '',
      validTo: '',
    });
    setEditingPricing(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const getPriceTypeLabel = (type: string) => {
    switch (type) {
      case 'daily':
        return 'Daily';
      case 'weekly':
        return 'Weekly';
      case 'monthly':
        return 'Monthly';
      default:
        return type;
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'USD':
        return '$';
      case 'GBP':
        return '£';
      case 'EUR':
        return '€';
      default:
        return currency;
    }
  };

  if (parkingLots.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No parking lots found</h3>
        <p className="text-gray-600">
          You need to create parking lots before setting pricing.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pricing Management</h2>
          <p className="text-gray-600">Set and manage pricing for your parking lots</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="h-4 w-4 mr-2" />
              Add Pricing
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingPricing ? 'Edit Pricing' : 'Add New Pricing'}
              </DialogTitle>
              <DialogDescription>
                {editingPricing ? 'Update pricing information' : 'Set pricing for your parking lot'}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceType">Price Type *</Label>
                  <Select value={formData.priceType} onValueChange={(value: any) => setFormData({ ...formData, priceType: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency *</Label>
                  <Select value={formData.currency} onValueChange={(value) => setFormData({ ...formData, currency: value })}>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="basePrice">Base Price *</Label>
                  <Input
                    id="basePrice"
                    type="number"
                    step="0.01"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="localizedPrice">Localized Price *</Label>
                  <Input
                    id="localizedPrice"
                    type="number"
                    step="0.01"
                    value={formData.localizedPrice}
                    onChange={(e) => setFormData({ ...formData, localizedPrice: e.target.value })}
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="taxRate">Tax Rate (%)</Label>
                  <Input
                    id="taxRate"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discountedPrice">Discounted Price</Label>
                  <Input
                    id="discountedPrice"
                    type="number"
                    step="0.01"
                    value={formData.discountedPrice}
                    onChange={(e) => setFormData({ ...formData, discountedPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="region">Region *</Label>
                  <Select value={formData.region} onValueChange={(value) => setFormData({ ...formData, region: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="US">United States</SelectItem>
                      <SelectItem value="GB">United Kingdom</SelectItem>
                      <SelectItem value="EU">European Union</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="validFrom">Valid From *</Label>
                  <Input
                    id="validFrom"
                    type="date"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="validTo">Valid To (Optional)</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingPricing ? 'Update Pricing' : 'Create Pricing'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lot Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select Parking Lot</CardTitle>
          <CardDescription>Choose a parking lot to manage its pricing</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={selectedLotId} onValueChange={setSelectedLotId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a parking lot" />
            </SelectTrigger>
            <SelectContent>
              {parkingLots.map((lot) => (
                <SelectItem key={lot.id} value={lot.id}>
                  {lot.name} {lot.airportName && `(${lot.airportName})`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Pricing List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-32">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading pricing...</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pricing.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing set</h3>
                <p className="text-gray-600 mb-4">
                  Set pricing for this parking lot to start accepting bookings.
                </p>
                <Button onClick={openCreateDialog}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Pricing
                </Button>
              </CardContent>
            </Card>
          ) : (
            pricing.map((pricingItem) => (
              <Card key={pricingItem.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-blue-100 text-blue-800">
                          {getPriceTypeLabel(pricingItem.priceType)}
                        </Badge>
                        <Badge className={pricingItem.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {pricingItem.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center space-x-4">
                          <span className="text-2xl font-bold">
                            {getCurrencySymbol(pricingItem.currency)}{pricingItem.localizedPrice}
                          </span>
                          {pricingItem.discountedPrice && (
                            <span className="text-lg text-gray-500 line-through">
                              {getCurrencySymbol(pricingItem.currency)}{pricingItem.discountedPrice}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-sm text-gray-600">
                          <span>Base: {getCurrencySymbol(pricingItem.currency)}{pricingItem.basePrice}</span>
                          {pricingItem.taxRate > 0 && (
                            <span className="ml-2">Tax: {pricingItem.taxRate}%</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-500">
                        <div>Region: {pricingItem.region}</div>
                        <div>Valid from: {new Date(pricingItem.validFrom).toLocaleDateString()}</div>
                        {pricingItem.validTo && (
                          <div>Valid to: {new Date(pricingItem.validTo).toLocaleDateString()}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(pricingItem)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(pricingItem.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PricingManager; 