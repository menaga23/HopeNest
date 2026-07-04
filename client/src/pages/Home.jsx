import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import API from '../utils/api';
import ImpactCounter from '../components/ImpactCounter';
import { MapPin, HeartHandshake, Sparkles, AlertCircle, Quote, ArrowRight, Heart } from 'lucide-react';

const Home = () => {
  const [impactStats, setImpactStats] = useState({
    totalMeals: 4250,
    totalVolunteers: 185,
    totalFunds: 152000,
    totalSponsored: 48
  });
  const [featuredOrphanages, setFeaturedOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch live statistics and featured orphanages
    const loadHomeData = async () => {
      try {
        const [impactRes, orphanageRes] = await Promise.all([
          API.get('/impact'),
          API.get('/orphanages')
        ]);
        setImpactStats(impactRes.data);
        // Take top 3 approved orphanages
        setFeaturedOrphanages(orphanageRes.data.slice(0, 3));
      } catch (error) {
        console.error("Failed to load landing page metrics:", error);
      } finally {
        setLoading(false);
      }
    };
    loadHomeData();
  }, []);

  // Standard static testimonials
  const testimonials = [
    {
      id: 1,
      quote: "Sponsoring Diya's monthly education package has been one of the most rewarding decisions. Watching her grow through regular updates brings me so much joy.",
      author: "John Doe",
      role: "Sponsor since 2024"
    },
    {
      id: 2,
      quote: "Our visit to Sunshine Haven was incredibly moving. The booking calendar was seamless, and teaching drawing classes to the kids was a highlight of my year.",
      author: "Meera Sen",
      role: "Regular Volunteer"
    },
    {
      id: 3,
      quote: "HopeNest bridges the gap. I can see the exact needs of orphanages in real time and ship them diapers or formula directly. The transparency is outstanding.",
      author: "Sarah Jenkins",
      role: "Donor"
    }
  ];

  return (
    <div className="relative min-h-screen pb-16 bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 transition-colors duration-300">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden py-24 sm:py-32 bg-gradient-to-br from-hn-primary to-[#ff7d4d] text-hn-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.1),transparent_70%)]" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block px-4 py-1 bg-hn-white/20 backdrop-blur-md rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-hn-white/10 shadow-sm animate-pulse">
              Join Our Care Community
            </span>
            <h1 className="text-4xl sm:text-6xl font-serif font-extrabold tracking-tight mb-6 leading-tight drop-shadow-md">
              Every child deserves a home, every heart deserves a purpose
            </h1>
            <p className="text-lg sm:text-xl text-hn-white/90 font-medium mb-10 max-w-2xl mx-auto leading-relaxed">
              At HopeNest, we connect orphanages directly with those eager to make a difference. Donate items, volunteer your time, sponsor a child, or explore adoption.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
              <Link
                to="/orphanages"
                className="inline-flex items-center justify-center gap-2 bg-hn-white hover:bg-hn-white/95 text-hn-primary font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
              >
                Help Orphanages Now <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/children"
                className="inline-flex items-center justify-center bg-hn-primary/20 hover:bg-hn-primary/30 border border-hn-white/30 text-hn-white font-bold px-8 py-4 rounded-full shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                Sponsor a Child
              </Link>
            </div>
          </div>

          {/* Impact Counters Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto mt-10">
            <ImpactCounter target={impactStats.totalFunds} label="Funds Raised" prefix="₹" />
            <ImpactCounter target={impactStats.totalMeals} label="Meals Donated" suffix="+" />
            <ImpactCounter target={impactStats.totalVolunteers} label="Volunteers Joined" />
            <ImpactCounter target={impactStats.totalSponsored} label="Sponsored Kids" />
          </div>
        </div>
      </section>

      {/* 2. HOW IT WORKS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-hn-dark dark:text-hn-white">
            Making a Difference is Simple
          </h2>
          <div className="h-1 w-20 bg-hn-primary mx-auto my-4 rounded-full" />
          <p className="text-base text-hn-dark/70 dark:text-hn-secondary/70">
            Three simple steps to bring comfort and change to children awaiting your love.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Card 1 */}
          <div className="bg-hn-white dark:bg-hn-dark p-8 rounded-2xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <div className="bg-hn-primary/10 text-hn-primary p-4 rounded-2xl mb-6">
              <MapPin className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white mb-3">
              1. Choose an Orphanage
            </h3>
            <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 leading-relaxed">
              Explore geolocated orphanages on our interactive map. View details and understand what they require.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-hn-white dark:bg-hn-dark p-8 rounded-2xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <div className="bg-hn-primary/10 text-hn-primary p-4 rounded-2xl mb-6">
              <HeartHandshake className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white mb-3">
              2. Settle on a Method
            </h3>
            <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 leading-relaxed">
              Donate funds or packages of food, clothing, and books. Choose to sponsor a child monthly or volunteer.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-hn-white dark:bg-hn-dark p-8 rounded-2xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center">
            <div className="bg-hn-primary/10 text-hn-primary p-4 rounded-2xl mb-6">
              <Sparkles className="w-8 h-8" />
            </div>
            <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white mb-3">
              3. Create Impact
            </h3>
            <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 leading-relaxed">
              Witness the results live on your dashboard and platform feeds. Receive direct verification reports.
            </p>
          </div>
        </div>
      </section>

      {/* 3. FEATURED ORPHANAGES & URGENT NEEDS */}
      <section className="py-16 bg-hn-secondary/30 dark:bg-hn-dark/30 border-y border-hn-secondary/50 dark:border-hn-dark/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* Featured Orphanages List */}
            <div className="lg:col-span-8 space-y-8">
              <div>
                <h2 className="text-3xl font-serif font-extrabold text-hn-dark dark:text-hn-white mb-2">
                  Featured Orphanages
                </h2>
                <p className="text-sm text-hn-dark/60 dark:text-hn-secondary/65">
                  Connect with care homes and support their mission of rehabilitation.
                </p>
              </div>

              {loading ? (
                <div className="space-y-4">
                  {[1, 2].map(n => (
                    <div key={n} className="h-32 skeleton-loading rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {featuredOrphanages.map(orph => (
                    <div key={orph._id} className="bg-hn-white dark:bg-hn-dark rounded-2xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex flex-col sm:flex-row gap-6 hover:shadow-md transition-shadow">
                      {orph.photos && orph.photos.length > 0 ? (
                        <img
                          src={orph.photos[0]}
                          alt={orph.name}
                          className="w-full sm:w-44 h-32 rounded-xl object-cover shrink-0"
                        />
                      ) : (
                        <div className="w-full sm:w-44 h-32 rounded-xl bg-hn-secondary/50 flex items-center justify-center shrink-0">
                          <MapPin className="text-hn-primary w-8 h-8" />
                        </div>
                      )}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-xs font-semibold text-hn-primary uppercase tracking-wide flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" /> {orph.city}
                          </span>
                          <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white mt-1 mb-2">
                            {orph.name}
                          </h3>
                          <p className="text-xs text-hn-dark/70 dark:text-hn-secondary/70 line-clamp-2 leading-relaxed">
                            {orph.description}
                          </p>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 font-medium">
                            Capacity: {orph.currentChildren}/{orph.capacity} Children
                          </span>
                          <Link
                            to={`/donate?orphanageId=${orph._id}`}
                            className="text-xs font-semibold text-hn-white bg-hn-primary hover:bg-hn-primary/95 py-2 px-4 rounded-full transition-colors flex items-center gap-1.5"
                          >
                            Help Now <Heart className="w-3.5 h-3.5 fill-current" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Urgent Needs Sidebar */}
            <div className="lg:col-span-4 bg-hn-white dark:bg-hn-dark rounded-2xl p-6 border border-hn-secondary/40 dark:border-hn-dark/40 shadow-sm space-y-6">
              <div className="flex items-center gap-2 border-b border-hn-secondary/20 pb-4">
                <AlertCircle className="w-5 h-5 text-hn-primary shrink-0" />
                <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">
                  Urgent Needs
                </h3>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-10 skeleton-loading rounded-lg" />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {featuredOrphanages.flatMap(o => o.needs.map(n => ({ ...n, orphanageName: o.name, orphanageId: o._id })))
                    .filter(n => n.priority === 'high')
                    .slice(0, 4)
                    .map((need, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3.5 rounded-xl bg-hn-secondary/25 dark:bg-hn-dark/30 border border-hn-secondary/20 dark:border-hn-dark/20 text-sm">
                        <div>
                          <h4 className="font-semibold text-hn-dark dark:text-hn-white">{need.item}</h4>
                          <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-0.5">{need.orphanageName}</p>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-medium text-hn-primary bg-hn-primary/10 py-1 px-2.5 rounded-full">
                            {need.quantity}
                          </span>
                          <Link
                            to={`/donate?orphanageId=${need.orphanageId}&type=${need.item.toLowerCase().includes('rice') || need.item.toLowerCase().includes('formula') ? 'food' : 'clothes'}`}
                            className="block text-[11px] font-semibold text-hn-accent hover:underline mt-1.5"
                          >
                            Supply
                          </Link>
                        </div>
                      </div>
                    ))}
                  
                  {featuredOrphanages.length === 0 && (
                    <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 text-center py-6">
                      No urgent needs listed currently.
                    </p>
                  )}
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* 4. DONOR TESTIMONIALS */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-serif font-extrabold text-hn-dark dark:text-hn-white">
            What Our Supporters Say
          </h2>
          <div className="h-1 w-20 bg-hn-primary mx-auto my-4 rounded-full" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map(t => (
            <div key={t.id} className="bg-hn-white dark:bg-hn-dark p-8 rounded-2xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm relative flex flex-col justify-between">
              <Quote className="w-10 h-10 text-hn-primary/10 absolute top-4 left-4" />
              <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 leading-relaxed italic z-10 mb-6">
                "{t.quote}"
              </p>
              <div>
                <h4 className="font-serif text-sm font-bold text-hn-dark dark:text-hn-white">
                  {t.author}
                </h4>
                <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FLOATING DONATION BUTTON */}
      <Link
        to="/donate"
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-hn-primary hover:bg-hn-primary/95 text-hn-white px-5 py-4.5 rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 select-none active:scale-95 group"
      >
        <Heart className="w-5 h-5 fill-current animate-bounce text-hn-white group-hover:scale-110 transition-transform" />
        <span className="text-sm font-bold tracking-wide pr-1">Donate now</span>
      </Link>

    </div>
  );
};

export default Home;
