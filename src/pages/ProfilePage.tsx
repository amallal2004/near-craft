import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Loader2, MapPin, Phone, Mail, Star, Shield, Bell, Link2, Trash2, Lock, Copy, Check } from "lucide-react";

// Deterministic avatar color from name
function getAvatarColors(name: string) {
  const palettes = [
    { bg: "from-rose-500 to-red-600", text: "text-white" },
    { bg: "from-violet-500 to-purple-600", text: "text-white" },
    { bg: "from-sky-500 to-blue-600", text: "text-white" },
    { bg: "from-emerald-500 to-green-600", text: "text-white" },
    { bg: "from-amber-500 to-orange-600", text: "text-white" },
    { bg: "from-pink-500 to-rose-600", text: "text-white" },
    { bg: "from-teal-500 to-cyan-600", text: "text-white" },
    { bg: "from-indigo-500 to-blue-700", text: "text-white" },
  ];
  const idx = name
    ? name
        .split("")
        .reduce((acc, c) => acc + c.charCodeAt(0), 0) % palettes.length
    : 0;
  return palettes[idx];
}

function ProfileAvatar({
  name,
  size = "lg",
}: {
  name: string;
  size?: "sm" | "md" | "lg";
}) {
  const initials = name
    ? name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "?";
  const { bg, text } = getAvatarColors(name);
  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-xl",
    lg: "h-28 w-28 text-4xl",
  };
  return (
    <div
      className={`rounded-full bg-gradient-to-br ${bg} ${text} ${sizeClasses[size]} flex items-center justify-center font-black shadow-xl select-none`}
    >
      {initials}
    </div>
  );
}

const quickSettings = [
  {
    icon: Lock,
    label: "Password",
    sub: "Last changed 3 months ago",
    color: "text-l-primary",
  },
  {
    icon: Shield,
    label: "2FA Security",
    sub: "Protect your account",
    color: "text-emerald-500",
  },
  {
    icon: Bell,
    label: "Notifications",
    sub: "Manage preferences",
    color: "text-amber-500",
  },
  {
    icon: Trash2,
    label: "Deactivate",
    sub: "Close your account permanently",
    color: "text-red-500",
    danger: true,
  },
];

export default function ProfilePage() {
  const { profile, refreshProfile, user } = useAuth();
  const [name, setName] = useState(profile?.name ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [locationText, setLocationText] = useState(
    profile?.location_text ?? ""
  );
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({
        name,
        bio: bio || null,
        phone: phone || null,
        location_text: locationText || null,
      })
      .eq("id", user.id);
    setLoading(false);
    if (error) toast.error(error.message);
    else {
      toast.success("Profile updated!");
      refreshProfile();
    }
  };

  const handleCopyLink = () => {
    const handle =
      profile?.name?.toLowerCase().replace(/\s+/g, "-") ?? "user";
    navigator.clipboard.writeText(`gigup.app/${handle}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const displayName = profile?.name ?? "User";
  const avgRating = Number(profile?.avg_rating ?? 0);
  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";
  const profileHandle =
    profile?.name?.toLowerCase().replace(/\s+/g, "-") ?? "user";

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-8 space-y-8">

        {/* ── Profile Header Card ── */}
        <section className="relative bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100">
          {/* Top accent bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#b7102a] to-[#db313f]" />
          <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 px-8 pt-10 pb-8">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="ring-4 ring-white shadow-xl rounded-full">
                <ProfileAvatar name={displayName} size="lg" />
              </div>
              {/* Online dot */}
              <span
                className="absolute bottom-1 right-1 h-5 w-5 rounded-full border-2 border-white shadow-sm"
                style={{ background: "#2A9D8F", boxShadow: "0 0 8px rgba(42,157,143,0.5)" }}
              />
            </div>

            {/* Info */}
            <div className="flex-1 text-center sm:text-left pb-1">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#b7102a] bg-red-50 px-3 py-1 rounded-full mb-3">
                {profile?.active_role === "worker" ? "Worker" : "Customer"} Account
              </span>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
                {displayName}
              </h1>
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-4 mt-2 text-sm text-slate-500 font-medium">
                {profile?.email && (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-l-primary/70" />
                    {profile.email}
                  </span>
                )}
                {locationText && (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5 text-l-primary/70" />
                    {locationText}
                  </span>
                )}
                <span className="flex items-center gap-1.5 text-slate-400">
                  Joined {memberSince}
                </span>
              </div>
            </div>

            {/* Rating */}
            <div className="flex flex-col items-center gap-1 pb-1 shrink-0">
              <div className="flex items-center gap-1.5">
                <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                <span className="text-2xl font-black text-slate-900">
                  {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Avg Rating</p>
            </div>
          </div>
        </section>

        {/* ── Bento Grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Edit Details Form ── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Edit Details
                </h2>
                <span className="text-xs text-slate-400 italic font-medium">
                  All fields are editable
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Full Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#b7102a]/30 text-slate-900 font-medium text-sm"
                    placeholder="Your full name"
                  />
                </div>

                {/* Phone */}
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#b7102a]/30 pl-10 text-slate-900 font-medium text-sm"
                      placeholder="+91 00000 00000"
                    />
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={locationText}
                    onChange={(e) => setLocationText(e.target.value)}
                    className="h-12 rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#b7102a]/30 pl-10 text-slate-900 font-medium text-sm"
                    placeholder="City, State"
                  />
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Professional Bio
                </label>
                <Textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={5}
                  className="rounded-xl bg-slate-50 border-none focus-visible:ring-2 focus-visible:ring-[#b7102a]/30 text-slate-900 font-medium text-sm resize-none leading-relaxed"
                  placeholder="Tell us about your skills and experience..."
                />
              </div>

              {/* Save Row */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-slate-400 max-w-xs text-center sm:text-left">
                  Your profile is visible to all potential clients on the GigUp network.
                </p>
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#b7102a] to-[#db313f] text-white font-bold px-8 py-3.5 rounded-xl shadow-[0_10px_20px_rgba(183,16,42,0.2)] hover:shadow-[0_15px_30px_rgba(183,16,42,0.3)] transition-all active:scale-95 disabled:opacity-60 text-sm"
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </div>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-6">

            {/* Avatar Preview Card */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 flex flex-col items-center gap-4 text-center">
              <ProfileAvatar name={displayName} size="lg" />
              <div>
                <p className="font-black text-slate-900 text-lg leading-tight">{displayName}</p>
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  {profile?.email}
                </p>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#b7102a] to-[#db313f] rounded-full transition-all duration-700"
                  style={{ width: bio && phone && locationText ? "100%" : bio && phone ? "80%" : bio || phone ? "60%" : "40%" }}
                />
              </div>
              <div className="flex justify-between items-center w-full">
                <span className="text-xs font-bold text-[#b7102a]">
                  {bio && phone && locationText ? "100" : bio && phone ? "80" : bio || phone ? "60" : "40"}% Complete
                </span>
                <span className="text-xs text-slate-400 font-medium">Profile Strength</span>
              </div>
            </div>

            {/* Public Link */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Public Profile Link
              </p>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2.5 border border-slate-100">
                <Link2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-xs text-slate-500 font-mono truncate flex-1">
                  gigup.app/{profileHandle}
                </span>
                <button
                  onClick={handleCopyLink}
                  className="text-[#b7102a] hover:text-[#92001c] transition-colors p-1 rounded"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Email (read-only) */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-3">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Account Email
              </p>
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-l-primary" />
                <span className="text-sm font-medium text-slate-700 truncate">
                  {profile?.email ?? "—"}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">Email cannot be changed here.</p>
            </div>

          </div>
        </div>

        {/* ── Quick Settings Row ── */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickSettings.map((item) => (
            <div
              key={item.label}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-all duration-200 cursor-pointer relative overflow-hidden border-t-4 border-t-transparent hover:border-t-[#b7102a]"
            >
              <item.icon className={`h-5 w-5 mb-3 ${item.color}`} />
              <h5
                className={`font-bold text-sm ${
                  item.danger ? "text-red-500" : "text-slate-900"
                }`}
              >
                {item.label}
              </h5>
              <p className="text-xs text-slate-400 mt-1">{item.sub}</p>
            </div>
          ))}
        </section>

      </div>
    </AppLayout>
  );
}
