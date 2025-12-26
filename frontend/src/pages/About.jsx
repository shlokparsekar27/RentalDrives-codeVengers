// src/pages/About.jsx
import { Link } from 'react-router-dom';
import { HiShieldCheck, HiSparkles, HiUserGroup } from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaInstagram, FaQuoteLeft } from 'react-icons/fa';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

// --- Main About Page Component ---
function About() {
  // --- Team Member Data ---
  const teamMembers = [
    {
      name: 'Shlok Parsekar',
      role: 'Co-CEO & CTO',
      initials: 'SP',
      color: 'bg-indigo-500',
      socials: {
        github: "https://github.com/shlokparsekar27",
        linkedin: "https://www.linkedin.com/in/shlok-parsekar/",
        instagram: "https://www.instagram.com/shlokk_p27/"
      }
    },
    {
      name: 'Vollin Fernandes',
      role: 'Founder & CEO',
      initials: 'VF',
      color: 'bg-blue-600',
      socials: {
        github: "https://github.com/vollin-git",
        linkedin: "https://www.linkedin.com/in/vollin-fernandes-978909373/",
        instagram: "https://www.instagram.com/vollin_ferns/"
      }
    },
    {
      name: 'Advit Mandrekar',
      role: 'COO & Marketing Head',
      initials: 'AM',
      color: 'bg-purple-600',
      socials: {
        github: "https://github.com/MandrekarAdvit",
        linkedin: "https://www.linkedin.com/in/advit-mandrekar-92636026a/",
        instagram: "https://www.instagram.com/a.dvit_/"
      }
    },
    {
      name: 'Roydon Soares',
      role: 'Director of Operations',
      initials: 'RS',
      color: 'bg-teal-600',
      socials: {
        github: "https://github.com/soares-roydon",
        linkedin: "https://linkedin.com/",
        instagram: "https://www.instagram.com"
      }
    },
    {
      name: 'Falgun Kole',
      role: 'Strategic Advisor',
      initials: 'FK',
      color: 'bg-slate-600',
      socials: {
        github: "https://github.com/FalgunKole",
        linkedin: "https://www.linkedin.com/in/falgun10202004/",
        instagram: "https://www.instagram.com/falgun_20/"
      }
    },
  ];

  const stats = [
    { label: "Active Host Partners", value: "50+" },
    { label: "Tourist Trips Provided", value: "1,200+" },
    { label: "Average Rating", value: "4.9/5" },
    { label: "Cities Covered", value: "All Goa" },
  ];

  return (
    <div className="bg-slate-50 dark:bg-[#020617] min-h-screen transition-colors duration-500 font-sans">

      {/* 
        🚀 Hero Section: "The Vision"
      */}
      <div className="bg-slate-900 text-white min-h-[60vh] flex items-center relative overflow-hidden">
        {/* Abstract Background Elements */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 animate-fade-in-up">
          <Badge variant="brand" className="mb-8 bg-white/10 backdrop-blur-md border-white/20 text-white">Since 2024</Badge>
          <h1 className="text-6xl md:text-8xl font-display font-extrabold tracking-tight mb-8">
            Redefining Mobility <br className="hidden md:block" /> in Goa.
          </h1>
          <p className="max-w-2xl mx-auto text-xl md:text-2xl text-slate-300 leading-relaxed font-light">
            We are building the digital infrastructure for seamless vehicle rentals.
            Connecting verified local hosts with travelers who demand freedom and reliability.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20 -mt-24">

        {/* 
          📊 Impact Metrics 
        */}
        <div className="glass rounded-3xl p-10 md:p-14 mb-24 animate-fade-in-up stagger-1 border dark:border-white/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 text-center divide-x divide-slate-100 dark:divide-slate-800">
            {stats.map((stat, index) => (
              <div key={index} className={index % 2 !== 0 ? "pl-4 md:pl-0" : ""}>
                <div className="text-4xl md:text-5xl font-mono font-bold text-slate-900 dark:text-white mb-2">{stat.value}</div>
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          🌟 Core Values 
        */}
        <div className="mb-32">
          <div className="text-center mb-16 animate-fade-in-up stagger-2">
            <h2 className="text-3xl md:text-4xl font-display font-bold text-slate-900 dark:text-white">Why We Built This</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              RentalDrives wasn't just created to rent cars. It was created to solve the trust deficit in the local rental market.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in-up stagger-3">
            <Card className="glass-card text-center p-10">
              <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-blue-600 dark:text-blue-400">
                <HiShieldCheck size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Trust First</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                We verify every host and vehicle personally. No more scams, no more hidden damages. Just honest rentals.
              </p>
            </Card>

            <Card className="glass-card text-center p-10">
              <div className="w-16 h-16 bg-purple-50 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-purple-600 dark:text-purple-400">
                <HiSparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Premium Experience</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                From the UI to the key handover, we prioritize a seamless, frictionless experience for every user.
              </p>
            </Card>

            <Card className="glass-card text-center p-10">
              <div className="w-16 h-16 bg-green-50 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                <HiUserGroup size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Community Drivin</h3>
              <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                We empower local Goan vehicle owners to become micro-entrepreneurs by giving them a powerful platform.
              </p>
            </Card>
          </div>
        </div>

        {/* 
          👥 Leadership Team 
        */}
        <div className="mb-32">
          <div className="text-center mb-16 animate-fade-in-up stagger-4">
            <Badge variant="outline" className="mb-4 text-xs font-bold tracking-widest uppercase">The Architects</Badge>
            <h2 className="text-3xl md:text-5xl font-display font-bold text-slate-900 dark:text-white">Meet the codeVengers</h2>
            <p className="mt-4 text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-lg">
              A dedicated team of engineers and visionaries from Goa College of Engineering, united by code.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 animate-fade-in-up stagger-5">
            {teamMembers.map((member) => (
              <div key={member.name} className="group relative">
                <div className="bg-white dark:bg-slate-900 rounded-3xl overflow-hidden hover:shadow-2xl hover:shadow-indigo-500/20 transition-all duration-500 border border-slate-100 dark:border-slate-800 h-full flex flex-col hover:-translate-y-2">
                  {/* Avatar Header */}
                  <div className={`h-28 ${member.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20"></div>
                    <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                  </div>

                  {/* Avatar Cirle */}
                  <div className="mx-auto -mt-12 w-24 h-24 bg-white dark:bg-slate-900 p-1.5 rounded-full relative z-10 shadow-xl">
                    <div className={`w-full h-full ${member.color} rounded-full flex items-center justify-center text-white font-display font-bold text-2xl shadow-inner`}>
                      {member.initials}
                    </div>
                  </div>

                  <div className="p-6 text-center flex-grow flex flex-col">
                    <h3 className="font-bold text-slate-900 dark:text-white truncate text-lg">{member.name}</h3>
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mt-1 mb-6">{member.role}</p>

                    <div className="mt-auto flex justify-center gap-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                      {member.socials.github && (
                        <a href={member.socials.github} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors hover:scale-110">
                          <FaGithub size={20} />
                        </a>
                      )}
                      {member.socials.linkedin && (
                        <a href={member.socials.linkedin} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-blue-600 transition-colors hover:scale-110">
                          <FaLinkedin size={20} />
                        </a>
                      )}
                      {member.socials.instagram && (
                        <a href={member.socials.instagram} target="_blank" rel="noreferrer" className="text-slate-400 hover:text-pink-600 transition-colors hover:scale-110">
                          <FaInstagram size={20} />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 
          📢 CTA 
        */}
        <div className="relative rounded-[3rem] overflow-hidden bg-slate-900 mb-24 animate-fade-in-up stagger-5">
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=3521&auto=format&fit=crop')] bg-cover bg-center opacity-20"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>

          <div className="relative z-10 p-12 md:p-24 max-w-4xl mx-auto text-center">
            <FaQuoteLeft className="text-slate-700 text-5xl mx-auto mb-8 opacity-50" />
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-8 leading-tight">
              "The journey matters just as much as the destination."
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link to="/cars" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-slate-900 bg-white rounded-full hover:bg-slate-100 transition-colors hover:scale-105 duration-300">
                Browse Fleet
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white border border-slate-700 rounded-full hover:bg-slate-800 transition-colors hover:scale-105 duration-300 backdrop-blur-sm">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default About;
