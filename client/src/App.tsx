import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LocaleProvider } from "@/contexts/LocaleContext";
import Landing from "@/pages/Landing";
import SearchResults from "@/pages/SearchResults";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Help from "@/pages/Help";
import HowItWorks from "@/pages/HowItWorks";
import Careers from "@/pages/Careers";
import Partners from "@/pages/Partners";
import Privacy from "@/pages/Privacy";
import Terms from "@/pages/Terms";
import BookingFlow from "@/pages/BookingFlow";
import Home from "@/pages/Home";
import NotFound from "@/pages/not-found";
import ComplianceBanner from "@/components/ComplianceBanner";
import ManageBooking from "@/pages/ManageBooking";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Press from "@/pages/Press";
import BookingHelp from "@/pages/BookingHelp";
import BookingReservationsHelp from "@/pages/help/BookingReservationsHelp";
import PaymentPricingHelp from "@/pages/help/PaymentPricingHelp";
import ParkingLocationsHelp from "@/pages/help/ParkingLocationsHelp";
import TravelDaySupportHelp from "@/pages/help/TravelDaySupportHelp";
import SupplierLogin from "@/pages/SupplierLogin";
import SupplierDashboard from "@/pages/SupplierDashboard";
import AdminLogin from "@/pages/AdminLogin";
import AdminDashboard from "@/pages/AdminDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/search" component={SearchResults} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/help" component={Help} />
      <Route path="/how-it-works" component={HowItWorks} />
      <Route path="/careers" component={Careers} />
      <Route path="/partners" component={Partners} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/terms" component={Terms} />
      <Route path="/booking" component={BookingFlow} />
      <Route path="/home" component={Home} />
      <Route path="/manage-booking" component={ManageBooking} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/press" component={Press} />
      <Route path="/booking-help" component={BookingHelp} />
      <Route path="/help/booking-reservations" component={BookingReservationsHelp} />
      <Route path="/help/payment-pricing" component={PaymentPricingHelp} />
      <Route path="/help/parking-locations" component={ParkingLocationsHelp} />
      <Route path="/help/travel-day-support" component={TravelDaySupportHelp} />
      
      {/* Supplier Routes */}
      <Route path="/supplier/login" component={SupplierLogin} />
      <Route path="/supplier/dashboard" component={SupplierDashboard} />
      
      {/* Admin Routes */}
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LocaleProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <ComplianceBanner />
        </TooltipProvider>
      </LocaleProvider>
    </QueryClientProvider>
  );
}

export default App;
