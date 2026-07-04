import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Users, Heart, Phone, Mail } from 'lucide-react';

const OrphanageCard = ({ orphanage }) => {
  const { _id, name, city, address, photos, needs, capacity, currentChildren, contact } = orphanage;
  const mainPhoto = photos && photos.length > 0 ? photos[0] : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600';

  // Get high priority needs
  const urgentNeeds = needs ? needs.filter(n => n.priority === 'high') : [];

  return (
    <div className="bg-hn-white dark:bg-hn-dark rounded-3xl border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
      
      {/* Top Image Frame */}
      <div className="relative h-48 overflow-hidden group">
        <img
          src={mainPhoto}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4 bg-hn-primary/95 text-hn-white text-[11px] font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
          <MapPin className="w-3 h-3" /> {city}
        </div>
      </div>

      {/* Main Details */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div className="space-y-3">
          <h3 className="font-serif text-xl font-bold text-hn-dark dark:text-hn-white line-clamp-1">
            {name}
          </h3>
          <p className="text-xs text-hn-dark/60 dark:text-hn-secondary/60 line-clamp-2 leading-relaxed">
            {orphanage.description}
          </p>

          <p className="text-[11px] text-hn-dark/50 dark:text-hn-secondary/50 flex items-center gap-1.5">
            <span className="font-semibold">Addr:</span> {address}
          </p>

          {/* Children Capacity Bar */}
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs font-medium text-hn-dark/70 dark:text-hn-secondary/70">
              <span className="flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-hn-primary" /> Capacity
              </span>
              <span>{currentChildren} / {capacity} kids</span>
            </div>
            <div className="w-full h-2 bg-hn-secondary/40 dark:bg-hn-dark/50 rounded-full overflow-hidden">
              <div 
                className="h-full bg-hn-accent rounded-full transition-all duration-300"
                style={{ width: `${Math.min((currentChildren / capacity) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Urgent Needs Badges */}
          {urgentNeeds.length > 0 && (
            <div className="pt-2">
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-1">
                🚨 Urgent Needs:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {urgentNeeds.map((need, idx) => (
                  <span 
                    key={idx} 
                    className="text-[10px] font-semibold text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200/30 dark:border-red-900/30 py-0.5 px-2 rounded-md"
                  >
                    {need.item} ({need.quantity})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Button Link */}
        <div className="pt-6 mt-4 border-t border-hn-secondary/20 flex gap-2">
          <Link
            to={`/donate?orphanageId=${_id}`}
            className="flex-1 text-center text-xs font-semibold text-hn-white bg-hn-primary hover:bg-hn-primary/95 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1 shadow-sm"
          >
            Help Now <Heart className="w-3.5 h-3.5 fill-current" />
          </Link>
          <a
            href={`tel:${contact.phone}`}
            className="p-2.5 border border-hn-secondary/40 dark:border-hn-dark/40 hover:bg-hn-secondary/30 dark:hover:bg-hn-dark/30 rounded-full text-hn-dark dark:text-hn-secondary transition-colors"
            title="Call Orphanage"
          >
            <Phone className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

    </div>
  );
};

export default OrphanageCard;
