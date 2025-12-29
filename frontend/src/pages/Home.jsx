import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaArrowRight, FaShieldAlt, FaMapMarkedAlt, FaClock } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const Home = () => {
  return (
    <div className="bg-background min-h-screen font-sans">

      {/* --- HERO SECTION --- */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background z-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center">
          <Badge variant="outline" className="mb-6 backdrop-blur-md bg-white/50 dark:bg-black/30 animate-fade-in-up">
            Goa's #1 Premium Fleet
          </Badge>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-6 max-w-5xl mx-auto leading-tight animate-fade-in-up">
            Master the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">Coastal Roads.</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Experience freedom with our calibrated fleet of high-performance cars and bikes. Zero deposits. Instant confirmation.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            <Button to="/cars" variant="primary" size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25">
              Find a Car
            </Button>
            <Button to="/bikes" variant="secondary" size="lg" className="h-14 px-8 text-lg rounded-full bg-white dark:bg-white/10 border border-border">
              Rent a Bike
            </Button>
          </div>

          {/* Social Proof */}
          <div className="mt-16 flex items-center justify-center gap-8 text-muted-foreground animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <span className="flex items-center gap-2 text-sm font-medium"><FaShieldAlt /> 100% Insured</span>
            <span className="flex items-center gap-2 text-sm font-medium"><FaMapMarkedAlt /> GPS Tracked</span>
            <span className="flex items-center gap-2 text-sm font-medium"><FaClock /> 24/7 Support</span>
          </div>
        </div>
      </section>

      {/* --- CATEGORY SECTION --- */}
      <section className="py-24 bg-secondary/30 border-t border-border relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Select Your Machinery</h2>
            <p className="text-muted-foreground">From agile scooters for market runs to SUVs for family excursions.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Car Card */}
            <Link to="/cars" className="group">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative">
                <div className="h-64 bg-zinc-100 dark:bg-zinc-900 relative">
                  <div className="absolute inset-0 bg-blue-500/5 group-hover:bg-blue-500/10 transition-colors"></div>
                  {/* Conceptual Icon Graphic */}
                  <FaCar className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-foreground/10 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Cars & SUVs</h3>
                  <p className="text-muted-foreground mb-6">Thar, Creta, Baleno, and more. Air-conditioned comfort for the whole crew.</p>
                  <span className="flex items-center text-primary font-bold group-hover:translate-x-1 transition-transform">
                    Browse Fleet <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>

            {/* Bike Card */}
            <Link to="/bikes" className="group">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative">
                <div className="h-64 bg-zinc-100 dark:bg-zinc-900 relative">
                  <div className="absolute inset-0 bg-indigo-500/5 group-hover:bg-indigo-500/10 transition-colors"></div>
                  <FaMotorcycle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-foreground/10 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Motorcycles</h3>
                  <p className="text-muted-foreground mb-6">Royal Enfield, KTM, BMW. Feel the coastal breeze on a premium cruiser.</p>
                  <span className="flex items-center text-primary font-bold group-hover:translate-x-1 transition-transform">
                    View Bikes <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>

            {/* Scooter Card */}
            <Link to="/scooters" className="group">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative">
                <div className="h-64 bg-zinc-100 dark:bg-zinc-900 relative">
                  <div className="absolute inset-0 bg-emerald-500/5 group-hover:bg-emerald-500/10 transition-colors"></div>
                  <FaMotorcycle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl text-foreground/10 group-hover:scale-110 transition-transform duration-500" style={{ transform: 'translate(-50%, -50%) scale(0.8)' }} />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Scooters</h3>
                  <p className="text-muted-foreground mb-6">Activa, Jupiter, Vespa. The smartest way to navigate narrow lanes.</p>
                  <span className="flex items-center text-primary font-bold group-hover:translate-x-1 transition-transform">
                    Find Scooters <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* --- STATS SECTION --- */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <h4 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono-numbers">50+</h4>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Premium Vehicles</p>
            </div>
            <div>
              <h4 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono-numbers">2.5k</h4>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Happy Travelers</p>
            </div>
            <div>
              <h4 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono-numbers">100%</h4>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">Safety Record</p>
            </div>
            <div>
              <h4 className="text-4xl md:text-5xl font-bold text-foreground mb-2 font-mono-numbers">4.9</h4>
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-widest">User Rating</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;