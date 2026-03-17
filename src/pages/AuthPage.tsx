import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Heart, Users, Shield, Eye, EyeOff, Star, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const testimonials = [
  { name: 'Fatima R.', area: 'Gulshan, Dhaka', text: 'Found a plumber within 10 minutes. This app is a lifesaver!', karma: 340 },
  { name: 'Arjun M.', area: 'Banani, Dhaka', text: 'I love helping neighbors. Already earned 500+ karma points!', karma: 520 },
  { name: 'Nusrat K.', area: 'Dhanmondi, Dhaka', text: 'Finally a community app that actually feels like a community.', karma: 280 },
];

const stats = [
  { value: '50K+', label: 'Active Neighbors' },
  { value: '120K+', label: 'Helps Given' },
  { value: '4.9★', label: 'App Rating' },
];

const AuthPage = () => {
  const { isAuthenticated, login, loginWithGoogle, register, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  if (isAuthenticated) return <Navigate to="/" replace />;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      login(email, password);
    } else {
      register(name, email, password);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    exit: { opacity: 0, x: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Panel - Rich Branding */}
      <div className="hidden lg:flex lg:w-[52%] relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-[hsl(230,80%,35%)]" />

        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-primary-foreground/5 -translate-y-1/2 translate-x-1/4" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-primary-foreground/5 translate-y-1/3 -translate-x-1/4" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary-foreground/[0.03]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-[0.04]"
            style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-10 xl:p-14 w-full">
          {/* Logo */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-primary-foreground/15 backdrop-blur-sm flex items-center justify-center border border-primary-foreground/10">
              <MapPin className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold font-[Lexend] text-primary-foreground tracking-tight">Neighborly</span>
          </motion.div>

          {/* Hero content */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-8 max-w-lg">
            <div>
              <h1 className="text-4xl xl:text-5xl font-bold font-[Lexend] text-primary-foreground leading-[1.15] tracking-tight">
                Your neighborhood,<br />
                <span className="text-primary-foreground/70">connected.</span>
              </h1>
              <p className="text-primary-foreground/70 text-lg mt-4 leading-relaxed max-w-sm">
                Help your neighbors, share resources, and build real trust — all within walking distance.
              </p>
            </div>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2.5">
              {[
                { icon: Heart, text: 'Give & Receive Help' },
                { icon: Shield, text: 'Verified Neighbors' },
                { icon: Star, text: 'Earn Karma Points' },
                { icon: Users, text: 'Local Community' },
              ].map(({ icon: Icon, text }, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-sm border border-primary-foreground/10">
                  <Icon className="w-3.5 h-3.5 text-primary-foreground/80" />
                  <span className="text-xs font-medium text-primary-foreground/90">{text}</span>
                </motion.div>
              ))}
            </div>

            {/* Testimonial card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="bg-primary-foreground/10 backdrop-blur-md rounded-2xl p-5 border border-primary-foreground/10 max-w-sm">
              <div className="flex gap-1 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
              <p className="text-sm text-primary-foreground/85 leading-relaxed italic">
                "{testimonials[0].text}"
              </p>
              <div className="flex items-center justify-between mt-3.5">
                <div>
                  <p className="text-xs font-semibold text-primary-foreground">{testimonials[0].name}</p>
                  <p className="text-[11px] text-primary-foreground/50">{testimonials[0].area}</p>
                </div>
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-400/20">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-[11px] font-bold text-amber-300">{testimonials[0].karma}</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Stats footer */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}
            className="flex gap-8">
            {stats.map((s, i) => (
              <div key={i}>
                <p className="text-2xl font-bold text-primary-foreground font-[Lexend]">{s.value}</p>
                <p className="text-xs text-primary-foreground/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Mobile header */}
        <div className="lg:hidden flex items-center justify-between p-5 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-[Lexend] text-foreground">Neighborly</span>
          </div>
        </div>

        <div className="flex-1 flex items-center justify-center p-5 sm:p-8">
          <div className="w-full max-w-[400px]">
            <AnimatePresence mode="wait">
              <motion.div key={mode} variants={formVariants} initial="hidden" animate="visible" exit="exit">
                {/* Header */}
                <div className="mb-7">
                  <h2 className="text-[26px] font-bold text-foreground font-[Lexend] tracking-tight">
                    {mode === 'login' ? 'Welcome back' : 'Get started'}
                  </h2>
                  <p className="text-muted-foreground mt-1.5 text-[15px]">
                    {mode === 'login'
                      ? 'Sign in to reconnect with your community'
                      : 'Create your account and join your neighbors'}
                  </p>
                </div>

                {/* Google */}
                <Button
                  variant="outline"
                  className="w-full h-[46px] text-sm font-medium border-border/80 hover:bg-muted/40 hover:border-border transition-all rounded-xl shadow-sm"
                  onClick={loginWithGoogle}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 mr-2.5 animate-spin" />
                  ) : (
                    <svg className="w-[18px] h-[18px] mr-2.5" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                    </svg>
                  )}
                  Continue with Google
                </Button>

                {/* Divider */}
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border/60" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-background px-4 text-xs text-muted-foreground/70 uppercase tracking-wider">or continue with email</span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {mode === 'register' && (
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-foreground text-[13px] font-medium">Full Name</Label>
                      <Input
                        id="name"
                        placeholder="e.g. Rahim Ahmed"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-[44px] rounded-xl border-border/80 focus:border-primary/50 placeholder:text-muted-foreground/40 text-sm"
                      />
                    </div>
                  )}
                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-foreground text-[13px] font-medium">Email address</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-[44px] rounded-xl border-border/80 focus:border-primary/50 placeholder:text-muted-foreground/40 text-sm"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password" className="text-foreground text-[13px] font-medium">Password</Label>
                      {mode === 'login' && (
                        <button type="button" className="text-xs text-primary hover:text-primary/80 font-medium transition-colors">
                          Forgot password?
                        </button>
                      )}
                    </div>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder={mode === 'register' ? 'Min. 6 characters' : '••••••••'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="h-[44px] rounded-xl border-border/80 pr-11 focus:border-primary/50 placeholder:text-muted-foreground/40 text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {mode === 'register' && (
                    <label className="flex items-start gap-2.5 cursor-pointer pt-1">
                      <input
                        type="checkbox"
                        checked={agreedTerms}
                        onChange={(e) => setAgreedTerms(e.target.checked)}
                        className="mt-0.5 rounded border-border text-primary focus:ring-primary/30 h-4 w-4"
                      />
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the <button type="button" className="text-primary hover:underline font-medium">Terms of Service</button> and{' '}
                        <button type="button" className="text-primary hover:underline font-medium">Privacy Policy</button>
                      </span>
                    </label>
                  )}

                  <Button
                    type="submit"
                    className="w-full h-[46px] text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition-all mt-2 group"
                    disabled={isLoading || (mode === 'register' && !agreedTerms)}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Register benefits */}
                {mode === 'register' && (
                  <div className="mt-5 space-y-2">
                    {['Free to use forever', 'No spam, ever', 'Your data stays private'].map((t, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-success" />
                        <span className="text-xs text-muted-foreground">{t}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Switch mode */}
                <p className="text-center text-sm text-muted-foreground mt-7">
                  {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
                  <button
                    onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
                    className="text-primary font-semibold hover:underline underline-offset-2"
                  >
                    {mode === 'login' ? 'Sign up free' : 'Sign in'}
                  </button>
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Demo hint - subtle */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setEmail('demo@neighborly.app'); setPassword('demo123'); }}
                className="text-[11px] text-muted-foreground/50 hover:text-muted-foreground transition-colors underline underline-offset-2"
              >
                Use demo account
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 text-center border-t border-border/30">
          <p className="text-[11px] text-muted-foreground/40">© 2024 Neighborly. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
