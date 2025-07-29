import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Mail, Phone, Clock, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Contact() {
  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      details: ["US: +1 (555) 123-4567", "UK: +44 20 7123 4567"],
      description: "Call us for immediate assistance"
    },
    {
      icon: Mail,
      title: "Email Support", 
      details: ["support@airportparkingcompare.com"],
      description: "We respond within 24 hours"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["24/7 Emergency Support", "Mon-Fri: 8AM-8PM local time"],
      description: "We're here when you need us"
    },
    {
      icon: MapPin,
      title: "Headquarters",
      details: ["123 Aviation Way", "Airport City, AC 12345"],
      description: "Visit our main office"
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8 text-center">Contact Us</h1>
          <p className="text-lg text-neutral-dark mb-12 text-center">
            Need help? We're here to assist you with any questions or concerns.
          </p>
          
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-semibold text-neutral-dark mb-6">Get in Touch</h2>
              <div className="grid gap-6">
                {contactMethods.map((method, index) => (
                  <Card key={index}>
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-4">
                        <div className="bg-secondary/10 rounded-lg p-3">
                          <method.icon className="w-6 h-6 text-secondary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-neutral-dark mb-1">{method.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">{method.description}</p>
                          <div className="space-y-1">
                            {method.details.map((detail, idx) => (
                              <p key={idx} className="text-neutral-dark font-medium">{detail}</p>
                            ))}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            {/* Contact Form */}
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Send us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          First Name
                        </label>
                        <Input placeholder="Your first name" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-neutral-dark mb-2">
                          Last Name
                        </label>
                        <Input placeholder="Your last name" />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-dark mb-2">
                        Email
                      </label>
                      <Input type="email" placeholder="your.email@example.com" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-dark mb-2">
                        Subject
                      </label>
                      <Input placeholder="How can we help you?" />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-dark mb-2">
                        Message
                      </label>
                      <Textarea 
                        placeholder="Tell us more about your inquiry..."
                        rows={5}
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}