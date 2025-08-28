import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
  CheckCircle,
  Receipt,
  Loader2
} from "lucide-react";
import type { ParkingLot, InsertBooking } from "@shared/schema";

interface BookingFlowParams {
  lotId: string;
}

const bookingSchema = z.object({
  vehicleMake: z.string().min(1, "Vehicle make is required"),
  vehicleModel: z.string().min(1, "Vehicle model is required"),
  vehicleColor: z.string().min(1, "Vehicle color is required"),
  licensePlate: z.string().min(1, "License plate is required"),
  specialRequests: z.string().optional(),
});

type BookingFormData = z.infer<typeof bookingSchema>;

export default function BookingFlow() {
  const [location, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const { toast } = useToast();
  
  // Debug: Log everything about the location
  console.log('🔍 BookingFlow - Component rendered');
  console.log('🔍 BookingFlow - Location from Wouter:', location);
  console.log('🔍 BookingFlow - Location type:', typeof location);
  console.log('🔍 BookingFlow - Location length:', location ? location.length : 'undefined');
  console.log('🔍 BookingFlow - Window location href:', window.location.href);
  console.log('🔍 BookingFlow - Window location search:', window.location.search);
  console.log('🔍 BookingFlow - Window location pathname:', window.location.pathname);
  console.log('🔍 BookingFlow - Current URL:', window.location.toString());
  console.log('🔍 BookingFlow - Document URL:', document.URL);
  
  // Parse URL parameters
  const searchParams = new URLSearchParams(window.location.search);
  const lotId = searchParams.get('lotId') || '';
  const startDate = searchParams.get('startDate') || '';
  const endDate = searchParams.get('endDate') || '';
  const pricePerDayParam = searchParams.get('pricePerDay'); // Add price parameter
  const taxRateParam = searchParams.get('taxRate'); // Add tax parameter

  console.log('🔍 BookingFlow - Direct URLSearchParams parsing:', { lotId, startDate, endDate });
  console.log('🔍 BookingFlow - Pricing parameters:', { pricePerDayParam, taxRateParam });
  console.log('🔍 BookingFlow - Search string length:', window.location.search.length);
  console.log('🔍 BookingFlow - Search string content:', window.location.search);
  
  // Debug: Log URL changes
  useEffect(() => {
    console.log('🔍 BookingFlow - useEffect triggered - URL changed');
    console.log('🔍 BookingFlow - New URL:', window.location.href);
    console.log('🔍 BookingFlow - New search params:', window.location.search);
    
    // Re-parse parameters when URL changes
    const newSearchParams = new URLSearchParams(window.location.search);
    const newLotId = newSearchParams.get('lotId') || '';
    const newStartDate = newSearchParams.get('startDate') || '';
    const newEndDate = newSearchParams.get('endDate') || '';
    
    console.log('🔍 BookingFlow - New parsed parameters:', { newLotId, newStartDate, newEndDate });
  }, [window.location.search]);
  
  // Fallback: try to clean up malformed URLs and extract parameters
  let cleanLotId = lotId;
  let cleanStartDate = startDate;
  let cleanEndDate = endDate;

  // If parameters are missing, try to extract from the full location string
  if (!lotId || !startDate || !endDate) {
    console.log('🔍 BookingFlow - Parameters missing, trying fallback extraction');
    
    // Try to extract from the full location string using regex
    const lotIdMatch = window.location.href.match(/lotId=([^&]*)/);
    const startDateMatch = window.location.href.match(/startDate=([^&]*)/);
    const endDateMatch = window.location.href.match(/endDate=([^&]*)/);
    
    cleanLotId = lotId || (lotIdMatch ? lotIdMatch[1] : '');
    cleanStartDate = startDate || (startDateMatch ? startDateMatch[1] : '');
    cleanEndDate = endDate || (endDateMatch ? endDateMatch[1] : '');
    
    console.log('🔍 BookingFlow - Fallback extraction:', { 
      lotIdMatch: lotIdMatch ? lotIdMatch[1] : 'none',
      startDateMatch: startDateMatch ? startDateMatch[1] : 'none', 
      endDateMatch: endDateMatch ? endDateMatch[1] : 'none'
    });
  }

  console.log('🔍 BookingFlow - Raw Location:', location);
  console.log('🔍 BookingFlow - Location Type:', typeof location);
  console.log('🔍 BookingFlow - Location Split Result:', location.split('?'));
  console.log('🔍 BookingFlow - Search String:', location.split('?')[1] || '');
  console.log('🔍 BookingFlow - URL Parameters:', { lotId, startDate, endDate });
  console.log('🔍 BookingFlow - Clean Parameters:', { cleanLotId, cleanStartDate, cleanEndDate });
  console.log('🔍 BookingFlow - Search Params Object:', searchParams);
  console.log('🔍 BookingFlow - Window Location:', window.location.href);
  console.log('🔍 BookingFlow - Window Search:', window.location.search);

  // Check authentication using localStorage
  useEffect(() => {
    const userToken = localStorage.getItem('userToken');
    const userData = localStorage.getItem('userData');

    if (userToken && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing user data:', error);
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
    setAuthLoading(false);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to make a booking.",
        variant: "destructive",
      });
      setTimeout(() => {
        setLocation('/login');
      }, 1000);
      return;
    }
  }, [isAuthenticated, authLoading, toast, setLocation]);

      const { data: parkingLot, isLoading: lotLoading, error: lotError } = useQuery<ParkingLot>({
      queryKey: ['/api/parking', cleanLotId],
      queryFn: async () => {
        console.log('🔍 BookingFlow - Fetching parking lot with ID:', cleanLotId);
        const response = await fetch(`/api/parking/${cleanLotId}`);
        console.log('🔍 BookingFlow - API response status:', response.status);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('🔍 BookingFlow - API error response:', errorText);
          throw new Error(`Failed to fetch parking lot: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('🔍 BookingFlow - Parking lot data received:', data);
        return data;
      },
      enabled: !!cleanLotId,
      retry: 1,
    });

    // Log any errors from the parking lot query
    useEffect(() => {
      if (lotError) {
        console.error('🔍 BookingFlow - Parking lot fetch error:', lotError);
      }
    }, [lotError]);

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
      const response = await fetch('/api/customer/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...bookingData,
          userId: user.id, // Add user ID from localStorage
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: (booking) => {
      setCurrentStep(5); // Success step
      toast({
        title: "Booking Confirmed!",
        description: `Your booking has been confirmed successfully.`,
      });
    },
    onError: (error) => {
      console.error('Booking error:', error);
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error creating your booking. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Handle vehicle information submission
  const handleVehicleSubmit = (formData: BookingFormData) => {
    console.log('🔍 BookingFlow - Vehicle information submitted:', formData);
    
    // Store vehicle information for later use
    setVehicleInfo(formData);
    
    // Move to payment step
    setCurrentStep(4);
  };

  // Handle payment submission
  const handlePaymentSubmit = () => {
    console.log('🔍 BookingFlow - Payment form submitted');
    
    // Validate payment form
    if (!validatePaymentForm()) {
      toast({
        title: "Payment Information Required",
        description: "Please fill in all payment fields correctly before proceeding.",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create the booking with complete parking lot information
      const bookingData = {
        lotId: cleanLotId,
        startDate: new Date(cleanStartDate),
        endDate: new Date(cleanEndDate),
        totalDays: bookingDetails?.totalDays || 0,
        pricePerDay: (bookingDetails?.pricePerDay || 0).toString(),
        totalAmount: (bookingDetails?.totalAmount || 0).toString(),
        vehicleInfo: vehicleInfo,
        specialRequests: vehicleInfo?.specialRequests || '',
        // Include complete parking lot details for customer dashboard
        parkingLotDetails: {
          id: parkingLot?.id || '',
          name: parkingLot?.name || '',
          address: parkingLot?.address || '',
          airportId: parkingLot?.airportId || '',
          airportName: parkingLot?.airportId || 'Unknown Airport', // We'll need to map this
          distanceToTerminal: parkingLot?.distanceToTerminal || '',
          description: parkingLot?.description || '',
          rating: parkingLot?.rating || '',
          isCovered: parkingLot?.isCovered || false,
          hasEvCharging: parkingLot?.hasEvCharging || false,
          hasSecurityPatrol: parkingLot?.hasSecurityPatrol || false,
          hasCctv: parkingLot?.hasCctv || false,
          isShuttleIncluded: parkingLot?.isShuttleIncluded || false,
          shuttleFrequencyMinutes: parkingLot?.shuttleFrequencyMinutes || 0
        }
      };

      console.log('🔍 BookingFlow - Creating booking with complete data:', bookingData);
      createBookingMutation.mutate(bookingData);
    } catch (error) {
      console.error('🔍 BookingFlow - Payment submission error:', error);
      toast({
        title: "Payment Error",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Store vehicle information
  const [vehicleInfo, setVehicleInfo] = useState<BookingFormData | null>(null);

  // Payment form state
  const [paymentData, setPaymentData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Card type detection
  const [cardType, setCardType] = useState<'visa' | 'mastercard' | 'amex' | 'discover' | null>(null);

  // Payment validation errors
  const [paymentErrors, setPaymentErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  // Detect card type based on card number
  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\s/g, '');
    
    if (/^4/.test(cleanNumber)) return 'visa';
    if (/^5[1-5]/.test(cleanNumber)) return 'mastercard';
    if (/^3[47]/.test(cleanNumber)) return 'amex';
    if (/^6/.test(cleanNumber)) return 'discover';
    
    return null;
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\s/g, '');
    const groups = cleanValue.match(/.{1,4}/g);
    return groups ? groups.join(' ') : cleanValue;
  };

  // Format expiry date
  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, '');
    if (cleanValue.length >= 2) {
      return cleanValue.slice(0, 2) + '/' + cleanValue.slice(2, 4);
    }
    return cleanValue;
  };

  // Validate expiry date
  const validateExpiryDate = (expiryDate: string) => {
    if (!expiryDate) return 'Expiry date is required';
    
    const [month, year] = expiryDate.split('/');
    if (!month || !year) return 'Invalid format (MM/YY)';
    
    const monthNum = parseInt(month);
    const yearNum = parseInt('20' + year);
    
    if (monthNum < 1 || monthNum > 12) return 'Invalid month';
    
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;
    
    if (yearNum < currentYear || (yearNum === currentYear && monthNum < currentMonth)) {
      return 'Card has expired';
    }
    
    return '';
  };

  // Validate CVV
  const validateCVV = (cvv: string, cardType: string | null) => {
    if (!cvv) return 'CVV is required';
    
    const cvvLength = cardType === 'amex' ? 4 : 3;
    if (cvv.length !== cvvLength) return `CVV must be ${cvvLength} digits`;
    
    if (!/^\d+$/.test(cvv)) return 'CVV must contain only numbers';
    
    return '';
  };

  // Handle payment input changes
  const handlePaymentInputChange = (field: string, value: string) => {
    let formattedValue = value;
    
    if (field === 'cardNumber') {
      formattedValue = formatCardNumber(value);
      setCardType(detectCardType(value));
    } else if (field === 'expiryDate') {
      formattedValue = formatExpiryDate(value);
    }
    
    setPaymentData(prev => ({
      ...prev,
      [field]: formattedValue
    }));

    // Clear error when user starts typing
    setPaymentErrors(prev => ({
      ...prev,
      [field]: ''
    }));
  };

  // Validate all payment fields
  const validatePaymentForm = () => {
    const errors = {
      cardNumber: !paymentData.cardNumber ? 'Card number is required' : 
                  paymentData.cardNumber.replace(/\s/g, '').length < 13 ? 'Invalid card number' : '',
      expiryDate: validateExpiryDate(paymentData.expiryDate),
      cvv: validateCVV(paymentData.cvv, cardType),
      cardholderName: !paymentData.cardholderName ? 'Cardholder name is required' : ''
    };

    setPaymentErrors(errors);
    return !Object.values(errors).some(error => error);
  };

  const calculateBookingDetails = () => {
    if (!cleanStartDate || !cleanEndDate) return null;

    const start = new Date(cleanStartDate);
    const end = new Date(cleanEndDate);
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    
    const pricePerDay = pricePerDayParam ? parseFloat(pricePerDayParam) : 18.99;
    const taxRate = taxRateParam ? parseFloat(taxRateParam) : 0.0875; // Default 8.75% tax
    
    const subtotal = totalDays * pricePerDay;
    const taxAmount = subtotal * taxRate;
    const totalAmount = subtotal + taxAmount;

    console.log('🔍 BookingFlow - Pricing calculation:', {
      pricePerDayParam,
      pricePerDay,
      taxRateParam,
      taxRate,
      totalDays,
      subtotal,
      taxAmount,
      totalAmount
    });

    return {
      totalDays,
      pricePerDay,
      subtotal,
      taxRate: taxRate * 100, // Convert to percentage for display
      taxAmount,
      totalAmount,
      startDate: start,
      endDate: end
    };
  };

  const bookingDetails = calculateBookingDetails();

  // Auto-advance to step 2 when parking lot data is loaded
  useEffect(() => {
    if (parkingLot && bookingDetails && currentStep === 1) {
      console.log('🔍 BookingFlow - Auto-advancing to step 2');
      setCurrentStep(2);
    }
  }, [parkingLot, bookingDetails, currentStep]);

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
          console.error('🔍 BookingFlow - Missing data:', { 
        parkingLot: !!parkingLot, 
        bookingDetails: !!bookingDetails,
        lotId: cleanLotId,
        startDate: cleanStartDate,
        endDate: cleanEndDate
      });
    
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="container mx-auto px-4 py-12">
          <Card>
            <CardContent className="py-12 text-center">
              <h3 className="text-lg font-medium text-neutral-dark mb-2">Invalid Booking</h3>
              <p className="text-neutral-dark mb-4">
                The booking information is incomplete. Please check the following:
              </p>
                              <div className="text-left text-sm text-gray-600 mb-4 space-y-2">
                  <p>• Lot ID: {cleanLotId || 'Missing'}</p>
                  <p>• Start Date: {cleanStartDate || 'Missing'}</p>
                  <p>• End Date: {cleanEndDate || 'Missing'}</p>
                  <p>• Parking Lot Data: {parkingLot ? 'Loaded' : 'Not Loaded'}</p>
                  <p>• Booking Details: {bookingDetails ? 'Calculated' : 'Not Calculated'}</p>
                </div>
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
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div
                  key={step}
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-200 ${
                    currentStep >= step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {currentStep > step ? <CheckCircle className="w-5 h-5" /> : ''}
                </div>
              ))}
            </div>
          </div>
          
          <div className="text-center mb-8">
            <div className="flex justify-center space-x-8 text-sm text-gray-600">
              <span className={currentStep >= 1 ? 'text-primary font-medium' : ''}>Parking Details</span>
              <span className={currentStep >= 2 ? 'text-primary font-medium' : ''}>Review</span>
              <span className={currentStep >= 3 ? 'text-primary font-medium' : ''}>Vehicle Info</span>
              <span className={currentStep >= 4 ? 'text-primary font-medium' : ''}>Payment</span>
              <span className={currentStep >= 5 ? 'text-primary font-medium' : ''}>Confirmation</span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {currentStep === 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Parking Lot Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{parkingLot.name}</h3>
                        <p className="text-gray-600 mb-4">{parkingLot.description}</p>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{parkingLot.distanceToTerminal} miles to terminal</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{startDate} - {endDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{bookingDetails?.totalDays || 0} days</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Included Services</h4>
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
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(2)}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 2 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Review Your Booking</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{parkingLot.name}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{parkingLot.distanceToTerminal} miles to terminal</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>{startDate} - {endDate}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>{bookingDetails?.totalDays || 0} days</span>
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="font-medium mb-3">Included Services</h4>
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
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Booking Summary</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Check-in:</span>
                            <span>{startDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Check-out:</span>
                            <span>{endDate}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Duration:</span>
                            <span>{bookingDetails?.totalDays || 0} days</span>
                          </div>
                        </div>

                        <Separator className="my-3" />

                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>${bookingDetails.pricePerDay.toFixed(2)}/day × {bookingDetails.totalDays} days:</span>
                            <span>${bookingDetails.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Tax ({bookingDetails?.taxRate || 0}%):</span>
                            <span>${(bookingDetails?.taxAmount || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between font-semibold text-lg">
                            <span>Total:</span>
                            <span>${(bookingDetails?.totalAmount || 0).toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 text-sm text-green-600 mt-3">
                          <Shield className="w-4 h-4" />
                          <span>Free cancellation</span>
                        </div>
                      </div>
                    </div>

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
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1"
                      >
                        Next
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 3 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(handleVehicleSubmit)} className="space-y-6">
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
                            onClick={() => setCurrentStep(2)}
                            className="flex-1"
                          >
                            Back
                          </Button>
                          <Button 
                            type="submit"
                            variant="outline"
                            className="flex-1"
                          >
                            Next
                          </Button>
                        </div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              )}

              {currentStep === 4 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Payment Information
                    </CardTitle>
                    <CardDescription>
                      Secure payment powered by Stripe - Your information is encrypted and secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                      <h4 className="font-semibold mb-4 text-blue-900 flex items-center gap-2">
                        <Receipt className="w-5 h-5" />
                        Booking Summary
                      </h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Parking Lot:</span>
                          <span className="font-medium">{parkingLot?.name}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Duration:</span>
                          <span className="font-medium">{bookingDetails?.totalDays} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-blue-700">Total Amount:</span>
                          <span className="font-bold text-xl text-blue-900">
                            ${bookingDetails?.totalAmount?.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="cardNumber" className="text-sm font-medium">
                          Card Number
                        </Label>
                        <div className="relative">
                          <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                          <Input
                            id="cardNumber"
                            type="text"
                            maxLength={19}
                            placeholder="1234 5678 9012 3456"
                            className="pl-10 h-12 text-lg font-mono"
                            value={paymentData.cardNumber}
                            onChange={(e) => handlePaymentInputChange('cardNumber', e.target.value)}
                            onBlur={() => setPaymentErrors(prev => ({ ...prev, cardNumber: '' }))}
                          />
                          {cardType && (
                            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                              {cardType === 'visa' && (
                                <div className="w-8 h-5 bg-blue-600 rounded text-white text-xs flex items-center justify-center font-bold">VISA</div>
                              )}
                              {cardType === 'mastercard' && (
                                <div className="w-8 h-5 bg-red-600 rounded text-white text-xs flex items-center justify-center font-bold">MC</div>
                              )}
                              {cardType === 'amex' && (
                                <div className="w-8 h-5 bg-blue-500 rounded text-white text-xs flex items-center justify-center font-bold">AMEX</div>
                              )}
                              {cardType === 'discover' && (
                                <div className="w-8 h-5 bg-orange-500 rounded text-white text-xs flex items-center justify-center font-bold">DISC</div>
                              )}
                            </div>
                          )}
                        </div>
                        {paymentErrors.cardNumber && (
                          <p className="text-red-500 text-xs mt-1">{paymentErrors.cardNumber}</p>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="expiry" className="text-sm font-medium">
                            Expiry Date
                          </Label>
                          <Input 
                            id="expiry" 
                            placeholder="MM/YY"
                            className="mt-1 h-12 text-center font-mono"
                            value={paymentData.expiryDate}
                            onChange={(e) => handlePaymentInputChange('expiryDate', e.target.value)}
                            onBlur={() => setPaymentErrors(prev => ({ ...prev, expiryDate: '' }))}
                          />
                          {paymentErrors.expiryDate && (
                            <p className="text-red-500 text-xs mt-1">{paymentErrors.expiryDate}</p>
                          )}
                        </div>
                        <div>
                          <Label htmlFor="cvv" className="text-sm font-medium">
                            CVV
                          </Label>
                          <Input 
                            id="cvv" 
                            placeholder={cardType === 'amex' ? '1234' : '123'}
                            className="mt-1 h-12 text-center font-mono w-full"
                            value={paymentData.cvv}
                            onChange={(e) => handlePaymentInputChange('cvv', e.target.value)}
                            onBlur={() => setPaymentErrors(prev => ({ ...prev, cvv: '' }))}
                          />
                          {paymentErrors.cvv && (
                            <p className="text-red-500 text-xs mt-1">{paymentErrors.cvv}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="cardholderName" className="text-sm font-medium">
                          Cardholder Name
                        </Label>
                        <Input 
                          id="cardholderName" 
                          placeholder="John Doe"
                          className="mt-1 h-12"
                          value={paymentData.cardholderName}
                          onChange={(e) => handlePaymentInputChange('cardholderName', e.target.value)}
                          onBlur={() => setPaymentErrors(prev => ({ ...prev, cardholderName: '' }))}
                        />
                        {paymentErrors.cardholderName && (
                          <p className="text-red-500 text-xs mt-1">{paymentErrors.cardholderName}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <Shield className="w-5 h-5 text-green-600" />
                      <div className="text-sm text-green-800">
                        <span className="font-medium">Secure Payment:</span> Your payment is encrypted and processed securely by Stripe
                      </div>
                    </div>

                    <div className="flex space-x-4">
                      <Button 
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentStep(3)}
                        className="flex-1"
                      >
                        Back
                      </Button>
                      <Button 
                        onClick={handlePaymentSubmit}
                        variant="outline"
                        className="flex-1 h-12 text-lg font-semibold"
                        disabled={createBookingMutation.isPending}
                      >
                        {createBookingMutation.isPending ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          'Next'
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {currentStep === 5 && (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-2xl font-bold text-neutral-dark mb-2">Booking Confirmed!</h3>
                    <p className="text-neutral-dark mb-6">
                      Your parking reservation has been confirmed and payment processed successfully. You'll receive a confirmation email shortly.
                    </p>
                    <div className="flex space-x-4 justify-center">
                      <Button variant="outline" onClick={() => window.location.href = '/dashboard'}>
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
                      <span>${bookingDetails.pricePerDay.toFixed(2)}/day × {bookingDetails.totalDays} days:</span>
                      <span>${bookingDetails.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax ({bookingDetails.taxRate}%):</span>
                      <span>${bookingDetails.taxAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg">
                      <span>Total:</span>
                      <span>${bookingDetails.totalAmount.toFixed(2)}</span>
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
