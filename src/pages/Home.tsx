import React from 'react';
import { useNavigate } from 'react-router-dom';
import SearchForm from '../components/search/SearchForm';
import FeaturedHotels from '../components/home/FeaturedHotels';
import Features from '../components/home/Features';
import Testimonials from '../components/home/Testimonials';

const Home = () => {
  const navigate = useNavigate();

  const handleSearch = (searchData: any) => {
    navigate('/search', { state: { searchData } });
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900">
        <div 
          className="absolute inset-0 bg-black opacity-40"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1920&h=1080&fit=crop)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Find Your Perfect
            <span className="bg-gradient-to-r from-blue-400 to-indigo-300 bg-clip-text text-transparent block">
              Hotel Experience
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto leading-relaxed">
            Discover amazing hotels worldwide. From luxury resorts to cozy boutique stays, 
            we help you find the perfect accommodation for your journey.
          </p>

          {/* Search Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-8 max-w-5xl mx-auto">
            <SearchForm onSearch={handleSearch} />
          </div>
        </div>
      </section>

      {/* Featured Hotels */}
      <FeaturedHotels />
      
      {/* Features */}
      <Features />
      
      {/* Testimonials */}
      <Testimonials />
    </div>
  );
};

export default Home;