import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import {
  MapPin,
  Navigation,
  Users,
  Shield,
  Clock,
  Phone
} from 'lucide-react';

const Home = () => {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  const features = [
    { icon: <MapPin className="h-8 w-8" />, title: 'Interactive Map', description: 'Navigate through sacred ghats, temples, and facilities with our detailed interactive map.' },
    { icon: <Navigation className="h-8 w-8" />, title: 'Smart Routing', description: 'Get optimal routes based on current crowd density and your pilgrim status.' },
    { icon: <Users className="h-8 w-8" />, title: 'Crowd Management', description: 'Real-time crowd density information to help you plan your visits.' },
    { icon: <Shield className="h-8 w-8" />, title: 'VIP Services', description: 'Special access and routing for VIP pilgrims and dignitaries.' },
    { icon: <Clock className="h-8 w-8" />, title: 'Live Updates', description: 'Instant notifications about events, changes, and important announcements.' },
    { icon: <Phone className="h-8 w-8" />, title: '24/7 Support', description: 'Round-the-clock assistance for all your pilgrimage needs.' }
  ];

  const stats = [
    { number: '50L+', label: 'Expected Pilgrims' },
    { number: '100+', label: 'Sacred Locations' },
    { number: '24/7', label: 'Live Monitoring' },
    { number: '15+', label: 'Languages Supported' }
  ];

  return (
    <div className="min-h-screen font-sans">
      {/* Hero Section */}
      <div className="relative hero-section text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight text-white mb-6 drop-shadow-lg tracking-wide">
            Welcome to <br />
            <span className="text-amber-400 drop-shadow-xl">Simhastha Kumbh 2025</span>
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-white/90">
            Your digital companion for a sacred journey. Navigate with confidence through the world's largest spiritual gathering in Ujjain.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/map"
              className="bg-amber-500 hover:bg-amber-600 hover:text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-xl transform hover:-translate-y-1 transition-all no-underline hover:no-underline"
            >
              Explore Interactive Map
            </Link>
            <Link
              to="/alerts"
              className="bg-white/20 hover:bg-white/30 border border-white/30 backdrop-blur-md px-8 py-4 rounded-xl font-semibold text-lg text-white shadow-lg transition-all hover:-translate-y-1 no-underline hover:no-underline"
            >
              View Live Updates
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="bg-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
            {stats.map((stat, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="text-center hover:scale-105 transition duration-300"
              >
                <div className="text-4xl font-extrabold text-amber-600 mb-2">{stat.number}</div>
                <div className="text-gray-700 text-lg font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className=" relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
        <h3></h3><img src="/images/swastik.svg" className="swastik" />
      </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Digital Solutions for Sacred Journey
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leveraging technology to enhance your spiritual experience while preserving the sanctity of this ancient tradition.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                data-aos="fade-up"
                data-aos-delay={index * 100}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl hover:scale-[1.03] transition duration-300 border border-gray-200"
              >
                <div className="bg-gradient-to-r from-amber-600 to-amber-500 w-16 h-16 rounded-xl flex items-center justify-center text-white text-2xl mb-4 shadow-md">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-base">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
