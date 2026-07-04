import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import ChildCard from '../components/ChildCard';
import { SlidersHorizontal, Heart, ShieldAlert, X, Info } from 'lucide-react';

const Children = () => {
  const navigate = useNavigate();
  const [childrenList, setChildrenList] = useState([]);
  const [orphanages, setOrphanages] = useState([]);
  const [filteredChildren, setFilteredChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [ageRange, setAgeRange] = useState('');
  const [filterOrphanage, setFilterOrphanage] = useState('');
  const [filterSponsor, setFilterSponsor] = useState('');
  const [filterAdoption, setFilterAdoption] = useState('');

  // 1. Fetch children and orphanages
  useEffect(() => {
    const loadData = async () => {
      try {
        const [childRes, orphanageRes] = await Promise.all([
          API.get('/children'),
          API.get('/orphanages')
        ]);
        setChildrenList(childRes.data);
        setFilteredChildren(childRes.data);
        setOrphanages(orphanageRes.data);
      } catch (error) {
        console.error("Failed to load children catalogue data:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // 2. Apply Filters
  useEffect(() => {
    let result = childrenList;

    if (ageRange) {
      if (ageRange === 'under-5') {
        result = result.filter(c => c.age < 5);
      } else if (ageRange === '5-9') {
        result = result.filter(c => c.age >= 5 && c.age <= 9);
      } else if (ageRange === '10-plus') {
        result = result.filter(c => c.age >= 10);
      }
    }

    if (filterOrphanage) {
      result = result.filter(c => c.orphanageId?._id === filterOrphanage);
    }

    if (filterSponsor) {
      result = result.filter(c => c.sponsorStatus === filterSponsor);
    }

    if (filterAdoption) {
      result = result.filter(c => c.adoptionStatus === filterAdoption);
    }

    setFilteredChildren(result);
  }, [ageRange, filterOrphanage, filterSponsor, filterAdoption, childrenList]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60 pb-20 transition-colors duration-300">
      
      {/* Header Banner */}
      <section className="bg-hn-primary text-hn-white py-12 px-4 text-center">
        <div className="max-w-4xl mx-auto">
          <span className="bg-hn-white/20 px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-2 inline-block">
            Support Our Hearts
          </span>
          <h1 className="text-3xl sm:text-5xl font-serif font-extrabold mt-1 mb-4 leading-tight">
            Meet the Children
          </h1>
          <p className="text-sm text-hn-white/90 max-w-xl mx-auto leading-relaxed">
            Every child has a story. Browse profiles, support monthly sponsorships, or submit adoption inquiries.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* Filters Controls Panel */}
        <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-6 shadow-sm border border-hn-secondary/30 dark:border-hn-dark/30">
          <div className="flex items-center gap-2 mb-4 border-b border-hn-secondary/10 pb-3">
            <SlidersHorizontal className="w-5 h-5 text-hn-primary" />
            <h3 className="font-serif text-lg font-bold text-hn-dark dark:text-hn-white">Filter Profiles</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Age Range Select */}
            <div>
              <select
                value={ageRange}
                onChange={(e) => setAgeRange(e.target.value)}
                className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
              >
                <option value="">Age Group (All)</option>
                <option value="under-5">Toddlers (Under 5)</option>
                <option value="5-9">Kids (5 - 9 yrs)</option>
                <option value="10-plus">Teens (10+ yrs)</option>
              </select>
            </div>

            {/* Orphanage Home Select */}
            <div>
              <select
                value={filterOrphanage}
                onChange={(e) => setFilterOrphanage(e.target.value)}
                className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
              >
                <option value="">Orphanage Home (All)</option>
                {orphanages.map(o => (
                  <option key={o._id} value={o._id}>{o.name}</option>
                ))}
              </select>
            </div>

            {/* Sponsorship status select */}
            <div>
              <select
                value={filterSponsor}
                onChange={(e) => setFilterSponsor(e.target.value)}
                className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
              >
                <option value="">Sponsorship (All)</option>
                <option value="available">Available for Sponsorship</option>
                <option value="sponsored">Already Sponsored</option>
              </select>
            </div>

            {/* Adoption status select */}
            <div>
              <select
                value={filterAdoption}
                onChange={(e) => setFilterAdoption(e.target.value)}
                className="w-full px-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark/70 dark:text-hn-secondary/70"
              >
                <option value="">Adoption Status (All)</option>
                <option value="available">Available for Adoption</option>
                <option value="inquired">Inquiry Active</option>
                <option value="adopted">Adopted</option>
              </select>
            </div>
          </div>
        </div>

        {/* Profiles Grid */}
        <div>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-96 skeleton-loading rounded-3xl" />
              ))}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredChildren.map(c => (
                  <ChildCard key={c._id} child={c} onSelect={setSelectedChild} />
                ))}
              </div>

              {filteredChildren.length === 0 && (
                <div className="text-center py-20 bg-hn-white dark:bg-hn-dark rounded-3xl border border-dashed border-hn-secondary/50 dark:border-hn-dark/40">
                  <ShieldAlert className="w-12 h-12 text-hn-primary/40 mx-auto mb-3" />
                  <span className="text-sm font-semibold text-hn-dark/40 dark:text-white/40 block mb-2">No matching children profiles</span>
                  <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50">Try adjustments to filters or check back later.</p>
                </div>
              )}
            </>
          )}
        </div>

      </div>

      {/* 4. MODAL DETAIL POPUP */}
      {selectedChild && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-hn-dark/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="bg-hn-white dark:bg-hn-dark w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl border border-hn-secondary/40 dark:border-hn-dark/40 relative">
            
            {/* Close button */}
            <button
              onClick={() => setSelectedChild(null)}
              className="absolute top-4 right-4 z-10 p-2 bg-hn-dark/20 dark:bg-hn-white/20 text-hn-white dark:text-hn-white hover:bg-hn-dark/30 dark:hover:bg-hn-white/30 rounded-full transition-colors focus:outline-none"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Top Child Large Photo */}
            <div className="relative h-64 sm:h-80 overflow-hidden">
              <img
                src={selectedChild.photo}
                alt={selectedChild.firstName}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-hn-dark/80 via-transparent to-transparent flex items-end p-6">
                <div>
                  <h3 className="font-serif text-3xl font-bold text-hn-white">{selectedChild.firstName}</h3>
                  <p className="text-xs font-medium text-hn-white/95 mt-1.5 uppercase tracking-wide">
                    🏠 {selectedChild.orphanageId?.name} • {selectedChild.orphanageId?.city}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 sm:p-8 space-y-6">
              <div className="flex gap-3">
                <span className="bg-hn-primary/10 text-hn-primary text-xs font-semibold px-3.5 py-1.5 rounded-full border border-hn-primary/20">
                  {selectedChild.age} years old
                </span>
                <span className="bg-hn-accent/10 text-hn-accent text-xs font-semibold px-3.5 py-1.5 rounded-full border border-hn-accent/20 capitalize">
                  {selectedChild.gender}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-hn-dark/50 dark:text-hn-secondary/50 uppercase tracking-wider block mb-2">
                  His/Her Story
                </span>
                <p className="text-sm text-hn-dark/80 dark:text-hn-secondary/85 leading-relaxed font-sans">
                  {selectedChild.story}
                </p>
              </div>

              {/* Action Pathways */}
              <div className="pt-6 border-t border-hn-secondary/25 flex flex-col sm:flex-row gap-4">
                {selectedChild.sponsorStatus === 'available' ? (
                  <button
                    onClick={() => {
                      setSelectedChild(null);
                      navigate(`/sponsor?childId=${selectedChild._id}`);
                    }}
                    className="flex-1 py-3 bg-hn-accent hover:bg-hn-accent/95 text-hn-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
                  >
                    Sponsor Monthly <Heart className="w-4 h-4 fill-current" />
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-hn-secondary/40 dark:bg-hn-dark/50 border border-hn-secondary/20 dark:border-hn-dark/20 text-hn-dark/40 dark:text-hn-secondary/40 text-center rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                    Child sponsored
                  </div>
                )}

                {selectedChild.adoptionStatus === 'available' ? (
                  <button
                    onClick={() => {
                      setSelectedChild(null);
                      navigate(`/adoption?childId=${selectedChild._id}`);
                    }}
                    className="flex-1 py-3 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-sm font-bold rounded-xl transition-all duration-200 shadow-md flex items-center justify-center gap-1.5"
                  >
                    Inquire Adoption <Info className="w-4 h-4" />
                  </button>
                ) : (
                  <div className="flex-1 py-3 bg-hn-secondary/40 dark:bg-hn-dark/50 border border-hn-secondary/20 dark:border-hn-dark/20 text-hn-dark/40 dark:text-hn-secondary/40 text-center rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5">
                    Adoption Unavailable
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Children;
