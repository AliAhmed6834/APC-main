import Header from "@/components/Header";
import SearchForm from "@/components/SearchForm";
import TrustSection from "@/components/TrustSection";
import Footer from "@/components/Footer";
import { Shield, Clock, Star, Users } from "lucide-react";
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
    // Navigate to search results with the search data
    const searchParams = new URLSearchParams({
      airportCode: data.airportCode,
      startDate: data.dropOffDate,
      endDate: data.pickUpDate,
      ...(data.promoCode && { promoCode: data.promoCode })
    });
    setLocation(`/search?${searchParams.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-airport-hero text-white py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-60" 
          style={{
            backgroundImage: "url('/airplane-bg.svg')"
          }}
        ></div>
        

        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in-up">
              Find & Book Airport {t('parking_lot')}
            </h2>
            <p className="text-xl md:text-2xl mb-12 opacity-90 animate-fade-in-up">
              Compare prices from trusted parking suppliers. Save up to {savingsFormatted} on airport {t('parking_lot')}.
            </p>
            
            <SearchForm className="animate-fade-in-up" onSearch={handleSearch} />
            
            <div className="flex flex-wrap justify-center items-center gap-8 mt-12 text-sm opacity-80">
              {trustBadges.map((badge, index) => (
                <div key={index} className="flex items-center">
                  <badge.icon className="w-4 h-4 mr-2" />
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <TrustSection />
      <Footer />
    </div>
  );
}
