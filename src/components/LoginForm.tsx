import React, { useState } from 'react';
import { Eye, EyeOff, LogIn, UserPlus, AlertTriangle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

interface LoginFormProps {
  onToggleMode: () => void;
  isLoginMode: boolean;
}

export default function LoginForm({ onToggleMode, isLoginMode }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const { login, register } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setPasswordError('');
    setIsLoading(true);

    try {
      if (isLoginMode) {
        // Login
        await login(email, password);
        setSuccess('¡Inicio de sesión exitoso!');
      } else {
        // Registro
        if (!username.trim()) {
          throw new Error('El nombre de usuario es requerido');
        }
        await register({
          email,
          username: username.trim(),
          password,
          role: 'user'
        });
        setSuccess('¡Registro exitoso! Iniciando sesión...');
      }

      // Limpiar formulario
      setTimeout(() => {
        setEmail('');
        setPassword('');
        setUsername('');
        setSuccess('');
        setPasswordError('');
      }, 2000);
    } catch (error: any) {
      setError(error.message || 'Error en la autenticación');
    } finally {
      setIsLoading(false);
    }
  };

  // Validar contraseña en tiempo real
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    if (value.length > 0 && value.length < 6) {
      setPasswordError('La contraseña debe tener mínimo 6 dígitos');
    } else {
      setPasswordError('');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-violet-800 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <LogIn size={32} className="text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">
              {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-white/60 text-sm">
              {isLoginMode ? 'Ingresa tus credenciales' : 'Registra una nueva cuenta'}
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-4 p-4 bg-green-500/20 border border-green-500/30 rounded-lg">
              <p className="text-green-300 text-sm text-center">{success}</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-red-300 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLoginMode && (
              <div>
                <label className="block text-sm font-medium text-white/70 mb-2">
                  Nombre de Usuario
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: juanperez"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-colors"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Contraseña <span className="text-white/50 text-xs">(mínimo 6 dígitos)</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => handlePasswordChange(e.target.value)}
                  placeholder="••••••••••"
                  className={`w-full px-4 py-3 bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-violet-400/50 focus:bg-white/15 transition-colors pr-10 ${
                    passwordError ? 'border-red-400/50' : 'border-white/20'
                  }`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {passwordError && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  {passwordError}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-violet-700 text-white font-semibold rounded-lg hover:from-violet-700 to-violet-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white/30 rounded-full animate-spin border-t-transparent"></div>
                  <span className="ml-2">
                    {isLoginMode ? 'Iniciando...' : 'Registrando...'}
                  </span>
                </span>
              ) : (
                <span className="flex items-center justify-center">
                  {isLoginMode ? <LogIn size={20} /> : <UserPlus size={20} />}
                  <span className="ml-2">
                    {isLoginMode ? 'Iniciar Sesión' : 'Crear Cuenta'}
                  </span>
                </span>
              )}
            </button>

            {/* Toggle Mode */}
            <div className="text-center mt-6">
              <button
                onClick={onToggleMode}
                className="text-violet-300 hover:text-violet-200 text-sm underline transition-colors"
              >
                {isLoginMode ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
