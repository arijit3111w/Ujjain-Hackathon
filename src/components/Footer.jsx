import React from 'react';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-kumbh-orange text-white">
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
                <p className="text-kumbh-text">Official Navigation Portal</p>
              </div>
            </div>
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

          {/* Contact Info */}
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-amber-200 text-sm mb-4 md:mb-0">
            © 2025 Government of Madhya Pradesh. All rights reserved.
          </div>
          <div className="flex space-x-6 text-sm">
            <a href="#" className="text-amber-200 hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="text-amber-200 hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="text-amber-200 hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;