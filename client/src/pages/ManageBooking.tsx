import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Calendar, User, Car } from 'lucide-react';
import { useLocale } from '@/contexts/LocaleContext';

export default function ManageBooking() {
  const [searchMethod, setSearchMethod] = useState<'reference' | 'email'>('reference');
  const [searchData, setSearchData] = useState({
    bookingReference: '',
    email: '',
    mobileOrReg: ''
  });
  const [isSearching, setIsSearching] = useState(false);
  const { localeInfo } = useLocale();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSearching(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {localeInfo.region === 'GB' ? 'Manage Booking' : 'Manage Booking'}
            </h1>
            <p className="text-gray-600">
              {localeInfo.region === 'GB' 
                ? 'Search for your booking by reference number or email address'
                : 'Search for your booking by reference number or email address'
              }
            </p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Search className="w-5 h-5 mr-2" />
                {localeInfo.region === 'GB' ? 'Search Booking' : 'Search Booking'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {/* Search Method Toggle */}
              <div className="flex space-x-4 mb-6">
                <Button
                  variant={searchMethod === 'reference' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('reference')}
                  className="flex-1"
                >
                  {localeInfo.region === 'GB' ? 'By Reference No' : 'By Reference No'}
                </Button>
                <Button
                  variant={searchMethod === 'email' ? 'default' : 'outline'}
                  onClick={() => setSearchMethod('email')}
                  className="flex-1"
                >
                  {localeInfo.region === 'GB' ? 'By Email Address' : 'By Email Address'}
                </Button>
              </div>

              <form onSubmit={handleSearch} className="space-y-6">
                {searchMethod === 'reference' ? (
                  <>
                    <div>
                      <Label htmlFor="bookingReference">
                        {localeInfo.region === 'GB' ? 'Booking Reference' : 'Booking Reference'} *
                      </Label>
                      <Input
                        id="bookingReference"
                        type="text"
                        placeholder="Enter your booking reference"
                        value={searchData.bookingReference}
                        onChange={(e) => setSearchData({...searchData, bookingReference: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        {localeInfo.region === 'GB' ? 'Email Address' : 'Email Address'} *
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={searchData.email}
                        onChange={(e) => setSearchData({...searchData, email: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <Label htmlFor="email2">
                        {localeInfo.region === 'GB' ? 'Email Address' : 'Email Address'} *
                      </Label>
                      <Input
                        id="email2"
                        type="email"
                        placeholder="Enter your email address"
                        value={searchData.email}
                        onChange={(e) => setSearchData({...searchData, email: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobileOrReg">
                        {localeInfo.region === 'GB' ? 'Mobile or Vehicle Reg Number' : 'Mobile or Vehicle Reg Number'} *
                      </Label>
                      <Input
                        id="mobileOrReg"
                        type="text"
                        placeholder={localeInfo.region === 'GB' ? 'Enter mobile or vehicle registration' : 'Enter mobile or vehicle registration'}
                        value={searchData.mobileOrReg}
                        onChange={(e) => setSearchData({...searchData, mobileOrReg: e.target.value})}
                        required
                        className="mt-1"
                      />
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSearching}
                >
                  {isSearching ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {localeInfo.region === 'GB' ? 'Searching...' : 'Searching...'}
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      {localeInfo.region === 'GB' ? 'Search Booking' : 'Search Booking'}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Help Section */}
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="w-5 h-5 mr-2" />
                {localeInfo.region === 'GB' ? 'Need Help?' : 'Need Help?'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-gray-600">
                  {localeInfo.region === 'GB' 
                    ? "Can't find your booking? Our customer support team is here to help."
                    : "Can't find your booking? Our customer support team is here to help."
                  }
                </p>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm text-gray-600">
                      {localeInfo.region === 'GB' ? 'Mon-Fri 9am-5pm' : 'Mon-Fri 9am-5pm'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Car className="w-4 h-4 text-primary mr-2" />
                    <span className="text-sm text-gray-600">
                      {localeInfo.region === 'GB' ? '0203 603 9797' : '+1 (555) 123-4567'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 