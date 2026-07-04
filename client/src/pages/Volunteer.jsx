import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { Calendar, UserCheck, Heart, Clock, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

const Volunteer = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orphanages, setOrphanages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form Fields State
  const [selectedOrphanage, setSelectedOrphanage] = useState('');
  const [visitDate, setVisitDate] = useState('');
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrphanages = async () => {
      try {
        const response = await API.get('/orphanages');
        setOrphanages(response.data);
      } catch (err) {
        console.error("Failed to load orphanages for volunteering:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrphanages();
  }, []);

  // Block selecting past dates by setting min date attribute to today
  const getMinDateString = () => {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yyyy = today.getFullYear();
    return `${yyyy}-${mm}-${dd}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setError('');
    
    if (!selectedOrphanage) {
      setError('Please select an orphanage center.');
      return;
    }
    if (!visitDate) {
      setError('Please select a visit date.');
      return;
    }
    if (!reason.trim() || reason.length < 15) {
      setError('Please write a short statement (min 15 characters) explaining why you wish to volunteer.');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/volunteers', {
        orphanageId: selectedOrphanage,
        visitDate,
        reason
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Submission failed. Please verify connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const getOrphanageName = () => {
    const target = orphanages.find(o => o._id === selectedOrphanage);
    return target ? target.name : '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Banner */}
      <section className="bg-hn-dark text-hn-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-hn-primary text-xs font-bold uppercase tracking-wider">
            Share Your Time and Skills
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-2 mb-4">
            Volunteer with HopeNest
          </h1>
          <p className="text-sm text-hn-secondary/70 max-w-xl mx-auto">
            Book visits to verified orphanages to teach, play, or help organize. Your presence makes a massive impact.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Info Sidebar Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm space-y-4">
            <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
              Volunteering Guidelines
            </h3>
            
            <div className="space-y-4 text-xs sm:text-sm text-hn-dark/70 dark:text-hn-secondary/75 leading-relaxed">
              <div className="flex gap-3">
                <Clock className="w-5 h-5 text-hn-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-hn-dark dark:text-hn-white">Admin Approval Required</p>
                  <p>All visit requests must be approved by the orphanage administrator before arrival.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Calendar className="w-5 h-5 text-hn-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-hn-dark dark:text-hn-white">Flexible Scheduling</p>
                  <p>Choose dates that match orphanage availability. Weekend visits are highly appreciated.</p>
                </div>
              </div>

              <div className="flex gap-3">
                <UserCheck className="w-5 h-5 text-hn-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-hn-dark dark:text-hn-white">Safety Measures</p>
                  <p>We mandate background validation. Please bring a government identity card for check-in.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Application Form Column */}
        <div className="lg:col-span-7">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-md">
            
            {success ? (
              <div className="text-center py-10 space-y-5">
                <div className="text-hn-accent flex justify-center">
                  <CheckCircle className="w-16 h-16 fill-current animate-bounce" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">Visit Scheduled!</h2>
                <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 leading-relaxed max-w-md mx-auto">
                  Your request to volunteer at <span className="font-semibold text-hn-dark dark:text-hn-white">{getOrphanageName()}</span> on <span className="font-semibold text-hn-primary">{new Date(visitDate).toDateString()}</span> has been submitted.
                </p>
                <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">
                  We sent a confirmation copy to your email inbox. The orphanage admin will review it shortly.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="py-2.5 px-6 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-xs font-semibold rounded-full shadow-sm"
                >
                  View Volunteer Schedule
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h2 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                  Submit Visit Request
                </h2>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Dropdown: Choose Orphanage */}
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                    Choose Target Orphanage *
                  </label>
                  {loading ? (
                    <div className="h-10 skeleton-loading rounded-xl" />
                  ) : (
                    <select
                      value={selectedOrphanage}
                      onChange={(e) => setSelectedOrphanage(e.target.value)}
                      className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
                    >
                      <option value="">-- Choose Orphanage --</option>
                      {orphanages.map(o => (
                        <option key={o._id} value={o._id}>{o.name} ({o.city})</option>
                      ))}
                    </select>
                  )}
                </div>

                {/* Date Picker */}
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                    Select Visit Date *
                  </label>
                  <input
                    type="date"
                    min={getMinDateString()}
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
                  />
                </div>

                {/* Motivation Textbox */}
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                    Why do you wish to volunteer? * (Min 15 characters)
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Describe what activities you wish to run, skills you can teach (e.g. sketching, coding, storytelling), or reasons you wish to spend time with the kids..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="w-full px-4 py-3 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white resize-none"
                  />
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Application'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

          </div>
        </div>

      </div>
    </div>
  );
};

export default Volunteer;
