import React, { useState, useEffect } from 'react';
import API from '../utils/api';
import { useAuth } from '../hooks/useAuth';
import DonationCard from '../components/DonationCard';
import { Coins, Calendar, Heart, FileText, Settings, User as UserIcon, LogOut, CheckCircle, Clock, XCircle, Printer } from 'lucide-react';

const UserDashboard = () => {
  const { user, updateProfile, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('donations');
  const [donations, setDonations] = useState([]);
  const [volunteerSchedules, setVolunteerSchedules] = useState([]);
  const [sponsoredChildren, setSponsoredChildren] = useState([]);
  const [adoptionInquiries, setAdoptionInquiries] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Profile Edit fields
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
    photo: user?.photo || ''
  });
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSubmitting, setProfileSubmitting] = useState(false);

  // Selected receipt modal state
  const [selectedReceipt, setSelectedReceipt] = useState(null);

  useEffect(() => {
    const fetchDashboardDetails = async () => {
      try {
        const [donationsRes, volunteerRes, adoptionsRes, childrenRes] = await Promise.all([
          API.get('/donations/my'),
          API.get('/volunteers/my'),
          API.get('/adoptions/my'),
          API.get('/children?sponsorStatus=sponsored') // filter clientside by sponsoredBy
        ]);
        
        setDonations(donationsRes.data);
        setVolunteerSchedules(volunteerRes.data);
        setAdoptionInquiries(adoptionsRes.data);
        
        // Filter sponsored children where sponsoredBy equals current user's ID
        const myKids = childrenRes.data.filter(c => c.sponsoredBy === user?.id || c.sponsoredBy === user?._id);
        setSponsoredChildren(myKids);
      } catch (error) {
        console.error("Failed to load user dashboard lists:", error);
      } finally {
        setLoadingData(false);
      }
    };

    if (user) {
      fetchDashboardDetails();
    }
  }, [user]);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    setProfileSubmitting(true);

    const res = await updateProfile(profileForm);
    setProfileSubmitting(false);
    if (res.success) {
      setProfileSuccess(true);
    } else {
      setProfileError(res.error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
      case 'interview':
        return <CheckCircle className="w-4 h-4 text-hn-accent" />;
      case 'rejected':
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-hn-primary animate-pulse" />;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
      case 'interview':
        return 'bg-hn-accent/10 text-hn-accent border-hn-accent/20';
      case 'rejected':
        return 'bg-red-50 text-red-600 border-red-200 dark:bg-red-950/20 dark:text-red-400';
      default:
        return 'bg-hn-primary/10 text-hn-primary border-hn-primary/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Top Banner */}
      <section className="bg-hn-dark text-hn-white py-12 px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-hn-primary flex items-center justify-center text-hn-white shrink-0 overflow-hidden border-2 border-hn-primary">
            {user?.photo ? (
              <img src={user.photo} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <UserIcon className="w-10 h-10" />
            )}
          </div>
          <div>
            <span className="text-hn-primary text-xs font-bold uppercase tracking-wider">Donor & Volunteer Account</span>
            <h1 className="text-3xl font-serif font-extrabold mt-1">{user?.name}</h1>
            <p className="text-xs text-hn-secondary/70 mt-1">{user?.email} • Member since {new Date(user?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      {/* Main Dashboard Workspace */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Sidebar Navigation */}
        <div className="lg:col-span-3 space-y-4">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-4 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex flex-col gap-1">
            <button
              onClick={() => setActiveTab('donations')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'donations' 
                  ? 'bg-hn-primary text-hn-white shadow-sm' 
                  : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
              }`}
            >
              <Coins className="w-5 h-5" /> Donations History
            </button>

            <button
              onClick={() => setActiveTab('volunteer')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'volunteer' 
                  ? 'bg-hn-primary text-hn-white shadow-sm' 
                  : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
              }`}
            >
              <Calendar className="w-5 h-5" /> Volunteer Schedule
            </button>

            <button
              onClick={() => setActiveTab('sponsored')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'sponsored' 
                  ? 'bg-hn-primary text-hn-white shadow-sm' 
                  : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
              }`}
            >
              <Heart className="w-5 h-5" /> Sponsored Kids
            </button>

            <button
              onClick={() => setActiveTab('adoption')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'adoption' 
                  ? 'bg-hn-primary text-hn-white shadow-sm' 
                  : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
              }`}
            >
              <FileText className="w-5 h-5" /> Adoption Inquiries
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                activeTab === 'settings' 
                  ? 'bg-hn-primary text-hn-white shadow-sm' 
                  : 'text-hn-dark/80 dark:text-hn-secondary/80 hover:bg-hn-secondary/40 dark:hover:bg-hn-dark/40'
              }`}
            >
              <Settings className="w-5 h-5" /> Edit Profile
            </button>
          </div>
        </div>

        {/* Right Details Workspace */}
        <div className="lg:col-span-9">
          <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-8 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm min-h-[460px]">
            
            {loadingData ? (
              <div className="space-y-6">
                <div className="h-10 skeleton-loading rounded-xl" />
                <div className="h-32 skeleton-loading rounded-2xl" />
              </div>
            ) : (
              <>
                {/* 1. TAB: DONATIONS HISTORY */}
                {activeTab === 'donations' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Donations ledger
                    </h3>
                    
                    {donations.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 py-8">You haven't made any donations yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {donations.map((don) => (
                          <DonationCard 
                            key={don._id} 
                            donation={don} 
                            onViewReceipt={setSelectedReceipt} 
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 2. TAB: VOLUNTEER SCHEDULES */}
                {activeTab === 'volunteer' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Volunteering Bookings
                    </h3>

                    {volunteerSchedules.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 py-8">No scheduled volunteer visits.</p>
                    ) : (
                      <div className="space-y-4">
                        {volunteerSchedules.map((vol) => (
                          <div key={vol._id} className="p-5 rounded-2xl bg-hn-secondary/15 dark:bg-hn-dark/40 border border-hn-secondary/25 dark:border-hn-dark/25 flex flex-col sm:flex-row justify-between gap-4">
                            <div className="space-y-2">
                              <span className="text-[10px] font-bold text-hn-primary uppercase">visit booking</span>
                              <h4 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">{vol.orphanageId?.name}</h4>
                              <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 font-mono">Date: {new Date(vol.visitDate).toDateString()}</p>
                              <p className="text-xs text-hn-dark/70 dark:text-hn-secondary/70">Reason: "{vol.reason}"</p>
                              
                              {vol.adminNote && (
                                <div className="text-xs bg-hn-white dark:bg-hn-dark/50 p-3 rounded-lg border border-hn-secondary/15">
                                  <span className="font-bold text-hn-primary block mb-0.5">Admin Comment:</span>
                                  <p className="italic">"{vol.adminNote}"</p>
                                </div>
                              )}
                            </div>
                            
                            <div className="shrink-0 flex items-start">
                              <div className={`flex items-center gap-1 text-xs font-bold border py-1.5 px-3 rounded-full uppercase tracking-wider ${getStatusBadgeClass(vol.status)}`}>
                                {getStatusIcon(vol.status)} {vol.status}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 3. TAB: SPONSORED CHILDREN */}
                {activeTab === 'sponsored' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      My Sponsored Children
                    </h3>

                    {sponsoredChildren.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 py-8">You are not monthly sponsoring any children yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {sponsoredChildren.map((kid) => (
                          <div key={kid._id} className="bg-hn-secondary/10 dark:bg-hn-dark/40 rounded-2xl border border-hn-secondary/20 p-5 flex gap-4">
                            <img
                              src={kid.photo}
                              alt={kid.firstName}
                              className="w-16 h-16 rounded-full object-cover shrink-0 border-2 border-hn-primary shadow-sm"
                            />
                            <div className="space-y-1">
                              <h4 className="font-serif text-base font-bold text-hn-dark dark:text-hn-white">{kid.firstName}</h4>
                              <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">Age {kid.age} • {kid.gender}</p>
                              <p className="text-[10px] text-hn-accent bg-hn-accent/10 border border-hn-accent/20 w-fit px-2 py-0.5 rounded-full font-bold uppercase">
                                Active Sponsor
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 4. TAB: ADOPTION INQUIRIES */}
                {activeTab === 'adoption' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Adoption Application Status
                    </h3>

                    {adoptionInquiries.length === 0 ? (
                      <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 py-8">No active adoption applications.</p>
                    ) : (
                      <div className="space-y-6">
                        {adoptionInquiries.map((inq) => (
                          <div key={inq._id} className="p-6 rounded-2xl bg-hn-secondary/15 dark:bg-hn-dark/40 border border-hn-secondary/25 flex flex-col md:flex-row justify-between gap-6">
                            
                            {/* Left details */}
                            <div className="space-y-3 flex-grow">
                              <div className="flex items-center gap-3">
                                {inq.childId?.photo && (
                                  <img src={inq.childId.photo} alt={inq.childId.firstName} className="w-12 h-12 rounded-full object-cover border-2 border-hn-primary shadow-sm" />
                                )}
                                <div>
                                  <h4 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">Adoption Inquiry: {inq.childId?.firstName}</h4>
                                  <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">Recipient: {inq.childId?.orphanageId?.name}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-xs bg-hn-white dark:bg-hn-dark/50 p-4 rounded-xl border border-hn-secondary/15">
                                <p><span className="font-semibold text-hn-dark/60 dark:text-hn-secondary/60">Marital status:</span> {inq.familyDetails?.maritalStatus}</p>
                                <p><span className="font-semibold text-hn-dark/60 dark:text-hn-secondary/60">Home type:</span> {inq.familyDetails?.homeType}</p>
                                <p><span className="font-semibold text-hn-dark/60 dark:text-hn-secondary/60">Annual income:</span> ₹{inq.familyDetails?.annualIncome?.toLocaleString()}</p>
                                <p><span className="font-semibold text-hn-dark/60 dark:text-hn-secondary/60">Employment:</span> {inq.familyDetails?.employment}</p>
                              </div>

                              {inq.notes && (
                                <div className="text-xs italic bg-hn-white dark:bg-hn-dark/50 p-3 rounded-lg border border-hn-secondary/15">
                                  <span className="font-bold text-hn-primary block mb-0.5">Orphanage comments:</span>
                                  "{inq.notes}"
                                </div>
                              )}
                            </div>

                            {/* Right Status steps */}
                            <div className="shrink-0 flex flex-col justify-between items-end gap-4 min-w-[160px]">
                              <div className={`flex items-center gap-1 text-xs font-bold border py-1.5 px-3 rounded-full uppercase tracking-wider ${getStatusBadgeClass(inq.status)}`}>
                                {getStatusIcon(inq.status)} {inq.status}
                              </div>
                              <span className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50 font-mono">Applied: {new Date(inq.appliedDate).toLocaleDateString()}</span>
                            </div>

                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* 5. TAB: PROFILE SETTINGS */}
                {activeTab === 'settings' && (
                  <div className="space-y-6">
                    <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white border-b border-hn-secondary/15 pb-2">
                      Profile Settings
                    </h3>

                    {profileSuccess && (
                      <div className="bg-hn-accent/10 border border-hn-accent/30 text-hn-accent text-xs px-4 py-3 rounded-xl font-medium">
                        Profile information updated successfully!
                      </div>
                    )}
                    {profileError && (
                      <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl font-medium">
                        {profileError}
                      </div>
                    )}

                    <form onSubmit={handleProfileSubmit} className="space-y-4 max-w-xl">
                      {/* Name */}
                      <div>
                        <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Full Name</label>
                        <input
                          type="text"
                          required
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                        />
                      </div>

                      {/* Phone */}
                      <div>
                        <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Phone Number</label>
                        <input
                          type="tel"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                        />
                      </div>

                      {/* Photo */}
                      <div>
                        <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Profile Photo URL</label>
                        <input
                          type="text"
                          placeholder="Enter image URL"
                          value={profileForm.photo}
                          onChange={(e) => setProfileForm({ ...profileForm, photo: e.target.value })}
                          className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                        />
                      </div>

                      {/* Address */}
                      <div>
                        <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Street Address</label>
                        <input
                          type="text"
                          value={profileForm.address}
                          onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                          className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={profileSubmitting}
                        className="py-2.5 px-6 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-xs font-semibold rounded-xl shadow-md transition-all disabled:opacity-50"
                      >
                        {profileSubmitting ? 'Updating...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            )}

          </div>
        </div>

      </div>

      {/* 5. RECEIPT MODAL POPUP */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-hn-dark/60 backdrop-blur-sm">
          <div className="bg-hn-white w-full max-w-sm rounded-3xl p-6 shadow-2xl relative text-hn-dark font-sans border-2 border-hn-primary/20">
            
            {/* Close */}
            <button
              onClick={() => setSelectedReceipt(null)}
              className="absolute top-4 right-4 p-1 hover:bg-hn-secondary/60 rounded-full text-hn-dark/50"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Receipt Header details */}
            <div className="text-center border-b border-dashed border-hn-secondary pb-4 mb-4">
              <h4 className="font-serif text-xl font-extrabold text-hn-primary">HopeNest</h4>
              <p className="text-[10px] text-hn-dark/50 uppercase tracking-widest mt-0.5">Donation Receipt</p>
            </div>

            {/* Receipt details list */}
            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between">
                <span className="text-hn-dark/50">Receipt ID:</span>
                <span className="font-mono font-bold">{selectedReceipt._id.substring(selectedReceipt._id.length - 8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hn-dark/50">Date:</span>
                <span className="font-mono font-bold">{new Date(selectedReceipt.date).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hn-dark/50">Orphanage:</span>
                <span className="font-bold">{selectedReceipt.orphanageId?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-hn-dark/50">Category Type:</span>
                <span className="font-bold uppercase">{selectedReceipt.type}</span>
              </div>
              <div className="flex justify-between border-t border-hn-secondary/20 pt-3">
                <span className="text-hn-dark/50 font-semibold">Total Contribution:</span>
                <span className="text-base font-extrabold text-hn-primary">
                  {selectedReceipt.type === 'money' ? `₹${selectedReceipt.amount}` : selectedReceipt.quantity}
                </span>
              </div>
              
              {selectedReceipt.message && (
                <div className="pt-2 border-t border-hn-secondary/15">
                  <span className="text-[10px] text-hn-dark/50 block mb-0.5">Donor Note:</span>
                  <p className="italic text-hn-dark/70 font-serif">"{selectedReceipt.message}"</p>
                </div>
              )}
            </div>

            {/* Receipt Footer stamp */}
            <div className="mt-8 text-center border-t border-dashed border-hn-secondary/30 pt-4 text-[10px] text-hn-dark/40 space-y-3">
              <p>Thank you for making a difference. HopeNest is a certified non-profit organization.</p>
              <button
                onClick={() => window.print()}
                className="py-1.5 px-4 border border-hn-secondary/50 hover:bg-hn-secondary/30 rounded-full font-bold flex items-center gap-1 mx-auto"
              >
                <Printer className="w-3.5 h-3.5" /> Print Receipt
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default UserDashboard;
