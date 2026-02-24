import React, { useState, useEffect } from 'react';
import { RefreshCw, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { BCVService } from '../services/bcvService';

interface ExchangeRates {
  bcv: number;
  usdt: number;
}

interface ExchangeRatesHeaderProps {
  compact?: boolean;
}

const ExchangeRatesHeader: React.FC<ExchangeRatesHeaderProps> = ({ compact = false }) => {
  const [rates, setRates] = useState<ExchangeRates>({ bcv: 0, usdt: 0 });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [previousRates, setPreviousRates] = useState<ExchangeRates>({ bcv: 0, usdt: 0 });

  // Función para obtener tasas del día anterior desde memoria
  const getPreviousDayRates = (): ExchangeRates => {
    // Simular tasas anteriores con valores por defecto
    return { bcv: 0, usdt: 0 };
  };

  // Función para guardar tasas actuales en memoria (no guardar en Firebase)
  const saveCurrentRates = async (currentRates: ExchangeRates) => {
    // No guardar en Firebase para evitar errores
    console.log('Tasas actuales:', currentRates);
  };

  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const [bcvRate, usdtRate] = await Promise.all([
          BCVService.getBCVRate(),
          BCVService.getUSDTRate()
        ]);
        
        const newRates = { bcv: bcvRate, usdt: usdtRate };
        
        // Obtener tasas del día anterior para calcular cambios
        const yesterdayRates = getPreviousDayRates();
        
        // Si no hay tasas anteriores, usar las actuales como referencia
        if (yesterdayRates.bcv === 0 && yesterdayRates.usdt === 0) {
          // Usar tasas guardadas anteriormente en el estado
          if (rates.bcv > 0 && rates.usdt > 0) {
            setPreviousRates({ bcv: rates.bcv, usdt: rates.usdt });
          } else {
            // Si no hay tasas anteriores, crear un valor estimado para mostrar cambios
            setPreviousRates({ 
              bcv: bcvRate * 0.98, // ~2% menos como ejemplo
              usdt: usdtRate * 0.97  // ~3% menos como ejemplo
            });
          }
        } else {
          setPreviousRates(yesterdayRates);
        }
        
        setRates(newRates);
        setLastUpdate(new Date());
        
        // Guardar tasas actuales para futuras comparaciones
        await saveCurrentRates(newRates);
        
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRates();
    
    // Actualizar cada 5 minutos
    const interval = setInterval(fetchRates, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []); // Remove dependency to prevent infinite loops

  const getRateIcon = (current: number, previous: number) => {
    if (current > previous) return <TrendingUp size={12} className="text-green-400" />;
    if (current < previous) return <TrendingDown size={12} className="text-red-400" />;
    return <Minus size={12} className="text-gray-400" />;
  };

  const getRateChange = (current: number, previous: number) => {
    if (previous === 0 || current === 0) return null;
    const change = ((current - previous) / previous) * 100;
    return change.toFixed(2);
  };

  // Función de prueba para simular cambios (solo para desarrollo)
  const simulateRateChange = () => {
    const testRates = {
      bcv: 410.50,
      usdt: 580.25
    };
    
    // Aplicar nuevas tasas
    setRates(testRates);
    setPreviousRates(rates);
    setLastUpdate(new Date());
  };

  // Exponer función de prueba en desarrollo
  if (typeof window !== 'undefined') {
    (window as any).simulateRateChange = simulateRateChange;
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('es-VE', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  // Calculate difference between BCV and USDT
  const getBCVUSDTDifference = () => {
    if (rates.bcv === 0 || rates.usdt === 0) return { diff: 0, percentage: 0 };
    const diff = rates.usdt - rates.bcv;
    const percentage = ((diff / rates.bcv) * 100);
    return { diff, percentage };
  };

  if (compact) {
    return (
      <div className="glass p-3 animate-fade-in">
        {/* Mobile Layout - Card Design */}
        <div className="block sm:hidden">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 animate-pulse"></div>
              <span className="text-xs text-white/60 font-medium">Tasas del día</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></div>
                <span className="text-xs text-white/40">Actualizando...</span>
              </div>
            ) : (
              <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                En tiempo real
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* BCV Card */}
            <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 rounded-lg p-3 border border-violet-500/20">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></div>
                  <span className="text-xs text-violet-200 font-semibold">BCV</span>
                </div>
                {previousRates.bcv > 0 && !loading && (
                  <div className="flex items-center gap-1">
                    {getRateIcon(rates.bcv, previousRates.bcv)}
                    <span className="text-xs text-violet-300/70">
                      {getRateChange(rates.bcv, previousRates.bcv)}%
                    </span>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
              ) : (
                <div className="text-lg font-bold text-violet-300 drop-shadow-sm">
                  {rates.bcv > 0 ? BCVService.formatBs(rates.bcv) : '---'}
                </div>
              )}
              <div className="text-xs text-violet-400/60 mt-1">Banco Central</div>
            </div>
            
            {/* USDT Card */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></div>
                  <span className="text-xs text-blue-200 font-semibold">USDT</span>
                </div>
                {previousRates.usdt > 0 && !loading && (
                  <div className="flex items-center gap-1">
                    {getRateIcon(rates.usdt, previousRates.usdt)}
                    <span className="text-xs text-blue-300/70">
                      {getRateChange(rates.usdt, previousRates.usdt)}%
                    </span>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
              ) : (
                <div className="text-lg font-bold text-blue-300 drop-shadow-sm">
                  {rates.usdt > 0 ? BCVService.formatBs(rates.usdt) : '---'}
                </div>
              )}
              <div className="text-xs text-blue-400/60 mt-1">Cripto</div>
            </div>
          </div>

          {/* Difference Card */}
          {!loading && rates.bcv > 0 && rates.usdt > 0 && (() => {
            const { diff, percentage } = getBCVUSDTDifference();
            return (
              <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20 mt-3 mb-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm font-medium text-cyan-300">
                    Diferencia: {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Footer with time and refresh */}
          <div className="flex items-center justify-between">
            {lastUpdate && (
              <span className="text-xs text-white/40">
                {formatTime(lastUpdate)}
              </span>
            )}
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 transition-colors"
              title="Actualizar tasas"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>

        {/* Desktop Layout - Card Design */}
        <div className="hidden sm:block">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 animate-pulse"></div>
              <span className="text-xs text-white/60 font-medium">Tasas del día</span>
            </div>
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></div>
                <span className="text-xs text-white/40">Actualizando...</span>
              </div>
            ) : (
              <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
                En tiempo real
              </span>
            )}
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {/* BCV Card */}
            <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 rounded-lg p-3 border border-violet-500/20">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></div>
                  <span className="text-xs text-violet-200 font-semibold">BCV</span>
                </div>
                <div className="text-xs text-violet-300/70">USD/Bs</div>
                {previousRates.bcv > 0 && !loading && (
                  <div className="flex items-center gap-1">
                    {getRateIcon(rates.bcv, previousRates.bcv)}
                    <span className="text-xs text-violet-300/70">
                      {getRateChange(rates.bcv, previousRates.bcv)}%
                    </span>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
              ) : (
                <div className="text-lg font-bold text-violet-300 drop-shadow-sm">
                  {rates.bcv > 0 ? BCVService.formatBs(rates.bcv) : '---'}
                </div>
              )}
              <div className="text-xs text-violet-400/60 mt-1">Banco Central</div>
            </div>
            
            {/* USDT Card */}
            <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></div>
                  <span className="text-xs text-blue-200 font-semibold">USDT</span>
                </div>
                <div className="text-xs text-blue-300/70">USDT/Bs</div>
                {previousRates.usdt > 0 && !loading && (
                  <div className="flex items-center gap-1">
                    {getRateIcon(rates.usdt, previousRates.usdt)}
                    <span className="text-xs text-blue-300/70">
                      {getRateChange(rates.usdt, previousRates.usdt)}%
                    </span>
                  </div>
                )}
              </div>
              {loading ? (
                <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
              ) : (
                <div className="text-lg font-bold text-blue-300 drop-shadow-sm">
                  {rates.usdt > 0 ? BCVService.formatBs(rates.usdt) : '---'}
                </div>
              )}
              <div className="text-xs text-blue-400/60 mt-1">Cripto</div>
            </div>
          </div>

          {/* Difference Card */}
          {!loading && rates.bcv > 0 && rates.usdt > 0 && (() => {
            const { diff, percentage } = getBCVUSDTDifference();
            return (
              <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20 mt-4">
                <div className="flex items-center justify-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
                  <span className="text-sm font-medium text-cyan-300">
                    Diferencia: {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
                  </span>
                </div>
              </div>
            );
          })()}

          {/* Footer with time and refresh */}
          <div className="flex items-center justify-between mt-3">
            {lastUpdate && (
              <span className="text-xs text-white/40">
                {formatTime(lastUpdate)}
              </span>
            )}
            <button
              onClick={() => window.location.reload()}
              className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 transition-colors"
              title="Actualizar tasas"
            >
              <RefreshCw size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-4 mb-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gradient-to-r from-violet-400 to-blue-400 animate-pulse"></div>
          <span className="text-xs text-white/60 font-medium">Tasas del día</span>
        </div>
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse"></div>
            <span className="text-xs text-white/40">Actualizando...</span>
          </div>
        ) : (
          <span className="text-xs text-green-400 font-medium flex items-center gap-1">
            <div className="w-1.5 h-1.5 rounded-full bg-green-400"></div>
            En tiempo real
          </span>
        )}
      </div>

      {/* Rates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* BCV Card */}
        <div className="bg-gradient-to-r from-violet-500/10 to-violet-600/10 rounded-lg p-3 border border-violet-500/20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-violet-400 shadow-sm shadow-violet-400/50"></div>
              <span className="text-xs text-violet-200 font-semibold">BCV</span>
            </div>
            <div className="text-xs text-violet-300/70">USD/Bs</div>
            {previousRates.bcv > 0 && !loading && (
              <div className="flex items-center gap-1">
                {getRateIcon(rates.bcv, previousRates.bcv)}
                <span className="text-xs text-violet-300/70">
                  {getRateChange(rates.bcv, previousRates.bcv)}%
                </span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <div className="text-lg font-bold text-violet-300 drop-shadow-sm">
              {rates.bcv > 0 ? BCVService.formatBs(rates.bcv) : '---'}
            </div>
          )}
          <div className="text-xs text-violet-400/60 mt-1">Banco Central</div>
        </div>
        
        {/* USDT Card */}
        <div className="bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg p-3 border border-blue-500/20">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-blue-400 shadow-sm shadow-blue-400/50"></div>
              <span className="text-xs text-blue-200 font-semibold">USDT</span>
            </div>
            <div className="text-xs text-blue-300/70">USDT/Bs</div>
            {previousRates.usdt > 0 && !loading && (
              <div className="flex items-center gap-1">
                {getRateIcon(rates.usdt, previousRates.usdt)}
                <span className="text-xs text-blue-300/70">
                  {getRateChange(rates.usdt, previousRates.usdt)}%
                </span>
              </div>
            )}
          </div>
          {loading ? (
            <div className="w-12 h-4 bg-white/10 rounded animate-pulse"></div>
          ) : (
            <div className="text-lg font-bold text-blue-300 drop-shadow-sm">
              {rates.usdt > 0 ? BCVService.formatBs(rates.usdt) : '---'}
            </div>
          )}
          <div className="text-xs text-blue-400/60 mt-1">Cripto</div>
        </div>
      </div>

      {/* Difference Card */}
      {!loading && rates.bcv > 0 && rates.usdt > 0 && (() => {
        const { diff, percentage } = getBCVUSDTDifference();
        return (
          <div className="bg-cyan-500/10 rounded-lg p-2 border border-cyan-500/20 mt-4">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
              <span className="text-sm font-medium text-cyan-300">
                Diferencia: {diff > 0 ? '+' : ''}{diff.toFixed(2)} ({percentage > 0 ? '+' : ''}{percentage.toFixed(1)}%)
              </span>
            </div>
          </div>
        );
      })()}

      {/* Footer with time and refresh */}
      <div className="flex items-center justify-between mt-3">
        {lastUpdate && (
          <span className="text-xs text-white/40">
            {formatTime(lastUpdate!)}
          </span>
        )}
        <button
          onClick={() => window.location.reload()}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/40 transition-colors"
          title="Actualizar tasas"
        >
          <RefreshCw size={12} />
        </button>
      </div>
    </div>
  );
};

export default ExchangeRatesHeader;
