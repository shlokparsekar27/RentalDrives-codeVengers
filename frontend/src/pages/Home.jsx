// src/pages/Home.jsx
import { Link } from 'react-router-dom'; // Import Link for the button

function Home() {
  return (
    // Main container with a subtle gradient background
    <div className="relative bg-gradient-to-r from-gray-100 to-gray-200 min-h-[calc(100vh-120px)] flex items-center justify-center p-4 sm:p-6 md:p-8">
      <div className="text-center z-10">
        
        {/* Main Heading */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-gray-900 tracking-tight leading-tight">
          Your Goan Adventure, <br className="hidden md:block" />
          <span className="text-blue-600">On Your Own Terms.</span>
        </h1>
        
        {/* Subheading */}
        <p className="mt-4 max-w-lg mx-auto text-base sm:text-lg md:text-xl text-gray-700">
          Unlock the best of Goa with our seamless car, bike, and scooter rentals. Your perfect ride is just a click away.
        </p>

        {/* Call to Action Button */}
        <div className="mt-8 flex justify-center">
          <Link
            to="/cars"
            className="inline-block bg-blue-600 text-white font-bold text-lg px-8 py-3 rounded-lg shadow-lg hover:bg-blue-700 transition-transform transform hover:scale-105"
          >
            Explore Vehicles
          </Link>
        </div>

      </div>
    </div>
  );
}

export default Home;