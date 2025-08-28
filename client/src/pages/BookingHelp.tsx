import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { HelpCircle, Calendar, CreditCard, MapPin, Clock, Phone } from "lucide-react";

export default function BookingHelp() {
  const bookingFaqs = [
    {
      question: "How do I make a parking reservation?",
      answer: "To make a reservation, simply enter your departure airport, drop-off and pick-up dates, and click 'Search Parking'. Browse available options, select your preferred lot, and complete the booking with your payment information."
    },
    {
      question: "Can I modify or cancel my booking?",
      answer: "Yes, you can modify or cancel your booking through your account dashboard. Most bookings allow free cancellation up to 24 hours before your scheduled drop-off time. Check your booking confirmation for specific terms."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through our encrypted payment system."
    },
    {
      question: "Do I need to print my booking confirmation?",
      answer: "While we recommend having a printed copy as backup, most modern parking facilities can process bookings using your mobile device. Show your booking confirmation email or use our mobile app at the facility entrance."
    },
    {
      question: "What happens if my flight is delayed?",
      answer: "Most parking bookings include grace periods for flight delays. If your return is delayed, contact our 24/7 support team as soon as possible. We'll work with the parking provider to extend your booking if needed."
    },
    {
      question: "How do shuttle services work?",
      answer: "Shuttle services vary by location. Some run on fixed schedules (every 10-15 minutes), while others operate on-demand. All shuttle information is provided in your booking confirmation, including pickup points and contact numbers."
    }
  ];

  const contactOptions = [
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Call us anytime for immediate assistance",
      contact: "+1 (555) 123-4567"
    },
    {
      icon: HelpCircle,
      title: "Live Chat",
      description: "Chat with our support team online",
      contact: "Available on website"
    },
    {
      icon: Calendar,
      title: "Booking Issues",
      description: "Problems with existing reservations",
      contact: "booking@airportparkingcompare.com"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Booking Help</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600 text-center mb-8">
              Get help with making, managing, and troubleshooting your parking bookings
            </p>
          </div>

          {/* Contact Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {contactOptions.map((option, index) => (
              <Card key={index} className="text-center">
                <CardContent className="p-6">
                  <div className="flex justify-center mb-4">
                    <option.icon className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <p className="font-medium text-primary">{option.contact}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-6 h-6 mr-2" />
              Frequently Asked Questions
            </h2>
            <Accordion type="single" collapsible className="w-full">
              {bookingFaqs.map((faq, index) => (
                <AccordionItem key={index} value={`item-${index}`}>
                  <AccordionTrigger className="text-left">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-gray-600">{faq.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* Quick Actions */}
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">Still Need Help?</h3>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg">
                <Phone className="w-4 h-4 mr-2" />
                Call Support
              </Button>
              <Button variant="outline" size="lg">
                <HelpCircle className="w-4 h-4 mr-2" />
                Live Chat
              </Button>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 