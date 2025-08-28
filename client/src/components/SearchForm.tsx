import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormLabel } from "@/components/ui/form";
import { Search, Calendar, Tag, Shield, Star, Users, Clock, Filter, ChevronDown, ChevronUp } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import AirportAutocomplete from "./AirportAutocomplete";
import { useToast } from "@/hooks/use-toast";
import { AdvancedSearchFilters } from "./AdvancedSearchFilters";

interface SearchFormProps {
  className?: string;
  onSearch: (data: any) => void;
}

export default function SearchForm({ className = "", onSearch }: SearchFormProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState(0);
  const { t, localeInfo } = useLocale();
  const { toast } = useToast();

  // Get default dates (tomorrow and day after tomorrow)
  const getDefaultDropOffDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  const getDefaultPickUpDate = () => {
    const dayAfterTomorrow = new Date();
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    return dayAfterTomorrow.toISOString().split('T')[0];
  };

  const form = useForm({
    defaultValues: {
      airportCode: "",
      dropOffDate: getDefaultDropOffDate(),
      dropOffTime: "",
      pickUpDate: getDefaultPickUpDate(),
      pickUpTime: "",
      promoCode: "",
    },
    mode: "onChange", // Enable real-time validation
    reValidateMode: "onChange", // Re-validate on change
  });
  
  console.log('🔍 Form default values:', form.getValues());

  // Monitor form state changes
  useEffect(() => {
    const subscription = form.watch((value, { name, type }) => {
      console.log('🔍 Form field changed:', { name, type, value });
      console.log('🔍 Current form values:', form.getValues());
      console.log('🔍 Form errors:', form.formState.errors);
      console.log('🔍 Form isValid:', form.formState.isValid);
      
      // Trigger validation when form values change
      if (name) {
        form.trigger(name as any);
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Trigger initial validation
  useEffect(() => {
    console.log('🔍 Triggering initial form validation');
    form.trigger();
  }, [form]);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = form;

  const onSubmit = async (data: any) => {
    console.log('🔍 onSubmit called with data:', data);
    console.log('🔍 Form state at submission:', {
      isValid: form.formState.isValid,
      errors: form.formState.errors,
      values: form.getValues()
    });
    
    // Final validation check before proceeding
    const isFormValid = await form.trigger();
    console.log('🔍 Form validation result:', isFormValid);
    console.log('🔍 Form errors after trigger:', form.formState.errors);
    
    if (!isFormValid) {
      console.error('❌ Form validation failed, preventing submission');
      toast({
        title: "Validation Error",
        description: "Please fix the form errors before submitting",
        variant: "destructive",
      });
      return;
    }
    console.log('🔍 Search Form Data:', data);
    console.log('🔍 Airport Code:', data.airportCode);
    console.log('🔍 Airport Code Type:', typeof data.airportCode);
    console.log('🔍 Airport Code Length:', data.airportCode ? data.airportCode.length : 'undefined');
    console.log('🔍 Drop-off Date:', data.dropOffDate);
    console.log('🔍 Pick-up Date:', data.pickUpDate);
    console.log('🔍 All form data keys:', Object.keys(data));
    console.log('🔍 All form data values:', Object.values(data));
    
    // Enhanced validation with more specific checks
    const airportCode = data.airportCode?.trim();
    const dropOffDate = data.dropOffDate?.trim();
    const pickUpDate = data.pickUpDate?.trim();
    
    // Validate airport code
    if (!airportCode || airportCode.length < 3) {
      console.error('❌ Airport code is invalid:', airportCode);
      toast({
        title: "Error",
        description: "Please select a valid airport (3-letter code required)",
        variant: "destructive",
      });
      return;
    }
    
    // Validate drop-off date
    if (!dropOffDate || dropOffDate.length === 0) {
      console.error('❌ Drop-off date is empty!');
      toast({
        title: "Error",
        description: "Please select drop-off date",
        variant: "destructive",
      });
      return;
    }
    
    // Validate pick-up date
    if (!pickUpDate || pickUpDate.length === 0) {
      console.error('❌ Pick-up date is empty!');
      toast({
        title: "Error",
        description: "Please select pick-up date",
        variant: "destructive",
      });
      return;
    }
    
    // Validate date logic
    const dropOff = new Date(dropOffDate);
    const pickUp = new Date(pickUpDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dropOff < today) {
      console.error('❌ Drop-off date is in the past!');
      toast({
        title: "Error",
        description: "Drop-off date cannot be in the past",
        variant: "destructive",
      });
      return;
    }
    
    if (pickUp <= dropOff) {
      console.error('❌ Pick-up date must be after drop-off date!');
      toast({
        title: "Error",
        description: "Pick-up date must be after drop-off date",
        variant: "destructive",
      });
      return;
    }
    
    console.log('✅ All validations passed, proceeding with search');
    console.log('✅ Validated data:', { airportCode, dropOffDate, pickUpDate });
    
    setIsSearching(true);
    try {
      // Create clean data object with validated values
      const searchData = {
        airportCode,
        dropOffDate,
        pickUpDate,
        dropOffTime: data.dropOffTime || '',
        pickUpTime: data.pickUpTime || '',
        promoCode: data.promoCode || '',
      };
      
      console.log('🔍 Calling onSearch with validated data:', searchData);
      await onSearch(searchData);
      console.log('🔍 onSearch completed successfully');
    } catch (error) {
      console.error('❌ Error in onSearch:', error);
      toast({
        title: "Error",
        description: "Failed to search. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedFiltersChange = (filters: any) => {
    // Count active filters
    const activeCount = Object.values(filters).filter(value => 
      value !== undefined && value !== null && value !== '' && 
      (Array.isArray(value) ? value.length > 0 : true)
    ).length;
    setActiveFilters(activeCount);
  };

  // Get date input type - always use HTML5 date input for better UX
  const getDateInputType = () => {
    return 'date';
  };

  // Get date placeholder based on locale
  const getDatePlaceholder = () => {
    return 'Select date';
  };

  return (
    <Form {...form}>
      <form 
        onSubmit={(e) => {
          console.log('🔍 Form submit event triggered');
          console.log('🔍 Form isValid:', isValid);
          console.log('🔍 Form isSearching:', isSearching);
          console.log('🔍 Form values:', form.getValues());
          console.log('🔍 Form errors:', form.formState.errors);
          
          // Force validation check
          const currentValues = form.getValues();
          const hasAirportCode = currentValues.airportCode && currentValues.airportCode.trim().length >= 3;
          const hasDropOffDate = currentValues.dropOffDate && currentValues.dropOffDate.trim().length > 0;
          const hasPickUpDate = currentValues.pickUpDate && currentValues.pickUpDate.trim().length > 0;
          
          console.log('🔍 Manual validation check:', {
            hasAirportCode,
            hasDropOffDate,
            hasPickUpDate,
            airportCode: currentValues.airportCode,
            dropOffDate: currentValues.dropOffDate,
            pickUpDate: currentValues.pickUpDate
          });
          
          if (!hasAirportCode || !hasDropOffDate || !hasPickUpDate || !isValid || isSearching) {
            console.log('❌ Preventing form submission - validation failed');
            e.preventDefault();
            e.stopPropagation();
            return false;
          }
          
          console.log('✅ Form submission allowed, calling handleSubmit');
          return handleSubmit(onSubmit)(e);
        }} 
        className={`${className}`}
        noValidate // Prevent browser validation
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            console.log('🔍 Enter key pressed in form');
            console.log('🔍 Form isValid:', isValid);
            console.log('🔍 Form isSearching:', isSearching);
            
            if (!isValid || isSearching) {
              console.log('❌ Preventing Enter key submission - form is invalid or searching');
              e.preventDefault();
              e.stopPropagation();
              return false;
            }
          }
        }}
      >
        {/* Main Search Form - Horizontal Layout */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Airport Selection */}
            <div>
              <FormLabel className="block text-sm font-medium mb-2 text-gray-700">
                Airport or Location
              </FormLabel>
                      <Controller
          name="airportCode"
          control={control}
          rules={{ 
            required: "Airport is required",
            minLength: {
              value: 3,
              message: "Airport code must be at least 3 characters"
            },
            validate: (value) => {
              console.log('🔍 Form validation - airportCode:', value);
              console.log('🔍 Form validation - value type:', typeof value);
              console.log('🔍 Form validation - value length:', value ? value.length : 'undefined');
              if (!value || value.trim().length === 0) {
                return "Please select an airport";
              }
              if (value.trim().length < 3) {
                return "Airport code must be at least 3 characters";
              }
              return true;
            }
          }}
                render={({ field }) => {
                  console.log('🔍 SearchForm - Field value:', field.value);
                  return (
                    <AirportAutocomplete
                      value={field.value || ''}
                      onChange={(code) => {
                        console.log('🔍 SearchForm - onChange called with:', code);
                        console.log('🔍 SearchForm - Field before onChange:', field.value);
                        field.onChange(code);
                        console.log('🔍 SearchForm - Field after onChange:', field.value);
                        // Trigger validation
                        form.trigger('airportCode');
                      }}
                      onSelect={(airport) => {
                        console.log('🔍 SearchForm - onSelect called with:', airport);
                        console.log('🔍 SearchForm - Airport code:', airport.code);
                        field.onChange(airport.code);
                        console.log('🔍 SearchForm - Field after onSelect:', field.value);
                        // Trigger validation
                        form.trigger('airportCode');
                      }}
                      placeholder="Search airports (e.g., London, UK or Los Angeles, CA)"
                      className={errors.airportCode ? 'border-red-500 focus:ring-red-500' : ''}
                    />
                  );
                }}
              />
              {errors.airportCode && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.airportCode.message}
                </p>
              )}
            </div>

            {/* Drop-off Date */}
            <div>
              <FormLabel className="block text-sm font-medium mb-2 text-gray-700">
                Drop-off Date
              </FormLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Controller
                  name="dropOffDate"
                  control={control}
                  rules={{ 
                    required: "Drop-off date is required",
                    validate: (value) => {
                      if (!value || value.trim().length === 0) {
                        return "Please select drop-off date";
                      }
                      const date = new Date(value);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      if (date < today) {
                        return "Drop-off date cannot be in the past";
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      type={getDateInputType()}
                      placeholder={getDatePlaceholder()}
                      className={`pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white cursor-pointer ${
                        errors.dropOffDate 
                          ? 'border-red-500 focus:ring-red-500 hover:border-red-400' 
                          : 'border-gray-300 focus:ring-orange-500 hover:border-orange-400'
                      }`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger('dropOffDate');
                      }}
                    />
                  )}
                />
              </div>
              {errors.dropOffDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.dropOffDate.message}
                </p>
              )}
            </div>

            {/* Pick-up Date */}
            <div>
              <FormLabel className="block text-sm font-medium mb-2 text-gray-700">
                Pick-up Date
              </FormLabel>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Controller
                  name="pickUpDate"
                  control={control}
                  rules={{ 
                    required: "Pick-up date is required",
                    validate: (value) => {
                      if (!value || value.trim().length === 0) {
                        return "Please select pick-up date";
                      }
                      const pickUpDate = new Date(value);
                      const dropOffDate = new Date(form.getValues('dropOffDate'));
                      if (pickUpDate <= dropOffDate) {
                        return "Pick-up date must be after drop-off date";
                      }
                      return true;
                    }
                  }}
                  render={({ field }) => (
                    <Input
                      type={getDateInputType()}
                      placeholder={getDatePlaceholder()}
                      className={`pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:border-transparent text-gray-900 bg-white cursor-pointer ${
                        errors.pickUpDate 
                          ? 'border-red-500 focus:ring-red-500 hover:border-red-400' 
                          : 'border-gray-300 focus:ring-orange-500 hover:border-orange-400'
                      }`}
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        form.trigger('pickUpDate');
                      }}
                    />
                  )}
                />
              </div>
              {errors.pickUpDate && (
                <p className="text-red-500 text-sm mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {errors.pickUpDate.message}
                </p>
              )}
            </div>
          </div>

          {/* Search Button */}
          <Button
            type="submit"
            className={`w-full py-4 rounded-lg font-semibold text-lg transition-colors ${
              isSearching || !isValid 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-brand-secondary hover:bg-brand-secondary/90 text-white'
            }`}
            disabled={isSearching || !isValid}
            onClick={(e) => {
              console.log('🔍 Button clicked');
              console.log('🔍 Button isValid:', isValid);
              console.log('🔍 Button isSearching:', isSearching);
              console.log('🔍 Form values at button click:', form.getValues());
              
              if (isSearching || !isValid) {
                e.preventDefault();
                e.stopPropagation();
                console.log('❌ Form submission prevented - form is invalid or searching');
                return false;
              }
              
              console.log('✅ Button click allowed');
            }}
          >
            {isSearching ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Searching...
              </>
            ) : !isValid ? (
              <>
                <Search className="mr-2 h-4 w-4" />
                Please fill all required fields
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Search Parking
              </>
            )}
          </Button>
        </div>

        {/* Advanced Search Filters */}
        <div className="mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="w-full flex items-center justify-center gap-2 py-3 border-gray-300 hover:border-gray-400 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4" />
            Advanced Filters
            {activeFilters > 0 && (
              <span className="ml-2 px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                {activeFilters} active
              </span>
            )}
            {showAdvancedFilters ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
          
          {showAdvancedFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
              <AdvancedSearchFilters 
                onFiltersChange={handleAdvancedFiltersChange}
                className="space-y-4"
              />
            </div>
          )}
        </div>

        {/* Trust Indicators */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-gray-600 mt-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-gray-500" />
            <span>Secure Booking</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>Free Cancellation</span>
          </div>
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 text-gray-500" />
            <span>4.8/5 Rating</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span>2M+ Happy Customers</span>
          </div>
        </div>
      </form>
    </Form>
  );
}
