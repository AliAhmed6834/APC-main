import React from 'react';
import { Link } from 'wouter';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CreditCard, DollarSign, Shield, HelpCircle, Clock } from "lucide-react";

export default function PaymentPricingHelp() {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express, Discover), PayPal, and Apple Pay. All payments are processed securely through our encrypted payment system. We do not accept cash payments for online bookings."
    },
    {
      question: "Are there any hidden fees?",
      answer: "No, we believe in transparent pricing. The price you see is the price you pay. All taxes and fees are clearly displayed during the booking process. There are no hidden charges or surprise fees."
    },
    {
      question: "How do refunds work?",
      answer: "Refund policies depend on the specific booking terms and timing of cancellation. Most bookings allow free cancellation up to 24 hours before the start date. Refunds are processed within 5-7 business days to your original payment method."
    },
    {
      question: "Do you offer price matching?",
      answer: "Yes! If you find a lower price for the same parking service elsewhere, we'll match it. Simply contact our support team with proof of the lower price, and we'll adjust your booking accordingly."
    },
    {
      question: "Are there discounts for longer stays?",
      answer: "Yes, many parking facilities offer discounted rates for longer stays. These discounts are automatically applied during the booking process. You can also look for promotional codes on our website or sign up for our newsletter to receive special offers."
    },
    {
      question: "Is my payment information secure?",
      answer: "Absolutely. We use industry-standard SSL encryption to protect your payment information. We never store your full credit card details on our servers. All payments are processed through secure, PCI-compliant payment processors."
    }
  ];

  const paymentMethods = [
    {
      icon: CreditCard,
      title: "Credit Cards",
      description: "Visa, MasterCard, American Express, Discover"
    },
    {
      icon: DollarSign,
      title: "PayPal",
      description: "Fast and secure online payments"
    },
    {
      icon: Shield,
      title: "Apple Pay",
      description: "Contactless payments for iOS users"
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

          <h1 className="text-4xl font-bold text-gray-900 mb-8">Payment & Pricing</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600">
              Everything you need to know about payments, pricing, and refunds
            </p>
          </div>

          {/* Payment Methods */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Accepted Payment Methods</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {paymentMethods.map((method, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="flex justify-center mb-4">
                      <method.icon className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{method.title}</h3>
                    <p className="text-sm text-gray-600">{method.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Pricing Information */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Pricing Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="w-5 h-5 mr-2" />
                    Transparent Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• No hidden fees or surprise charges</li>
                    <li>• All taxes included in displayed price</li>
                    <li>• Price matching guarantee</li>
                    <li>• Discounts for longer stays</li>
                  </ul>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    Cancellation Policy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-gray-600">
                    <li>• Free cancellation up to 24 hours</li>
                    <li>• Partial refunds for early returns</li>
                    <li>• No-show fees may apply</li>
                    <li>• Weather-related cancellations</li>
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
                Questions about payment or pricing?
              </h3>
              <p className="text-gray-600 mb-4">
                Our support team is here to help with any payment or pricing questions.
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