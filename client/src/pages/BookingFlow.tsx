import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Car, 
  CreditCard,
  Shield,
  CheckCircle 
} from "lucide-react";
import type { ParkingLot, InsertBooking } from "@shared/schema";

const bookingSchema = z.object({
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingFlow() {
  const [location] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();

  // Parse booking parameters from URL
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const lotId = searchParams.get('lotId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast]);

  const { data: parkingLot, isLoading: lotLoading } = useQuery<ParkingLot>({
    queryKey: ['/api/parking', lotId],
    enabled: !!lotId,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      vehicleMake: "",
      vehicleModel: "",
      vehicleColor: "",
      licensePlate: "",
      specialRequests: "",
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: Omit<InsertBooking, 'userId'>) => {
      const response = await apiRequest('POST', '/api/bookings', bookingData);
      return response.json();
    },
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setCurrentStep(3); // Success step
      toast({
        title: "Booking Confirmed!",
        description: `Your booking ${booking.bookingReference} has been confirmed.`,
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Booking Failed",
        description: "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  const calculateBookingDetails = () => {
    if (!startDate || !endDate) return null;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const pricePerDay = 18.99; // This would come from pricing API
    const totalAmount = totalDays * pricePerDay;

    return {
      totalDays,
      pricePerDay,
      totalAmount,
      startDate: start,
      endDate: end,
    };
  };

  const bookingDetails = calculateBookingDetails();

  const handleBookingSubmit = async (formData: BookingFormData) => {
    if (!bookingDetails || !parkingLot) return;

    const bookingData: Omit<InsertBooking, 'userId'> = {
      lotId: parkingLot.id,
      startDate: bookingDetails.startDate,
      endDate: bookingDetails.endDate,
      totalDays: bookingDetails.totalDays,
      pricePerDay: bookingDetails.pricePerDay.toString(),
      totalAmount: bookingDetails.totalAmount.toString(),
      vehicleInfo: {
        make: formData.vehicleMake,
        model: formData.vehicleModel,
        color: formData.vehicleColor,
        licensePlate: formData.licensePlate,
      },
      specialRequests: formData.specialRequests,
      status: 'confirmed',
      isCancellable: true,
    };

    createBookingMutation.mutate(bookingData);
  };

  if (authLoading || lotLoading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!parkingLot || !bookingDetails) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-neutral-dark mb-2">Invalid Booking</h3>
              <p className="text-neutral-dark mb-4">
                The booking information is incomplete. Please start over.
              </p>
              <Button onClick={() => window.location.href = '/search'}>
                Back to Search
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-4">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {currentStep > step ? <CheckCircle className="w-4 h-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-16 h-1 mx-2 ${
                      currentStep > step ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-2">
              <div className="text-sm text-neutral-dark">
                {currentStep === 1 && "Review Details"}
                {currentStep === 2 && "Vehicle Information"}
                {currentStep === 3 && "Booking Confirmed"}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Booking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-4">{parkingLot.name}</h3>
                      <div className="space-y-2 text-sm text-neutral-dark">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-2" />
                          <span>{parkingLot.distanceToTerminal} miles to terminal</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {bookingDetails.startDate.toLocaleDateString()} - {bookingDetails.endDate.toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          <span>{bookingDetails.totalDays} days</span>
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-2">Included Services</h4>
                      <ul className="text-sm text-neutral-dark space-y-1">
                        {parkingLot.isShuttleIncluded && (
                          <li>• Shuttle service every {parkingLot.shuttleFrequencyMinutes} minutes</li>
                        )}
                        {parkingLot.hasSecurityPatrol && <li>• 24/7 security patrol</li>}
                        {parkingLot.hasCctv && <li>• CCTV surveillance</li>}
                        {parkingLot.hasEvCharging && <li>• EV charging stations</li>}
                        <li>• Free cancellation up to 24 hours before</li>
                      </ul>
                    </div>

                    <Button 
                      onClick={() => setCurrentStep(2)}
                      className="w-full bg-primary text-white"
                    >
                      Continue to Vehicle Details
                    </Button>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleBookingSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vehicleMake"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Make</FormLabel>
                                <FormControl>
                                  <Input placeholder="Toyota" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="vehicleModel"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Model</FormLabel>
                                <FormControl>
                                  <Input placeholder="Camry" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="vehicleColor"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Vehicle Color</FormLabel>
                                <FormControl>
                                  <Input placeholder="Silver" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="licensePlate"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>License Plate</FormLabel>
                                <FormControl>
                                  <Input placeholder="ABC123" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <FormField
                          control={form.control}
                          name="specialRequests"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Special Requests (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any special requests or instructions..."
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <div className="flex space-x-4">
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setCurrentStep(1)}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button 
                            type="submit"
                            className="flex-1 bg-accent text-white"
                            disabled={createBookingMutation.isPending}
                          >
                            {createBookingMutation.isPending ? (
                              <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Processing...
                              </>
                            ) : (
                              'Confirm Booking'
                            )}
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-neutral-dark mb-2">Booking Confirmed!</h3>
                    <p className="text-neutral-dark mb-6">
                      Your parking reservation has been confirmed. You'll receive a confirmation email shortly.
                    </p>
                    <div className="flex space-x-4 justify-center">
                      <Button variant="outline" onClick={() => window.location.href = '/bookings'}>
                        View My Bookings
                      </Button>
                      <Button onClick={() => window.location.href = '/search'}>
                        Book Another Parking
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Booking Summary Sidebar */}
            <div className="lg:col-span-1">
              <Card className="sticky top-4">
                <CardHeader>
                  <CardTitle>Booking Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium">{parkingLot.name}</h4>
                    <p className="text-sm text-neutral-dark">{parkingLot.distanceToTerminal} miles to terminal</p>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Check-in:</span>
                      <span>{bookingDetails.startDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Check-out:</span>
                      <span>{bookingDetails.endDate.toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Duration:</span>
                      <span>{bookingDetails.totalDays} days</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>${bookingDetails.pricePerDay}/day × {bookingDetails.totalDays} days:</span>
                      <span>${bookingDetails.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span className="text-primary">${bookingDetails.totalAmount.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-green-600">
                    <Shield className="w-4 h-4" />
                    <span>Free cancellation</span>
                  </div>

                  <div className="flex items-center space-x-2 text-sm text-blue-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Secure payment</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
