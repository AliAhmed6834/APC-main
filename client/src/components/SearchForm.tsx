import React, { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormLabel } from "@/components/ui/form";
import { Search, Calendar, Clock, Tag } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";

interface SearchFormProps {
  className?: string;
  onSearch: (data: any) => void;
}

export default function SearchForm({ className = "", onSearch }: SearchFormProps) {
  const [isSearching, setIsSearching] = useState(false);
  const { t, localeInfo } = useLocale();

  const form = useForm({
    defaultValues: {
      airportCode: "",
      dropOffDate: "",
      dropOffTime: "",
      pickUpDate: "",
      pickUpTime: "",
      promoCode: "",
    },
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = form;

  const onSubmit = async (data: any) => {
    setIsSearching(true);
    try {
      await onSearch(data);
    } finally {
      setIsSearching(false);
    }
  };

  // Get date input type based on locale
  const getDateInputType = () => {
    return localeInfo.dateFormat === 'DD/MM/YYYY' ? 'text' : 'date';
  };

  // Get date placeholder based on locale
  const getDatePlaceholder = () => {
    return localeInfo.dateFormat === 'DD/MM/YYYY' ? 'DD/MM/YYYY' : 'MM/DD/YYYY';
  };

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Airport Selection */}
        <div className="md:col-span-2">
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Airport' : 'Airport'}
          </FormLabel>
          <Controller
            name="airportCode"
            control={control}
            rules={{ required: "Airport is required" }}
            render={({ field }) => (
              <Input
                placeholder="Enter airport code (e.g., LHR, LAX)"
                className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                {...field}
              />
            )}
          />
          {errors.airportCode && (
            <p className="text-red-500 text-sm mt-1">{errors.airportCode.message}</p>
          )}
        </div>

        {/* Drop-off Date & Time */}
        <div>
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Drop-off' : 'Drop-off'}
          </FormLabel>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Controller
              name="dropOffDate"
              control={control}
              rules={{ required: "Drop-off date is required" }}
              render={({ field }) => (
                <Input
                  type={getDateInputType()}
                  placeholder={getDatePlaceholder()}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                  {...field}
                />
              )}
            />
          </div>
          {errors.dropOffDate && (
            <p className="text-red-500 text-sm mt-1">{errors.dropOffDate.message}</p>
          )}
        </div>

        <div>
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Drop-off Time' : 'Drop-off Time'}
          </FormLabel>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Controller
              name="dropOffTime"
              control={control}
              rules={{ required: "Drop-off time is required" }}
              render={({ field }) => (
                <Input
                  type="time"
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                  {...field}
                />
              )}
            />
          </div>
          {errors.dropOffTime && (
            <p className="text-red-500 text-sm mt-1">{errors.dropOffTime.message}</p>
          )}
        </div>

        {/* Pick-up Date & Time */}
        <div>
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Collection' : 'Pick-up'}
          </FormLabel>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Controller
              name="pickUpDate"
              control={control}
              rules={{ required: "Pick-up date is required" }}
              render={({ field }) => (
                <Input
                  type={getDateInputType()}
                  placeholder={getDatePlaceholder()}
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                  {...field}
                />
              )}
            />
          </div>
          {errors.pickUpDate && (
            <p className="text-red-500 text-sm mt-1">{errors.pickUpDate.message}</p>
          )}
        </div>

        <div>
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Collection Time' : 'Pick-up Time'}
          </FormLabel>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Controller
              name="pickUpTime"
              control={control}
              rules={{ required: "Pick-up time is required" }}
              render={({ field }) => (
                <Input
                  type="time"
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                  {...field}
                />
              )}
            />
          </div>
          {errors.pickUpTime && (
            <p className="text-red-500 text-sm mt-1">{errors.pickUpTime.message}</p>
          )}
        </div>

        {/* Promo Code */}
        <div className="md:col-span-2">
          <FormLabel className="block text-sm font-medium mb-2 text-left text-gray-700">
            {localeInfo.region === 'GB' ? 'Promo Code' : 'Promo Code'} (Optional)
          </FormLabel>
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Controller
              name="promoCode"
              control={control}
              render={({ field }) => (
                <Input
                  placeholder="Enter promo code for discount"
                  className="pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-transparent text-gray-900 bg-white"
                  {...field}
                />
              )}
            />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        className="w-full bg-accent text-white py-4 rounded-lg font-semibold text-lg hover:bg-opacity-90 transition-colors"
        disabled={isSearching}
      >
        {isSearching ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
            Searching...
          </>
        ) : (
          <>
            <Search className="mr-2 h-4 w-4" />
            {localeInfo.region === 'GB' ? `Search ${t('parking_lot')}s` : 'Search Parking'}
          </>
        )}
      </Button>
      </form>
    </Form>
  );
}
