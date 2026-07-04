import React from 'react';
import { Heart, Users } from 'lucide-react';

const ChildCard = ({ child, onSelect }) => {
  const { firstName, age, gender, photo, story, sponsorStatus, adoptionStatus, orphanageId } = child;

  const getSponsorBadge = () => {
    if (sponsorStatus === 'sponsored') {
      return <span className="bg-hn-accent/10 text-hn-accent border border-hn-accent/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Sponsored</span>;
    }
    return <span className="bg-hn-primary/10 text-hn-primary border border-hn-primary/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Needs Sponsor</span>;
  };

  const getAdoptionBadge = () => {
    switch (adoptionStatus) {
      case 'adopted':
        return <span className="bg-hn-dark/20 text-hn-dark/60 border border-hn-dark/10 dark:text-hn-secondary/60 text-[10px] font-bold px-2 py-0.5 rounded-full">Adopted</span>;
      case 'inquired':
        return <span className="bg-blue-100 text-blue-600 dark:bg-blue-950/20 dark:text-blue-400 border border-blue-200/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Inquiry Active</span>;
      default:
        return <span className="bg-hn-accent/10 text-hn-accent border border-hn-accent/30 text-[10px] font-bold px-2 py-0.5 rounded-full">Adoptable</span>;
    }
  };

  return (
    <div 
      onClick={() => onSelect(child)}
      className="bg-hn-white dark:bg-hn-dark rounded-3xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300 cursor-pointer group"
    >
      {/* Photo Frame */}
      <div className="relative h-56 overflow-hidden">
        <img
          src={photo || 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400'}
          alt={firstName}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 flex flex-col gap-1">
          {getSponsorBadge()}
          {getAdoptionBadge()}
        </div>
      </div>

      {/* Details Box */}
      <div className="p-5 flex-grow flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white">
              {firstName}
            </h3>
            <span className="text-xs font-semibold text-hn-dark/60 dark:text-hn-secondary/60">
              {age} yrs • {gender}
            </span>
          </div>
          
          <span className="text-[10px] font-bold text-hn-primary uppercase tracking-wider block mb-2">
            🏠 {orphanageId?.name || 'Care Home'}
          </span>

          <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60 line-clamp-3 leading-relaxed">
            {story}
          </p>
        </div>

        {/* Call to action text indicator */}
        <div className="pt-4 border-t border-hn-secondary/10 mt-4 flex items-center justify-between text-xs font-bold text-hn-primary">
          <span>Read story & details</span>
          <Heart className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" />
        </div>
      </div>

    </div>
  );
};

export default ChildCard;
