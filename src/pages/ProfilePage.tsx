import { useState, useEffect } from 'react';
import { MapPin, Trophy, Target, Check, Plus, X, Save, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import {
  SPORT_OPTIONS,
  SKILL_LEVELS,
  LOOKING_FOR_OPTIONS,
  SPORT_EMOJIS,
  type Profile,
} from '@/types';

export function ProfilePage() {
  const { user, profile, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState(false);

  // Edit form state
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [sports, setSports] = useState<string[]>([]);
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [achievements, setAchievements] = useState<string[]>([]);
  const [newAchievement, setNewAchievement] = useState('');
  const [lookingFor, setLookingFor] = useState<string[]>([]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setBio(profile.bio || '');
      setCity(profile.city || '');
      setArea(profile.area || '');
      setAvatarUrl(profile.avatar_url || '');
      setSports(profile.sports || []);
      setSkillLevel(profile.skill_level || 'Beginner');
      setAchievements(profile.achievements || []);
      setLookingFor(profile.looking_for || []);
    }
  }, [profile]);

  const toggleSport = (sport: string) => {
    setSports((prev) => (prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]));
  };

  const toggleLookingFor = (item: string) => {
    setLookingFor((prev) => (prev.includes(item) ? prev.filter((x) => x !== item) : [...prev, item]));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setAchievements((prev) => [...prev, newAchievement.trim()]);
      setNewAchievement('');
    }
  };

  const removeAchievement = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const updates: Partial<Profile> = {
      full_name: fullName,
      bio,
      city,
      area,
      avatar_url: avatarUrl,
      sports,
      skill_level: skillLevel,
      achievements,
      looking_for: lookingFor,
    };
    await supabase.from('profiles').update(updates).eq('id', user.id);
    await refreshProfile();
    setSaving(false);
    setEditing(false);
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 3000);
  };

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center pt-16">
        <p className="text-ink-500">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50/60 pt-16">
      <div className="container-px py-8">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="font-display text-2xl font-extrabold text-ink-950">My Profile</h1>
            {!editing ? (
              <Button variant="secondary" size="sm" onClick={() => setEditing(true)}>
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save'}
                </Button>
              </div>
            )}
          </div>

          {savedMsg && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
              <Check className="h-4 w-4" />
              Profile saved successfully!
            </div>
          )}

          {/* Profile card */}
          <div className="overflow-hidden rounded-3xl border border-ink-100 bg-white shadow-soft">
            <div className="relative h-24 bg-gradient-to-r from-brand-500 to-brand-700">
              <div
                className="absolute inset-0 opacity-20"
                style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #fff 1px, transparent 0)', backgroundSize: '20px 20px' }}
              />
            </div>

            <div className="px-6 pb-6">
              <div className="-mt-10 flex items-end justify-between">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={fullName} className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-card" />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-2xl border-4 border-white bg-brand-100 shadow-card">
                    <User className="h-8 w-8 text-brand-600" />
                  </div>
                )}
              </div>

              {editing ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-700">Full name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-700">Avatar URL (optional)</label>
                    <input
                      type="text"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://..."
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-semibold text-ink-700">Bio</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      placeholder="Tell other athletes about yourself..."
                      className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-ink-700">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="e.g. Hyderabad"
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-semibold text-ink-700">Area</label>
                      <input
                        type="text"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        placeholder="e.g. Begumpet"
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-3">
                  <h2 className="font-display text-xl font-extrabold text-ink-950">{profile.full_name}</h2>
                  {profile.city && (
                    <p className="mt-0.5 flex items-center gap-1 text-sm text-ink-400">
                      <MapPin className="h-3.5 w-3.5" />
                      {profile.city}
                      {profile.area ? `, ${profile.area}` : ''}
                    </p>
                  )}
                  {profile.bio && <p className="mt-2 text-sm text-ink-600">{profile.bio}</p>}
                </div>
              )}

              {/* Sports */}
              <div className="mt-5">
                <p className="text-xs font-bold uppercase tracking-wide text-ink-400">Sports</p>
                {editing ? (
                  <>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {SPORT_OPTIONS.map((sport) => {
                        const selected = sports.includes(sport);
                        return (
                          <button
                            key={sport}
                            type="button"
                            onClick={() => toggleSport(sport)}
                            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-all ${
                              selected ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-ink-200 text-ink-600 hover:border-ink-300'
                            }`}
                          >
                            <span className={`flex h-5 w-5 items-center justify-center rounded-md border ${selected ? 'border-brand-600 bg-brand-600 text-white' : 'border-ink-300'}`}>
                              {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                            </span>
                            {SPORT_EMOJIS[sport] || ''} {sport}
                          </button>
                        );
                      })}
                    </div>
                    <div className="mt-3">
                      <label className="mb-1.5 block text-sm font-semibold text-ink-700">Skill level</label>
                      <select
                        value={skillLevel}
                        onChange={(e) => setSkillLevel(e.target.value)}
                        className="w-full rounded-xl border border-ink-200 px-4 py-2.5 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      >
                        {SKILL_LEVELS.map((level) => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 space-y-2">
                    {profile.sports?.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                          <span className="text-sm font-semibold text-ink-800">
                            {profile.sports.map((s) => `${SPORT_EMOJIS[s] || ''} ${s}`).join(' · ')}
                          </span>
                        </div>
                        <div className="flex items-center justify-between rounded-xl bg-ink-50 px-3 py-2">
                          <span className="text-sm font-medium text-ink-500">Skill level</span>
                          <span className="text-sm font-semibold text-ink-800">{profile.skill_level}</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-sm text-ink-400">No sports added yet. Click Edit Profile to add them.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                  <Trophy className="h-3 w-3" />
                  Achievements
                </p>
                {editing ? (
                  <div className="mt-2">
                    {achievements.map((a, i) => (
                      <div key={i} className="mb-2 flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2">
                        <span className="text-lg">🏆</span>
                        <span className="flex-1 text-sm font-semibold text-ink-800">{a}</span>
                        <button onClick={() => removeAchievement(i)} className="text-ink-400 hover:text-red-500">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newAchievement}
                        onChange={(e) => setNewAchievement(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addAchievement())}
                        placeholder="Add an achievement..."
                        className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
                      />
                      <Button variant="secondary" size="sm" onClick={addAchievement}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 space-y-2">
                    {profile.achievements?.length > 0 ? (
                      profile.achievements.map((a, i) => (
                        <div key={i} className="flex items-center gap-2 rounded-xl bg-accent-50 px-3 py-2">
                          <span className="text-lg">🏆</span>
                          <span className="text-sm font-semibold text-ink-800">{a}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-ink-400">No achievements added yet.</p>
                    )}
                  </div>
                )}
              </div>

              {/* Looking for */}
              <div className="mt-5">
                <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-400">
                  <Target className="h-3 w-3" />
                  Looking for
                </p>
                {editing ? (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LOOKING_FOR_OPTIONS.map((item) => {
                      const selected = lookingFor.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleLookingFor(item)}
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                            selected ? 'bg-brand-600 text-white' : 'bg-ink-50 text-ink-500 hover:bg-ink-100'
                          }`}
                        >
                          {selected && <Check className="h-3 w-3" />}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {profile.looking_for?.length > 0 ? (
                      profile.looking_for.map((tag) => (
                        <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
                          <Check className="h-3 w-3" />
                          {tag}
                        </span>
                      ))
                    ) : (
                      <p className="text-sm text-ink-400">Not specified yet.</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Multi-sport explanation */}
          <div className="mt-6 rounded-2xl border border-brand-100 bg-brand-50/50 p-5">
            <h3 className="font-display text-sm font-bold text-brand-800">How SportArena handles multiple sports on one profile</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-600">
              Every athlete has a single profile, but can list as many sports as they play — each with its own skill level.
              When you search for players, SportArena matches you based on the specific sports you share, your skill levels,
              and your location. This means a cricketer who also plays badminton can find partners for both sports from one
              profile, without needing separate accounts or pages. Your achievements, activities, and connections all live
              in one place, but are always filtered by the sport that matters in the moment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
