import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Search, Car, CheckCircle, MapPin, DollarSign, Shield, Star, Clock, Plane } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Search & Compare",
      description: "Enter your departure airport and travel dates. Our platform instantly searches hundreds of parking lots from multiple suppliers, showing you real-time availability and pricing.",
      details: [
        "Search by airport code or city name",
        "Compare prices from multiple suppliers",
        "Filter by amenities, distance, and ratings",
        "View detailed lot information and photos"
      ]
    },
    {
      icon: Car,
      title: "Choose Your Perfect Spot",
      description: "Browse parking options with detailed information including distance from terminal, shuttle frequency, security features, and authentic customer reviews.",
      details: [
        "See exact walking/shuttle distance to terminal",
        "Check security features and indoor/outdoor options",
        "Read verified customer reviews and ratings",
        "Compare covered vs uncovered parking"
      ]
    },
    {
      icon: CheckCircle,
      title: "Book Instantly",
      description: "Complete your secure booking with instant confirmation. Receive all parking details, directions, and contact information via email and SMS.",
      details: [
        "Secure payment processing",
        "Instant email and SMS confirmation",
        "Detailed directions and parking instructions",
        "24/7 customer support contact information"
      ]
    }
  ];

  const features = [
    {
      icon: DollarSign,
      title: "Best Price Guarantee",
      description: "We compare prices from all major parking suppliers to ensure you get the lowest rate available."
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "All parking facilities are vetted for security and reliability. Your booking is protected by our guarantee."
    },
    {
      icon: Star,
      title: "Verified Reviews",
      description: "Read authentic reviews from real customers who have used each parking facility."
    },
    {
      icon: Clock,
      title: "24/7 Support",
      description: "Our customer support team is available around the clock to help with any questions or issues."
    },
    {
      icon: MapPin,
      title: "Global Coverage",
      description: "Find parking at major airports across the US, UK, and internationally with local currency support."
    },
    {
      icon: Plane,
      title: "Travel Day Support",
      description: "Get help on your travel day with emergency contact numbers and real-time assistance."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8 text-center">How It Works</h1>
          <p className="text-lg text-neutral-dark mb-12 text-center">
            Booking airport parking has never been easier. Follow these simple steps to secure your spot.
          </p>
          
          <div className="space-y-12 mb-16">
            {steps.map((step, index) => (
              <Card key={index} className="overflow-hidden">
                <CardContent className="p-8">
                  <div className="flex flex-col lg:flex-row items-start gap-6">
                    <div className="flex-shrink-0">
                      <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center">
                        <step.icon className="w-8 h-8 text-secondary" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-neutral-dark mb-3">
                        Step {index + 1}: {step.title}
                      </h3>
                      <p className="text-lg text-neutral-dark mb-4">
                        {step.description}
                      </p>
                      <ul className="grid md:grid-cols-2 gap-2">
                        {step.details.map((detail, idx) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                            <span className="text-neutral-dark text-sm">{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          
          {/* Why Choose Us Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-neutral-dark mb-8 text-center">Why Choose Airport Parking Compare?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Card key={index} className="h-full">
                  <CardHeader>
                    <div className="bg-secondary/10 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-neutral-dark">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* What Happens After Booking */}
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-neutral-dark mb-6">What Happens After Booking?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-neutral-dark mb-3">Immediate Confirmation</h3>
                <ul className="space-y-2 text-neutral-dark">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Instant email confirmation with booking details
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    SMS confirmation with parking lot address
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Detailed directions and access instructions
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-neutral-dark mb-3">Travel Day</h3>
                <ul className="space-y-2 text-neutral-dark">
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Drive directly to your reserved parking space
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Use included shuttle service to reach terminal
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                    Return to collect your vehicle after your trip
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}