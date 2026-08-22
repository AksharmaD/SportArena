import { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin, Star, Clock, Search, Plus, X } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { SPORT_OPTIONS, SPORT_EMOJIS, type Venue } from '@/types';

// Fix default marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

const DEFAULT_CENTER: [number, number] = [17.385, 78.4867]; // Hyderabad

export function VenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterSport, setFilterSport] = useState('');
  const [filterRating, setFilterRating] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [name, setName] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [rating, setRating] = useState('4.0');
  const [facilities, setFacilities] = useState('');
  const [openingHours, setOpeningHours] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const fetchVenues = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('venues').select('*').order('rating', { ascending: false });
    if (filterSport) query = query.contains('sports', [filterSport]);
    if (filterRating) query = query.gte('rating', parseFloat(filterRating));
    const { data } = await query;
    let filtered = (data as Venue[]) || [];
    if (searchQuery) {
      filtered = filtered.filter((v) => v.name.toLowerCase().includes(searchQuery.toLowerCase()) || v.address?.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setVenues(filtered);
    setLoading(false);
  }, [filterSport, filterRating, searchQuery]);

  useEffect(() => { fetchVenues(); }, [fetchVenues]);

  const toggleSport = (sport: string) => {
    setSports((prev) => prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await supabase.from('venues').insert({
      name: name.trim(),
      sports,
      address: address.trim(),
      latitude: lat ? parseFloat(lat) : null,
      longitude: lng ? parseFloat(lng) : null,
      rating: parseFloat(rating) || 0,
      facilities: facilities ? facilities.split(',').map((f) => f.trim()) : [],
      opening_hours: openingHours,
      image_url: imageUrl,
    });
    setShowCreate(false);
    setName(''); setSports([]); setAddress(''); setLat(''); setLng(''); setFacilities(''); setOpeningHours(''); setImageUrl('');
    fetchVenues();
  };

  const mapVenues = venues.filter((v) => v.latitude != null && v.longitude != null);

  return (
    <div className="container-px py-8 lg:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-ink-950">Venues</h1>
            <p className="mt-1 text-sm text-ink-500">Find sports facilities near you.</p>
          </div>
          <Button size="sm" onClick={() => setShowCreate(true)}>
            <Plus className="h-4 w-4" /> Add Venue
          </Button>
        </div>

        {/* Search & filters */}
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search venues..."
              className="w-full rounded-xl border border-ink-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
          </div>
          <select value={filterSport} onChange={(e) => setFilterSport(e.target.value)}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
            <option value="">All sports</option>
            {SPORT_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filterRating} onChange={(e) => setFilterRating(e.target.value)}
            className="rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100">
            <option value="">Any rating</option>
            <option value="4">4.0+</option>
            <option value="4.5">4.5+</option>
          </select>
        </div>

        {/* Create modal */}
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/40 px-5" onClick={() => setShowCreate(false)}>
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-extrabold text-ink-950">Add a Venue</h2>
                <button onClick={() => setShowCreate(false)} className="text-ink-400 hover:text-ink-900"><X className="h-5 w-5" /></button>
              </div>
              <form onSubmit={handleCreate} className="mt-4 space-y-3">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Venue name</label>
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. SportArena Badminton Court" required
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-semibold text-ink-700">Sports</label>
                  <div className="flex flex-wrap gap-2">
                    {SPORT_OPTIONS.map((s) => (
                      <button key={s} type="button" onClick={() => toggleSport(s)}
                        className={`rounded-full px-3 py-1 text-xs font-semibold transition-all ${sports.includes(s) ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-500'}`}>
                        {SPORT_EMOJIS[s]} {s}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Address</label>
                  <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="e.g. Road No 12, Hyderabad"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Latitude</label>
                    <input type="text" value={lat} onChange={(e) => setLat(e.target.value)} placeholder="17.385"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Longitude</label>
                    <input type="text" value={lng} onChange={(e) => setLng(e.target.value)} placeholder="78.4867"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Rating</label>
                    <input type="text" value={rating} onChange={(e) => setRating(e.target.value)} placeholder="4.5"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-ink-700">Opening hours</label>
                    <input type="text" value={openingHours} onChange={(e) => setOpeningHours(e.target.value)} placeholder="6AM - 10PM"
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                  </div>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-semibold text-ink-700">Facilities (comma-separated)</label>
                  <input type="text" value={facilities} onChange={(e) => setFacilities(e.target.value)} placeholder="Parking, Changing rooms, Cafeteria"
                    className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100" />
                </div>
                <Button type="submit" size="md" className="w-full">Add Venue</Button>
              </form>
            </div>
          </div>
        )}

        {/* Map */}
        {mapVenues.length > 0 && (
          <div className="mt-6 overflow-hidden rounded-2xl border border-ink-100 shadow-soft">
            <MapContainer center={DEFAULT_CENTER} zoom={11} style={{ height: '320px', width: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; OpenStreetMap contributors'
              />
              {mapVenues.map((venue) => (
                <Marker key={venue.id} position={[venue.latitude!, venue.longitude!]}>
                  <Popup>
                    <strong>{venue.name}</strong><br />
                    {venue.sports?.join(', ') || 'Multi-sport'}<br />
                    {venue.rating ? `⭐ ${venue.rating}` : ''}
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Venue cards */}
        {loading ? (
          <div className="py-20 text-center text-ink-400">Loading venues...</div>
        ) : venues.length === 0 ? (
          <div className="py-20 text-center">
            <MapPin className="mx-auto h-10 w-10 text-ink-300" />
            <p className="mt-3 text-sm font-medium text-ink-500">No venues found.</p>
            <p className="text-xs text-ink-400">Add a venue to help others find places to play!</p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {venues.map((venue) => (
              <div key={venue.id} className="overflow-hidden rounded-2xl border border-ink-100 bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
                <div className="relative h-36 overflow-hidden bg-sky-50">
                  {venue.image_url ? (
                    <img src={venue.image_url} alt={venue.name} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-4xl">🏟️</div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/40 to-transparent" />
                  <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-ink-800 backdrop-blur-sm">
                    {venue.sports?.slice(0, 2).map((s) => `${SPORT_EMOJIS[s] || ''} ${s}`).join(' · ') || 'Multi-sport'}
                  </span>
                </div>
                <div className="p-5">
                  <h3 className="font-display text-base font-bold text-ink-950">{venue.name}</h3>
                  {venue.address && <p className="mt-1 flex items-start gap-1.5 text-sm text-ink-500"><MapPin className="mt-0.5 h-3.5 w-3.5 flex-none" />{venue.address}</p>}
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
                    {venue.rating > 0 && <span className="flex items-center gap-1 font-semibold text-ink-700"><Star className="h-4 w-4 fill-accent-400 text-accent-400" />{venue.rating}</span>}
                    {venue.opening_hours && <span className="flex items-center gap-1 text-ink-400"><Clock className="h-3.5 w-3.5" />{venue.opening_hours}</span>}
                  </div>
                  {venue.facilities?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {venue.facilities.map((f) => (
                        <span key={f} className="rounded-full bg-ink-50 px-2.5 py-0.5 text-xs font-medium text-ink-600">{f}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
