import { Link } from "wouter";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, HelpCircle, Car, CreditCard, MapPin, Clock } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const categories = [
    {
      icon: Car,
      title: "Booking & Reservations",
      description: "Questions about making and managing bookings",
      href: "/help/booking-reservations"
    },
    {
      icon: CreditCard,
      title: "Payment & Pricing",
      description: "Information about payments, refunds, and pricing",
      href: "/help/payment-pricing"
    },
    {
      icon: MapPin,
      title: "Parking Locations",
      description: "Finding and accessing parking facilities",
      href: "/help/parking-locations"
    },
    {
      icon: Clock,
      title: "Travel Day Support",
      description: "Help for the day of your travel",
      href: "/help/travel-day-support"
    }
  ];

  const faqs = [
    {
      question: "How do I cancel or modify my booking?",
      answer: "You can cancel or modify your booking by logging into your account and navigating to 'My Bookings'. Each booking has different cancellation terms depending on the parking provider. Free cancellation is available up to 24 hours before your booking for most locations."
    },
    {
      question: "What happens if my flight is delayed?",
      answer: "Most parking bookings include grace periods for flight delays. If your return is delayed, contact our 24/7 support team as soon as possible. We'll work with the parking provider to extend your booking if needed. Additional charges may apply for extended stays."
    },
    {
      question: "Do I need to print my booking confirmation?",
      answer: "While we recommend having a printed copy as backup, most modern parking facilities can process bookings using your mobile device. Show your booking confirmation email or use our mobile app at the facility entrance."
    },
    {
      question: "What if the parking lot is full when I arrive?",
      answer: "This is extremely rare as we only partner with reliable providers. If this happens, contact our emergency support line immediately. We'll find you alternative parking and cover any additional costs."
    },
    {
      question: "How do shuttle services work?",
      answer: "Shuttle services vary by location. Some run on fixed schedules (every 10-15 minutes), while others operate on-demand. All shuttle information is provided in your booking confirmation, including pickup points and contact numbers."
    },
    {
      question: "Can I get a refund if I don't use my parking?",
      answer: "Refund policies depend on the specific booking terms and timing of cancellation. Most bookings allow free cancellation up to 24 hours before the start date. No-show bookings are typically non-refundable."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8 text-center">Help Center</h1>
          
          {/* Search */}
          <div className="relative mb-12">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input 
              placeholder="Search for help..." 
              className="pl-10 py-3 text-lg"
            />
          </div>
          
          {/* Help Categories */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {categories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <div className="bg-secondary/10 rounded-lg p-2">
                        <category.icon className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold">{category.title}</h3>
                        <p className="text-sm text-gray-600 font-normal">{category.description}</p>
                      </div>
                    </CardTitle>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
          
          {/* FAQ Section */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-dark mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2 text-secondary" />
              Frequently Asked Questions
            </h2>
            
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium text-neutral-dark">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-neutral-dark leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
          
          {/* Contact Support */}
          <Card className="mt-12 bg-secondary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-neutral-dark mb-2">
                Still need help?
              </h3>
              <p className="text-neutral-dark mb-4">
                Our support team is available 24/7 to assist you with any questions.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a 
                  href="/contact" 
                  className="bg-secondary text-white px-6 py-2 rounded-lg hover:bg-secondary/90 transition-colors"
                >
                  Contact Support
                </a>
                <a 
                  href="tel:+1-555-123-4567" 
                  className="border border-secondary text-secondary px-6 py-2 rounded-lg hover:bg-secondary/10 transition-colors"
                >
                  Call Now
                </a>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}