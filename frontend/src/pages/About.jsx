// src/pages/About.jsx
import { Link } from 'react-router-dom';
// NEW: Importing icons from the react-icons library
import { HiKey, HiMap, HiShieldCheck } from 'react-icons/hi';

function About() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="bg-gray-900 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight">About RentalDrives</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-gray-300">
            We believe the best way to experience the vibrant culture and stunning landscapes of Goa is with the freedom of your own ride.
          </p>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Our Mission</h2>
          <p className="mt-4 text-gray-600 text-lg">
            Our mission is to provide a seamless, reliable, and affordable vehicle rental experience for every tourist visiting Goa. We connect you with trusted local hosts, ensuring you get a quality, well-maintained vehicle to make your trip unforgettable. We handle the logistics so you can focus on the adventure.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
                {/* REPLACED: Using the imported HiKey icon */}
                <HiKey className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Easy & Secure Booking</h3>
              <p className="mt-2 text-gray-600">Book your vehicle in minutes with our secure online platform. No hidden fees, no hassle.</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
                {/* REPLACED: Using the imported HiMap icon */}
                <HiMap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Wide Selection for Goa</h3>
              <p className="mt-2 text-gray-600">From nimble scooters for city streets to comfortable cars for family trips, we have the perfect ride for your Goan journey.</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
                {/* REPLACED: Using the imported HiShieldCheck icon */}
                <HiShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Trusted Local Hosts</h3>
              <p className="mt-2 text-gray-600">All vehicles are sourced from verified, reliable local hosts who are committed to providing a great experience.</p>
            </div>

          </div>
        </div>
      </div>
      
      {/* Call to Action Section */}
      <div className="bg-blue-600">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold text-white">Ready for Your Adventure?</h2>
          <p className="mt-2 text-blue-100 text-lg">Browse our selection and book your ride today.</p>
          <div className="mt-8">
            <Link 
              to="/cars" 
              className="inline-block bg-white text-blue-600 font-bold text-lg px-8 py-3 rounded-lg shadow-lg hover:bg-gray-100 transition-transform transform hover:scale-105"
            >
              See Our Vehicles
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}

export default About;