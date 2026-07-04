import React, { useEffect, useState } from 'react';
import API from '../utils/api';
import { io } from 'socket.io-client';
import { Coins, Heart, Users, Utensils, Download, Radio, ShieldCheck } from 'lucide-react';

const Impact = () => {
  const [stats, setStats] = useState({
    totalMeals: 4250,
    totalVolunteers: 185,
    totalFunds: 152000,
    totalSponsored: 48
  });
  const [activities, setActivities] = useState([
    { type: 'donation', donorName: 'John Doe', donationType: 'money', amount: 5000, orphanageName: 'Sunshine Haven', date: new Date(Date.now() - 1000 * 60 * 30) },
    { type: 'donation', donorName: 'Sarah Jenkins', donationType: 'food', quantity: '15 tins formula', orphanageName: 'Grace Meadows Home', date: new Date(Date.now() - 1000 * 60 * 120) },
    { type: 'volunteer', volunteerName: 'John Doe', orphanageName: 'Sunshine Haven', date: new Date(Date.now() - 1000 * 60 * 420) },
    { type: 'adoption', familyName: 'John Doe', childName: 'Ananya', orphanageName: 'Grace Meadows Home', date: new Date(Date.now() - 1000 * 60 * 1440) }
  ]);
  const [loading, setLoading] = useState(true);

  // Fund goals parameters
  const FUND_GOAL = 300000; // Target Goal: ₹3,00,000

  useEffect(() => {
    // 1. Fetch live metrics from API
    const fetchStats = async () => {
      try {
        const response = await API.get('/impact');
        setStats(response.data);
      } catch (err) {
        console.error("Failed to load impact stats:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();

    // 2. Establish Socket.io connection for realtime notifications
    const socket = io('http://localhost:5000');
    
    socket.on('newActivity', (newAct) => {
      setActivities(prev => [
        {
          ...newAct,
          date: new Date(newAct.date)
        },
        ...prev
      ].slice(0, 10)); // Keep top 10 activities

      // Dynamically increment counters locally so they reflect immediately
      setStats(prev => {
        const updated = { ...prev };
        if (newAct.type === 'donation') {
          if (newAct.donationType === 'money') {
            updated.totalFunds += parseFloat(newAct.amount) || 0;
          } else if (newAct.donationType === 'food') {
            const qty = parseInt(newAct.quantity) || 1;
            updated.totalMeals += qty * 10;
          }
        } else if (newAct.type === 'sponsor') {
          updated.totalSponsored += 1;
          updated.totalFunds += parseFloat(newAct.amount) || 0;
        }
        return updated;
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const downloadReport = () => {
    window.print();
  };

  const getPercentage = () => {
    return Math.min(Math.round((stats.totalFunds / FUND_GOAL) * 100), 100);
  };

  const formatActivityText = (act) => {
    const timeString = new Date(act.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (act.type === 'donation') {
      const detail = act.donationType === 'money' ? `₹${act.amount}` : act.quantity;
      return (
        <p className="text-xs sm:text-sm text-hn-dark/80 dark:text-hn-secondary/80">
          <span className="font-bold text-hn-dark dark:text-hn-white">{act.donorName}</span> donated <span className="font-semibold text-hn-primary">{detail}</span> ({act.donationType}) to <span className="font-semibold text-hn-dark dark:text-hn-white">{act.orphanageName}</span>
          <span className="text-[10px] text-hn-dark/40 dark:text-hn-secondary/40 block mt-0.5">{timeString}</span>
        </p>
      );
    } else if (act.type === 'volunteer') {
      return (
        <p className="text-xs sm:text-sm text-hn-dark/80 dark:text-hn-secondary/80">
          <span className="font-bold text-hn-dark dark:text-hn-white">{act.volunteerName}</span> booked a volunteer visit to <span className="font-semibold text-hn-dark dark:text-hn-white">{act.orphanageName}</span>
          <span className="text-[10px] text-hn-dark/40 dark:text-hn-secondary/40 block mt-0.5">{timeString}</span>
        </p>
      );
    } else if (act.type === 'adoption') {
      return (
        <p className="text-xs sm:text-sm text-hn-dark/80 dark:text-hn-secondary/80">
          <span className="font-bold text-hn-dark dark:text-hn-white">{act.familyName}</span> submitted an adoption inquiry for <span className="font-semibold text-hn-primary">{act.childName}</span> at <span className="font-semibold text-hn-dark dark:text-hn-white">{act.orphanageName}</span>
          <span className="text-[10px] text-hn-dark/40 dark:text-hn-secondary/40 block mt-0.5">{timeString}</span>
        </p>
      );
    } else if (act.type === 'sponsor') {
      return (
        <p className="text-xs sm:text-sm text-hn-dark/80 dark:text-hn-secondary/80">
          <span className="font-bold text-hn-dark dark:text-hn-white">{act.sponsorName}</span> became a monthly sponsor for <span className="font-semibold text-hn-primary">{act.childName}</span> at <span className="font-semibold text-hn-dark dark:text-hn-white">{act.orphanageName}</span> (₹{act.amount}/mo)
          <span className="text-[10px] text-hn-dark/40 dark:text-hn-secondary/40 block mt-0.5">{timeString}</span>
        </p>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300 print:bg-white print:p-0">
      
      {/* Banner */}
      <section className="bg-hn-dark text-hn-white py-12 px-4 text-center print:hidden">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-left">
            <span className="text-hn-primary text-xs font-bold uppercase tracking-wider">
              Transparency & Realtime Activity
            </span>
            <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-1 mb-2">
              Our Platform Impact
            </h1>
            <p className="text-sm text-hn-secondary/70 max-w-lg">
              Monitor donation goals, volunteer signups, and live contribution alerts in real time.
            </p>
          </div>
          <button
            onClick={downloadReport}
            className="py-2.5 px-6 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-xs font-semibold rounded-full shadow-sm flex items-center gap-1.5 shrink-0"
          >
            <Download className="w-4 h-4" /> Download PDF Report
          </button>
        </div>
      </section>

      {/* Print-only Header */}
      <div className="hidden print:block text-center py-8 border-b-2 border-hn-primary mb-8">
        <h1 className="text-4xl font-serif font-bold text-hn-primary">HopeNest Impact Report</h1>
        <p className="text-xs text-gray-500 mt-2">Generated on {new Date().toLocaleDateString()} • Verified Platform Ledger</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Metrics & Goal bars */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Cards */}
            <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex items-center gap-4">
              <div className="bg-hn-primary/10 text-hn-primary p-3 rounded-2xl shrink-0">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 block font-medium uppercase">Funds Raised</span>
                <span className="text-xl sm:text-2xl font-bold text-hn-dark dark:text-hn-white">₹{stats.totalFunds.toLocaleString()}</span>
              </div>
            </div>

            <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex items-center gap-4">
              <div className="bg-hn-accent/10 text-hn-accent p-3 rounded-2xl shrink-0">
                <Utensils className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 block font-medium uppercase">Meals Supplied</span>
                <span className="text-xl sm:text-2xl font-bold text-hn-dark dark:text-hn-white">{stats.totalMeals.toLocaleString()}+</span>
              </div>
            </div>

            <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex items-center gap-4">
              <div className="bg-hn-primary/10 text-hn-primary p-3 rounded-2xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 block font-medium uppercase">Volunteers Approved</span>
                <span className="text-xl sm:text-2xl font-bold text-hn-dark dark:text-hn-white">{stats.totalVolunteers}</span>
              </div>
            </div>

            <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex items-center gap-4">
              <div className="bg-hn-accent/10 text-hn-accent p-3 rounded-2xl shrink-0">
                <Heart className="w-6 h-6" />
              </div>
              <div>
                <span className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 block font-medium uppercase">Kids Sponsored</span>
                <span className="text-xl sm:text-2xl font-bold text-hn-dark dark:text-hn-white">{stats.totalSponsored}</span>
              </div>
            </div>
          </div>

          {/* Goal Progress bar */}
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">Annual Rehabilitation Goal</h3>
                <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-0.5">Crowdfunding to support verified orphanages' schooling projects.</p>
              </div>
              <span className="text-xs font-bold text-hn-primary bg-hn-primary/10 py-1.5 px-3 rounded-full">
                {getPercentage()}% Completed
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="w-full h-4 bg-hn-secondary/40 dark:bg-hn-dark/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-hn-primary rounded-full transition-all duration-500"
                  style={{ width: `${getPercentage()}%` }}
                />
              </div>
              <div className="flex justify-between text-xs font-semibold text-hn-dark dark:text-hn-white">
                <span>Raised: ₹{stats.totalFunds.toLocaleString()}</span>
                <span>Target: ₹{FUND_GOAL.toLocaleString()}</span>
              </div>
            </div>
          </div>

        </div>

        {/* Right: Live Activity Feed (Socket.io) */}
        <div className="lg:col-span-4 print:hidden">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-sm space-y-6">
            
            <div className="flex items-center justify-between border-b border-hn-secondary/15 pb-4">
              <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white flex items-center gap-2">
                Live activity Feed
              </h3>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 py-1 px-2.5 rounded-full animate-pulse border border-red-200/30">
                <Radio className="w-3 h-3" /> Live
              </span>
            </div>

            <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
              {activities.map((act, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-2xl bg-hn-secondary/20 dark:bg-hn-dark/40 border border-hn-secondary/15 dark:border-hn-dark/15 flex items-start gap-3 hover:border-hn-primary/30 transition-colors animate-fadeIn"
                >
                  <div className={`p-2 rounded-xl text-hn-white shrink-0 ${
                    act.type === 'donation' ? 'bg-hn-primary' : act.type === 'volunteer' ? 'bg-blue-500' : act.type === 'sponsor' ? 'bg-hn-accent' : 'bg-purple-500'
                  }`}>
                    {act.type === 'donation' ? <Coins className="w-4 h-4" /> : act.type === 'volunteer' ? <Users className="w-4 h-4" /> : act.type === 'sponsor' ? <Heart className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    {formatActivityText(act)}
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Impact;
