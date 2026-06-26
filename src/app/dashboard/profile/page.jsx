"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase.config";
import { onAuthStateChanged } from "firebase/auth";
import toast from "react-hot-toast";
import { User, Mail, Phone, MapPin, Camera, Edit3, Save, X } from "lucide-react";

const FIELD_CLASS =
  "w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm outline-none focus:border-gray-400 focus:ring-2 focus:ring-black/5 transition placeholder:text-gray-400";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", address: "", photo: "" });
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (u) {
        setUser(u);
        try {
          const res = await fetch(`/api/users?email=${u.email}`);
          const data = await res.json();
          setForm({
            name: data?.name || u.displayName || "",
            phone: data?.phone || "",
            address: data?.address || "",
            photo: data?.photo || u.photoURL || "",
          });
        } catch (err) { console.error(err); }
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  /* auto-save draft */
  useEffect(() => {
    if (!isDirty) return;
    const t = setTimeout(() => localStorage.setItem("profile-draft", JSON.stringify(form)), 600);
    return () => clearTimeout(t);
  }, [form, isDirty]);

  /* warn on leave */
  useEffect(() => {
    const handler = (e) => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  const handleChange = (e) => {
    setIsDirty(true);
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image"); return; }
    const reader = new FileReader();
    reader.onloadend = () => { setIsDirty(true); setForm((p) => ({ ...p, photo: reader.result })); };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await fetch("/api/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, ...form }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setEditMode(false);
      setIsDirty(false);
      localStorage.removeItem("profile-draft");
      toast.success("Profile updated");
    } catch (err) { toast.error(err.message || "Something went wrong"); }
    finally { setSaving(false); }
  };

  const cancelEdit = () => {
    setEditMode(false);
    setIsDirty(false);
    localStorage.removeItem("profile-draft");
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-5 max-w-3xl">
        <div className="h-8 w-32 bg-gray-200 rounded-xl" />
        <div className="grid md:grid-cols-3 gap-5">
          <div className="h-64 bg-gray-200 rounded-2xl" />
          <div className="md:col-span-2 h-64 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!user) return <p className="text-center text-gray-500 py-20">Not logged in</p>;

  const initials = (form.name || user.displayName || user.email || "U")[0].toUpperCase();

  return (
    <div className="max-w-3xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage your personal information</p>
        </div>
        {!editMode ? (
          <button
            onClick={() => setEditMode(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition"
          >
            <Edit3 size={14} /> Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={cancelEdit}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition">
              <X size={14} /> Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-black text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition disabled:opacity-50">
              {saving
                ? <><span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />Saving…</>
                : <><Save size={14} />Save Changes</>}
            </button>
          </div>
        )}
      </div>

      {isDirty && (
        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
          You have unsaved changes
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Avatar card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            {form.photo ? (
              <img
                src={form.photo}
                alt="avatar"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gray-900 flex items-center justify-center border-4 border-white shadow-md">
                <span className="text-3xl font-bold text-white">{initials}</span>
              </div>
            )}
            {editMode && (
              <label className="absolute bottom-0 right-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-gray-800 transition shadow">
                <Camera size={14} />
                <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
              </label>
            )}
          </div>

          <h2 className="font-semibold text-gray-900">{form.name || user.displayName || "—"}</h2>
          <p className="text-xs text-gray-400 mt-1 break-all">{user.email}</p>

          <div className="mt-4 w-full pt-4 border-t border-gray-100 space-y-2 text-left">
            {[
              { icon: Phone, value: form.phone || "—", label: "Phone" },
              { icon: MapPin, value: form.address || "—", label: "Address" },
            ].map(({ icon: Icon, value, label }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-gray-500">
                <Icon size={12} className="shrink-0 text-gray-400" />
                <span className="truncate">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Info card */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-5">Personal Information</h3>

          <div className="grid sm:grid-cols-2 gap-5">
            {/* Name */}
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5">
                <User size={11} /> Full Name
              </label>
              {editMode
                ? <input name="name" value={form.name} onChange={handleChange} className={FIELD_CLASS} placeholder="Your full name" />
                : <p className="text-sm text-gray-800 font-medium">{form.name || "—"}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5">
                <Mail size={11} /> Email
              </label>
              <p className="text-sm text-gray-800 font-medium">{user.email}</p>
              <p className="text-xs text-gray-400 mt-0.5">Cannot be changed</p>
            </div>

            {/* Phone */}
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5">
                <Phone size={11} /> Phone Number
              </label>
              {editMode
                ? <input name="phone" value={form.phone} onChange={handleChange} className={FIELD_CLASS} placeholder="01XXXXXXXXX" />
                : <p className="text-sm text-gray-800 font-medium">{form.phone || "—"}</p>}
            </div>

            {/* Address */}
            <div>
              <label className="text-xs text-gray-400 font-medium flex items-center gap-1 mb-1.5">
                <MapPin size={11} /> Address
              </label>
              {editMode
                ? <input name="address" value={form.address} onChange={handleChange} className={FIELD_CLASS} placeholder="Your address" />
                : <p className="text-sm text-gray-800 font-medium">{form.address || "—"}</p>}
            </div>
          </div>

          {/* Account info */}
          <div className="mt-6 pt-5 border-t border-gray-100">
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Account Details</h3>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-1">Account Created</p>
                <p className="font-medium text-gray-800">
                  {user.metadata?.creationTime
                    ? new Date(user.metadata.creationTime).toLocaleDateString("en-BD", { day: "numeric", month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Email Verified</p>
                <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                  user.emailVerified ? "bg-green-50 text-green-700 border-green-200" : "bg-yellow-50 text-yellow-700 border-yellow-200"
                }`}>
                  {user.emailVerified ? "✓ Verified" : "Unverified"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
