import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gradient-to-r from-violet-900 via-violet-800 to-orange-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-white/20 p-2 rounded-lg">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold">Simhastha Kumbh 2025</h3>
                <p className="text-violet-200">Official Navigation Portal</p>
              </div>
            </div>
            <p className="text-violet-200 mb-4 leading-relaxed">
              Government of Madhya Pradesh's official digital platform for pilgrims visiting 
              the sacred Simhastha Kumbh Mela in Ujjain. Navigate with confidence and devotion.
            </p>
            <div className="flex space-x-4">
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer">
                <Globe className="h-5 w-5" />
              </div>
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer">
                <Phone className="h-5 w-5" />
              </div>
              <div className="bg-white/10 hover:bg-white/20 p-2 rounded-lg transition-colors cursor-pointer">
                <Mail className="h-5 w-5" />
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-orange-200">Quick Links</h4>
            <ul className="space-y-2">
              {['Map Navigation', 'Ghat Information', 'Parking Areas', 'Emergency Services', 'Food Courts', 'Lost & Found'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-violet-200 hover:text-white transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-lg mb-4 text-orange-200">Contact Information</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <Phone className="h-4 w-4 mt-1 text-orange-300" />
                <div>
                  <p className="text-sm font-medium">Emergency Helpline</p>
                  <p className="text-violet-200 text-sm">1800-XXX-XXXX</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Mail className="h-4 w-4 mt-1 text-orange-300" />
                <div>
                  <p className="text-sm font-medium">Support Email</p>
                  <p className="text-violet-200 text-sm">support@simhastha.mp.gov.in</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 mt-1 text-orange-300" />
                <div>
                  <p className="text-sm font-medium">Control Room</p>
                  <p className="text-violet-200 text-sm">Simhastha Kumbh Office, Ujjain</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-violet-200 text-sm mb-4 md:mb-0">
            © 2025 Government of Madhya Pradesh. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-violet-200 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-violet-200 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-violet-200 hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;