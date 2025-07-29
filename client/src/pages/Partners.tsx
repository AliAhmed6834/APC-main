import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Partners() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Partner With Us</h1>
          <p className="text-lg text-neutral-dark mb-8">
            Join our network of trusted parking suppliers and reach millions of travelers worldwide.
          </p>
          <p className="text-neutral-dark">
            Contact our partnerships team to learn more about opportunities.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}