import { Link } from 'react-router-dom';
import { FaCar, FaMotorcycle, FaArrowRight, FaShieldAlt, FaMapMarkedAlt, FaClock, FaBicycle, FaCalendarCheck, FaUserCheck, FaKey } from 'react-icons/fa';
import Button from '../Components/ui/Button';
import Card from '../Components/ui/Card';
import Badge from '../Components/ui/Badge';

const Home = () => {
  return (
    <div className="bg-background min-h-screen font-sans overflow-x-hidden">

      {/* --- HERO SECTION --- */}
      <section className="relative min-h-[90dvh] flex items-center justify-center overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        {/* Background Gradients */}
        <div className="absolute inset-0 bg-background z-0 pointer-events-none select-none">
          <div className="absolute top-0 right-0 w-[200px] md:w-[600px] h-[200px] md:h-[600px] bg-primary/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 opacity-50 dark:opacity-30"></div>
          <div className="absolute bottom-0 left-0 w-[200px] md:w-[500px] h-[200px] md:h-[500px] bg-blue-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 opacity-50 dark:opacity-30"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        </div>

        <div className="container mx-auto px-4 z-10 text-center flex flex-col items-center">
          <Badge variant="outline" className="mb-8 backdrop-blur-md bg-background/50 border-primary/20 text-primary animate-fade-in-up">
            Goa's #1 Premium Fleet
          </Badge>

          <h1 className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight text-foreground mb-8 max-w-5xl mx-auto leading-[1.1] animate-fade-in-up">
            Master the <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-blue-600">Coastal Roads.</span>
          </h1>

          <p className="text-lg md:text-2xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed animate-fade-in-up px-4 delay-100">
            Experience freedom with our calibrated fleet of high-performance cars and bikes. Zero deposits. Instant confirmation.
          </p>

          <div className="flex flex-row items-center justify-center gap-3 w-full max-w-md mx-auto sm:w-auto animate-fade-in-up delay-200 px-4">
            <Button to="/cars" variant="primary" size="lg" className="flex-1 h-12 px-4 text-sm sm:h-14 sm:px-8 sm:text-lg rounded-full shadow-xl shadow-primary/25 hover:scale-105 transition-transform whitespace-nowrap">
              Find a Car
            </Button>
            <Button to="/bikes" variant="secondary" size="lg" className="flex-1 h-12 px-4 text-sm sm:h-14 sm:px-8 sm:text-lg rounded-full bg-card hover:bg-secondary border border-border hover:scale-105 transition-transform whitespace-nowrap">
              Rent a Bike
            </Button>
          </div>

          {/* Social Proof / Trust Indicators */}
          <div className="mt-16 sm:mt-24 w-full max-w-4xl mx-auto border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 animate-fade-in-up delay-300">
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-full bg-secondary/50 text-emerald-500"><FaShieldAlt /></div>
              <span className="text-sm font-semibold">100% Insured Rides</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-border"></div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-full bg-secondary/50 text-blue-500"><FaMapMarkedAlt /></div>
              <span className="text-sm font-semibold">GPS Tracked Safety</span>
            </div>
            <div className="hidden md:block w-px h-8 bg-border"></div>
            <div className="flex items-center gap-3 text-muted-foreground">
              <div className="p-2 rounded-full bg-secondary/50 text-primary"><FaClock /></div>
              <span className="text-sm font-semibold">24/7 Roadside Support</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- HOW IT WORKS (Replaces Fake Stats) --- */}
      <section className="py-20 bg-secondary/20 border-t border-border relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg">Your journey from booking to destination in three simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-primary/10 transition-colors"></div>
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary text-2xl mb-6">
                <FaCalendarCheck />
              </div>
              <h3 className="text-xl font-bold mb-3">1. Book Online</h3>
              <p className="text-muted-foreground leading-relaxed">
                Choose your dates and select your preferred vehicle from our live inventory. No back-and-forth calls.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-blue-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500 text-2xl mb-6">
                <FaUserCheck />
              </div>
              <h3 className="text-xl font-bold mb-3">2. Quick Verify</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your license and ID securely. We verify instantly so you don't wait at the counter.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-background p-8 rounded-3xl border border-border/50 shadow-sm relative overflow-hidden group hover:-translate-y-1 transition-transform duration-300">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/10 transition-colors"></div>
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 text-2xl mb-6">
                <FaKey />
              </div>
              <h3 className="text-xl font-bold mb-3">3. Zoom Away</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pick up your vehicle or get it delivered. The keys are waiting for you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- CATEGORY SECTION --- */}
      <section className="py-24 border-t border-border relative">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Fleet</h2>
              <p className="text-muted-foreground text-lg">From agile scooters for market runs to SUVs for family excursions.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Car Card */}
            <Link to="/cars" className="group block h-full">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative flex flex-col hover:shadow-2xl hover:shadow-primary/5 transition-all duration-300">
                <div className="h-64 bg-secondary/50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <FaCar className="text-8xl text-foreground/10 group-hover:scale-110 group-hover:text-primary transition-all duration-500 transform group-hover:-rotate-3" />
                </div>
                <div className="p-8 flex-grow flex flex-col bg-card">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Cars & SUVs</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">Thar, Creta, Baleno, and more. Air-conditioned comfort for the whole crew.</p>
                  <span className="flex items-center text-primary font-bold group-hover:translate-x-2 transition-transform mt-auto">
                    Browse Fleet <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>

            {/* Bike Card */}
            <Link to="/bikes" className="group block h-full">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative flex flex-col hover:shadow-2xl hover:shadow-pink-500/5 transition-all duration-300">
                <div className="h-64 bg-secondary/50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <FaMotorcycle className="text-8xl text-foreground/10 group-hover:scale-110 group-hover:text-orange-500 transition-all duration-500 transform group-hover:rotate-3" />
                </div>
                <div className="p-8 flex-grow flex flex-col bg-card">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Motorcycles</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">Royal Enfield, KTM, BMW. Feel the coastal breeze on a premium cruiser.</p>
                  <span className="flex items-center text-orange-600 font-bold group-hover:translate-x-2 transition-transform mt-auto">
                    View Bikes <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>

            {/* Scooter Card */}
            <Link to="/scooters" className="group block h-full">
              <Card hover noPadding className="h-full border-border/50 overflow-hidden relative flex flex-col hover:shadow-2xl hover:shadow-emerald-500/5 transition-all duration-300">
                <div className="h-64 bg-secondary/50 relative flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <FaBicycle className="text-8xl text-foreground/10 group-hover:scale-110 group-hover:text-emerald-500 transition-all duration-500 transform group-hover:-rotate-3" />
                </div>
                <div className="p-8 flex-grow flex flex-col bg-card">
                  <h3 className="text-2xl font-bold text-foreground mb-2">Scooters</h3>
                  <p className="text-muted-foreground mb-6 flex-grow">Activa, Jupiter, Vespa. The smartest way to navigate narrow lanes.</p>
                  <span className="flex items-center text-emerald-600 font-bold group-hover:translate-x-2 transition-transform mt-auto">
                    Find Scooters <FaArrowRight className="ml-2 text-xs" />
                  </span>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;