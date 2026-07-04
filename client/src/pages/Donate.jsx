import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import confetti from 'canvas-confetti';
import { Heart, Coins, Gift, BookOpen, MessageSquare, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';

const Donate = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // URL Pre-population
  const queryOrphanageId = searchParams.get('orphanageId') || '';
  const queryType = searchParams.get('type') || '';

  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // Form states
  const [selectedOrphanage, setSelectedOrphanage] = useState(queryOrphanageId);
  const [donationType, setDonationType] = useState(queryType || 'money');
  const [amount, setAmount] = useState('1000'); // for money type
  const [quantity, setQuantity] = useState(''); // for items type
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrphanages = async () => {
      try {
        const response = await API.get('/orphanages');
        setOrphanages(response.data);
        if (queryOrphanageId) setSelectedOrphanage(queryOrphanageId);
      } catch (err) {
        console.error("Failed to load orphanages for donation wizard:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrphanages();
  }, [queryOrphanageId]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
  };

  const handleNext = () => {
    setError('');
    if (step === 1 && !selectedOrphanage) {
      setError('Please select a recipient orphanage to proceed.');
      return;
    }
    if (step === 2 && !donationType) {
      setError('Please select a donation category.');
      return;
    }
    if (step === 3) {
      if (donationType === 'money' && (!amount || isNaN(amount) || parseFloat(amount) <= 0)) {
        setError('Please enter a valid donation amount.');
        return;
      }
      if (donationType !== 'money' && !quantity.trim()) {
        setError('Please enter the items list and quantity description.');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!user) {
      navigate('/auth');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      await API.post('/donations', {
        orphanageId: selectedOrphanage,
        type: donationType,
        amount: donationType === 'money' ? amount : 0,
        quantity: donationType !== 'money' ? quantity : '',
        message
      });

      triggerConfetti();
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Transaction submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOrphanageName = () => {
    const target = orphanages.find(o => o._id === selectedOrphanage);
    return target ? target.name : '';
  };

  return (
    <div className="min-h-screen py-16 px-4 bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 transition-colors duration-300">
      
      <div className="w-full max-w-2xl bg-hn-white dark:bg-hn-dark rounded-3xl border border-hn-secondary/40 dark:border-hn-dark/40 shadow-xl p-8 mx-auto transition-all">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="bg-hn-primary/10 text-hn-primary p-3 rounded-full w-fit mx-auto mb-3">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h1 className="font-serif text-3xl font-bold text-hn-dark dark:text-hn-white">Make a Donation</h1>
          <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-1">
            Provide warmth, nourishment, education, or financial support directly to orphanages.
          </p>
        </div>

        {/* Stepper Status Indicators */}
        {!success && (
          <div className="flex justify-between items-center mb-10 max-w-md mx-auto">
            {[1, 2, 3, 4].map(idx => (
              <React.Fragment key={idx}>
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold transition-all duration-300 ${
                  step === idx
                    ? 'bg-hn-primary text-hn-white scale-110 shadow-md'
                    : step > idx
                      ? 'bg-hn-accent text-hn-white'
                      : 'bg-hn-secondary/60 dark:bg-hn-dark/50 text-hn-dark/50 dark:text-hn-secondary/50'
                }`}>
                  {idx}
                </div>
                {idx < 4 && (
                  <div className={`flex-1 h-0.5 mx-2 transition-colors duration-300 ${
                    step > idx ? 'bg-hn-accent' : 'bg-hn-secondary/40 dark:bg-hn-dark/30'
                  }`} />
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl mb-6 font-medium">
            {error}
          </div>
        )}

        {/* ----------------- SUCCESS VIEW ----------------- */}
        {success ? (
          <div className="text-center py-10 space-y-6">
            <div className="text-hn-accent flex justify-center">
              <CheckCircle className="w-20 h-20 fill-current animate-bounce" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">Thank you for your kindness!</h2>
            <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 max-w-md mx-auto leading-relaxed">
              Your donation of <span className="font-bold text-hn-primary">{donationType === 'money' ? `₹${amount}` : quantity}</span> to <span className="font-semibold text-hn-dark dark:text-hn-white">{getOrphanageName()}</span> has been recorded.
            </p>
            <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">
              A receipt confirmation copy has been sent to your email. You can check it under your dashboard.
            </p>
            <div className="pt-4 flex gap-4 justify-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="py-2.5 px-6 bg-hn-accent hover:bg-hn-accent/95 text-hn-white text-xs font-semibold rounded-full shadow-sm"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => {
                  setStep(1);
                  setSuccess(false);
                  setQuantity('');
                  setMessage('');
                }}
                className="py-2.5 px-6 border border-hn-secondary/50 dark:border-hn-dark/50 text-hn-dark dark:text-hn-secondary text-xs font-semibold rounded-full hover:bg-hn-secondary/20 dark:hover:bg-hn-dark/20"
              >
                Donate Again
              </button>
            </div>
          </div>
        ) : (
          /* ----------------- STEPPER SECTIONS ----------------- */
          <div className="min-h-60 flex flex-col justify-between">
            <div>
              {/* STEP 1: Select Orphanage */}
              {step === 1 && (
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-hn-dark dark:text-hn-white block">
                    Choose Recipient Orphanage *
                  </label>
                  {loading ? (
                    <div className="h-12 skeleton-loading rounded-xl" />
                  ) : (
                    <select
                      value={selectedOrphanage}
                      onChange={(e) => setSelectedOrphanage(e.target.value)}
                      className="w-full px-4 py-3 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
                    >
                      <option value="">-- Select Orphanage Center --</option>
                      {orphanages.map(o => (
                        <option key={o._id} value={o._id}>{o.name} ({o.city})</option>
                      ))}
                    </select>
                  )}
                  <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 pt-2 leading-relaxed">
                    Donations made on this platform go directly to the management structure of the verified orphanage you specify.
                  </p>
                </div>
              )}

              {/* STEP 2: Choose Donation Category */}
              {step === 2 && (
                <div className="space-y-4">
                  <label className="text-sm font-semibold text-hn-dark dark:text-hn-white block">
                    Choose Donation Category *
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Category: Money */}
                    <button
                      type="button"
                      onClick={() => setDonationType('money')}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        donationType === 'money'
                          ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                          : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70 hover:border-hn-primary/50'
                      }`}
                    >
                      <Coins className="w-8 h-8" />
                      <span className="text-sm font-bold">Money</span>
                    </button>

                    {/* Category: Food */}
                    <button
                      type="button"
                      onClick={() => setDonationType('food')}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        donationType === 'food'
                          ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                          : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70 hover:border-hn-primary/50'
                      }`}
                    >
                      <Gift className="w-8 h-8" />
                      <span className="text-sm font-bold">Food</span>
                    </button>

                    {/* Category: Clothes */}
                    <button
                      type="button"
                      onClick={() => setDonationType('clothes')}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        donationType === 'clothes'
                          ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                          : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70 hover:border-hn-primary/50'
                      }`}
                    >
                      <Heart className="w-8 h-8" />
                      <span className="text-sm font-bold">Clothes</span>
                    </button>

                    {/* Category: Books */}
                    <button
                      type="button"
                      onClick={() => setDonationType('books')}
                      className={`p-6 rounded-2xl border text-center transition-all flex flex-col items-center gap-2 ${
                        donationType === 'books'
                          ? 'border-hn-primary bg-hn-primary/5 text-hn-primary shadow-sm'
                          : 'border-hn-secondary/40 dark:border-hn-dark/40 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70 hover:border-hn-primary/50'
                      }`}
                    >
                      <BookOpen className="w-8 h-8" />
                      <span className="text-sm font-bold">Books</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Enter Details / Amount */}
              {step === 3 && (
                <div className="space-y-6">
                  {donationType === 'money' ? (
                    /* MONEY INPUTS */
                    <div className="space-y-4 animate-fadeIn">
                      <label className="text-sm font-semibold text-hn-dark dark:text-hn-white block">
                        Select / Enter Amount (₹) *
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {['500', '1000', '2000', '5000'].map(val => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => setAmount(val)}
                            className={`py-3 rounded-xl border text-xs font-bold transition-colors ${
                              amount === val
                                ? 'bg-hn-primary border-hn-primary text-hn-white'
                                : 'bg-hn-secondary/25 border-hn-secondary/40 dark:border-hn-dark/40 text-hn-dark/80 dark:text-hn-secondary/80'
                            }`}
                          >
                            ₹{val}
                          </button>
                        ))}
                      </div>
                      <input
                        type="number"
                        placeholder="Or enter custom amount in Rupees"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full px-4 py-3.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                      />
                    </div>
                  ) : (
                    /* PHYSICAL ITEMS QUANTITY */
                    <div className="space-y-4 animate-fadeIn">
                      <label className="text-sm font-semibold text-hn-dark dark:text-hn-white block">
                        Specify Items List & Quantity *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 50 kg Rice, 15 packs of medium diapers"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-3.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                      />
                      <p className="text-[11px] text-hn-dark/50 dark:text-hn-secondary/50 leading-relaxed">
                        Please include detailed item summaries. An administrator will review details and schedule a pick-up/drop-off.
                      </p>
                    </div>
                  )}

                  {/* Optional Message */}
                  <div className="relative">
                    <label className="text-sm font-semibold text-hn-dark dark:text-hn-white block mb-1.5">
                      Add a Warm Message (Optional)
                    </label>
                    <div className="flex items-start">
                      <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-hn-dark/40 dark:text-hn-secondary/40" />
                      <textarea
                        rows="3"
                        placeholder="Leave a short note of encouragement for the children or orphanage team..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: Confirm summary */}
              {step === 4 && (
                <div className="space-y-6">
                  <h3 className="text-sm font-semibold text-hn-dark dark:text-hn-white block">
                    Review and Confirm Details
                  </h3>
                  
                  <div className="bg-hn-secondary/25 dark:bg-hn-dark/30 border border-hn-secondary/20 dark:border-hn-dark/20 rounded-2xl p-6 text-sm space-y-4">
                    <div className="flex justify-between border-b border-hn-secondary/15 pb-2">
                      <span className="text-hn-dark/60 dark:text-hn-secondary/60">Recipient Orphanage:</span>
                      <span className="font-bold text-hn-dark dark:text-hn-white">{getOrphanageName()}</span>
                    </div>
                    <div className="flex justify-between border-b border-hn-secondary/15 pb-2">
                      <span className="text-hn-dark/60 dark:text-hn-secondary/60">Category Type:</span>
                      <span className="font-bold uppercase text-hn-dark dark:text-hn-white">{donationType}</span>
                    </div>
                    <div className="flex justify-between border-b border-hn-secondary/15 pb-2">
                      <span className="text-hn-dark/60 dark:text-hn-secondary/60">
                        {donationType === 'money' ? 'Amount:' : 'Quantity/Items:'}
                      </span>
                      <span className="font-bold text-hn-primary">
                        {donationType === 'money' ? `₹${amount}` : quantity}
                      </span>
                    </div>
                    {message && (
                      <div className="text-xs">
                        <span className="text-hn-dark/60 dark:text-hn-secondary/60 block mb-1">Your Message:</span>
                        <p className="italic text-hn-dark/80 dark:text-hn-secondary/80 bg-hn-white dark:bg-hn-dark/50 p-3 rounded-lg border border-hn-secondary/10">
                          "{message}"
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <p className="text-[11px] text-hn-dark/50 dark:text-hn-secondary/50 text-center leading-relaxed">
                    By confirming, you agree to dispatch the transaction details. Live Socket feeds will alert the platform.
                  </p>
                </div>
              )}
            </div>

            {/* Stepper Navigation Buttons */}
            <div className="flex justify-between pt-10 border-t border-hn-secondary/20 mt-8">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={handleBack}
                  className="flex items-center gap-1 text-xs font-semibold py-2.5 px-6 border border-hn-secondary/40 dark:border-hn-dark/40 text-hn-dark dark:text-hn-secondary rounded-full hover:bg-hn-secondary/20 dark:hover:bg-hn-dark/20"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>
              ) : (
                <div /> // empty placeholder for layout alignment
              )}

              {step < 4 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-1 text-xs font-semibold py-2.5 px-6 bg-hn-primary hover:bg-hn-primary/95 text-hn-white rounded-full shadow-sm"
                >
                  Next <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-1 text-xs font-bold py-2.5 px-8 bg-hn-accent hover:bg-hn-accent/95 text-hn-white rounded-full shadow-md disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Confirm & Donate'}
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Donate;
