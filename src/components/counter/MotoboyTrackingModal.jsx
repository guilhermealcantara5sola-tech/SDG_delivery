import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import {
  X, Bike, Store, MapPin, Navigation, Compass, Clock,
  RefreshCw, ChevronRight, User, Phone, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useOrder } from '../../context/OrderContext';
import { formatCurrency, formatDateTime } from '../../utils/formatters';

export const MotoboyTrackingModal = ({ isOpen, onClose, targetDriverId, targetOrderId }) => {
  const { orders, motoboyLocations, storeSettings, sendMotoboyLocation } = useOrder();

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef({});
  const storeMarkerRef = useRef(null);

  const [selectedDriverId, setSelectedDriverId] = useState(targetDriverId || null);

  // Store coordinates (default to SP Central if not set)
  const storeLat = storeSettings?.latitude || -23.550520;
  const storeLng = storeSettings?.longitude || -46.633308;

  // Active in-route orders
  const inRouteOrders = useMemo(() => {
    return orders.filter(o => o.deliveryType === 'delivery' && o.status === 'saiu_para_entrega');
  }, [orders]);

  // List of active motoboys with locations
  const activeMotoboys = useMemo(() => {
    const list = Object.values(motoboyLocations || {});
    // Se não tiver motoboy no state mas houver pedidos em rota, cria representação padrão
    return list.filter(m => m && m.latitude && m.longitude);
  }, [motoboyLocations]);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isOpen || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        zoomControl: true,
        attributionControl: false
      }).setView([storeLat, storeLng], 14);

      // TileLayer limpo do OpenStreetMap
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19
      }).addTo(map);

      mapInstanceRef.current = map;

      // Marcador da Loja / Restaurante (Sede)
      const storeIcon = L.divIcon({
        className: 'custom-store-pin',
        html: `
          <div style="position: relative; display: flex; flex-direction: column; align-items: center;">
            <div style="background: #0f172a; border: 2px solid #f59e0b; color: #f59e0b; padding: 4px 8px; border-radius: 9999px; font-weight: 900; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 12px rgba(0,0,0,0.5);">
              🏢 ${storeSettings?.restaurantName || 'Restaurante'}
            </div>
            <div style="width: 14px; height: 14px; background: #f59e0b; border-radius: 50%; border: 3px solid #0f172a; margin-top: -3px; box-shadow: 0 0 12px #f59e0b;"></div>
          </div>
        `,
        iconSize: [120, 42],
        iconAnchor: [60, 40]
      });

      storeMarkerRef.current = L.marker([storeLat, storeLng], { icon: storeIcon })
        .addTo(map)
        .bindPopup(`
          <div style="padding: 6px; font-family: sans-serif;">
            <b style="color: #0f172a; font-size: 13px;">${storeSettings?.restaurantName || 'Sede do Restaurante'}</b>
            <p style="color: #475569; font-size: 11px; margin: 4px 0 0 0;">${storeSettings?.address || 'Ponto de Partida dos Motoboys'}</p>
          </div>
        `);
    }

    const timer = setTimeout(() => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.invalidateSize();
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [isOpen, storeLat, storeLng, storeSettings]);

  // Clean up on modal close
  useEffect(() => {
    if (!isOpen && mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
      markersRef.current = {};
      storeMarkerRef.current = null;
    }
  }, [isOpen]);

  // Update Motoboy Markers on Map
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Atualiza ou cria marcadores de cada motoboy
    activeMotoboys.forEach((moto) => {
      const isSelected = selectedDriverId === moto.id;
      const key = `moto_${moto.id}`;

      const iconHtml = `
        <div style="position: relative; display: flex; flex-direction: column; align-items: center; cursor: pointer;">
          <!-- Badge do Entregador -->
          <div style="background: ${isSelected ? '#10b981' : '#0284c7'}; color: #ffffff; padding: 3px 8px; border-radius: 9999px; font-weight: 800; font-size: 11px; white-space: nowrap; box-shadow: 0 4px 10px rgba(0,0,0,0.6); display: flex; align-items: center; gap: 4px; border: 2px solid #ffffff;">
            <span>🛵 ${moto.driverName}</span>
            ${moto.speed > 0 ? `<span style="background: rgba(0,0,0,0.25); padding: 1px 4px; border-radius: 6px; font-size: 9px;">${moto.speed} km/h</span>` : ''}
          </div>
          <!-- Ponto com Anel Pulsante de Radar -->
          <div style="position: relative; width: 16px; height: 16px; margin-top: -2px;">
            <div style="position: absolute; inset: -4px; background: ${isSelected ? '#10b981' : '#0284c7'}; border-radius: 50%; opacity: 0.4; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
            <div style="position: absolute; inset: 0; background: ${isSelected ? '#10b981' : '#0284c7'}; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.5);"></div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        className: `custom-moto-pin-${moto.id}`,
        html: iconHtml,
        iconSize: [120, 44],
        iconAnchor: [60, 42]
      });

      if (markersRef.current[key]) {
        markersRef.current[key].setLatLng([moto.latitude, moto.longitude]);
        markersRef.current[key].setIcon(customIcon);
      } else {
        const marker = L.marker([moto.latitude, moto.longitude], { icon: customIcon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family: sans-serif; padding: 4px;">
              <h4 style="font-weight: 900; font-size: 13px; margin: 0; color: #0f172a;">🛵 ${moto.driverName}</h4>
              <p style="font-size: 11px; color: #475569; margin: 4px 0;">
                ${moto.orderId ? `<b>Levando Pedido:</b> #${moto.orderId}` : 'Disponível em trânsito'}
              </p>
              <div style="font-size: 10px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 4px;">
                ${moto.speed > 0 ? `Velocidade: <b>${moto.speed} km/h</b><br/>` : 'Parado no momento<br/>'}
                Último sinal: ${formatDateTime(moto.updatedAt)}
              </div>
            </div>
          `);

        marker.on('click', () => {
          setSelectedDriverId(moto.id);
        });

        markersRef.current[key] = marker;
      }
    });

    // Remove marcadores antigos de motoboys que não existem mais
    Object.keys(markersRef.current).forEach((key) => {
      if (key.startsWith('moto_')) {
        const id = key.replace('moto_', '');
        if (!activeMotoboys.some(m => m.id === id)) {
          map.removeLayer(markersRef.current[key]);
          delete markersRef.current[key];
        }
      }
    });
  }, [activeMotoboys, selectedDriverId]);

  // Focus on selected driver
  const handleFocusDriver = (driver) => {
    setSelectedDriverId(driver.id);
    if (mapInstanceRef.current && driver.latitude && driver.longitude) {
      mapInstanceRef.current.flyTo([driver.latitude, driver.longitude], 16, {
        duration: 1.2
      });
      const key = `moto_${driver.id}`;
      if (markersRef.current[key]) {
        markersRef.current[key].openPopup();
      }
    }
  };

  // Reset view to store and all motoboys
  const handleResetView = () => {
    if (!mapInstanceRef.current) return;
    if (activeMotoboys.length > 0) {
      const bounds = L.latLngBounds([
        [storeLat, storeLng],
        ...activeMotoboys.map(m => [m.latitude, m.longitude])
      ]);
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    } else {
      mapInstanceRef.current.flyTo([storeLat, storeLng], 14);
    }
  };

  // Simulação rápida para testar no PC do Balcão
  const handleSimulateDriver = () => {
    const randomOffsetLat = (Math.random() - 0.5) * 0.02;
    const randomOffsetLng = (Math.random() - 0.5) * 0.02;
    const simLat = storeLat + randomOffsetLat;
    const simLng = storeLng + randomOffsetLng;
    const driverKey = `Entregador-${Math.floor(1 + Math.random() * 5)}`;

    sendMotoboyLocation({
      id: driverKey,
      driverName: driverKey,
      orderId: inRouteOrders[0]?.id || 'PED-1001',
      latitude: simLat,
      longitude: simLng,
      speed: Math.round(25 + Math.random() * 20),
      heading: Math.round(Math.random() * 360),
      accuracy: 6,
      isOnline: true
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[92vh]">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-md">
              <Navigation className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg sm:text-xl font-black text-white">
                  Rastreamento de Motoboys em Tempo Real
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 uppercase flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>GPS Ativo</span>
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Acompanhe a localização dos entregadores na rua conforme eles transmitem o sinal do celular.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetView}
              className="hidden sm:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold transition-all"
              title="Ajustar zoom para ver a loja e todos os motoboys"
            >
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>Ver Todos</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-all"
              title="Fechar mapa"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content: Map + Side Panel */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden relative">
          
          {/* MAP CANVAS (8 COLS ON DESKTOP) */}
          <div className="lg:col-span-8 relative h-full w-full bg-slate-950">
            <div ref={mapContainerRef} className="w-full h-full z-0" />

            {/* Floating Map Legend Overlay */}
            <div className="absolute top-3 left-3 z-10 bg-slate-900/90 backdrop-blur-md border border-slate-800 p-2.5 rounded-2xl shadow-xl text-xs space-y-1.5 pointer-events-auto">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-white">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Loja: {storeSettings?.restaurantName || 'Sede'}</span>
              </div>
              <div className="flex items-center space-x-2 text-[11px] font-bold text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
                <span>Motoboy Transmitindo GPS</span>
              </div>
            </div>

            {/* Floating Button: Simular Motoboy para Teste */}
            <div className="absolute bottom-4 left-4 z-10 pointer-events-auto">
              <button
                type="button"
                onClick={handleSimulateDriver}
                className="px-3 py-2 rounded-xl bg-slate-900/95 hover:bg-slate-800 border border-slate-700 text-amber-400 font-bold text-xs flex items-center space-x-1.5 shadow-xl transition-all"
                title="Gera uma posição de teste para você ver o ícone da moto no mapa agora"
              >
                <RefreshCw className="w-3.5 h-3.5 text-amber-400 animate-spin" />
                <span>+ Simular Posição (Teste)</span>
              </button>
            </div>
          </div>

          {/* SIDE PANEL: ACTIVE DRIVERS & IN-ROUTE ORDERS (4 COLS) */}
          <div className="lg:col-span-4 bg-slate-950 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col overflow-hidden">
            
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bike className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-black text-white uppercase tracking-wider">
                  Entregadores Conectados ({activeMotoboys.length})
                </h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">
                {inRouteOrders.length} em rota
              </span>
            </div>

            {/* Drivers List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMotoboys.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-800 rounded-2xl p-6 text-center space-y-2">
                  <div className="w-10 h-10 rounded-full bg-slate-800 mx-auto flex items-center justify-center text-slate-500">
                    <Bike className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-300">Nenhum motoboy transmitindo no momento</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Assim que o entregador acessar o painel no celular e iniciar uma entrega, o sinal aparecerá automaticamente aqui.
                  </p>
                  <button
                    type="button"
                    onClick={handleSimulateDriver}
                    className="mt-2 inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-black hover:bg-amber-500 hover:text-slate-950 transition-all cursor-pointer"
                  >
                    <span>Testar com Motoboy Simulado</span>
                  </button>
                </div>
              ) : (
                activeMotoboys.map((moto) => {
                  const isSelected = selectedDriverId === moto.id;
                  const activeOrder = orders.find(o => o.id === moto.orderId);

                  return (
                    <div
                      key={moto.id}
                      onClick={() => handleFocusDriver(moto)}
                      className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2.5 ${
                        isSelected
                          ? 'bg-emerald-950/30 border-emerald-500/60 shadow-lg shadow-emerald-500/10'
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <div className="w-7 h-7 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black">
                            <Bike className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white">{moto.driverName}</h4>
                            <span className="text-[10px] text-slate-400">
                              {moto.speed > 0 ? `🚴 Em trânsito (${moto.speed} km/h)` : '🟡 Parado no local'}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold flex items-center space-x-1 transition-all"
                        >
                          <span>Focar</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Active order info */}
                      {activeOrder ? (
                        <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] space-y-1">
                          <div className="flex justify-between font-bold">
                            <span className="text-amber-400">Pedido #{activeOrder.id}</span>
                            <span className="text-white">{formatCurrency(activeOrder.total)}</span>
                          </div>
                          <p className="text-slate-300 font-semibold truncate">
                            Cliente: {activeOrder.customerName}
                          </p>
                          <p className="text-slate-400 truncate text-[10px]">
                            End: {activeOrder.address}
                          </p>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-500 italic">
                          Aguardando atribuição de entrega
                        </div>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 border-t border-slate-800/60 pt-2">
                        <span>Sinal: ±{moto.accuracy || 5}m de precisão</span>
                        <span>{formatDateTime(moto.updatedAt)}</span>
                      </div>
                    </div>
                  );
                })
              )}

              {/* Pedidos em rota aguardando coleta */}
              {inRouteOrders.length > 0 && (
                <div className="pt-3 border-t border-slate-800 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Entregas em Andamento ({inRouteOrders.length}):
                  </span>
                  {inRouteOrders.map(order => (
                    <div key={order.id} className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs flex justify-between items-center">
                      <div>
                        <div className="font-black text-amber-400">{order.id}</div>
                        <div className="text-slate-300 font-bold truncate max-w-[180px]">{order.customerName}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        Em Rota
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900 text-center text-[11px] text-slate-400">
              Atualização automática via satélite & rede 4G
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
