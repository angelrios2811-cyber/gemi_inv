import { useState, useEffect } from 'react';
import { LogIn, Eye, EyeOff, Shield, Lock, User, Sparkles, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<'email' | 'password' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [touchedFields, setTouchedFields] = useState({
    email: false,
    password: false
  });
  
  const { login } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    setIsAnimating(true);
  }, []);

  const validateEmail = (email: string) => {
    if (!email) return 'El correo electrónico es requerido';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Formato de correo inválido';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password) return 'La contraseña es requerida';
    if (password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    return '';
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (touchedFields.email) {
      setFieldErrors(prev => ({ ...prev, email: validateEmail(value) }));
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (touchedFields.password) {
      setFieldErrors(prev => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const handleEmailBlur = () => {
    setTouchedFields(prev => ({ ...prev, email: true }));
    setFocusedField(null);
    setFieldErrors(prev => ({ ...prev, email: validateEmail(email) }));
  };

  const handlePasswordBlur = () => {
    setTouchedFields(prev => ({ ...prev, password: true }));
    setFocusedField(null);
    setFieldErrors(prev => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    // Validate all fields
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    
    setFieldErrors({ email: emailError, password: passwordError });
    setTouchedFields({ email: true, password: true });
    
    if (emailError || passwordError) {
      return;
    }
    
    setLoading(true);

    try {
      await login(email, password);
      navigate('/'); // Redirect to home after successful login
    } catch (err) {
      setError('Credenciales incorrectas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0a1a] via-[#1a1525] to-[#0f0a1a] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        {/* Gradient Orbs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        
        {/* Floating Particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-violet-400/60 rounded-full animate-float"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-blue-400/60 rounded-full animate-float" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-32 left-40 w-1.5 h-1.5 bg-purple-400/60 rounded-full animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-20 right-20 w-1 h-1 bg-violet-400/60 rounded-full animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/2 left-32 w-0.5 h-0.5 bg-blue-400/60 rounded-full animate-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      {/* Login Container */}
      <div className={`relative w-full max-w-md transition-all duration-1000 transform ${isAnimating ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
        <div className="glass-strong p-8 rounded-3xl border border-white/10 shadow-2xl relative overflow-hidden">
          {/* Glow Effect */}
          <div className="absolute -inset-px bg-gradient-to-r from-violet-500/20 to-blue-500/20 rounded-3xl blur-lg"></div>
          
          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="relative inline-block mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500/30 to-violet-600/30 border border-violet-500/40 flex items-center justify-center relative overflow-hidden group">
                  {/* Inner Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-400/20 to-transparent rounded-2xl"></div>
                  {/* Animated Sparkles */}
                  <Sparkles className="absolute top-1 right-1 w-4 h-4 text-violet-300 animate-pulse" />
                  <Sparkles className="absolute bottom-1 left-1 w-3 h-3 text-blue-300 animate-pulse" style={{ animationDelay: '0.5s' }} />
                  <Shield size={40} className="text-violet-300 relative z-10 group-hover:text-violet-200 transition-colors" />
                </div>
                {/* Ring Animation */}
                <div className="absolute -inset-2 border-2 border-violet-500/30 rounded-3xl animate-pulse"></div>
              </div>
              <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent">INVCAS</h1>
              <p className="text-white/60 text-sm mb-1">Sistema de Inventario y Gastos</p>
              <div className="flex items-center justify-center gap-2 text-xs">
                <span className="text-white/40">v4.0.0</span>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <span className="text-green-400/60 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  Online
                </span>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className={`space-y-2 transition-all duration-300 ${focusedField === 'email' ? 'transform scale-105' : ''} ${fieldErrors.email ? 'mb-8' : ''}`}>
                <label className="text-xs text-white/50 font-medium flex items-center gap-2">
                  <User size={14} className={`${fieldErrors.email ? 'text-red-400' : 'text-violet-400'}`} />
                  Correo Electrónico
                </label>
                <div className="relative group">
                  <input
                    type="email"
                    value={email}
                    onChange={handleEmailChange}
                    onFocus={() => setFocusedField('email')}
                    onBlur={handleEmailBlur}
                    placeholder="admin@invcas.com"
                    className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/8 transition-all duration-300 group-hover:border-white/20 ${
                      fieldErrors.email 
                        ? 'border-red-400/50 focus:border-red-400/70' 
                        : 'border-white/10 focus:border-violet-400/50'
                    }`}
                    required
                  />
                  {/* Field Focus Effect */}
                  {focusedField === 'email' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-xl blur-md -z-10"></div>
                  )}
                  
                  {/* Error Message */}
                  {fieldErrors.email && (
                    <div className="absolute -bottom-6 left-0 right-0">
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                        {fieldErrors.email}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Password */}
              <div className={`space-y-2 transition-all duration-300 ${focusedField === 'password' ? 'transform scale-105' : ''} ${fieldErrors.password ? 'mb-8' : ''}`}>
                <label className="text-xs text-white/50 font-medium flex items-center gap-2">
                  <Lock size={14} className={`${fieldErrors.password ? 'text-red-400' : 'text-violet-400'}`} />
                  Contraseña
                </label>
                <div className="relative group">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={handlePasswordChange}
                    onFocus={() => setFocusedField('password')}
                    onBlur={handlePasswordBlur}
                    placeholder="•••••••••"
                    className={`w-full px-4 py-3.5 bg-white/5 border rounded-xl text-white placeholder-white/40 focus:outline-none focus:bg-white/8 transition-all duration-300 pr-14 group-hover:border-white/20 ${
                      fieldErrors.password 
                        ? 'border-red-400/50 focus:border-red-400/70' 
                        : 'border-white/10 focus:border-violet-400/50'
                    }`}
                    required
                  />
                  {/* Field Focus Effect */}
                  {focusedField === 'password' && (
                    <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 to-blue-500/10 rounded-xl blur-md -z-10"></div>
                  )}
                  
                  {/* Error Message */}
                  {fieldErrors.password && (
                    <div className="absolute -bottom-6 left-0 right-0">
                      <p className="text-red-400 text-xs flex items-center gap-1">
                        <div className="w-1 h-1 bg-red-400 rounded-full"></div>
                        {fieldErrors.password}
                      </p>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-2 rounded-lg hover:bg-white/10 transition-all duration-200 group hover:scale-110"
                  >
                    {showPassword ? (
                      <EyeOff size={16} className="text-white/50 hover:text-white/70" />
                    ) : (
                      <Eye size={16} className="text-white/50 hover:text-white/70" />
                    )}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 animate-slide-up">
                  <div className="text-red-400 text-sm text-center flex items-center justify-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse"></div>
                    {error}
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading || !!fieldErrors.email || !!fieldErrors.password || !email || !password}
                className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-violet-500 to-violet-600 text-white font-semibold hover:from-violet-600 hover:to-violet-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed aura-glow flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                {/* Button Shimmer Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Autenticando...</span>
                  </>
                ) : (
                  <>
                    <LogIn size={20} className="group-hover:translate-x-1 transition-transform" />
                    <span>Iniciar Sesión</span>
                    <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform opacity-0 group-hover:opacity-100" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-8 text-center space-y-3">
              <div className="flex items-center justify-center gap-3 text-xs text-white/40">
                <div className="flex items-center gap-1.5">
                  <Lock size={12} className="text-green-400/60" />
                  <span>Conexión segura</span>
                </div>
                <div className="w-1 h-1 bg-white/20 rounded-full"></div>
                <div className="flex items-center gap-1.5">
                  <Shield size={12} className="text-violet-400/60" />
                  <span>Protegido</span>
                </div>
              </div>
              <p className="text-white/30 text-xs">
                Acceso restringido a personal autorizado
              </p>
            </div>
          </div>
        </div>
        
        {/* Bottom Glow */}
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-violet-500/20 rounded-full blur-xl"></div>
      </div>
    </div>
  );
}
