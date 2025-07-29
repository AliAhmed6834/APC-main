import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Careers() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Careers</h1>
          <p className="text-lg text-neutral-dark mb-8">
            Join our team and help transform the airport parking experience for travelers worldwide.
          </p>
          <p className="text-neutral-dark">
            We're always looking for talented individuals to join our growing team.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}