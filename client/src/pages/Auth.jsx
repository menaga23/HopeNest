import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Heart, User, Mail, Lock, Phone, MapPin, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const { login, register, user } = useAuth();
  const navigate = useNavigate();
  
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Form Fields State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'public'
  });

  // Redirect if already authenticated
  React.useEffect(() => {
    if (user) {
      navigate(user.role === 'public' ? '/dashboard' : '/admin');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
      const res = await login(formData.email, formData.password);
      setLoading(false);
      if (res.success) {
        navigate(res.user.role === 'public' ? '/dashboard' : '/admin');
      } else {
        setError(res.error);
      }
    } else {
      // Validate inputs
      if (!formData.name || !formData.email || !formData.password) {
        setError('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const res = await register(formData);
      setLoading(false);
      if (res.success) {
        navigate(res.user.role === 'public' ? '/dashboard' : '/admin');
      } else {
        setError(res.error);
      }
    }
  };

  return (
    <div className="min-h-screen py-16 px-4 flex items-center justify-center bg-gradient-to-br from-hn-secondary via-hn-white to-hn-secondary/30 dark:from-hn-dark/30 dark:via-hn-dark dark:to-hn-dark/60">
      <div className="w-full max-w-lg bg-hn-white dark:bg-hn-dark rounded-3xl shadow-xl border border-hn-secondary/40 dark:border-hn-dark/40 p-8 relative overflow-hidden transition-all duration-300">
        
        {/* Logo Icon Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="bg-hn-primary p-3 rounded-full text-hn-white mb-3 shadow-md">
            <Heart className="w-6 h-6 fill-current animate-pulse" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-hn-dark dark:text-hn-white">
            {isLogin ? 'Welcome Back to HopeNest' : 'Create an Account'}
          </h2>
          <p className="text-xs text-hn-dark/50 dark:text-hn-secondary/50 mt-1.5 text-center">
            {isLogin 
              ? 'Sign in to access your donations history, volunteering dates, and applications.'
              : 'Join as a donor, volunteer, or register your orphanage administrator account.'
            }
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-hn-secondary/40 dark:bg-hn-dark/50 p-1.5 rounded-full mb-6">
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
              isLogin 
                ? 'bg-hn-primary text-hn-white shadow-sm' 
                : 'text-hn-dark dark:text-hn-secondary hover:text-hn-primary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            className={`flex-1 text-center py-2 text-sm font-semibold rounded-full transition-all duration-200 ${
              !isLogin 
                ? 'bg-hn-primary text-hn-white shadow-sm' 
                : 'text-hn-dark dark:text-hn-secondary hover:text-hn-primary'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Notification Alert */}
        {error && (
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 text-xs px-4 py-3 rounded-xl mb-4 font-medium">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* 1. Name Field (Only Sign Up) */}
          {!isLogin && (
            <div className="relative">
              <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Full Name *</label>
              <div className="flex items-center">
                <User className="absolute left-3 w-5 h-5 text-hn-dark/40 dark:text-hn-secondary/40" />
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                />
              </div>
            </div>
          )}

          {/* 2. Email Field */}
          <div className="relative">
            <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Email Address *</label>
            <div className="flex items-center">
              <Mail className="absolute left-3 w-5 h-5 text-hn-dark/40 dark:text-hn-secondary/40" />
              <input
                type="email"
                name="email"
                required
                placeholder="email@example.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
              />
            </div>
          </div>

          {/* 3. Password Field */}
          <div className="relative">
            <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Password *</label>
            <div className="flex items-center">
              <Lock className="absolute left-3 w-5 h-5 text-hn-dark/40 dark:text-hn-secondary/40" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                required
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 p-1 hover:bg-hn-secondary/50 dark:hover:bg-hn-dark/50 rounded-full text-hn-dark/40 dark:text-hn-secondary/40"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* 4. Extra Fields (Only Sign Up) */}
          {!isLogin && (
            <>
              {/* Phone Field */}
              <div className="relative">
                <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Phone Number</label>
                <div className="flex items-center">
                  <Phone className="absolute left-3 w-5 h-5 text-hn-dark/40 dark:text-hn-secondary/40" />
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+91 99999 99999"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                  />
                </div>
              </div>

              {/* Address Field */}
              <div className="relative">
                <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Street Address</label>
                <div className="flex items-center">
                  <MapPin className="absolute left-3 w-5 h-5 text-hn-dark/40 dark:text-hn-secondary/40" />
                  <input
                    type="text"
                    name="address"
                    placeholder="Enter city and address details"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2.5 bg-hn-secondary/20 dark:bg-hn-dark/30 border border-hn-secondary/40 dark:border-hn-dark/40 rounded-xl text-sm focus:outline-none focus:border-hn-primary text-hn-dark dark:text-hn-white"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs font-semibold text-hn-dark/70 dark:text-hn-secondary/70 mb-1.5 block">Account Purpose *</label>
                <div className="grid grid-cols-2 gap-4">
                  <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    formData.role === 'public'
                      ? 'border-hn-primary bg-hn-primary/5 text-hn-primary font-semibold'
                      : 'border-hn-secondary/40 dark:border-hn-dark/45 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="public"
                      checked={formData.role === 'public'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span>Donor / Volunteer</span>
                  </label>
                  <label className={`border rounded-xl p-3 flex items-center justify-center gap-2 cursor-pointer transition-colors ${
                    formData.role === 'orphanageAdmin'
                      ? 'border-hn-primary bg-hn-primary/5 text-hn-primary font-semibold'
                      : 'border-hn-secondary/40 dark:border-hn-dark/45 dark:bg-hn-dark/30 text-hn-dark/70 dark:text-hn-secondary/70'
                  }`}>
                    <input
                      type="radio"
                      name="role"
                      value="orphanageAdmin"
                      checked={formData.role === 'orphanageAdmin'}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span>Orphanage Admin</span>
                  </label>
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-hn-primary hover:bg-hn-primary/95 text-hn-white text-sm font-semibold rounded-xl transition-all duration-200 mt-4 shadow-md disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Demo Accounts Info */}
        {isLogin && (
          <div className="mt-8 pt-6 border-t border-hn-secondary/35 dark:border-hn-dark/30 text-left">
            <span className="text-[11px] font-bold text-hn-primary uppercase tracking-wider block mb-2">
              💡 Seeded Test Accounts (Password: password123)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-hn-dark/70 dark:text-hn-secondary/75">
              <div>
                <p className="font-semibold text-hn-dark dark:text-hn-white">Donor / Volunteer:</p>
                <p className="font-mono">donor@hopenest.org</p>
              </div>
              <div>
                <p className="font-semibold text-hn-dark dark:text-hn-white">Orphanage Admin:</p>
                <p className="font-mono">admin@hopenest.org</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Auth;
