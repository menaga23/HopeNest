import React from 'react';
import { Coins, Gift, Heart, BookOpen, FileText, MessageSquare } from 'lucide-react';

/**
 * Reusable card to display a donation record (used in User Dashboard history/ledgers)
 */
const DonationCard = ({ donation, onViewReceipt }) => {
  const { type, amount, quantity, message, date, orphanageId } = donation;

  // Select matching category icon
  const getIcon = () => {
    switch (type) {
      case 'money':
        return <Coins className="w-5 h-5 text-hn-primary" />;
      case 'food':
        return <Gift className="w-5 h-5 text-hn-accent" />;
      case 'books':
        return <BookOpen className="w-5 h-5 text-purple-500" />;
      default:
        return <Heart className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="bg-hn-white dark:bg-hn-dark rounded-3xl p-5 border border-hn-secondary/30 dark:border-hn-dark/30 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
      
      {/* Top Header Row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-hn-secondary/40 dark:bg-hn-dark/50 shrink-0">
            {getIcon()}
          </div>
          <div>
            <h4 className="font-serif text-base font-bold text-hn-dark dark:text-hn-white line-clamp-1">
              {orphanageId?.name || 'Care Center'}
            </h4>
            <span className="text-[10px] text-hn-dark/50 dark:text-hn-secondary/50 font-mono block mt-0.5">
              {new Date(date).toDateString()}
            </span>
          </div>
        </div>

        {/* Amount Badge */}
        <span className="text-sm font-bold text-hn-primary bg-hn-primary/10 py-1 px-3.5 rounded-full border border-hn-primary/25">
          {type === 'money' ? `₹${amount.toLocaleString()}` : quantity}
        </span>
      </div>

      {/* Message notes */}
      {message && (
        <div className="mt-4 bg-hn-secondary/20 dark:bg-hn-dark/30 p-3 rounded-2xl border border-hn-secondary/15 flex items-start gap-2">
          <MessageSquare className="w-4 h-4 text-hn-dark/40 shrink-0 mt-0.5" />
          <p className="text-xs text-hn-dark/80 dark:text-hn-secondary/80 italic font-serif leading-relaxed">
            "{message}"
          </p>
        </div>
      )}

      {/* View Receipt action */}
      {onViewReceipt && (
        <div className="pt-4 mt-4 border-t border-hn-secondary/10 flex justify-end">
          <button
            onClick={() => onViewReceipt(donation)}
            className="text-xs font-semibold text-hn-accent hover:underline flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> View Receipt
          </button>
        </div>
      )}

    </div>
  );
};

export default DonationCard;
