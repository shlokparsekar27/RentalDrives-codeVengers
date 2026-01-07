// src/pages/About.jsx
import { Link } from 'react-router-dom';
import { HiKey, HiMap, HiShieldCheck, HiLightningBolt, HiHeart, HiGlobe } from 'react-icons/hi';
import { FaGithub, FaLinkedin, FaInstagram, FaCode, FaRocket, FaTwitter } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

function About() {
  const teamMembers = [
    {
      name: 'Shlok Parsekar',
      role: 'co-CEO & CTO',
      bio: 'Architecting scalable systems.',
      socials: { github: "https://github.com/shlokparsekar27", linkedin: "https://www.linkedin.com/in/shlok-parsekar/", instagram: "https://www.instagram.com/shlokk_p27/" }
    },
    {
      name: 'Vollin Fernandes',
      role: 'Founder & CEO',
      bio: 'Visionary behind the wheel.',
      socials: { github: "https://github.com/vollin-git", linkedin: "https://www.linkedin.com/in/vollin-fernandes-978909373/", instagram: "https://www.instagram.com/vollin_ferns/" }
    },
    {
      name: 'Advit Mandrekar',
      role: 'COO & Marketing Head',
      bio: 'Driving brand growth.',
      socials: { github: "https://github.com/MandrekarAdvit", linkedin: "https://www.linkedin.com/in/advit-mandrekar-92636026a/", instagram: "https://www.instagram.com/a.dvit_/" }
    },
    {
      name: 'Roydon Soares',
      role: 'Director',
      bio: 'Ensuring operational excellence.',
      socials: { github: "https://github.com/soares-roydon", linkedin: "https://linkedin.com/", instagram: "https://www.instagram.com" }
    },
    {
      name: 'Falgun Kole',
      role: 'Independent Advisor',
      bio: 'Strategic guidance & mentorship.',
      socials: { github: "https://github.com/FalgunKole", linkedin: "https://www.linkedin.com/in/falgun10202004/", instagram: "https://www.instagram.com/falgun_20/" }
    }
  ];

  const values = [
    { icon: HiLightningBolt, title: "Speed", desc: "Digital-first workflows." },
    { icon: HiShieldCheck, title: "Trust", desc: "Verified hosts & vehicles." },
    { icon: HiHeart, title: "Passion", desc: "Built by petrolheads." },
  ];

  return (
    <div className="bg-background min-h-screen text-foreground font-sans pt-20">

      {/* Hero Section */}
      <div className="relative py-20 lg:py-32 overflow-hidden border-b border-border/40">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 dark:opacity-20 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[128px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-[96px]"></div>
        </div>

        <div className="container mx-auto px-4 max-w-5xl text-center relative z-10">
          <Badge variant="outline" className="mb-6 font-mono border-primary/20 text-primary backdrop-blur-md bg-background/50">EST. 2025</Badge>
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight mb-8 leading-tight">
            The Future of <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">Tourist Mobility.</span>
          </h1>
          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            We are engineering a seamless rental experience for the modern traveler, built on a foundation of trust and technology.
          </p>
        </div>
      </div>

      {/* Mission & Values */}
      <div className="py-16 md:py-24 bg-secondary/20">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 md:gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                Our Mission
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                To democratize vehicle rentals in Goa by bridging the gap between local hosts and global travelers. We are essentially building the operating system for tourist logistics—removing friction, ensuring safety, and maximizing freedom.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
                {values.map((v, i) => (
                  <div key={i} className="bg-background border border-border p-4 rounded-xl shadow-sm">
                    <v.icon className="text-primary w-6 h-6 mb-2" />
                    <h3 className="font-bold text-sm">{v.title}</h3>
                    <p className="text-xs text-muted-foreground">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-secondary border border-border/60 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-4">
                    <HiKey size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Instant Access</h3>
                  <p className="text-muted-foreground">
                    Forget the paperwork. Our digital-first booking flow gets you on the road in minutes, not hours.
                  </p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-background to-secondary border border-border/60 shadow-lg relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500 mb-4">
                    <HiMap size={24} />
                  </div>
                  <h3 className="text-xl font-bold mb-2">Local Reach</h3>
                  <p className="text-muted-foreground">
                    With pickup points across every major Goan hub, your ride is always just a corner away from your resort.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-16 md:py-24 border-t border-border/60">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-secondary text-primary font-bold uppercase tracking-widest text-xs">
                <FaCode /> The Team
              </div>
              <h2 className="text-4xl font-bold mb-4">Meet the codeVengers</h2>
              <p className="text-muted-foreground text-lg">
                A collective of passionate engineers and creators dedicated to solving real-world logistics problems.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-8">
            {teamMembers.map((member) => (
              <div key={member.name} className="w-full sm:w-[350px] group relative">
                <Card className="flex flex-col items-center p-6 h-full hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 border-border bg-card hover:-translate-y-2">

                  {/* Avatar centered */}
                  <div className="mb-6 w-full flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-secondary to-primary/10 flex items-center justify-center text-3xl font-bold text-foreground border border-border shadow-inner group-hover:scale-110 transition-transform duration-500">
                      {member.name.charAt(0)}
                    </div>
                  </div>

                  {/* Name & Role stacked and centered */}
                  <div className="mb-8 text-center w-full">
                    <h4 className="font-bold text-xl text-foreground block mb-2">{member.name}</h4>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider block">
                      {member.role}
                    </span>
                  </div>

                  {/* Socials - Center with gap */}
                  <div className="flex justify-center gap-6 w-full mt-auto pt-6 border-t border-border/50">
                    {member.socials.github && (
                      <a href={member.socials.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110">
                        <FaGithub size={20} />
                      </a>
                    )}
                    {member.socials.linkedin && (
                      <a href={member.socials.linkedin} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#0077b5] transition-colors transform hover:scale-110">
                        <FaLinkedin size={20} />
                      </a>
                    )}
                    {member.socials.instagram && (
                      <a href={member.socials.instagram} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-[#E4405F] transition-colors transform hover:scale-110">
                        <FaInstagram size={20} />
                      </a>
                    )}
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 md:py-24 bg-secondary/10 border-t border-border">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to hit the road?</h2>
          <p className="text-lg text-muted-foreground mb-10">
            Join the movement. Experience the freedom of Goa on your own terms.
          </p>
          <Button to="/cars" variant="primary" size="lg" className="px-10 py-6 text-lg rounded-full shadow-2xl shadow-primary/20 hover:shadow-primary/40 transition-all font-bold">
            Explore Vehicles
          </Button>
        </div>
      </div>

    </div>
  );
}

export default About;
