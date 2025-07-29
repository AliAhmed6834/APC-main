import { Car } from "lucide-react";
import { Link } from "wouter";
import { useLocale } from "@/contexts/LocaleContext";

export default function Footer() {
  const { region } = useLocale();
  
  // Region-specific popular airports
  const airportsByRegion = {
    US: [
      { code: "LAX", name: "Los Angeles" },
      { code: "JFK", name: "New York" },
      { code: "ORD", name: "Chicago" },
      { code: "DFW", name: "Dallas" },
      { code: "ATL", name: "Atlanta" }
    ],
    GB: [
      { code: "LHR", name: "London Heathrow" },
      { code: "LGW", name: "London Gatwick" },
      { code: "MAN", name: "Manchester" },
      { code: "EDI", name: "Edinburgh" },
      { code: "BHX", name: "Birmingham" }
    ]
  };
  
  const popularAirports = airportsByRegion[region as keyof typeof airportsByRegion] || airportsByRegion.US;

  const companyLinks = [
    { label: "About Us", href: "/about" },
    { label: "How It Works", href: "/how-it-works" },
    { label: "Partner With Us", href: "/partners" },
    { label: "Careers", href: "/careers" },
    { label: "Press", href: "/press" }
  ];

  const supportLinks = [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Booking Help", href: "/booking-help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" }
  ];

  const socialLinks = [
    { icon: "fab fa-facebook", href: "#" },
    { icon: "fab fa-twitter", href: "#" },
    { icon: "fab fa-instagram", href: "#" },
    { icon: "fab fa-linkedin", href: "#" }
  ];

  return (
    <footer className="bg-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/" className="flex items-center space-x-2 mb-6">
              <Car className="text-secondary text-2xl" />
              <h3 className="text-2xl font-bold">Airport Parking Compare</h3>
            </Link>
            <p className="text-gray-300 mb-6">
              The most trusted platform for finding and booking airport parking worldwide.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => (
                <a 
                  key={index}
                  href={social.href} 
                  className="text-gray-300 hover:text-secondary transition-colors"
                >
                  <i className={`${social.icon} text-xl`}></i>
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Popular Airports</h4>
            <ul className="space-y-2 text-gray-300">
              {popularAirports.map((airport) => (
                <li key={airport.code}>
                  <Link 
                    href={`/search?airportCode=${airport.code}`}
                    className="hover:text-secondary transition-colors"
                  >
                    {airport.code} - {airport.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-300">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Support</h4>
            <ul className="space-y-2 text-gray-300">
              {supportLinks.map((link) => (
                <li key={link.label}>
                  <Link 
                    href={link.href}
                    className="hover:text-secondary transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-12 pt-8 flex flex-col md:flex-row items-center justify-between">
          <p className="text-gray-300">&copy; 2024 Airport Parking Compare. All rights reserved.</p>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              <i className="fas fa-lock text-secondary"></i>
              <span className="text-sm text-gray-300">SSL Secured</span>
            </div>
            <div className="flex items-center space-x-2">
              <i className="fas fa-credit-card text-secondary"></i>
              <span className="text-sm text-gray-300">PCI Compliant</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
