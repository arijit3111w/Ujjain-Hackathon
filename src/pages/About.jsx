import React from 'react';
import { Calendar, MapPin, Users, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">About Simhastha Kumbh 2025</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The world's largest peaceful gathering, celebrating faith, tradition, and spiritual unity in the sacred city of Ujjain.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-6">A Sacred Tradition</h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              The Simhastha Kumbh Mela is one of four Kumbh Mela celebrations held every 12 years in Ujjain, 
              Madhya Pradesh. This ancient pilgrimage draws millions of devotees from around the world to 
              bathe in the sacred Shipra River and seek spiritual purification.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Our digital platform serves as your trusted guide, helping you navigate this massive gathering 
              while preserving the sanctity and tradition of this millennia-old celebration.
            </p>
          </div>
          <div className="bg-gradient-to-r from-violet-600 to-orange-500 rounded-xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-6">Key Information</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5" />
                <span>Duration: 48 Days of Sacred Celebration</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5" />
                <span>Location: Ujjain, Madhya Pradesh, India</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="h-5 w-5" />
                <span>Expected: 5+ Crore Pilgrims</span>
              </div>
              <div className="flex items-center space-x-3">
                <Award className="h-5 w-5" />
                <span>UNESCO: Intangible Cultural Heritage</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Our Digital Initiative</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-violet-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-violet-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Smart Navigation</h3>
              <p className="text-gray-600">Advanced mapping technology to guide pilgrims safely through the vast gathering.</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Crowd Management</h3>
              <p className="text-gray-600">Real-time monitoring to ensure safety and smooth flow of pilgrims.</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Cultural Preservation</h3>
              <p className="text-gray-600">Balancing modern technology with ancient traditions and spiritual values.</p>
            </div>
          </div>
        </div>

        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Government of Madhya Pradesh</h2>
          <p className="text-xl text-gray-600 mb-8">
            Committed to providing world-class facilities and digital infrastructure for all pilgrims.
          </p>
          <div className="bg-gradient-to-r from-violet-600 to-orange-500 text-white rounded-lg p-6 inline-block">
            <p className="font-semibold">For support and inquiries:</p>
            <p className="text-lg">Helpline: 1800-XXX-XXXX</p>
            <p>Email: support@simhastha.mp.gov.in</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;