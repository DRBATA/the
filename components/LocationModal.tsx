"use client";
import { useCallback, useMemo, useState, useEffect } from "react";
import { X, ChevronLeft, Navigation, AlertCircle, Compass, Info, Sparkles } from "lucide-react";

import { venues, Venue } from "../lib/venues";
import AgenticButton from "./AgenticButton";
import dynamic from "next/dynamic";
import { useGeolocation } from "../hooks/useGeolocation";
import { calculateDistance, formatDistance } from "../utils/distance";

// React Leaflet depends on the browser DOM (window). Dynamically import it with SSR disabled.
const RefillMap = dynamic(() => import("./RefillMap").then((m) => m.RefillMap), {
  ssr: false,
});

interface Props {
  open: boolean;
  onCloseAction: () => void;
  onInfoOpen?: () => void;
}


export default function LocationModal({ open, onCloseAction }: Props) {
  const [typeFilter, setTypeFilter] = useState<'dayAnchor' | 'eveningAnchor' | 'anchor24h' | 'all'>("all");

  // Options for dropdown (no redundancy)
  const typeOptions = [
    { value: 'all', label: 'All Types' },
    { value: 'dayAnchor', label: 'Day Venue' },
    { value: 'eveningAnchor', label: 'Evening Venue' },
    { value: 'anchor24h', label: '24h Venue' },
  ];
  const { position, requestPermission, permissionDenied } = useGeolocation();
  const [selected, setSelected] = useState<number | null>(null);
  const [pingedVenues, setPingedVenues] = useState<string[]>([]);

  // Proximity sensor: notify when within 1km of a venue (once per venue per session)
  useEffect(() => {
    if (!position) return;
    venues.forEach((venue) => {
      if (pingedVenues.includes(venue.id)) return;
      const dist = calculateDistance(
        position.latitude,
        position.longitude,
        venue.coordinates.latitude,
        venue.coordinates.longitude
      );
      if (dist <= 1) {
        window.showToast?.(
          `You're near ${venue.name}! ${venue.offers[0]?.title ? 'Offer: ' + venue.offers[0].title : ''}`,
          'info'
        );
        setPingedVenues((prev) => [...prev, venue.id]);
      }
    });
  }, [position, pingedVenues]);

  const filteredVenues = useMemo(() => {
    return typeFilter === "all" ? venues : venues.filter(v => {
      const role = v.role === 'redundancy'
        ? (parseInt(v.openTime) < 15 ? 'dayAnchor' : 'eveningAnchor')
        : v.role;
      return role === typeFilter;
    });
  }, [typeFilter]);

  const sortedVenues = useMemo(() => {
    if (!position) return filteredVenues;
    return [...filteredVenues].sort((a, b) => {
      const dA = calculateDistance(position.latitude, position.longitude, a.coordinates.latitude, a.coordinates.longitude);
      const dB = calculateDistance(position.latitude, position.longitude, b.coordinates.latitude, b.coordinates.longitude);
      return dA - dB;
    });
  }, [position, filteredVenues]);

  const getDistance = useCallback(
    (venue: Venue) => {
      if (!position) return null;
      const km = calculateDistance(position.latitude, position.longitude, venue.coordinates.latitude, venue.coordinates.longitude);
      return formatDistance(km);
    },
    [position]
  );

  const openDirections = (venue: Venue) => {
    if (!position) {
      requestPermission();
      (window as Window & typeof globalThis & { showToast?: (msg: string, type?: string) => void }).showToast?.("Please enable location services to get directions", "info");
      return;
    }
    const url = `https://www.google.com/maps/dir/?api=1&origin=${position.latitude},${position.longitude}&destination=${venue.coordinates.latitude},${venue.coordinates.longitude}&travelmode=driving`;
    window.open(url, "_blank");
    (window as Window & typeof globalThis & { showToast?: (msg: string, type?: string) => void }).showToast?.("Opening directions in Google Maps...", "info");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-black/80 border border-white/10 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-auto relative">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-medium text-white">Premium Refill Locations</h3>
          <button className="text-white/70 hover:text-white" onClick={onCloseAction}>
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Location permission banner */}
        {!position && (
          <div className="bg-[color:var(--primary-blue)]/20 border border-[color:var(--primary-blue)]/30 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Compass className="h-5 w-5 text-[color:var(--primary-blue)] mr-2 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-white font-medium mb-1">Enable Location Services</h4>
                <p className="text-white/80 text-sm">Allow location access to see how far you are from each refill station and get directions.</p>
                {permissionDenied ? (
                  <p className="text-amber-400 text-sm mt-2">Location access was denied. Please enable location services in your browser settings.</p>
                ) : (
                  <button onClick={requestPermission} className="mt-2 bg-[color:var(--primary-blue)] text-white text-sm px-3 py-1 rounded-md hover:bg-[color:var(--primary-blue)]/90 transition-colors">
                    Enable Location
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Venue Type Filter Dropdown */}
        <div className="mb-6 flex justify-end">
          <select
            className="bg-black/80 border border-white/20 text-white rounded-lg px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-blue)]"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as 'dayAnchor' | 'eveningAnchor' | 'anchor24h' | 'all')}
          >
            {typeOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        {/* Important notice */}
        <div className="bg-[rgba(0,159,255,0.08)] border border-[rgba(0,159,255,0.20)] rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-[color:var(--primary-blue)] mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-white font-medium mb-1">Important Refill Information</h4>
              <p className="text-white/80 text-sm">Please bring your own water bottle to refill stations. Our partners cannot provide glassware — this helps us reduce single-use plastic waste together!</p>
            </div>
          </div>
        </div>

        {selected !== null ? (
          // Detail view
          <>
            <button className="flex items-center text-[color:var(--primary-blue)] hover:text-[color:var(--primary-blue)]/80 transition-colors mb-4" onClick={() => setSelected(null)}>
              <ChevronLeft className="h-4 w-4 mr-1" /> Back to all locations
            </button>
            {(() => {
              const v = sortedVenues[selected];
              return (
                <div className="space-y-6">
                  <div className="bg-white/5 rounded-lg overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xl font-medium text-white">{v.name}</h4>
                        <div className="bg-[color:var(--primary-blue)]/20 text-[color:var(--primary-blue)] px-3 py-1 rounded-full text-xs">{selected + 1} of {sortedVenues.length}</div>
                      </div>
                      <div className="mb-4">
                        <span className="inline-block bg-white/10 text-white/80 px-3 py-1 rounded-full text-xs font-semibold">
                          {v.role === 'redundancy'
                            ? (parseInt(v.openTime) < 15 ? 'Day Menu' : 'Evening Menu')
                            : v.role === 'dayAnchor'
                              ? 'Day Menu'
                              : v.role === 'eveningAnchor'
                                ? 'Evening Menu'
                                : v.role === 'anchor24h'
                                  ? '24h Anchor'
                                  : ''}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-white/70 mb-4">
                        <div>{v.address}</div>
                        {position && (
                          <div className="flex items-center text-[color:var(--primary-blue)] font-medium"><Navigation className="h-4 w-4 mr-1" />{getDistance(v)} away</div>
                        )}
                      </div>

                      <div className="bg-white/5 p-4 rounded-lg mb-4">
                        <div className="flex items-start mb-2">
                          <Info className="h-4 w-4 text-[color:var(--primary-blue)] mr-2 mt-1 flex-shrink-0" />
                          <div>
                            <h5 className="text-white font-medium mb-1">Venue Highlights</h5>
                            <ul className="list-disc pl-5 text-white/80 text-sm">
                              {v.reasons.split(',').map((reason, idx) => (
                                <li key={idx}>{reason.trim()}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>

                      {v.hook && (
                        <div className="bg-white/5 p-4 rounded-lg mb-4 border-l-4 border-[color:var(--primary-blue)]">
                          <div className="flex items-start">
                            <Sparkles className="h-4 w-4 text-gold mr-2 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-[color:var(--primary-blue)] font-semibold text-sm mb-1">{v.hook}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {v.offers.length > 0 && (
                        <div className="bg-white/5 p-4 rounded-lg mb-4">
                          <h5 className="text-white font-medium mb-2 flex items-center"><Sparkles className="h-4 w-4 text-gold mr-2" />Special Offers</h5>
                          {v.offers.map((o) => (
                            <div key={o.id} className="mb-2 text-white/80 text-sm">
                              <p className="font-medium text-white">{o.title}</p>
                              <p>{o.description}{o.code && (<span className="ml-1 text-[color:var(--primary-blue)] font-semibold">({o.code})</span>)}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => openDirections(v)}
                        className="w-full bg-[color:var(--primary-blue)] text-white py-3 rounded-xl shadow-lg flex items-center justify-center gap-2 text-lg font-semibold hover:bg-[color:var(--primary-blue)]/90 active:scale-95 transition-all mt-6 focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-blue)] focus:ring-offset-2"
                      >
                        <Navigation className="h-5 w-5 mr-2" />
                        Click here to get directions
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors" onClick={() => setSelected(selected === 0 ? sortedVenues.length - 1 : selected - 1)}>Previous</button>
                    <button className="bg-[color:var(--primary-blue)] text-white px-4 py-2 rounded-lg transition-colors" onClick={() => setSelected(null)}>Close</button>
                    <button className="bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors" onClick={() => setSelected((selected + 1) % sortedVenues.length)}>Next</button>
                  </div>
                </div>
              );
            })()}
          </>
        ) : (
          // List view
          <>
            {/* Filter by type */}
            <div className="flex justify-end mb-4">
              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value as "dayAnchor" | "eveningAnchor" | "anchor24h" | "all")}
                className="bg-black/60 border border-[color:var(--primary-blue)]/50 text-white px-3 py-1 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[color:var(--primary-blue)]"
              >
                <option value="all">All Types</option>
                <option value="dayAnchor">Day Venue</option>
                <option value="eveningAnchor">Evening Venue</option>
                <option value="anchor24h">24h Venue</option>
                <option value="redundancy">Redundancy Venue</option>
              </select>
            </div>
            <div className="aspect-video rounded-lg mb-6 relative overflow-hidden">
              <RefillMap venues={sortedVenues} />
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="bg-black/60 px-4 py-2 rounded-lg text-white text-sm">
                  {sortedVenues.length} Premium Refill Venues
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {sortedVenues.map((v, i) => (
                <div key={v.id} className="bg-white/5 hover:bg-white/10 transition-colors rounded-lg p-4 cursor-pointer" onClick={() => setSelected(i)}>
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-medium text-white">{v.name}</h4>
                    <div className="bg-[color:var(--primary-blue)]/20 text-[color:var(--primary-blue)] px-2 py-0.5 rounded-full text-xs">{i + 1}</div>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-sm text-white/70">{v.address}</p>
                    {position && <span className="text-xs text-[color:var(--primary-blue)] font-medium flex items-center"><Navigation className="h-3 w-3 mr-1" /> {getDistance(v)}</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center text-white/50"><Info className="h-3 w-3 mr-1" /><span>Tap for details</span></div>
                    <button onClick={(e) => { e.stopPropagation(); openDirections(v); }} className="text-[color:var(--primary-blue)] hover:text-[color:var(--primary-blue)]/80 transition-colors flex items-center"><Navigation className="h-3 w-3 mr-1" /> Directions</button>
                  </div>
                </div>
              ))}
            </div>
            
          </>
        )}
        {/* Agentic Button (bottom right) */}
        <AgenticButton onClick={() => alert('Agentic workflow coming soon!')} />
      </div>
    </div>
  );
}
