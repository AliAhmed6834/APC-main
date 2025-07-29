import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Terms() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Terms of Service</h1>
          <div className="prose prose-lg max-w-none text-neutral-dark">
            <p className="mb-6">Last updated: January 28, 2025</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Agreement to Terms</h2>
            <p className="mb-4">By accessing our service, you agree to be bound by these terms.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Service</h2>
            <p className="mb-4">You may use our service for lawful purposes only.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Booking Terms</h2>
            <p className="mb-4">All bookings are subject to availability and confirmation.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
            <p>Questions about the Terms of Service should be sent to us.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}