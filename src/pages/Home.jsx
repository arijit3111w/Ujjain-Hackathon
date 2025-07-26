import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Navigation, Users, Shield, Clock, Phone } from 'lucide-react';

const Home = () => {
  const features = [
    {
      icon: <MapPin className="h-8 w-8" />,
      title: 'Interactive Map',
      description: 'Navigate through sacred ghats, temples, and facilities with our detailed interactive map.'
    },
    {
      icon: <Navigation className="h-8 w-8" />,
      title: 'Smart Routing',
      description: 'Get optimal routes based on current crowd density and your pilgrim status.'
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Crowd Management',
      description: 'Real-time crowd density information to help you plan your visits.'
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'VIP Services',
      description: 'Special access and routing for VIP pilgrims and dignitaries.'
    },
    {
      icon: <Clock className="h-8 w-8" />,
      title: 'Live Updates',
      description: 'Instant notifications about events, changes, and important announcements.'
    },
    {
      icon: <Phone className="h-8 w-8" />,
      title: '24/7 Support',
      description: 'Round-the-clock assistance for all your pilgrimage needs.'
    }
  ];

  const stats = [
    { number: '50L+', label: 'Expected Pilgrims' },
    { number: '100+', label: 'Sacred Locations' },
    { number: '24/7', label: 'Live Monitoring' },
    { number: '15+', label: 'Languages Supported' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-violet-900 via-violet-800 to-orange-700 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Welcome to <br />
              <span className="text-orange-300">Simhastha Kumbh 2025</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-violet-200 max-w-3xl mx-auto">
              Your digital companion for a sacred journey. Navigate with confidence through 
              the world's largest spiritual gathering in Ujjain.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/map"
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg"
              >
                Explore Interactive Map
              </Link>
              <Link
                to="/alerts"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white border border-white/30 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                View Live Updates
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-violet-600 mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Digital Solutions for Sacred Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leveraging technology to enhance your spiritual experience while preserving 
              the sanctity of this ancient tradition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100">
                <div className="bg-gradient-to-r from-violet-600 to-orange-500 w-16 h-16 rounded-lg flex items-center justify-center text-white mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-violet-600 to-orange-500 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Begin Your Sacred Journey Today
          </h2>
          <p className="text-xl text-violet-100 mb-8 max-w-2xl mx-auto">
            Join millions of pilgrims in this divine celebration. Let technology guide 
            your path while you focus on your spiritual journey.
          </p>
          <Link
            to="/map"
            className="bg-white text-violet-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors shadow-lg inline-flex items-center space-x-2"
          >
            <MapPin className="h-5 w-5" />
            <span>Start Navigation</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;