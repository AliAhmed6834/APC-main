import React from 'react';
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, FileText } from "lucide-react";

export default function Press() {
  const pressReleases = [
    {
      id: "1",
      title: "Airport Parking Compare Launches New Mobile App",
      date: "2024-01-15",
      summary: "Leading airport parking platform introduces mobile app for iOS and Android devices."
    },
    {
      id: "2",
      title: "Partnership with Major UK Airports Announced",
      date: "2023-12-10",
      summary: "Expansion into UK market with partnerships at Heathrow, Gatwick, and Manchester airports."
    },
    {
      id: "3",
      title: "Record Growth in Airport Parking Bookings",
      date: "2023-11-20",
      summary: "Company reports 150% year-over-year growth in parking bookings across major US airports."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8 text-center">Press & Media</h1>
          
          <div className="prose prose-lg max-w-none mb-12">
            <p className="text-xl text-gray-600 text-center mb-8">
              For media inquiries, press releases, and company information
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mail className="w-5 h-5 mr-2" />
                  Media Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  For press inquiries, interviews, and media requests:
                </p>
                <p className="font-medium">press@airportparkingcompare.com</p>
                <p className="text-sm text-gray-500">Response within 24 hours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Press Office
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  For urgent media requests:
                </p>
                <p className="font-medium">+1 (555) 123-4567</p>
                <p className="text-sm text-gray-500">Available 24/7 for urgent matters</p>
              </CardContent>
            </Card>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <FileText className="w-6 h-6 mr-2" />
              Press Releases
            </h2>
            <div className="space-y-4">
              {pressReleases.map((release) => (
                <Card key={release.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold">{release.title}</h3>
                      <span className="text-sm text-gray-500">{release.date}</span>
                    </div>
                    <p className="text-gray-600">{release.summary}</p>
                    <Button variant="outline" size="sm" className="mt-4">
                      Read More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="text-center">
            <Button size="lg">
              Download Press Kit
            </Button>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
} 