import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-neutral-dark mb-8">Privacy Policy</h1>
          <div className="prose prose-lg max-w-none text-neutral-dark">
            <p className="mb-6">Last updated: January 28, 2025</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
            <p className="mb-4">We collect information to provide better services to our users.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Information</h2>
            <p className="mb-4">We use the information we collect to operate and improve our services.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Information Sharing</h2>
            <p className="mb-4">We do not sell or rent your personal information to third parties.</p>
            
            <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
            <p>If you have questions about this Privacy Policy, please contact us.</p>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}