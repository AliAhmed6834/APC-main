import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import Footer from "@/components/Footer";
import { Shield, Star, Award, Search, CheckCircle, Clock, Users } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { useLocation } from "wouter";

export default function Landing() {
  const { formatPrice, t, localeInfo } = useLocale();
  const [, setLocation] = useLocation();
  
  const trustBadges = [
    {
      icon: Shield,
      text: "Secure Booking"
    },
    {
      icon: Clock,
      text: "Free Cancellation"
    },
    {
      icon: Star,
      text: "4.8/5 Rating"
    },
    {
      icon: Users,
      text: "2M+ Happy Customers"
    }
  ];

  // Calculate savings amount based on locale
  const savingsAmount = localeInfo.currency === 'GBP' ? 50 : 70;
  const savingsFormatted = formatPrice(savingsAmount);

  const handleSearch = (data: any) => {
    console.log('🔍 Landing Page - Search Data:', data);
    console.log('🔍 Airport Code:', data.airportCode);
    console.log('🔍 Drop-off Date:', data.dropOffDate);
    console.log('🔍 Pick-up Date:', data.pickUpDate);
    
    // Validate data before proceeding
    if (!data.airportCode || !data.dropOffDate || !data.pickUpDate) {
      console.error('❌ Missing required search data:', data);
      return;
    }
    
    // Navigate to search results with the search data
    const searchParams = new URLSearchParams({
      airportCode: data.airportCode,
      startDate: data.dropOffDate,
      endDate: data.pickUpDate,
      ...(data.promoCode && { promoCode: data.promoCode })
    });
    
    const searchUrl = `/search?${searchParams.toString()}`;
    console.log('🔍 Search URL:', searchUrl);
    console.log('🔍 About to call setLocation with:', searchUrl);
    
    try {
      setLocation(searchUrl);
      console.log('🔍 setLocation called successfully');
    } catch (error) {
      console.error('❌ Error calling setLocation:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-blue-100 to-teal-100 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-100 via-teal-50 to-white opacity-75"></div>
        {/* Side Plane Watermark */}
        <div className="absolute inset-0 z-0 opacity-5">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <svg width="400" height="400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21 16V14L13 9V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9L2 14V16L10 13.5V19L8 20.5V22L11.5 21L15 22V20.5L13 19V13.5L21 16Z" fill="currentColor"/>
            </svg>
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up text-gray-900">
              Find & Book Airport Parking
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in-up text-gray-700">
              Compare prices from trusted parking suppliers. Save up to 70% on airport parking.
            </p>
            
            <SearchForm className="animate-fade-in-up" onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-4">Why Choose Airport Parking Compare?</h2>
            <p className="text-lg text-gray-600 mb-12">
              Join millions of travelers who trust us to find the best airport parking deals.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6">
              <div className="inline-block p-4 bg-teal-100 rounded-full mb-4">
                <Search className="w-8 h-8 text-teal-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Compare All Options</h3>
              <p className="text-gray-600">
                We compare prices from all major parking providers to find you the best deal.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-block p-4 bg-orange-100 rounded-full mb-4">
                <Shield className="w-8 h-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold mb-2">Secure Booking</h3>
              <p className="text-gray-600">
                Your payment is protected with bank-level security and free cancellation options.
              </p>
            </div>
            <div className="p-6">
              <div className="inline-block p-4 bg-blue-200 rounded-full mb-4">
                <Award className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2">Best Price Guarantee</h3>
              <p className="text-gray-600">
                Find a lower price elsewhere? We'll match it and give you an extra 10% off.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
