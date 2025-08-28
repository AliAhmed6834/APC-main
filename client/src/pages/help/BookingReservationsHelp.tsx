import React from 'react';
import { Link } from 'wouter';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Clock, Car, CreditCard, HelpCircle } from "lucide-react";

export default function BookingReservationsHelp() {
  const faqs = [
    {
      question: "How do I make a parking reservation?",
      answer: "To make a reservation, simply enter your departure airport, drop-off and pick-up dates, and click 'Search Parking'. Browse available options, select your preferred lot, and complete the booking with your payment information. You'll receive instant confirmation via email."
    },
    {
      question: "Can I modify my booking after it's confirmed?",
      answer: "Yes, you can modify your booking through your account dashboard. Most changes are free if made more than 24 hours before your scheduled drop-off time. Changes may incur fees if made closer to your travel date."
    },
    {
      question: "How do I cancel my parking reservation?",
      answer: "You can cancel your booking through your account dashboard or by contacting our support team. Most bookings allow free cancellation up to 24 hours before your scheduled drop-off time. Check your booking confirmation for specific cancellation terms."
    },
    {
      question: "What information do I need to make a booking?",
      answer: "You'll need your departure airport, drop-off date and time, pick-up date and time, vehicle information (make, model, color, license plate), and payment method. We also recommend having your flight number for reference."
    },
    {
      question: "Can I book parking for someone else?",
      answer: "Yes, you can book parking for someone else. Simply enter their vehicle information and contact details during the booking process. The booking confirmation will be sent to the email address you provide."
    },
    {
      question: "What happens if I arrive early or late?",
      answer: "Most parking facilities offer grace periods for early arrival or late departure. Check your booking confirmation for specific details. If you need to extend your stay, contact our support team as soon as possible."
    }
  ];

  const bookingSteps = [
    {
      icon: Calendar,
      title: "Select Dates",
      description: "Choose your drop-off and pick-up dates and times"
    },
    {
      icon: Car,
      title: "Choose Location",
      description: "Browse available parking lots and select your preferred option"
    },
    {
      icon: CreditCard,
      title: "Complete Payment",
      description: "Enter your payment information and confirm your booking"
    },
    {
      icon: Clock,
      title: "Get Confirmation",
      description: "Receive instant confirmation and parking instructions via email"
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

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Booking & Reservations</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Everything you need to know about making and managing your parking reservations
            </p>
          </div>

          {/* Booking Steps */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">How to Book</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {bookingSteps.map((step, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <step.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
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
                Need help with your booking?
              </h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help you with any booking questions.
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