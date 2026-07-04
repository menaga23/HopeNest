import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import confetti from 'canvas-confetti';
import { Heart, CheckCircle2, ShieldCheck, ArrowRight, X } from 'lucide-react';

const Sponsor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryChildId = searchParams.get('childId') || '';

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form selections
  const [selectedChildId, setSelectedChildId] = useState(queryChildId);
  const [selectedTier, setSelectedTier] = useState(1000); // default to ₹1000 tier
  const [customAmount, setCustomAmount] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await API.get('/children?sponsorStatus=available');
        setChildren(response.data);
        if (queryChildId) setSelectedChildId(queryChildId);
      } catch (err) {
        console.error("Failed to load sponsorable children list:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [queryChildId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const getSelectedChild = () => {
    return children.find(c => c._id === selectedChildId);
  };

  const getFinalAmount = () => {
    if (selectedTier === 'custom') {
      return parseFloat(customAmount) || 0;
    }
    return selectedTier;
  };

  const handleSponsorSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setError('');
    
    if (!selectedChildId) {
      setError('Please select a child to sponsor.');
      return;
    }

    const finalAmount = getFinalAmount();
    if (finalAmount < 100) {
      setError('Minimum sponsorship amount is ₹100.');
      return;
    }

    setSubmitting(true);
    try {
      await API.put(`/children/${selectedChildId}/sponsor`, {
        amount: finalAmount
      });
      
      triggerConfetti();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit sponsorship transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Header Banner */}
      <section className="bg-hn-primary text-hn-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider bg-hn-white/20 px-3.5 py-1 rounded-full mb-2 inline-block">
            Change a Life Monthly
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-1 mb-4 leading-tight">
            Sponsor a Child's Future
          </h1>
          <p className="text-sm text-hn-white/95 max-w-xl mx-auto">
            Provide continuous support. Monthly sponsorships cover essential meals, quality education, and medical checkups.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
        
        {success ? (
          /* SUCCESS STATE */
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-10 border border-hn-secondary/40 dark:border-hn-dark/40 shadow-xl max-w-xl mx-auto text-center space-y-6">
            <div className="text-hn-accent flex justify-center">
              <CheckCircle2 className="w-16 h-16 fill-current animate-bounce" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">Sponsorship Confirmed!</h2>
            
            {getSelectedChild() && (
              <div className="flex flex-col items-center">
                <img
                  src={getSelectedChild().photo}
                  alt={getSelectedChild().firstName}
                  className="w-24 h-24 rounded-full object-cover border-4 border-hn-primary shadow-md mb-3"
                />
                <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70">
                  You are now monthly sponsoring <span className="font-bold text-hn-dark dark:text-hn-white">{getSelectedChild().firstName}</span>.
                </p>
              </div>
            )}
            
            <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 max-w-sm mx-auto leading-relaxed">
              Your monthly support of <span className="font-bold text-hn-primary">₹{getFinalAmount()}</span> is successfully configured. We have sent a confirmation packet with progress updates to your email.
            </p>
            <div className="pt-4 flex gap-3 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="py-2.5 px-6 bg-hn-accent hover:bg-hn-accent/95 text-hn-white text-xs font-semibold rounded-full"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setSuccess(false);
                  setSelectedChildId('');
                  setCustomAmount('');
                }}
                className="py-2.5 px-6 border border-hn-secondary/50 dark:border-hn-dark/50 text-hn-dark dark:text-hn-secondary text-xs font-semibold rounded-full hover:bg-hn-secondary/20 dark:hover:bg-hn-dark/20"
              >
                Sponsor Another Child
              </button>
            </div>
          </div>
        ) : (
          /* FORM STATE */
          <form onSubmit={handleSponsorSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Left: Choose Child & Select Tiers */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Box 1: Select Child */}
              <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                  1. Choose a Child
                </h3>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="h-12 skeleton-loading rounded-xl" />
                ) : (
                  <div>
                    {queryChildId && getSelectedChild() ? (
                      /* URL Pre-selected preview */
                      <div className="flex items-center gap-4 bg-hn-secondary/20 dark:bg-hn-dark/40 p-4 rounded-2xl border border-hn-secondary/30">
                        <img
                          src={getSelectedChild().photo}
                          alt={getSelectedChild().firstName}
                          className="w-16 h-16 rounded-full object-cover shrink-0"
                        />
                        <div>
                          <h4 className="font-bold text-hn-dark dark:text-hn-white">{getSelectedChild().firstName}</h4>
                          <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-0.5">
                            Age {getSelectedChild().age} • {getSelectedChild().gender}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedChildId('')}
                          className="ml-auto p-1.5 hover:bg-hn-secondary/60 rounded-full text-hn-dark/50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      /* Catalogue list dropdown */
                      <select
                        value={selectedChildId}
                        onChange={(e) => setSelectedChildId(e.target.value)}
                        className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
                      >
                        <option value="">-- Choose child profile --</option>
                        {children.map(c => (
                          <option key={c._id} value={c._id}>
                            {c.firstName} (Age {c.age}, {c.gender}) • {c.orphanageId?.name}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                )}
              </div>

              {/* Box 2: Sponsorship Tiers */}
              <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                  2. Choose Sponsorship Tier
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Tier 500 */}
                  <div
                    onClick={() => setSelectedTier(500)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTier === 500
                        ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                        : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark dark:text-hn-secondary hover:border-hn-primary/40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-hn-dark/50 dark:text-hn-secondary/50 block mb-1">Basic Support</span>
                      <span className="text-3xl font-extrabold font-serif">₹500</span>
                      <span className="text-xs block mt-0.5">/ month</span>
                    </div>
                    <ul className="text-xs space-y-1.5 pt-4 text-hn-dark/70 dark:text-hn-secondary/70 border-t border-hn-secondary/20 mt-4">
                      <li>• Covers daily meals</li>
                      <li>• Clean drinking water</li>
                      <li>• Nutritional snacks</li>
                    </ul>
                  </div>

                  {/* Tier 1000 */}
                  <div
                    onClick={() => setSelectedTier(1000)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTier === 1000
                        ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                        : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark dark:text-hn-secondary hover:border-hn-primary/40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-hn-accent block mb-1">Recommended</span>
                      <span className="text-3xl font-extrabold font-serif">₹1,000</span>
                      <span className="text-xs block mt-0.5">/ month</span>
                    </div>
                    <ul className="text-xs space-y-1.5 pt-4 text-hn-dark/70 dark:text-hn-secondary/70 border-t border-hn-secondary/20 mt-4">
                      <li>• Covers daily meals</li>
                      <li>• Schooling & tuition</li>
                      <li>• Books & uniforms</li>
                    </ul>
                  </div>

                  {/* Tier 2000 */}
                  <div
                    onClick={() => setSelectedTier(2000)}
                    className={`border rounded-2xl p-5 cursor-pointer transition-all flex flex-col justify-between ${
                      selectedTier === 2000
                        ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                        : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark dark:text-hn-secondary hover:border-hn-primary/40'
                    }`}
                  >
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-hn-dark/50 dark:text-hn-secondary/50 block mb-1">Full Support</span>
                      <span className="text-3xl font-extrabold font-serif">₹2,000</span>
                      <span className="text-xs block mt-0.5">/ month</span>
                    </div>
                    <ul className="text-xs space-y-1.5 pt-4 text-hn-dark/70 dark:text-hn-secondary/70 border-t border-hn-secondary/20 mt-4">
                      <li>• Covers daily meals</li>
                      <li>• Schooling & materials</li>
                      <li>• Healthcare & checks</li>
                      <li>• Mental care support</li>
                    </ul>
                  </div>
                </div>

                {/* Custom tier selector */}
                <div className="pt-4 flex items-center gap-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 cursor-pointer">
                    <input
                      type="radio"
                      name="tier"
                      checked={selectedTier === 'custom'}
                      onChange={() => setSelectedTier('custom')}
                      className="accent-hn-primary"
                    />
                    <span>Custom Monthly Amount:</span>
                  </label>
                  {selectedTier === 'custom' && (
                    <input
                      type="number"
                      placeholder="Enter amount (₹)"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="w-40 pl-3 pr-2 py-1.5 bg-hn-secondary/20 border border-hn-primary rounded-lg text-xs focus:outline-none text-hn-dark"
                    />
                  )}
                </div>
              </div>

            </div>

            {/* Right: Checkout Summary Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-sm space-y-4">
                <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                  Summary
                </h3>

                <div className="space-y-4 text-xs sm:text-sm">
                  {getSelectedChild() && (
                    <div className="flex items-center gap-3 border-b border-hn-secondary/10 pb-3">
                      <img
                        src={getSelectedChild().photo}
                        alt={getSelectedChild().firstName}
                        className="w-12 h-12 rounded-full object-cover shrink-0"
                      />
                      <div>
                        <p className="font-bold text-hn-dark dark:text-hn-white">{getSelectedChild().firstName}</p>
                        <p className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50">Recp: {getSelectedChild().orphanageId?.name}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between font-medium">
                    <span className="text-hn-dark/60 dark:text-hn-secondary/60">Subscription cycle:</span>
                    <span className="text-hn-dark dark:text-hn-white">Monthly</span>
                  </div>

                  <div className="flex justify-between font-medium border-b border-hn-secondary/10 pb-3">
                    <span className="text-hn-dark/60 dark:text-hn-secondary/60">Amount:</span>
                    <span className="text-hn-dark dark:text-hn-white font-mono">₹{getFinalAmount()}/mo</span>
                  </div>

                  <div className="flex gap-2 text-[10px] text-hn-dark/50 dark:text-hn-secondary/50 pt-2 leading-relaxed">
                    <ShieldCheck className="w-4 h-4 text-hn-accent shrink-0 mt-0.5" />
                    <span>Your transaction details are encrypted. Monthly subscriptions can be paused or cancelled at any time on your dashboard.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 bg-hn-accent hover:bg-hn-accent/95 text-hn-white text-sm font-bold rounded-xl shadow-md transition-all disabled:opacity-50 mt-4 flex items-center justify-center gap-1.5"
                  >
                    {submitting ? 'Confirming...' : 'Sponsor Monthly'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};

export default Sponsor;
