import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { CheckCircle2, ChevronRight, FileText, Home as HomeIcon, Award, MessageSquare, ArrowRight } from 'lucide-react';

const Adoption = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const queryChildId = searchParams.get('childId') || '';

  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [success, setSuccess] = useState(false);

  // Form Fields State
  const [selectedChildId, setSelectedChildId] = useState(queryChildId);
  const [maritalStatus, setMaritalStatus] = useState('married');
  const [annualIncome, setAnnualIncome] = useState('');
  const [employment, setEmployment] = useState('');
  const [homeType, setHomeType] = useState('apartment');
  const [hasChildren, setHasChildren] = useState(false);
  const [motivation, setMotivation] = useState('');
  const [familyPhoto, setFamilyPhoto] = useState(''); // mock url
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchChildren = async () => {
      try {
        const response = await API.get('/children?adoptionStatus=available');
        setChildren(response.data);
        if (queryChildId) setSelectedChildId(queryChildId);
      } catch (err) {
        console.error("Failed to load adoptable children:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChildren();
  }, [queryChildId]);

  const getSelectedChild = () => {
    return children.find(c => c._id === selectedChildId);
  };

  const handleAdoptionSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate('/auth');
      return;
    }

    setError('');
    
    if (!selectedChildId) {
      setError('Please select the child you wish to adopt.');
      return;
    }
    if (!annualIncome || isNaN(annualIncome) || parseFloat(annualIncome) <= 0) {
      setError('Please enter a valid annual income.');
      return;
    }
    if (!employment.trim()) {
      setError('Please fill in your current employment details.');
      return;
    }
    if (!motivation.trim() || motivation.length < 30) {
      setError('Please expand your motivation statement (minimum 30 characters).');
      return;
    }

    setSubmitting(true);
    try {
      await API.post('/adoptions', {
        childId: selectedChildId,
        maritalStatus,
        annualIncome,
        employment,
        homeType,
        hasChildren,
        motivation,
        familyPhoto: familyPhoto || 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=600'
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || "Application submission failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Header Banner */}
      <section className="bg-hn-dark text-hn-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-wider text-hn-primary">
            A Journey of Love & Care
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-2 mb-4">
            Adoption Inquiry Application
          </h1>
          <p className="text-sm text-hn-secondary/70 max-w-xl mx-auto">
            Take a step to welcome a new member to your family. Follow our structured guidelines and submit details below.
          </p>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-12">
        
        {/* 1. PROCESS PIPELINE DESCRIPTIONS */}
        <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2 mb-6">
            Adoption Process (5 Steps)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            {/* Step 1 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-hn-primary uppercase">Step 1</span>
              <h4 className="font-serif font-bold text-sm text-hn-dark dark:text-hn-white">Submit Form</h4>
              <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60">Fill out background details, family descriptions, and child preference.</p>
            </div>
            
            {/* Step 2 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-hn-primary uppercase">Step 2</span>
              <h4 className="font-serif font-bold text-sm text-hn-dark dark:text-hn-white">Document Review</h4>
              <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60">Orphanage staff validates income certificates and family background.</p>
            </div>

            {/* Step 3 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-hn-primary uppercase">Step 3</span>
              <h4 className="font-serif font-bold text-sm text-hn-dark dark:text-hn-white">In-Person Interview</h4>
              <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60">Selected families are invited for physical interview discussions.</p>
            </div>

            {/* Step 4 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-hn-primary uppercase">Step 4</span>
              <h4 className="font-serif font-bold text-sm text-hn-dark dark:text-hn-white">Home Visit</h4>
              <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60">Social workers inspect residential parameters and safety checks.</p>
            </div>

            {/* Step 5 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-hn-primary uppercase">Step 5</span>
              <h4 className="font-serif font-bold text-sm text-hn-dark dark:text-hn-white">Final Approval</h4>
              <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60">Custody legalities are completed and child transitions home.</p>
            </div>
          </div>
        </div>

        {/* 2. FORM INTERFACE */}
        <div className="max-w-3xl mx-auto">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-md">
            
            {success ? (
              /* Success Card */
              <div className="text-center py-10 space-y-5">
                <div className="text-hn-accent flex justify-center">
                  <CheckCircle2 className="w-16 h-16 fill-current animate-bounce" />
                </div>
                <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">Application Received!</h2>
                <p className="text-sm text-hn-dark/70 dark:text-hn-secondary/70 max-w-md mx-auto leading-relaxed">
                  Your adoption inquiry has been logged. The orphanage administration will initiate verification reviews shortly.
                </p>
                <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">
                  We sent a confirmation copy to your email. You can monitor progress on your dashboard tracker.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="py-2.5 px-6 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-xs font-semibold rounded-full shadow-sm"
                >
                  Track Application Status
                </button>
              </div>
            ) : (
              /* Application Form */
              <form onSubmit={handleAdoptionSubmit} className="space-y-6">
                <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                  Adoption Application Details
                </h3>

                {error && (
                  <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl font-medium">
                    {error}
                  </div>
                )}

                {/* Step A: Select Child */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 block">
                    Choose Adoptable Child *
                  </label>
                  {loading ? (
                    <div className="h-10 skeleton-loading rounded-xl" />
                  ) : (
                    <div>
                      {queryChildId && getSelectedChild() ? (
                        <div className="flex items-center gap-4 bg-hn-secondary/10 dark:bg-hn-dark/40 p-4 rounded-2xl border border-hn-secondary/30">
                          <img
                            src={getSelectedChild().photo}
                            alt={getSelectedChild().firstName}
                            className="w-16 h-16 rounded-full object-cover shrink-0"
                          />
                          <div>
                            <h4 className="font-bold text-hn-dark dark:text-hn-white">{getSelectedChild().firstName}</h4>
                            <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-0.5">
                              Available • Age {getSelectedChild().age} • {getSelectedChild().gender}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setSelectedChildId('')}
                            className="ml-auto p-1 text-hn-dark/40 hover:bg-hn-secondary/50 rounded-full"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <select
                          value={selectedChildId}
                          onChange={(e) => setSelectedChildId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
                        >
                          <option value="">-- Choose child --</option>
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

                {/* Step B: Marital & Home details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                      Marital Status *
                    </label>
                    <select
                      value={maritalStatus}
                      onChange={(e) => setMaritalStatus(e.target.value)}
                      className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="married">Married Couple</option>
                      <option value="single">Single Individual</option>
                      <option value="widowed">Widowed</option>
                      <option value="divorced">Divorced</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                      Residential Home Type *
                    </label>
                    <select
                      value={homeType}
                      onChange={(e) => setHomeType(e.target.value)}
                      className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none"
                    >
                      <option value="apartment">Owned/Rented Apartment</option>
                      <option value="house">Individual House / Villa</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                {/* Step C: Income & Employment */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                      Annual Family Income (₹) *
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 1200000"
                      value={annualIncome}
                      onChange={(e) => setAnnualIncome(e.target.value)}
                      className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                      Employment & Job Position *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Senior Software Architect"
                      value={employment}
                      onChange={(e) => setEmployment(e.target.value)}
                      className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                    />
                  </div>
                </div>

                {/* Checkbox: existing kids */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="hasChildren"
                    checked={hasChildren}
                    onChange={(e) => setHasChildren(e.target.checked)}
                    className="w-4 h-4 rounded text-hn-primary accent-hn-primary cursor-pointer"
                  />
                  <label htmlFor="hasChildren" className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 cursor-pointer">
                    We currently have biological or adopted children living in our home
                  </label>
                </div>

                {/* Textbox: family photo URL */}
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                    Family Photo Image URL (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="Enter image URL showing family and residence space"
                    value={familyPhoto}
                    onChange={(e) => setFamilyPhoto(e.target.value)}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                  />
                </div>

                {/* Textarea: motivation */}
                <div className="relative">
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">
                    Describe your family motivation and residence space details * (Min 30 chars)
                  </label>
                  <div className="flex items-start">
                    <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-hn-dark/40 dark:text-hn-secondary/40" />
                    <textarea
                      rows="4"
                      placeholder="Share details of your home spacing, reasons you wish to adopt, and how you plan to support the child's growth and education..."
                      value={motivation}
                      onChange={(e) => setMotivation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white resize-none"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-sm font-semibold rounded-xl shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-1.5"
                >
                  {submitting ? 'Submitting Application...' : 'Submit Inquiry Application'}
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

export default Adoption;
