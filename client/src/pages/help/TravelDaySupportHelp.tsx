import React from 'react';
import { Link } from 'wouter';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Clock, Phone, AlertTriangle, HelpCircle, Car, Plane } from "lucide-react";

export default function TravelDaySupportHelp() {
  const faqs = [
    {
      question: "What if my flight is delayed?",
      answer: "Most parking bookings include grace periods for flight delays. If your return is delayed, contact our 24/7 support team as soon as possible. We'll work with the parking provider to extend your booking if needed. Additional charges may apply for extended stays."
    },
    {
      question: "What if I arrive early to the parking facility?",
      answer: "Most parking facilities offer grace periods for early arrival. You can typically arrive up to 2 hours early without additional charges. Check your booking confirmation for specific early arrival policies for your chosen facility."
    },
    {
      question: "How do I contact support on the day of travel?",
      answer: "Our 24/7 support team is available via phone, live chat, and email. The emergency contact number is provided in your booking confirmation. For urgent issues, call our support line immediately."
    },
    {
      question: "What if the parking lot is full when I arrive?",
      answer: "This is extremely rare as we only partner with reliable providers. If this happens, contact our emergency support line immediately. We'll find you alternative parking and cover any additional costs."
    },
    {
      question: "What if I can't find the shuttle pickup point?",
      answer: "Shuttle pickup points are clearly marked at most facilities. If you can't locate the pickup point, call the facility's contact number provided in your booking confirmation. Staff can guide you to the correct location."
    },
    {
      question: "What if I need to extend my parking stay?",
      answer: "If you need to extend your stay, contact our support team as soon as possible. We'll work with the parking provider to accommodate your request. Additional charges will apply for extended stays."
    }
  ];

  const emergencyContacts = [
    {
      icon: Phone,
      title: "24/7 Support",
      description: "Emergency support line",
      contact: "+1 (555) 123-4567"
    },
    {
      icon: AlertTriangle,
      title: "Urgent Issues",
      description: "Immediate assistance",
      contact: "Available 24/7"
    },
    {
      icon: Clock,
      title: "Flight Delays",
      description: "Extension requests",
      contact: "Call support team"
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

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Travel Day Support</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Help for the day of your travel - from arrival to departure
            </p>
          </div>

          {/* Emergency Contacts */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Emergency Contacts</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {emergencyContacts.map((contact, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <contact.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{contact.title}</h3>
                    <p className="text-sm text-gray-600 mb-2">{contact.description}</p>
                    <p className="font-medium text-primary">{contact.contact}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Travel Day Checklist */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Travel Day Checklist</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Car className="w-5 h-5 mr-2" />
                    Before You Leave
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Have your booking confirmation ready</li>
                    <li>• Check your flight status</li>
                    <li>• Note the parking facility address</li>
                    <li>• Save emergency contact numbers</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plane className="w-5 h-5 mr-2" />
                    At the Airport
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Follow facility directions</li>
                    <li>• Park in your assigned space</li>
                    <li>• Take note of shuttle times</li>
                    <li>• Keep your keys with you</li>
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
                Need help on your travel day?
              </h3>
              <p className="text-gray-600 mb-4">
                Our 24/7 support team is here to help with any travel day issues.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/contact">
                  <Button size="lg">
                    Contact Support
                  </Button>
                </Link>
                <a href="tel:+1-555-123-4567">
                  <Button variant="outline" size="lg">
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
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