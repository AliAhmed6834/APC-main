import React from 'react';
import { Link } from 'wouter';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Car, Clock, Shield, HelpCircle, Navigation } from "lucide-react";

export default function ParkingLocationsHelp() {
  const faqs = [
    {
      question: "How do I find my parking location?",
      answer: "Your parking location details are provided in your booking confirmation email. This includes the exact address, directions, and a map. You can also access this information through your account dashboard or our mobile app."
    },
    {
      question: "What if I can't find the parking lot?",
      answer: "If you're having trouble locating your parking facility, call the contact number provided in your booking confirmation. Most facilities have 24/7 support and can guide you to the correct location. You can also use the GPS coordinates provided."
    },
    {
      question: "Are there different types of parking facilities?",
      answer: "Yes, we offer various parking options including covered parking, uncovered parking, valet service, and premium lots. Each facility has different amenities, security features, and pricing. You can compare options during the booking process."
    },
    {
      question: "How do shuttle services work?",
      answer: "Shuttle services vary by location. Some run on fixed schedules (every 10-15 minutes), while others operate on-demand. All shuttle information, including pickup points and contact numbers, is provided in your booking confirmation."
    },
    {
      question: "What security features do parking facilities have?",
      answer: "Most facilities offer 24/7 security patrols, CCTV surveillance, well-lit areas, and secure entry/exit points. Premium facilities may also have gated access and on-site security personnel. Check your booking confirmation for specific security features."
    },
    {
      question: "Can I access my vehicle 24/7?",
      answer: "Most parking facilities offer 24/7 access to your vehicle. However, some facilities may have restricted hours for shuttle services. Check your booking confirmation for specific access hours and shuttle schedules."
    }
  ];

  const facilityTypes = [
    {
      icon: Car,
      title: "Covered Parking",
      description: "Protection from weather elements"
    },
    {
      icon: Shield,
      title: "Secure Facilities",
      description: "24/7 security and surveillance"
    },
    {
      icon: Clock,
      title: "24/7 Access",
      description: "Round-the-clock vehicle access"
    },
    {
      icon: Navigation,
      title: "Shuttle Service",
      description: "Regular transport to terminals"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/help" className="inline-flex items-center text-primary hover:text-primary/80 mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Help Center
          </Link>

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Parking Locations</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Everything you need to know about finding and accessing parking facilities
            </p>
          </div>

          {/* Facility Types */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Types of Parking Facilities</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {facilityTypes.map((type, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <type.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{type.title}</h3>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Location Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Finding Your Parking Location</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <MapPin className="w-5 h-5 mr-2" />
                    Location Details
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Exact address and GPS coordinates</li>
                    <li>• Step-by-step directions</li>
                    <li>• Landmark references</li>
                    <li>• Contact information</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Access Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Entry and exit procedures</li>
                    <li>• Shuttle pickup points</li>
                    <li>• Operating hours</li>
                    <li>• Emergency contacts</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="space-y-4">
              {faqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`} className="border rounded-lg px-6">
                  <AccordionTrigger className="text-left hover:no-underline">
                    <span className="font-medium text-gray-900">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Contact Support */}
          <Card className="bg-primary/5">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Need help finding your parking location?
              </h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help you locate and access your parking facility.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg">
                    Contact Support
                  </Button>
                </Link>
                <Link href="/booking-help">
                  <Button variant="outline" size="lg">
                    Booking Help
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 