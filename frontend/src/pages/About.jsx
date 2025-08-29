// src/pages/About.jsx
import { Link } from 'react-router-dom';
import { HiKey, HiMap, HiShieldCheck } from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

// --- Main About Page Component ---
function About() {
  // --- Team Member Data ---
  // The `image` property is no longer used but is kept for potential future use.
  const teamMembers = [
    { 
      name: 'Shlok Parsekar', 
      role: 'co-CEO & CTO',
      image: '/team/shlok.jpg',
      socials: {
        github: "https://github.com/shlokparsekar27",
        linkedin: "https://www.linkedin.com/in/shlok-parsekar/",
        instagram: "https://www.instagram.com/shlokk_p27/"
      }
    },
    { 
      name: 'Vollin Fernandes', 
      role: 'Founder & CEO',
      image: '/team/vollin.jpg',
      socials: {
        github: "https://github.com/vollin-git",
        linkedin: "https://www.linkedin.com/in/vollin-fernandes-978909373/",
        instagram: "https://www.instagram.com/vollin_ferns/"
      }
    },
    { 
      name: 'Advit Mandrekar', 
      role: 'COO & Marketing Head',
      image: '/team/advit.jpg',
      socials: {
        github: "https://github.com/MandrekarAdvit",
        linkedin: "https://www.linkedin.com/in/advit-mandrekar-92636026a/",
        instagram: "https://www.instagram.com/a.dvit_/"
      }
    },
    { 
      name: 'Roydon Soares', 
      role: 'Director',
      image: '/team/roydon.jpg',
      socials: {
        github: "https://github.com/soares-roydon",
        linkedin: "https://linkedin.com/",
        instagram: "https://www.instagram.com"
      }
    },
    { 
      name: 'Falgun Kole', 
      role: 'Independent Advisor',
      image: '/team/falgun.jpg',
      socials: {
        github: "https://github.com/FalgunKole",
        linkedin: "https://www.linkedin.com/in/falgun10202004/",
        instagram: "https://www.instagram.com/falgun_20/"
      }
    },
  ];

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
                <HiKey className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Easy & Secure Booking</h3>
              <p className="mt-2 text-gray-600">Book your vehicle in minutes with our secure online platform. No hidden fees, no hassle.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
                <HiMap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Wide Selection for Goa</h3>
              <p className="mt-2 text-gray-600">From nimble scooters for city streets to comfortable cars for family trips, we have the perfect ride for your Goan journey.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4">
                <HiShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Trusted Local Hosts</h3>
              <p className="mt-2 text-gray-600">All vehicles are sourced from verified, reliable local hosts who are committed to providing a great experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Meet Our Team Section --- */}
      <div className="bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900">Meet Our Team - The codeVengers</h2>
            <p className="mt-4 text-gray-600 text-lg">
              We are a passionate team of developers dedicated to creating intuitive and powerful solutions. The codeVengers came together to build RentalDrives, combining our skills in web development to craft a seamless rental experience from the ground up.
            </p>
          </div>

          {/* --- Team Members Grid --- */}
          <div className="mt-16 flex flex-wrap justify-center gap-10">
            {teamMembers.map((member) => (
              <div 
                key={member.name} 
                className="w-full max-w-xs text-center"
              >
                <div className="bg-gray-100 p-6 rounded-2xl shadow-lg transition-transform duration-300 hover:shadow-2xl hover:-translate-y-2">
                  {/* --- MODIFIED: Display Initial Instead of Image --- */}
                  <div className="w-32 h-32 mx-auto rounded-full bg-blue-200 flex items-center justify-center border-4 border-white shadow-md">
                    <span className="text-5xl font-bold text-blue-700">{member.name.charAt(0)}</span>
                  </div>
                  
                  <h4 className="mt-4 text-xl font-bold text-gray-900">{member.name}</h4>
                  <p className="mt-1 text-blue-600 font-medium">{member.role}</p>
                  
                  {/* Social Links */}
                  <div className="mt-4 flex justify-center space-x-4">
                    {member.socials.github && (
                      <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-gray-900 transition-colors">
                        <FaGithub className="h-6 w-6" />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-700 transition-colors">
                        <FaLinkedin className="h-6 w-6" />
                      </a>
                    )}
                      {member.socials.instagram && (
                      <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-red-500 transition-colors">
                        <FaInstagram className="h-6 w-6" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
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
