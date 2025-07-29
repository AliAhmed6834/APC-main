import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">About Airport Parking Compare</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-neutral-dark mb-6">
              Airport Parking Compare is the world's most trusted platform for finding and booking airport parking. 
              We help millions of travelers save time and money by comparing parking options from multiple suppliers 
              across major airports worldwide.
            </p>
            
            <h2 className="text-2xl font-semibold text-neutral-dark mt-8 mb-4">Our Mission</h2>
            <p className="text-neutral-dark mb-6">
              To make airport parking simple, transparent, and affordable for every traveler. We believe that 
              finding great parking shouldn't be stressful or expensive.
            </p>
            
            <h2 className="text-2xl font-semibold text-neutral-dark mt-8 mb-4">Why Choose Us?</h2>
            <ul className="list-disc pl-6 text-neutral-dark mb-6">
              <li>Compare prices from multiple suppliers in one place</li>
              <li>Guaranteed best rates with our price match promise</li>
              <li>Real customer reviews and ratings</li>
              <li>24/7 customer support in multiple languages</li>
              <li>Secure booking with instant confirmation</li>
              <li>Multi-currency support for international travelers</li>
            </ul>
            
            <h2 className="text-2xl font-semibold text-neutral-dark mt-8 mb-4">Global Coverage</h2>
            <p className="text-neutral-dark mb-6">
              We partner with parking suppliers at over 45 major airports across the United States, United Kingdom, 
              and internationally, ensuring you always have reliable parking options wherever you travel.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}