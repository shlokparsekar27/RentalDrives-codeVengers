// src/pages/About.jsx
import { Link } from 'react-router-dom';
import { HiKey, HiMap, HiShieldCheck } from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaInstagram } from 'react-icons/fa';

// --- Main About Page Component ---
function About() {
  // --- Team Member Data ---
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
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-slate-900 dark:bg-black text-white transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-6xl font-display font-extrabold tracking-tight">About RentalDrives</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-300">
            We believe the best way to experience the vibrant culture and stunning landscapes of Goa is with the freedom of your own ride.
          </p>
        </div>
      </div>

      {/* Our Mission Section */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Our Mission</h2>
          <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
            Our mission is to provide a seamless, reliable, and affordable vehicle rental experience for every tourist visiting Goa. We connect you with trusted local hosts, ensuring you get a quality, well-maintained vehicle to make your trip unforgettable. We handle the logistics so you can focus on the adventure.
          </p>
        </div>
      </div>

      {/* Why Choose Us Section */}
      <div className="bg-slate-50 dark:bg-slate-900 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-display font-bold text-center text-slate-900 dark:text-white mb-12">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 text-center">
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
                <HiKey className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Easy & Secure Booking</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">Book your vehicle in minutes with our secure online platform. No hidden fees, no hassle.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
                <HiMap className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Wide Selection for Goa</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">From nimble scooters for city streets to comfortable cars for family trips, we have the perfect ride for your Goan journey.</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-600 mb-4 shadow-lg shadow-blue-500/30">
                <HiShieldCheck className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Trusted Local Hosts</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-400">All vehicles are sourced from verified, reliable local hosts who are committed to providing a great experience.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- Meet Our Team Section --- */}
      <div className="bg-white dark:bg-slate-950 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-display font-bold text-slate-900 dark:text-white">Meet Our Team - The codeVengers</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 text-lg">
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
                <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-2xl shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 dark:hover:shadow-blue-900/10 border border-slate-100 dark:border-slate-800">
                  {/* --- MODIFIED: Display Initial Instead of Image --- */}
                  <div className="w-32 h-32 mx-auto rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center border-4 border-white dark:border-slate-800 shadow-md">
                    <span className="text-5xl font-bold text-blue-600 dark:text-blue-400">{member.name.charAt(0)}</span>
                  </div>

                  <h4 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{member.name}</h4>
                  <p className="mt-1 text-blue-600 dark:text-blue-400 font-medium">{member.role}</p>

                  {/* Social Links */}
                  <div className="mt-4 flex justify-center space-x-4">
                    {member.socials.github && (
                      <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
                        <FaGithub className="h-6 w-6" />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-blue-700 dark:text-slate-400 dark:hover:text-blue-400 transition-colors">
                        <FaLinkedin className="h-6 w-6" />
                      </a>
                    )}
                    {member.socials.instagram && (
                      <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-red-500 dark:text-slate-400 dark:hover:text-red-400 transition-colors">
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
      <div className="bg-blue-600 dark:bg-blue-700 transition-colors">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-display font-bold text-white">Ready for Your Adventure?</h2>
          <p className="mt-2 text-blue-100 text-lg">Browse our selection and book your ride today.</p>
          <div className="mt-8">
            <Link
              to="/cars"
              className="inline-block bg-white text-blue-600 dark:text-blue-700 font-bold text-lg px-8 py-3 rounded-lg shadow-lg hover:bg-slate-100 transition-transform transform hover:scale-105"
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
