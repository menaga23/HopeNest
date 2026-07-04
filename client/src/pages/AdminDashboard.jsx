import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, Users, Heart, ClipboardList, Coins, ShieldAlert, CheckCircle, XCircle, Trash2, Plus, Info, Printer } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useAuth();
  
  // State
  const [orphanage, setOrphanage] = useState(null);
  const [children, setChildren] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [adoptions, setAdoptions] = useState([]);
  const [donations, setDonations] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // 1. Setup Orphanage registration form state (for admins without one)
  const [setupForm, setSetupForm] = useState({
    name: '',
    description: '',
    address: '',
    city: '',
    capacity: '40',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [setupError, setSetupError] = useState('');
  const [setupSubmitting, setSetupSubmitting] = useState(false);

  // 2. Add Child Form State
  const [childForm, setChildForm] = useState({
    firstName: '',
    age: '',
    gender: 'male',
    photo: '',
    story: ''
  });
  const [childError, setChildError] = useState('');
  const [childSuccess, setChildSuccess] = useState(false);
  const [childSubmitting, setChildSubmitting] = useState(false);

  // 3. Needs form state (for updating urgent needs list)
  const [needInput, setNeedInput] = useState({ item: '', quantity: '', priority: 'medium' });

  // 4. Action states (for accept/reject forms)
  const [reviewNote, setReviewNote] = useState({}); // stores notes keyed by request ID
  const [actionSubmitting, setActionSubmitting] = useState({});

  useEffect(() => {
    const fetchOrphanageAndMetrics = async () => {
      try {
        // Query admin's orphanage (with all=true to fetch even unapproved ones)
        const orphRes = await API.get(`/orphanages?adminId=${user?.id || user?._id}&all=true`);
        
        if (orphRes.data && orphRes.data.length > 0) {
          const activeOrph = orphRes.data[0];
          setOrphanage(activeOrph);

          // Fetch related metrics inside this orphanage
          const [childrenRes, volsRes, adopsRes, donsRes] = await Promise.all([
            API.get(`/children?orphanageId=${activeOrph._id}`),
            API.get(`/volunteers/orphanage/${activeOrph._id}`),
            API.get(`/adoptions/orphanage/${activeOrph._id}`),
            API.get(`/donations/orphanage/${activeOrph._id}`)
          ]);

          setChildren(childrenRes.data);
          setVolunteers(volsRes.data);
          setAdoptions(adopsRes.data);
          setDonations(donsRes.data);
        }
      } catch (err) {
        console.error("Failed to load orphanage admin metrics:", err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchOrphanageAndMetrics();
    }
  }, [user]);

  // Handle Orphanage registration setup
  const handleSetupSubmit = async (e) => {
    e.preventDefault();
    setSetupError('');
    setSetupSubmitting(true);

    try {
      const res = await API.post('/orphanages', {
        ...setupForm,
        contact: { phone: setupForm.phone, email: setupForm.email }
      });
      setOrphanage(res.data);
    } catch (err) {
      setSetupError(err.response?.data?.error || "Registration failed. Try again.");
    } finally {
      setSetupSubmitting(false);
    }
  };

  // Handle adding child profiles
  const handleAddChild = async (e) => {
    e.preventDefault();
    setChildError('');
    setChildSuccess(false);
    setChildSubmitting(true);

    if (!childForm.firstName || !childForm.age || !childForm.story || !childForm.photo) {
      setChildError("All child profile fields are required.");
      setChildSubmitting(false);
      return;
    }

    try {
      const res = await API.post('/children', {
        ...childForm,
        orphanageId: orphanage._id
      });
      setChildren([...children, res.data]);
      setChildSuccess(true);
      setChildForm({ firstName: '', age: '', gender: 'male', photo: '', story: '' });
    } catch (err) {
      setChildError(err.response?.data?.error || "Failed to create child record.");
    } finally {
      setChildSubmitting(false);
    }
  };

  // Delete child profile
  const handleDeleteChild = async (childId) => {
    if (!window.confirm("Are you sure you want to delete this child profile?")) return;
    try {
      await API.delete(`/children/${childId}`);
      setChildren(children.filter(c => c._id !== childId));
    } catch (err) {
      alert("Failed to delete child record.");
    }
  };

  // Handle posting/adding urgent needs items
  const handleAddNeed = async (e) => {
    e.preventDefault();
    if (!needInput.item || !needInput.quantity) return;

    const updatedNeeds = [...(orphanage.needs || []), needInput];
    try {
      const res = await API.put(`/orphanages/${orphanage._id}`, { needs: updatedNeeds });
      setOrphanage(res.data);
      setNeedInput({ item: '', quantity: '', priority: 'medium' });
    } catch (err) {
      alert("Failed to post need.");
    }
  };

  // Delete need item
  const handleDeleteNeed = async (needIdx) => {
    const updatedNeeds = orphanage.needs.filter((_, idx) => idx !== needIdx);
    try {
      const res = await API.put(`/orphanages/${orphanage._id}`, { needs: updatedNeeds });
      setOrphanage(res.data);
    } catch (err) {
      alert("Failed to delete need.");
    }
  };

  // Update volunteer booking status
  const handleVolunteerStatus = async (volId, newStatus) => {
    setActionSubmitting({ ...actionSubmitting, [volId]: true });
    try {
      const note = reviewNote[volId] || '';
      const res = await API.put(`/volunteers/${volId}/status`, {
        status: newStatus,
        adminNote: note
      });
      setVolunteers(volunteers.map(v => v._id === volId ? { ...v, status: res.data.status, adminNote: res.data.adminNote } : v));
      setReviewNote({ ...reviewNote, [volId]: '' });
    } catch (err) {
      alert("Failed to update status.");
    } finally {
      setActionSubmitting({ ...actionSubmitting, [volId]: false });
    }
  };

  // Update adoption application status
  const handleAdoptionStatus = async (adopId, newStatus) => {
    setActionSubmitting({ ...actionSubmitting, [adopId]: true });
    try {
      const note = reviewNote[adopId] || '';
      const res = await API.put(`/adoptions/${adopId}/status`, {
        status: newStatus,
        notes: note
      });
      setAdoptions(adoptions.map(a => a._id === adopId ? { ...a, status: res.data.status, notes: res.data.notes } : a));
      setReviewNote({ ...reviewNote, [adopId]: '' });
    } catch (err) {
      alert("Failed to update adoption status.");
    } finally {
      setActionSubmitting({ ...actionSubmitting, [adopId]: false });
    }
  };

  // Calculations for overview stats
  const getDonationsTotalAmount = () => {
    return donations.filter(d => d.type === 'money').reduce((sum, d) => sum + d.amount, 0);
  };

  const getPendingVolsCount = () => {
    return volunteers.filter(v => v.status === 'pending').length;
  };

  const getPendingAdoptionsCount = () => {
    return adoptions.filter(a => a.status === 'applied' || a.status === 'review').length;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-hn-white dark:bg-hn-dark">
        <div className="w-12 h-12 rounded-full border-4 border-hn-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300 print:bg-white">
      
      {/* ------------------- SCENARIO A: NO ORPHANAGE REGISTERED ------------------- */}
      {!orphanage ? (
        <div className="max-w-2xl mx-auto py-16 px-4">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/35 dark:border-hn-dark/35 shadow-xl space-y-6">
            <div className="text-center">
              <div className="bg-hn-primary/10 text-hn-primary p-3 rounded-full w-fit mx-auto mb-3">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">Register Your Orphanage</h2>
              <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-1">
                Before accessing your dashboard, please register the details of the orphanage you manage.
              </p>
            </div>

            {setupError && (
              <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl font-medium">
                {setupError}
              </div>
            )}

            <form onSubmit={handleSetupSubmit} className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Orphanage Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Grace Meadows Home"
                    value={setupForm.name}
                    onChange={(e) => setSetupForm({ ...setupForm, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">City Location *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bengaluru"
                    value={setupForm.city}
                    onChange={(e) => setSetupForm({ ...setupForm, city: e.target.value })}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 12, Indiranagar 100ft Road"
                  value={setupForm.address}
                  onChange={(e) => setSetupForm({ ...setupForm, address: e.target.value })}
                  className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Short Description *</label>
                <textarea
                  rows="3"
                  required
                  placeholder="Describe your orphanage's history, mission, and focus..."
                  value={setupForm.description}
                  onChange={(e) => setSetupForm({ ...setupForm, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Total Capacity *</label>
                  <input
                    type="number"
                    required
                    value={setupForm.capacity}
                    onChange={(e) => setSetupForm({ ...setupForm, capacity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none text-hn-dark"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Contact Phone *</label>
                  <input
                    type="tel"
                    required
                    value={setupForm.phone}
                    onChange={(e) => setSetupForm({ ...setupForm, phone: e.target.value })}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none text-hn-dark"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Contact Email *</label>
                  <input
                    type="email"
                    required
                    value={setupForm.email}
                    onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                    className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none text-hn-dark"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={setupSubmitting}
                className="w-full py-3 bg-hn-primary hover:bg-hn-primary/95 text-hn-white font-bold rounded-xl shadow-md disabled:opacity-50 mt-4"
              >
                {setupSubmitting ? 'Registering...' : 'Register Orphanage'}
              </button>
            </form>
          </div>
        </div>
      ) : (
        /* ------------------- SCENARIO B: ORPHANAGE IS MANAGED ------------------- */
        <>
          {/* Dashboard Header banner */}
          <section className="bg-hn-dark text-hn-white py-12 px-4 print:hidden">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-hn-primary text-xs font-bold uppercase tracking-wider">Orphanage Administration Dashboard</span>
                  {!orphanage.isApproved && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-500 uppercase tracking-widest bg-red-50 dark:bg-red-950/20 py-0.5 px-2.5 rounded-full border border-red-200/30">
                      Pending Approval
                    </span>
                  )}
                </div>
                <h1 className="text-3xl font-serif font-extrabold mt-1">{orphanage.name}</h1>
                <p className="text-xs text-hn-secondary/70 mt-1">📍 {orphanage.address} • City: {orphanage.city}</p>
              </div>
              <div className="text-xs text-hn-secondary/60">
                Managed by <span className="font-semibold text-hn-primary">{user?.name}</span>
              </div>
            </div>
          </section>

          {/* Setup dashboard container */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8 print:mt-0 print:p-0">
            
            {/* Sidebar Left Navigation */}
            <div className="lg:col-span-3 space-y-4 print:hidden">
              <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-4 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex flex-col gap-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'overview' 
                      ? 'bg-hn-primary text-hn-white shadow-sm' 
                      : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
                  }`}
                >
                  <LayoutDashboard className="w-5 h-5" /> Overview & Needs
                </button>

                <button
                  onClick={() => setActiveTab('children')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'children' 
                      ? 'bg-hn-primary text-hn-white shadow-sm' 
                      : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
                  }`}
                >
                  <Users className="w-5 h-5" /> Children Manager
                </button>

                <button
                  onClick={() => setActiveTab('volunteers')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'volunteers' 
                      ? 'bg-hn-primary text-hn-white shadow-sm' 
                      : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
                  }`}
                >
                  <ClipboardList className="w-5 h-5" /> Volunteer Requests ({getPendingVolsCount()})
                </button>

                <button
                  onClick={() => setActiveTab('adoptions')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'adoptions' 
                      ? 'bg-hn-primary text-hn-white shadow-sm' 
                      : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
                  }`}
                >
                  <Heart className="w-5 h-5" /> Adoptions Portal ({getPendingAdoptionsCount()})
                </button>

                <button
                  onClick={() => setActiveTab('donations')}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                    activeTab === 'donations' 
                      ? 'bg-hn-primary text-hn-white shadow-sm' 
                      : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
                  }`}
                >
                  <Coins className="w-5 h-5" /> Donations Logs
                </button>
              </div>
            </div>

            {/* Right workspace details */}
            <div className="lg:col-span-9 print:col-span-12">
              <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm min-h-[480px]">
                
                {/* 1. TAB: OVERVIEW & NEEDS */}
                {activeTab === 'overview' && (
                  <div className="space-y-8 print:hidden">
                    {/* Metrics Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div className="bg-hn-secondary/20 dark:bg-hn-dark/50 border border-hn-secondary/20 rounded-2xl p-5">
                        <span className="text-[10px] font-bold text-hn-primary uppercase">Received Funds</span>
                        <h4 className="text-2xl font-bold font-mono mt-1">₹{getDonationsTotalAmount().toLocaleString()}</h4>
                      </div>
                      <div className="bg-hn-secondary/20 dark:bg-hn-dark/50 border border-hn-secondary/20 rounded-2xl p-5">
                        <span className="text-[10px] font-bold text-hn-primary uppercase">Pending Visits</span>
                        <h4 className="text-2xl font-bold font-mono mt-1">{getPendingVolsCount()} visits</h4>
                      </div>
                      <div className="bg-hn-secondary/20 dark:bg-hn-dark/50 border border-hn-secondary/20 rounded-2xl p-5">
                        <span className="text-[10px] font-bold text-hn-primary uppercase">Pending Adoptions</span>
                        <h4 className="text-2xl font-bold font-mono mt-1">{getPendingAdoptionsCount()} applications</h4>
                      </div>
                    </div>

                    {/* Needs Poster Section */}
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Form: Add Need */}
                      <div className="md:col-span-5 space-y-4">
                        <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                          Post Urgent Need
                        </h3>
                        <form onSubmit={handleAddNeed} className="space-y-4 text-xs">
                          <div>
                            <label className="font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Item Name</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Diapers (Medium)"
                              value={needInput.item}
                              onChange={(e) => setNeedInput({ ...needInput, item: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Required Quantity</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. 50 packs"
                              value={needInput.quantity}
                              onChange={(e) => setNeedInput({ ...needInput, quantity: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none"
                            />
                          </div>

                          <div>
                            <label className="font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1 block">Priority Level</label>
                            <select
                              value={needInput.priority}
                              onChange={(e) => setNeedInput({ ...needInput, priority: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl focus:outline-none"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-hn-primary hover:bg-hn-primary/95 text-hn-white font-bold rounded-xl"
                          >
                            Post Need
                          </button>
                        </form>
                      </div>

                      {/* Current Needs List */}
                      <div className="md:col-span-7 space-y-4">
                        <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                          Active Needs Checklist
                        </h3>
                        
                        {(!orphanage.needs || orphanage.needs.length === 0) ? (
                          <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">No items listed. Post a need on the left.</p>
                        ) : (
                          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {orphanage.needs.map((need, idx) => (
                              <div key={idx} className="flex justify-between items-center p-3 bg-hn-secondary/20 dark:bg-hn-dark/40 border border-hn-secondary/15 rounded-xl text-xs">
                                <div>
                                  <h4 className="font-bold text-hn-dark dark:text-hn-white">{need.item}</h4>
                                  <span className={`text-[9px] font-bold uppercase ${need.priority === 'high' ? 'text-red-500' : 'text-hn-dark/50'}`}>
                                    {need.priority} priority
                                  </span>
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold bg-hn-primary/10 text-hn-primary py-0.5 px-2 rounded">
                                    {need.quantity}
                                  </span>
                                  <button
                                    onClick={() => handleDeleteNeed(idx)}
                                    className="text-red-500 hover:bg-red-50 p-1.5 rounded-full"
                                    title="Delete need"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. TAB: CHILDREN MANAGER */}
                {activeTab === 'children' && (
                  <div className="space-y-8 print:hidden">
                    
                    {/* Add Child Form */}
                    <div className="bg-hn-secondary/10 dark:bg-hn-dark/40 rounded-3xl p-6 border border-hn-secondary/25">
                      <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2 mb-4">
                        Add Child Profile
                      </h3>

                      {childSuccess && (
                        <div className="bg-hn-accent/10 border border-hn-accent/35 text-hn-accent text-xs px-4 py-3 rounded-xl mb-4 font-medium">
                          Child profile successfully uploaded!
                        </div>
                      )}
                      {childError && (
                        <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 text-red-600 text-xs px-4 py-3 rounded-xl mb-4 font-medium">
                          {childError}
                        </div>
                      )}

                      <form onSubmit={handleAddChild} className="space-y-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                          <div>
                            <label className="font-semibold mb-1 block">First Name *</label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Liam"
                              value={childForm.firstName}
                              onChange={(e) => setChildForm({ ...childForm, firstName: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="font-semibold mb-1 block">Age (Years) *</label>
                            <input
                              type="number"
                              required
                              placeholder="e.g. 5"
                              value={childForm.age}
                              onChange={(e) => setChildForm({ ...childForm, age: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl"
                            />
                          </div>
                          <div>
                            <label className="font-semibold mb-1 block">Gender *</label>
                            <select
                              value={childForm.gender}
                              onChange={(e) => setChildForm({ ...childForm, gender: e.target.value })}
                              className="w-full px-4 py-2.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl"
                            >
                              <option value="male">Male</option>
                              <option value="female">Female</option>
                              <option value="other">Other</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="font-semibold mb-1 block">Photo Image URL *</label>
                          <input
                            type="text"
                            required
                            placeholder="Enter image URL"
                            value={childForm.photo}
                            onChange={(e) => setChildForm({ ...childForm, photo: e.target.value })}
                            className="w-full px-4 py-2.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl"
                          />
                        </div>

                        <div>
                          <label className="font-semibold mb-1 block">Biography Story *</label>
                          <textarea
                            rows="3"
                            required
                            placeholder="Describe their background, interests, and future goals..."
                            value={childForm.story}
                            onChange={(e) => setChildForm({ ...childForm, story: e.target.value })}
                            className="w-full px-4 py-2.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-xl resize-none"
                          />
                        </div>

                        <button
                          type="submit"
                          disabled={childSubmitting}
                          className="py-2.5 px-6 bg-hn-accent hover:bg-hn-accent/95 text-hn-white font-bold rounded-xl shadow-sm"
                        >
                          {childSubmitting ? 'Uploading...' : 'Upload Profile'}
                        </button>
                      </form>
                    </div>

                    {/* Children List */}
                    <div className="space-y-4">
                      <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                        Registered Children ({children.length})
                      </h3>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {children.map((c) => (
                          <div key={c._id} className="p-4 rounded-2xl bg-hn-secondary/10 dark:bg-hn-dark/40 border border-hn-secondary/15 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <img src={c.photo} alt={c.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-hn-primary shrink-0 shadow-sm" />
                              <div>
                                <h4 className="font-serif font-bold text-hn-dark dark:text-hn-white">{c.firstName}</h4>
                                <p className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50">Age {c.age} • {c.gender}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleDeleteChild(c._id)}
                              className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-full"
                              title="Delete profile"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. TAB: VOLUNTEERS REVIEW */}
                {activeTab === 'volunteers' && (
                  <div className="space-y-6 print:hidden">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Volunteer Visit Requests
                    </h3>

                    {volunteers.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">No volunteer visit registrations logged.</p>
                    ) : (
                      <div className="space-y-6">
                        {volunteers.map((vol) => (
                          <div key={vol._id} className="p-6 rounded-2xl bg-hn-secondary/15 dark:bg-hn-dark/40 border border-hn-secondary/25 flex flex-col md:flex-row justify-between gap-6 text-xs sm:text-sm">
                            
                            <div className="space-y-3 flex-grow">
                              <div className="flex items-center gap-3">
                                {vol.userId?.photo ? (
                                  <img src={vol.userId.photo} alt={vol.userId.name} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                  <div className="w-10 h-10 rounded-full bg-hn-primary/20 flex items-center justify-center text-hn-primary font-bold">
                                    {vol.userId?.name?.charAt(0)}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-serif font-bold text-hn-dark dark:text-hn-white">{vol.userId?.name}</h4>
                                  <p className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50">{vol.userId?.email} • {vol.userId?.phone}</p>
                                </div>
                              </div>

                              <div className="bg-hn-white dark:bg-hn-dark/50 p-4 rounded-xl border border-hn-secondary/15 space-y-2">
                                <p><span className="font-bold text-hn-primary">Scheduled Date:</span> <span className="font-mono">{new Date(vol.visitDate).toDateString()}</span></p>
                                <p><span className="font-bold text-hn-primary">Reason Statement:</span> "{vol.reason}"</p>
                              </div>

                              {vol.status === 'pending' ? (
                                <div className="pt-2 space-y-2">
                                  <input
                                    type="text"
                                    placeholder="Add comment / location note (Optional)"
                                    value={reviewNote[vol._id] || ''}
                                    onChange={(e) => setReviewNote({ ...reviewNote, [vol._id]: e.target.value })}
                                    className="w-full px-3 py-1.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-lg text-xs"
                                  />
                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => handleVolunteerStatus(vol._id, 'approved')}
                                      disabled={actionSubmitting[vol._id]}
                                      className="py-1.5 px-4 bg-hn-accent text-hn-white text-xs font-bold rounded-lg shadow-sm"
                                    >
                                      Approve
                                    </button>
                                    <button
                                      onClick={() => handleVolunteerStatus(vol._id, 'rejected')}
                                      disabled={actionSubmitting[vol._id]}
                                      className="py-1.5 px-4 bg-red-500 text-hn-white text-xs font-bold rounded-lg shadow-sm"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs bg-hn-white dark:bg-hn-dark/30 p-3 rounded-lg border border-hn-secondary/15 flex justify-between items-center">
                                  <p><span className="font-bold">Status note:</span> "{vol.adminNote || 'No comment added'}"</p>
                                  <span className={`font-bold uppercase ${vol.status === 'approved' ? 'text-hn-accent' : 'text-red-500'}`}>{vol.status}</span>
                                </div>
                              )}
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TAB: ADOPTIONS PORTAL */}
                {activeTab === 'adoptions' && (
                  <div className="space-y-6 print:hidden">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Adoption inquiries
                    </h3>

                    {adoptions.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">No adoption inquiry applications logged.</p>
                    ) : (
                      <div className="space-y-6">
                        {adoptions.map((adop) => (
                          <div key={adop._id} className="p-6 rounded-2xl bg-hn-secondary/15 dark:bg-hn-dark/40 border border-hn-secondary/25 flex flex-col md:flex-row gap-6 text-xs sm:text-sm">
                            
                            {/* Applicant specs */}
                            <div className="space-y-3 flex-grow">
                              <div className="flex items-center gap-3">
                                <img src={adop.familyPhoto} alt="Family photo" className="w-14 h-14 rounded-full object-cover border-2 border-hn-primary shadow-sm" />
                                <div>
                                  <h4 className="font-serif font-bold text-hn-dark dark:text-hn-white">Applicant: {adop.familyId?.name}</h4>
                                  <p className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50">Email: {adop.familyId?.email} • Phone: {adop.familyId?.phone}</p>
                                  <p className="text-[10px] text-hn-primary font-bold">Adoptive Child Choice: {adop.childId?.firstName}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 bg-hn-white dark:bg-hn-dark/50 p-4 rounded-xl border border-hn-secondary/15">
                                <p><span className="font-semibold text-hn-dark/60">Marital status:</span> {adop.familyDetails?.maritalStatus}</p>
                                <p><span className="font-semibold text-hn-dark/60">Home type:</span> {adop.familyDetails?.homeType}</p>
                                <p><span className="font-semibold text-hn-dark/60">Annual income:</span> ₹{adop.familyDetails?.annualIncome?.toLocaleString()}</p>
                                <p><span className="font-semibold text-hn-dark/60">Employment:</span> {adop.familyDetails?.employment}</p>
                                <p className="col-span-2"><span className="font-semibold text-hn-dark/60 block mb-1">Motivation story:</span> "{adop.familyDetails?.motivation}"</p>
                              </div>

                              {/* Action selection */}
                              <div className="pt-3 space-y-2 border-t border-hn-secondary/10">
                                <input
                                  type="text"
                                  placeholder="Update comment note / schedule interview details"
                                  value={reviewNote[adop._id] || ''}
                                  onChange={(e) => setReviewNote({ ...reviewNote, [adop._id]: e.target.value })}
                                  className="w-full px-3 py-1.5 bg-hn-white dark:bg-hn-dark/30 border border-hn-secondary/40 rounded-lg text-xs"
                                />
                                <div className="flex flex-wrap gap-2">
                                  <button
                                    onClick={() => handleAdoptionStatus(adop._id, 'review')}
                                    className="py-1 px-3 bg-hn-primary text-hn-white text-xs font-semibold rounded-lg"
                                  >
                                    Move to Review
                                  </button>
                                  <button
                                    onClick={() => handleAdoptionStatus(adop._id, 'interview')}
                                    className="py-1 px-3 bg-blue-500 text-hn-white text-xs font-semibold rounded-lg"
                                  >
                                    Schedule Interview
                                  </button>
                                  <button
                                    onClick={() => handleAdoptionStatus(adop._id, 'approved')}
                                    className="py-1 px-3 bg-hn-accent text-hn-white text-xs font-semibold rounded-lg"
                                  >
                                    Approve Adoption
                                  </button>
                                  <button
                                    onClick={() => handleAdoptionStatus(adop._id, 'rejected')}
                                    className="py-1 px-3 bg-red-500 text-hn-white text-xs font-semibold rounded-lg"
                                  >
                                    Reject
                                  </button>
                                </div>
                              </div>
                            </div>

                            {/* Right active status indicator */}
                            <div className="shrink-0 flex flex-col justify-between items-end min-w-[140px]">
                              <span className="font-bold text-hn-primary uppercase bg-hn-primary/10 py-1 px-3 rounded-full border border-hn-primary/20">
                                {adop.status}
                              </span>
                              <span className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50 font-mono">Date: {new Date(adop.appliedDate).toLocaleDateString()}</span>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. TAB: DONATIONS LOGS & REPORTS */}
                {activeTab === 'donations' && (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center border-b border-hn-secondary/15 pb-2 print:hidden">
                      <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white">
                        Donations Ledger Reports
                      </h3>
                      <button
                        onClick={() => window.print()}
                        className="py-1.5 px-4 bg-hn-primary text-hn-white text-xs font-semibold rounded-full flex items-center gap-1.5"
                      >
                        <Printer className="w-3.5 h-3.5" /> Print Ledger
                      </button>
                    </div>

                    <div className="hidden print:block text-center mb-6">
                      <h2 className="text-2xl font-serif font-bold text-hn-dark">{orphanage.name} - Donation Ledger</h2>
                      <p className="text-[10px] text-gray-500">Total Funds Collected: ₹{getDonationsTotalAmount().toLocaleString()}</p>
                    </div>

                    {donations.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 py-6">No donations logged yet.</p>
                    ) : (
                      <div className="overflow-x-auto text-xs sm:text-sm">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-hn-secondary/20 text-xs text-hn-dark/50 dark:text-hn-secondary/50 uppercase font-bold">
                              <th className="py-2.5 px-3">Date</th>
                              <th className="py-2.5 px-3">Donor</th>
                              <th className="py-2.5 px-3">Type</th>
                              <th className="py-2.5 px-3">Detail</th>
                              <th className="py-2.5 px-3 print:hidden">Message</th>
                            </tr>
                          </thead>
                          <tbody>
                            {donations.map((don) => (
                              <tr key={don._id} className="border-b border-hn-secondary/10 hover:bg-hn-secondary/5 dark:hover:bg-hn-dark/30">
                                <td className="py-3 px-3 font-mono text-[10px]">{new Date(don.date).toLocaleDateString()}</td>
                                <td className="py-3 px-3 font-semibold text-hn-dark dark:text-hn-white">{don.donorId?.name}</td>
                                <td className="py-3 px-3 uppercase text-[10px]">{don.type}</td>
                                <td className="py-3 px-3 font-bold text-hn-primary">
                                  {don.type === 'money' ? `₹${don.amount}` : don.quantity}
                                </td>
                                <td className="py-3 px-3 italic text-hn-dark/60 dark:text-hn-secondary/60 print:hidden max-w-xs truncate">
                                  {don.message || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}

              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
};

export default AdminDashboard;
