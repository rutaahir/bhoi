import { createFileRoute, Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useTranslation } from "@/hooks/useTranslation";
import { useLanguage } from "@/context/LanguageContext";
import { useState, useEffect, useMemo, useRef, type TouchEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users, Calendar, Building2, Briefcase, Heart, MapPin,
  ArrowRight, Star, Sparkles, HandHeart, Check, FileText, Download,
  LayoutDashboard, Newspaper, Image as ImageIcon, Video, Network, Settings,
  Search, Bell, Globe, ChevronDown, Plus, Play, User, X, Mail, Phone, Home as HomeIcon,
  ChevronLeft, ChevronRight,
  ShieldCheck, ArrowUpRight, Loader, IndianRupee, Clock, Filter, Tag, ExternalLink, Share2, Loader2
} from "lucide-react";
import { COMMUNITIES, EVENTS, MATRIMONY, BUSINESSES, JOBS, NEWS } from "@/data/mock";
import { api, getImageUrl } from "@/lib/api";
import heroBg from "@/assets/hero-bg.png";
import { toast } from "sonner";
import { MobileBottomNav, type SidebarItem } from "@/components/wag/Sidebar";
import { useAuth } from "@/context/AuthContext";
import { dashHomeFor } from "@/components/wag/Navbar";

type SearchParams = {
  page?: string;
};

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): SearchParams => {
    return {
      page: search.page as string || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "BHOI — Connect. Empower. Grow." },
      { name: "description", content: "Community ERP and social network for Indian samaj communities — manage members, events, matrimony, jobs and donations on one platform." },
      { property: "og:title", content: "BHOI — Connect Your Samaj Digitally" },
    ]
  }),
  component: DashboardStyleHome,
});

const sidebarItems = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Samachar", icon: Newspaper },
  { label: "Matrimony", icon: Heart },
  { label: "Jobs", icon: Briefcase },
  { label: "Communities", icon: Building2 },
  { label: "Events", icon: Calendar },
  { label: "Directory", icon: Users },
  { label: "Business Directory", icon: Building2 },
  { label: "Donations", icon: HandHeart },
  { label: "Gallery", icon: ImageIcon },
  { label: "Videos", icon: Video },
  { label: "Documents", icon: FileText }
];


const BIZ_CATEGORIES = [
  "All", "Food & Bakery", "Manufacturing", "Jewellery", "Healthcare",
  "Textile", "Construction", "Automobile", "Professional",
  "Education", "Technology", "Retail", "Agriculture", "Finance", "Transport", "Other"
];

function memberToBizCard(m: any): any {
  return {
    _source: "member",
    id: `m_${m.id}`,
    name: m.business_name || m.name,
    category: m.business_category || "Other",
    owner: m.name,
    phone: m.phone || "",
    email: m.email || "",
    city: m.district || m.village || "",
    state: m.state || "Gujarat",
    gst_no: m.gst_no || "",
    business_years: m.business_years || "",
    desc: m.business_category
      ? `${m.business_category} business by ${m.name}, ${m.village || m.district || "Gujarat"}.`
      : `Community member business by ${m.name}.`,
    verified: m.status === "Verified" || m.status === "Active",
    img: m.avatar || null,
    img_url: m.avatar_url || null,
    rating: 0,
    member_id: m.id,
  };
}

function BusinessDirectorySection({ t }: { t: (k: string) => string }) {
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [memberBiz, setMemberBiz] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [tab, setTab] = useState<"all" | "listed" | "members">("all");
  const [openCard, setOpenCard] = useState<any | null>(null);
  const [carouselIdx, setCarouselIdx] = useState(0);

  useEffect(() => {
    setCarouselIdx(0);
  }, [openCard]);

  useEffect(() => {
    setLoading(true);
    Promise.allSettled([
      api.getBusinesses({}),
      api.getMembers({ profession_type: "Business" }),
    ]).then(([bizRes, memRes]) => {
      if (bizRes.status === "fulfilled") {
        const visible = (bizRes.value || []).filter(
          (b: any) => b.status !== "REJECTED" && b.status !== "SUSPENDED" &&
            (b.verified || b.status === "VERIFIED" || b.status === undefined || b.status === "PENDING")
        );
        setBusinesses(visible);
      }
      if (memRes.status === "fulfilled") {
        const bm = (memRes.value || [])
          .filter((m: any) => m.profession_type === "Business" && m.business_name)
          .map(memberToBizCard);
        setMemberBiz(bm);
      }
    }).finally(() => setLoading(false));
  }, []);

  const combined = (() => {
    let src: any[] = [];
    if (tab === "listed") src = businesses;
    else if (tab === "members") src = memberBiz;
    else {
      const names = new Set(businesses.map((b: any) => b.name?.toLowerCase()));
      src = [...businesses, ...memberBiz.filter((m: any) => !names.has(m.name?.toLowerCase()))];
    }
    return src.filter((b: any) => {
      const q = search.toLowerCase();
      const matchSearch = !q || (b.name || "").toLowerCase().includes(q) || (b.owner || "").toLowerCase().includes(q) || (b.category || "").toLowerCase().includes(q);
      const matchCat = category === "All" || b.category === category;
      return matchSearch && matchCat;
    });
  })();

  const getImg = (b: any) => b.img || b.img_url || b.cover || b.cover_url || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop";

  return (
    <motion.div key="business" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-[#3E2723]">{t("sidebar.businessDirectory")}</h2>
          <p className="text-xs text-warm-muted mt-0.5">Discover businesses & entrepreneurs from our samaj community</p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1 rounded-full font-bold">{businesses.length} Listed</span>
          <span className="bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-full font-bold">{memberBiz.length} Member</span>
        </div>
      </div>

      {/* Search + Filter */}
      <div className="bg-white border border-[#EBE3DB] rounded-2xl p-4 shadow-sm space-y-3">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D58]" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search business name, owner, or category..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] text-sm"
          />
        </div>
        {/* Category Pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
          {BIZ_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition border ${
                category === cat
                  ? "bg-[#F97316] text-white border-[#F97316]"
                  : "border-[#EBE3DB] text-[#5C4033] bg-[#FFF8F2] hover:bg-[#FDF2E9]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-2 pt-1 border-t border-[#F3E8DE]">
          {(["all", "listed", "members"] as const).map(tb => (
            <button
              key={tb}
              onClick={() => setTab(tb)}
              className={`px-4 py-1.5 rounded-lg text-[11px] font-bold transition border ${
                tab === tb
                  ? "bg-[#3E2723] text-white border-[#3E2723]"
                  : "border-[#EBE3DB] text-[#5C4033] hover:bg-[#FAF3EC]"
              }`}
            >
              {tb === "all" ? "All" : tb === "listed" ? "Directory Listings" : "Member Businesses"}
            </button>
          ))}
          <span className="ml-auto text-[11px] text-warm-muted font-medium">{combined.length} result{combined.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      {/* Cards Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden animate-pulse shadow-sm">
              <div className="h-32 bg-[#F3E8DE]" />
              <div className="p-4 space-y-2">
                <div className="h-3 w-16 bg-[#F3E8DE] rounded" />
                <div className="h-4 w-3/4 bg-[#F3E8DE] rounded" />
                <div className="h-3 w-1/2 bg-[#F3E8DE] rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : combined.length === 0 ? (
        <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center shadow-sm">
          <Building2 className="w-10 h-10 text-[#F97316] mx-auto mb-3 opacity-50" />
          <h3 className="font-bold text-[#3E2723] text-base">No businesses found</h3>
          <p className="text-xs text-warm-muted mt-1">Try adjusting your search or category filter</p>
          <button onClick={() => { setSearch(""); setCategory("All"); setTab("all"); }} className="mt-4 px-5 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] transition">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {combined.map((b: any) => (
            <div
              key={b.id}
              onClick={() => setOpenCard(b)}
              className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden flex flex-col hover:shadow-lg transition-all duration-300 cursor-pointer group shadow-sm"
            >
              <div className="relative h-36 overflow-hidden bg-[#FAF3EC]">
                <img src={getImg(b)} alt={b.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  <span className="text-[9px] uppercase tracking-wider bg-black/60 text-amber-300 px-2 py-0.5 rounded-full font-bold border border-amber-400/30">
                    {b.category}
                  </span>
                  {b._source === "member" && (
                    <span className="text-[9px] uppercase tracking-wider bg-blue-600/80 text-white px-2 py-0.5 rounded-full font-bold">Member</span>
                  )}
                </div>
                {(b.verified || b.status === "VERIFIED") && (
                  <div className="absolute top-2.5 right-2.5 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-400">✓ Verified</div>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div className="space-y-1">
                  <h3 className="font-bold text-sm text-[#3E2723] line-clamp-1 group-hover:text-[#F97316] transition-colors">{b.name}</h3>
                  <p className="text-[10px] text-warm-muted">Owner: <span className="font-semibold text-[#5C4033]">{b.owner || "—"}</span></p>
                  <p className="text-[10px] text-warm-muted line-clamp-2 min-h-[28px]">{b.desc || "No description available."}</p>
                </div>
                <div className="flex gap-2 pt-3 mt-2 border-t border-[#F3E8DE]">
                  {b.phone && (
                    <a href={`https://wa.me/${b.phone}`} target="_blank" rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className="flex-1 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold text-center hover:bg-emerald-100 transition"
                    >
                      WhatsApp
                    </a>
                  )}
                  <button className="flex-1 py-1.5 rounded-lg bg-[#FFF5EE] border border-[#F3E8DE] text-[#F97316] text-[10px] font-bold hover:bg-[#FDF2E9] transition">
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {openCard && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setOpenCard(null)}>
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="relative h-44">
              <img src={getImg(openCard)} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <button onClick={() => setOpenCard(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition">✕</button>
              <div className="absolute bottom-3 left-4">
                <span className="text-[9px] uppercase font-bold bg-[#F97316] text-white px-2.5 py-0.5 rounded-full">{openCard.category}</span>
                {openCard._source === "member" && <span className="ml-1.5 text-[9px] uppercase font-bold bg-blue-600 text-white px-2.5 py-0.5 rounded-full">Member Business</span>}
              </div>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <h2 className="font-bold text-lg text-[#3E2723]">{openCard.name}</h2>
                <p className="text-xs text-warm-muted">Owner: <span className="font-semibold text-[#5C4033]">{openCard.owner}</span></p>
              </div>
              <p className="text-xs text-[#5C4033] leading-relaxed bg-[#FAF3EC] p-3 rounded-xl">{openCard.desc}</p>
              
              {/* Gallery List */}
              {(() => {
                const galleryList: string[] = [];
                if (openCard.gallery) {
                  if (Array.isArray(openCard.gallery)) {
                    galleryList.push(...openCard.gallery);
                  } else if (typeof openCard.gallery === "string") {
                    try {
                      const parsed = JSON.parse(openCard.gallery);
                      if (Array.isArray(parsed)) galleryList.push(...parsed);
                    } catch (_) {}
                  }
                }
                if (galleryList.length === 0) return null;
                return (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Business Gallery</span>
                    
                    {/* Large display */}
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-[#EBE3DB] bg-[#FAF3EC] shadow-sm group">
                      <img
                        src={getImageUrl(galleryList[carouselIdx] || galleryList[0])}
                        alt=""
                        className="w-full h-full object-cover transition-all duration-300"
                      />
                      {galleryList.length > 1 && (
                        <>
                          <button
                            type="button"
                            onClick={() => setCarouselIdx(prev => (prev === 0 ? galleryList.length - 1 : prev - 1))}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setCarouselIdx(prev => (prev === galleryList.length - 1 ? 0 : prev + 1))}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white text-slate-800 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold">
                        {(carouselIdx % galleryList.length) + 1} / {galleryList.length}
                      </div>
                    </div>

                    {/* Small thumbnails */}
                    {galleryList.length > 1 && (
                      <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
                        {galleryList.map((g, idx) => {
                          const isActive = (carouselIdx % galleryList.length) === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => setCarouselIdx(idx)}
                              className={`w-14 h-10 rounded-lg overflow-hidden border shrink-0 transition-all ${
                                isActive ? "border-[#F97316] ring-2 ring-[#F97316]/20 scale-95" : "border-[#EBE3DB] opacity-70 hover:opacity-100"
                              }`}
                            >
                              <img src={getImageUrl(g)} alt="" className="w-full h-full object-cover" />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {openCard.city && <div className="bg-[#FFF8F2] rounded-xl p-2.5"><span className="text-warm-muted block">City</span><strong className="text-[#3E2723]">{openCard.city}</strong></div>}
                {openCard.state && <div className="bg-[#FFF8F2] rounded-xl p-2.5"><span className="text-warm-muted block">State</span><strong className="text-[#3E2723]">{openCard.state}</strong></div>}
                {openCard.gst_no && <div className="bg-[#FFF8F2] rounded-xl p-2.5"><span className="text-warm-muted block">GST No.</span><strong className="text-[#3E2723]">{openCard.gst_no}</strong></div>}
                {openCard.business_years && <div className="bg-[#FFF8F2] rounded-xl p-2.5"><span className="text-warm-muted block">Years in Business</span><strong className="text-[#3E2723]">{openCard.business_years}</strong></div>}
              </div>
              <div className="flex gap-2 pt-1">
                {openCard.phone && (
                  <a href={`https://wa.me/${openCard.phone}`} target="_blank" rel="noopener noreferrer"
                    className="flex-1 py-2.5 rounded-xl bg-emerald-500 text-white text-xs font-bold text-center hover:bg-emerald-600 transition"
                  >WhatsApp</a>
                )}
                {openCard.phone && (
                  <a href={`tel:${openCard.phone}`}
                    className="flex-1 py-2.5 rounded-xl bg-[#F97316] text-white text-xs font-bold text-center hover:bg-[#EA580C] transition"
                  >Call Now</a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function DashboardStyleHome() {
  const { t } = useTranslation();
  const { page } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showLoginPromptModal, setShowLoginPromptModal] = useState(false);

  const [activeNav, setActiveNav] = useState("Dashboard");
  const [selectedCity, setSelectedCity] = useState("Ahmedabad");
  const { language, setLanguage } = useLanguage();
  const [samacharPaused, setSamacharPaused] = useState(false);
  const [jobsPaused, setJobsPaused] = useState(false);
  const [partnerIndex, setPartnerIndex] = useState(0);
  const [partnerPaused, setPartnerPaused] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryPaused, setGalleryPaused] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const eventTrackRef = useRef<HTMLDivElement | null>(null);

  const handleNavClick = (label: string) => {
    const pageVal = label === "Dashboard" ? undefined : label.toLowerCase().replace(/\s+/g, "-");
    navigate({
      to: "/",
      search: { page: pageVal },
    });
  };

  useEffect(() => {
    if (page) {
      const matchedItem = sidebarItems.find(
        (item) => item.label.toLowerCase().replace(/\s+/g, "-") === page.toLowerCase()
      );
      if (matchedItem) {
        setActiveNav(matchedItem.label);
      } else if (page.toLowerCase() === "subscription") {
        setActiveNav("Subscription");
      }
    } else {
      setActiveNav("Dashboard");
    }
  }, [page]);

  useEffect(() => {
    if (partnerPaused) return;

    const timer = window.setInterval(() => {
      setPartnerIndex((prev) => (prev + 1) % PARTNERS.length);
    }, 3200);

    return () => window.clearInterval(timer);
  }, [partnerPaused]);

  useEffect(() => {
    if (galleryPaused) return;
    const timer = window.setInterval(() => {
      setGalleryIndex((prev) => (prev + 1) % GALLERY_IMAGES.length);
    }, 4200);

    return () => window.clearInterval(timer);
  }, [galleryPaused]);

  useEffect(() => {
    setGalleryLoading(true);
  }, [galleryIndex]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setVideoIndex((prev) => (prev + 1) % POPULAR_VIDEOS.length);
    }, 5000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setHighlightIndex((prev) => (prev + 1) % HIGHLIGHTS.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, []);

  const activeHighlight = HIGHLIGHTS[highlightIndex];
  const activeVideo = POPULAR_VIDEOS[videoIndex];
  const activeGallery = GALLERY_IMAGES[galleryIndex];

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  };

  const handleTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartX.current;
    const end = event.changedTouches[0]?.clientX ?? null;
    if (start === null || end === null) return;
    const delta = start - end;
    if (Math.abs(delta) < 40) return;
    setGalleryIndex((prev) => (prev + (delta > 0 ? 1 : -1) + GALLERY_IMAGES.length) % GALLERY_IMAGES.length);
    touchStartX.current = null;
  };

  // Data states - loading from API
  const [communities, setCommunities] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [matrimony, setMatrimony] = useState<any[]>([]);
  const [news, setNews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Global Mock States to make items interactive
  const [userProfile, setUserProfile] = useState({
    name: "Rajesh Patel",
    email: "rajesh.patel@gmail.com",
    phone: "+91 98240 12345",
    address: "A-402, Shivalik Residency, Satellite",
    samaj: "Kutch Patidar Samaj",
    membership: "Premium Member",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop"
  });

  const [communityList, setCommunityList] = useState<any[]>([]);
  const [jobList, setJobList] = useState<any[]>([]);
  const [eventList, setEventList] = useState<any[]>([]);
  const [matrimonyList, setMatrimonyList] = useState<any[]>([]);

  // Modal / Detail States
  const [selectedNews, setSelectedNews] = useState<any>(null);
  const [selectedVideo, setSelectedVideo] = useState<any>(null);
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);
  const [showPostJob, setShowPostJob] = useState(false);
  const [showReceipt, setShowReceipt] = useState<any>(null);

  // New features states
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [registeringEvent, setRegisteringEvent] = useState<{ event: any; index: number } | null>(null);
  const [regForm, setRegForm] = useState({ name: "", email: "", phone: "", attendees: 1 });
  const [selectedFamilyTree, setSelectedFamilyTree] = useState<any>(null);
  const [campaignList, setCampaignList] = useState<any[]>([]);
  const [userDonations, setUserDonations] = useState<any[]>([]);
  const [donationTab, setDonationTab] = useState<"campaigns" | "history">("campaigns");
  const [families, setFamilies] = useState<any[]>([]);

  // Form & Filter states for Communities Portal
  const [communitySearch, setCommunitySearch] = useState("");
  const [communityTypeFilter, setCommunityTypeFilter] = useState("All");
  const [selectedCommunityDetails, setSelectedCommunityDetails] = useState<any>(null);
  const [showRegisterCommunity, setShowRegisterCommunity] = useState(false);
  const [isSubmittingCommunity, setIsSubmittingCommunity] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: "",
    type: "Subsidiary",
    district: "Ahmedabad",
    village: "Navrangpura",
    desc: "",
    state: "Gujarat"
  });

  const FALLBACK_COMMUNITIES = [
    { id: 101, name: "Ahmedabad Brahmin Samaj", type: "Super", state: "Gujarat", district: "Ahmedabad", village: "Navrangpura", member_count: 1250, cover: "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60", desc: "Premier Brahmin Samaj platform for Ahmedabad region promoting cultural exchange, student education, and community networking.", joined: false },
    { id: 102, name: "Bangalore Kannada Koota", type: "Super", state: "Karnataka", district: "Bengaluru", village: "Jayanagar", member_count: 840, cover: "https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=800&auto=format&fit=crop&q=60", desc: "Cultural and community organization for Kannada diaspora in Bangalore.", joined: false },
    { id: 103, name: "Bhuj Kutchi Leva Patel", type: "Subsidiary", state: "Gujarat", district: "Kutch", village: "Bhuj City", member_count: 2300, cover: "https://images.unsplash.com/photo-1532375810709-75b1da00537c?w=800&auto=format&fit=crop&q=60", desc: "Local chapter connecting Leva Patel families across Kutch district.", joined: false },
    { id: 104, name: "Chennai Iyengar Sabha", type: "Super", state: "Tamil Nadu", district: "Chennai", village: "Mylapore", member_count: 620, cover: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=800&auto=format&fit=crop&q=60", desc: "Promoting culture, religious events, and family welfare in Chennai.", joined: false },
    { id: 105, name: "Delhi Punjabi Biradari", type: "Super", state: "Delhi", district: "New Delhi", village: "Greater Kailash", member_count: 1750, cover: "https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800&auto=format&fit=crop&q=60", desc: "Connecting families, trade, and youth initiatives across NCR.", joined: false },
    { id: 106, name: "Hyderabad Reddy Sangh", type: "Super", state: "Telangana", district: "Hyderabad", village: "Banjara Hills", member_count: 1410, cover: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60", desc: "Community association for social support, matrimonials, and student scholarships.", joined: false }
  ];

  const allAvailableCommunities = useMemo(() => {
    return communityList.length > 0 ? communityList : (communities.length > 0 ? communities : FALLBACK_COMMUNITIES);
  }, [communityList, communities]);

  const filteredCommunities = useMemo(() => {
    return allAvailableCommunities.filter((c: any) => {
      const q = communitySearch.toLowerCase().trim();
      const nameStr = (c.name || "").toLowerCase();
      const districtStr = (c.district || "").toLowerCase();
      const villageStr = (c.village || "").toLowerCase();
      const stateStr = (c.state || "").toLowerCase();
      const typeStr = (c.type || "").toLowerCase();

      const matchSearch = !q || nameStr.includes(q) || districtStr.includes(q) || villageStr.includes(q) || stateStr.includes(q);
      const matchType = communityTypeFilter === "All" || typeStr.includes(communityTypeFilter.toLowerCase());

      return matchSearch && matchType;
    });
  }, [allAvailableCommunities, communitySearch, communityTypeFilter]);

  const handleRegisterCommunitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommunity.name.trim()) {
      toast.error("Please provide a Community Name.");
      return;
    }
    setIsSubmittingCommunity(true);
    try {
      const payload = {
        name: newCommunity.name,
        type: newCommunity.type || "Subsidiary",
        district: newCommunity.district || "Ahmedabad",
        village: newCommunity.village || "Navrangpura",
        state: newCommunity.state || "Gujarat",
        desc: newCommunity.desc || "Community platform created by member.",
        cover_url: "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60"
      };
      const created = await api.createCommunity(payload).catch(() => null);
      const mapped = {
        ...(created || payload),
        id: created?.id || Date.now(),
        cover: payload.cover_url,
        member_count: 1,
        joined: true
      };
      setCommunityList(prev => [mapped, ...prev]);
      setShowRegisterCommunity(false);
      setNewCommunity({ name: "", type: "Subsidiary", district: "Ahmedabad", village: "Navrangpura", desc: "", state: "Gujarat" });
      toast.success("Community registered successfully!");
    } catch (err: any) {
      console.error("Failed to register community:", err);
      toast.error("Failed to register community.");
    } finally {
      setIsSubmittingCommunity(false);
    }
  };

  const handleJoinCommunityClick = async (c: any, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();

    // Enforce login requirement
    if (!user) {
      setShowLoginPromptModal(true);
      return;
    }

    const nextJoined = !c.joined;
    try {
      if (c.id) {
        if (nextJoined) {
          await api.joinCommunity(c.id, {
            name: user.name,
            email: user.email,
            phone: user.phone || "+91 98240 12345",
            gender: user.gender || "Male",
            village: c.village || c.district || "Ahmedabad"
          }).catch(() => null);
        } else {
          await api.leaveCommunity(c.id).catch(() => null);
        }
      }
    } catch (err) {
      console.warn("API join/leave failed", err);
    }

    setCommunityList(prev => prev.map((item, idx) => {
      if ((item.id && item.id === c.id) || item.name === c.name) {
        return {
          ...item,
          joined: nextJoined,
          member_count: nextJoined ? (item.member_count || 150) + 1 : Math.max(1, (item.member_count || 150) - 1)
        };
      }
      return item;
    }));

    if (selectedCommunityDetails && selectedCommunityDetails.name === c.name) {
      setSelectedCommunityDetails((prev: any) => prev ? {
        ...prev,
        joined: nextJoined,
        member_count: nextJoined ? (prev.member_count || 150) + 1 : Math.max(1, (prev.member_count || 150) - 1)
      } : null);
    }

    if (nextJoined) {
      toast.success(`Join request sent to ${c.name}! Pending Community Admin approval.`);
    } else {
      toast.info(`Left ${c.name}.`);
    }
  };

  // Form & Filter states for Jobs Portal
  const [newJob, setNewJob] = useState({ role: "", company: "", location: "", desc: "", salary: "", type: "Full-time", category: "Technology" });
  const [jobSearch, setJobSearch] = useState("");
  const [jobTypeFilter, setJobTypeFilter] = useState("All");
  const [jobCategoryFilter, setJobCategoryFilter] = useState("All");
  const [selectedJobDetails, setSelectedJobDetails] = useState<any>(null);
  const [selectedJobApply, setSelectedJobApply] = useState<any>(null);
  const [isSubmittingJob, setIsSubmittingJob] = useState(false);
  const [isSubmittingApp, setIsSubmittingApp] = useState(false);
  const [applyForm, setApplyForm] = useState({ name: "", email: "", phone: "", exp: "1-3 years", letter: "" });

  const [donateAmount, setDonateAmount] = useState<{ [key: string]: string }>({});
  const [dirSearchTab, setDirSearchTab] = useState<"members" | "businesses" | "contacts">("members");
  const [dirQuery, setDirQuery] = useState("");
  const [dirLocation, setDirLocation] = useState("All Locations");

  // Fallback initial jobs list if database is empty
  const FALLBACK_JOBS = [
    { id: 101, role: "Senior Software Engineer", company: "Samaj Infotech Ltd.", location: "Ahmedabad, Gujarat", salary: "₹6.0 - ₹12.0 LPA", type: "Full-time", category: "Technology", desc: "Building scalable React & Python web applications for community enterprises.", logo: "S", applied: false },
    { id: 102, role: "Account & Finance Manager", company: "Patel & Associates", location: "Surat, Gujarat", salary: "₹35,000 - ₹50,000 / mo", type: "Full-time", category: "Finance", desc: "Overseeing GST filings, financial audits, and client accounts.", logo: "P", applied: false },
    { id: 103, role: "Marketing & Sales Lead", company: "Shree Umiya Traders", location: "Rajkot, Gujarat", salary: "₹25,000 - ₹40,000 / mo", type: "Full-time", category: "Sales", desc: "Driving regional business development and B2B wholesale distribution.", logo: "U", applied: false },
    { id: 104, role: "UI/UX Product Designer", company: "Digital Samaj Studio", location: "Remote / Ahmedabad", salary: "₹5.0 - ₹9.0 LPA", type: "Remote", category: "Technology", desc: "Designing intuitive mobile and web dashboards for community platforms.", logo: "D", applied: false }
  ];

  const allAvailableJobs = useMemo(() => {
    return jobList.length > 0 ? jobList : (jobs.length > 0 ? jobs : FALLBACK_JOBS);
  }, [jobList, jobs]);

  const filteredJobs = useMemo(() => {
    return allAvailableJobs.filter((j: any) => {
      const q = jobSearch.toLowerCase().trim();
      const roleStr = (j.role || j.title || "").toLowerCase();
      const companyStr = (j.company || "").toLowerCase();
      const locationStr = (j.location || "").toLowerCase();
      const descStr = (j.desc || j.description || "").toLowerCase();
      const categoryStr = (j.category || "").toLowerCase();
      const typeStr = (j.type || j.job_type || "").toLowerCase();

      const matchSearch = !q || roleStr.includes(q) || companyStr.includes(q) || locationStr.includes(q) || descStr.includes(q);
      const matchType = jobTypeFilter === "All" || typeStr.includes(jobTypeFilter.toLowerCase());
      const matchCat = jobCategoryFilter === "All" || categoryStr.includes(jobCategoryFilter.toLowerCase());

      return matchSearch && matchType && matchCat;
    });
  }, [allAvailableJobs, jobSearch, jobTypeFilter, jobCategoryFilter]);

  const handlePostJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newJob.role.trim() || !newJob.company.trim()) {
      toast.error("Please provide both Job Role and Company Name.");
      return;
    }
    setIsSubmittingJob(true);
    try {
      const payload = {
        role: newJob.role,
        company: newJob.company,
        location: newJob.location || "Gujarat",
        salary: newJob.salary || "Competitive",
        type: newJob.type || "Full-time",
        category: newJob.category || "General",
        desc: newJob.desc || "Opportunity posted by community business."
      };
      const res = await api.createJob(payload);
      const createdJob = res || { ...payload, id: Date.now() };
      setJobList(prev => [createdJob, ...prev]);
      setShowPostJob(false);
      setNewJob({ role: "", company: "", location: "", desc: "", salary: "", type: "Full-time", category: "Technology" });
      toast.success("Job posting created successfully!");
    } catch (err: any) {
      console.error("Failed to post job:", err);
      toast.error("Failed to post job. Please try again.");
    } finally {
      setIsSubmittingJob(false);
    }
  };

  const handleApplyJobSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyForm.name.trim() || !applyForm.phone.trim()) {
      toast.error("Please provide your Name and Contact Phone Number.");
      return;
    }
    setIsSubmittingApp(true);
    try {
      if (selectedJobApply?.id) {
        const formData = new FormData();
        formData.append("job", String(selectedJobApply.id));
        formData.append("applicant_name", applyForm.name);
        formData.append("applicant_email", applyForm.email);
        formData.append("applicant_phone", applyForm.phone);
        formData.append("experience_years", applyForm.exp || "1-3 years");
        formData.append("cover_letter", applyForm.letter || "Interested in this job role.");
        await api.createJobApplication(formData).catch(() => null);
      }
      setJobList(prev => prev.map(j => (j.id === selectedJobApply?.id ? { ...j, applied: true } : j)));
      toast.success(`Application submitted for ${selectedJobApply?.role || selectedJobApply?.title || "Job"}!`);
      setSelectedJobApply(null);
      setApplyForm({ name: "", email: "", phone: "", exp: "1-3 years", letter: "" });
    } catch (err: any) {
      console.error(err);
      toast.error("Failed to submit application.");
    } finally {
      setIsSubmittingApp(false);
    }
  };

  const visibleJobs = allAvailableJobs.slice(0, 4);
  const displaySamachar = news.length > 0 ? news : SAMACHAR_ITEMS;
  const displayEvents = eventList.length > 0 ? eventList : EVENTS_ITEMS;
  const quickAccessItems = sidebarItems
    .filter((item) => ["Samachar", "Matrimony", "Jobs", "Events", "Directory", "Gallery", "Videos", "Donations"].includes(item.label))
    .map((item, index) => ({
      label: item.label,
      icon: item.icon,
      color: [
        "bg-[#FFF5EE] text-[#F97316] hover:bg-[#FDF2E9]",
        "bg-red-50 text-red-500 hover:bg-red-100/50",
        "bg-amber-50 text-amber-600 hover:bg-amber-100/50",
        "bg-emerald-50 text-emerald-600 hover:bg-emerald-100/50",
        "bg-blue-50 text-blue-600 hover:bg-blue-100/50",
        "bg-purple-50 text-purple-600 hover:bg-purple-100/50",
        "bg-pink-50 text-pink-500 hover:bg-pink-100/50",
        "bg-[#FDF2E9] text-[#F97316] hover:bg-[#FBE9DC]",
      ][index % 8],
    }));

  // Load data from API on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [
          communitiesData,
          eventsData,
          jobsData,
          businessesData,
          matrimonyData,
          newsData,
          campaignsData,
          donationsData,
          familiesData
        ] = await Promise.all([
          api.getCommunities(),
          api.getUpcomingEvents(),
          api.getJobs(),
          api.getBusinesses(),
          api.getMatrimony(),
          api.getNews(),
          api.getCampaigns(),
          api.getDonations(),
          api.getFamilies(),
        ]);

        setCommunities(communitiesData);
        setEvents(eventsData);
        setJobs(jobsData);
        setBusinesses(businessesData);
        setMatrimony(matrimonyData);
        setNews(newsData);
        setCampaignList(campaignsData);
        setFamilies(familiesData);

        // Filter user donations
        const myDons = donationsData.filter((d: any) => d.donor === userProfile.name);
        setUserDonations(myDons);

        // Fetch user event registrations from database
        let registrationsData: any[] = [];
        try {
          registrationsData = await api.getEventRegistrations({ email: userProfile.email });
        } catch (e) {
          console.warn("Failed to get event registrations, using empty array", e);
        }

        // Initialize interactive lists
        setCommunityList(communitiesData.map(c => ({
          ...c,
          cover: c.cover || c.cover_url || "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60",
          logo: c.logo || c.logo_url || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop",
          joined: false,
          member_count: c.member_count || c.members || 150
        })));
        setJobList(jobsData.map(j => ({ ...j, logo: j.logo ?? j.logo_letter ?? (j.company ? j.company.charAt(0).toUpperCase() : "J"), applied: false })));
        setEventList(eventsData.map(e => ({
          ...e,
          registered: registrationsData.some((r: any) => r.event === e.id)
        })));
        setMatrimonyList(matrimonyData.map(m => ({ ...m, interested: false })));
      } catch (error) {
        console.error("Failed to load data from API, using mock data", error);
        // Fallback to mock data
        setCommunityList(COMMUNITIES.map(c => ({
          ...c,
          cover: (c as any).cover || (c as any).cover_url || "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60",
          joined: false,
          member_count: (c as any).members ?? 150
        })));
        setJobList(JOBS.map(j => ({ ...j, applied: false })));
        setEventList(EVENTS.map(e => ({ ...e, registered: false })));
        setMatrimonyList(MATRIMONY.map(m => ({ ...m, interested: false })));
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const downloadReceiptPdf = (receipt: any) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;
    printWindow.document.write(`
      <html>
        <head>
          <title>Donation Receipt - ${receipt.txnId}</title>
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #3E2723; background: #FFF5EE; padding: 40px; }
            .receipt-card { max-width: 500px; margin: 0 auto; background: white; border: 1px solid #EBE3DB; border-radius: 20px; padding: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .header { text-align: center; border-bottom: 2px dashed #EBE3DB; padding-bottom: 20px; margin-bottom: 20px; }
            .logo { font-size: 24px; font-weight: bold; color: #F97316; }
            .title { font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; color: #8C6D58; margin-top: 5px; }
            .success { color: #10B981; font-weight: bold; margin-top: 10px; font-size: 16px; }
            .details { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .details td { padding: 10px 0; border-bottom: 1px solid #FAF3EC; font-size: 14px; }
            .details td.label { color: #8C6D58; }
            .details td.value { text-align: right; font-weight: bold; }
            .total-row { font-size: 18px; border-top: 2px solid #EBE3DB; }
            .total-row td { padding-top: 15px; }
            .total-val { color: #F97316; font-size: 20px; font-weight: 800; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #8C6D58; }
            @media print {
              body { background: white; padding: 0; }
              .receipt-card { border: none; box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="receipt-card">
            <div class="header">
              <div class="logo">We Are Samaj</div>
              <div class="title">Official Donation Receipt</div>
              <div class="success">✓ Transaction Successful</div>
            </div>
            <table class="details">
              <tr>
                <td class="label">Donor Name</td>
                <td class="value">${userProfile.name}</td>
              </tr>
              <tr>
                <td class="label">Campaign</td>
                <td class="value">${receipt.campaign}</td>
              </tr>
              <tr>
                <td class="label">Transaction ID</td>
                <td class="value">${receipt.txnId}</td>
              </tr>
              <tr>
                <td class="label">Date</td>
                <td class="value">${receipt.date}</td>
              </tr>
              <tr class="total-row">
                <td class="label" style="font-weight:bold;">Amount Paid</td>
                <td class="value total-val">₹${parseInt(receipt.amount).toLocaleString()}</td>
              </tr>
            </table>
            <div class="footer">
              Thank you for your generous contribution to support the community.<br>
              This is a computer-generated receipt and does not require a physical signature.
            </div>
          </div>
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };



  return (
    <div className="min-h-screen flex bg-[#FFF5EE] text-[#3E2723] font-sans antialiased overflow-x-hidden lg:h-screen w-full min-w-0">
      {/* 1. Left Sidebar Navigation */}
      <aside className="w-[240px] flex-shrink-0 border-r border-[#EBE3DB] bg-[#FAF3EC] flex flex-col justify-between p-4 sticky top-0 h-screen hidden lg:flex z-20">
        <div className="space-y-6 overflow-y-auto max-h-[calc(100vh-160px)] pr-1">
          {/* Logo + Tagline */}
          <Link to="/" className="flex items-center gap-2.5 px-2 py-1">
            <svg width="34" height="34" viewBox="0 0 40 40" className="drop-shadow-sm flex-shrink-0">
              <defs>
                <linearGradient id="lg" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
              <path d="M20 3 L34 9 V21 C34 29 27 35 20 37 C13 35 6 29 6 21 V9 Z" fill="url(#lg)" />
              <path d="M14 19 L18 23 L26 14" fill="none" stroke="#FFF5EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="leading-tight text-left">
              <div className="font-ui font-bold text-base text-[#3E2723] tracking-tight">BHOI</div>
              <div className="text-[10px] text-warm-muted -mt-0.5 font-medium">Connect. Empower. Grow.</div>
            </div>
          </Link>

          {/* Navigation items */}
          <nav className="space-y-1">
            {sidebarItems.map((item) => {
              const active = activeNav === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item.label)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${active
                    ? "bg-[#FDF2E9] text-[#F97316] font-bold shadow-sm"
                    : "text-[#5C4033] hover:bg-[#F3E8DE]/60 hover:text-[#3E2723]"
                    }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebarActiveBar"
                      className="absolute left-0 top-2.5 bottom-2.5 w-[3px] bg-[#F97316] rounded-r-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <item.icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${active ? "text-[#F97316]" : "text-[#8C6D58]"}`} />
                  <span>{t("sidebar." + item.label.charAt(0).toLowerCase() + item.label.slice(1).replace(/\s+/g, ""))}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Card - Upgrade to Premium */}
        <div className="mt-auto pt-4 border-t border-[#EBE3DB]">
          <div className="bg-gradient-to-br from-[#2D1B13] to-[#1C100B] text-white rounded-2xl p-4 text-center relative overflow-hidden shadow-md border border-white/5">
            <div className="absolute -top-3 -right-3 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#F97316]/60" />
            </div>
            <h4 className="font-semibold text-xs text-white tracking-wide">{t("sidebar.upgradeToPremium")}</h4>
            <p className="text-[10px] text-white/70 mt-1 leading-relaxed">
              {t("sidebar.upgradeDesc")}
            </p>
            <button onClick={() => handleNavClick("Subscription")} className="w-full mt-3 py-2 rounded-xl bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA580C] transition duration-300 shadow-lg shadow-[#F97316]/20">
              {t("sidebar.upgradeNow")}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Workspace (Top Header + Center Main + Right Panel) */}
      <div className="flex-1 flex flex-col min-w-0 lg:h-screen overflow-hidden pb-16 lg:pb-0">
        {/* 2. Top Header Bar */}
        <header className="h-14 sm:h-16 border-b border-[#EBE3DB] bg-[#FAF3EC]/95 backdrop-blur-md px-2 sm:px-4 lg:px-6 flex items-center justify-between flex-shrink-0 z-30 shadow-2xs w-full max-w-full overflow-x-clip">
          {/* Mobile Logo + App Title */}
          <Link to="/" className="flex items-center gap-1.5 lg:hidden flex-shrink-0">
            <svg width="26" height="26" viewBox="0 0 40 40" className="drop-shadow-xs flex-shrink-0">
              <defs>
                <linearGradient id="lg_mob" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#F97316" />
                  <stop offset="100%" stopColor="#EA580C" />
                </linearGradient>
              </defs>
              <path d="M20 3 L34 9 V21 C34 29 27 35 20 37 C13 35 6 29 6 21 V9 Z" fill="url(#lg_mob)" />
              <path d="M14 19 L18 23 L26 14" fill="none" stroke="#FFF5EE" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="leading-tight text-left max-w-[85px] xs:max-w-[110px] sm:max-w-none">
              <div className="font-ui font-extrabold text-[11px] sm:text-sm text-[#3E2723] tracking-tight truncate">BHOI</div>
              <div className="text-[8px] sm:text-[9px] text-warm-muted -mt-0.5 font-semibold truncate">Connect. Empower. Grow.</div>
            </div>
          </Link>

          {/* Search bar (desktop) */}
          <div className="relative w-full max-w-xs md:max-w-md hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D58]" />
            <input
              type="text"
              placeholder={t("header.searchPlaceholder")}
              className="w-full pl-9 pr-12 py-2 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316] text-[#3E2723] placeholder-[#8C6D58]/60 transition duration-200"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[9px] text-[#8C6D58]/60 bg-[#FAF3EC] border border-[#EBE3DB] px-1.5 py-0.5 rounded font-mono select-none">
              ⌘K
            </span>
          </div>

          <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 ml-auto flex-shrink-0">
            {/* Location selector dropdown */}
            <div className="relative flex-shrink-0">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="flex items-center gap-1 pl-4 sm:pl-6 pr-3 sm:pr-5 py-1 rounded-full bg-[#FFF8F2] border border-[#EBE3DB] text-[9.5px] xs:text-[10px] sm:text-xs font-bold text-[#3E2723] hover:bg-[#FDF2E9] focus:outline-none appearance-none cursor-pointer max-w-[66px] xs:max-w-[85px] sm:max-w-[130px] truncate"
                style={{
                  backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='8' height='8' fill='none' stroke='%238C6D58' stroke-width='2' viewBox='0 0 24 24'><path d='M6 9l6 6 6-6'/></svg>")`,
                  backgroundPosition: 'right 3px center',
                  backgroundRepeat: 'no-repeat'
                }}
              >
                <option value="Ahmedabad">Ahmedabad</option>
                <option value="Surat">Surat</option>
                <option value="Rajkot">Rajkot</option>
                <option value="Mumbai">Mumbai</option>
                <option value="Amreli">Amreli</option>
              </select>
              <MapPin className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#F97316] absolute left-1 sm:left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* LanguageSelector */}
            <div className="flex items-center gap-0.5 bg-[#FFF8F2] border border-[#EBE3DB] rounded-full p-0.5 flex-shrink-0">
              {(["en", "gu", "hi"] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-1 xs:px-1.5 sm:px-2 py-0.5 rounded-full text-[8px] sm:text-[10px] font-bold transition duration-200 uppercase ${language === l ? "bg-[#F97316] text-white shadow-2xs" : "text-[#8C6D58] hover:text-[#3E2723]"
                    }`}
                >
                  {l}
                </button>
              ))}
            </div>

            {/* Notification bell with badge */}
            <button className="relative w-6.5 h-6.5 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-full bg-[#FFF8F2] border border-[#EBE3DB] hover:bg-[#FDF2E9] flex items-center justify-center transition duration-200 shadow-2xs flex-shrink-0">
              <Bell className="w-3.5 h-3.5 text-[#3E2723]" />
              <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-red-500 border border-white text-[8px] font-bold text-white rounded-full flex items-center justify-center">
                3
              </span>
            </button>

            {/* Auth status / Dashboard button */}
            {user ? (
              <div className="flex items-center gap-2 flex-shrink-0">
                <Link
                  to={dashHomeFor(user.role)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[11px] sm:text-xs font-bold shadow-xs hover:shadow-md hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>My Dashboard</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-1 flex-shrink-0">
                <Link
                  to="/login"
                  search={{ redirect: "/?page=communities" }}
                  className="px-2 xs:px-2.5 sm:px-3 py-1 rounded-lg bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-[9.5px] xs:text-[10px] sm:text-xs font-bold hover:shadow-sm transition whitespace-nowrap active:scale-95 flex-shrink-0"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="hidden md:inline-flex px-2.5 sm:px-3 py-1 rounded-lg border border-[#F97316] text-[#F97316] text-[10px] sm:text-xs font-bold hover:bg-[#F97316]/10 transition whitespace-nowrap flex-shrink-0"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </header>



        {/* Content Body Layout */}
        <div className="flex-1 flex overflow-hidden">
          {/* 3. Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-transparent">
            <AnimatePresence mode="wait">
              {activeNav === "Dashboard" && (
                <motion.div key="dash" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6">

                  {/* Hero Banner with Image Background */}
                  <div
                    className="relative rounded-[24px] bg-[#FAF3EC] p-6 sm:p-7 overflow-hidden min-h-[200px] md:min-h-[240px] flex items-center shadow-sm border border-[#EBE3DB] bg-cover bg-center"
                    style={{ backgroundImage: `url(${heroBg})` }}
                  >
                    {/* Glowing background highlights for depth */}
                    <div className="absolute top-[-50px] right-[-50px] w-48 h-48 bg-[#F97316]/5 rounded-full blur-3xl pointer-events-none z-0" />
                    <div className="absolute bottom-[-50px] left-[10%] w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none z-0" />

                    <div className="relative z-10 w-full grid grid-cols-1 md:grid-cols-[1.2fr_0.8fr] gap-6 items-center">
                      <div className="space-y-4 text-left">
                        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#3E2723] leading-tight">
                          {t("banner.title")}
                        </h2>
                        <p className="text-xs text-[#5C4033]/85 max-w-sm leading-relaxed font-medium">
                          {t("banner.desc")}
                        </p>
                      </div>

                      <div className="flex flex-row md:justify-end items-center gap-2 sm:gap-3 w-full">
                        <button onClick={() => handleNavClick("Communities")} className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-xs rounded-xl bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold hover:shadow-lg hover:shadow-[#F97316]/20 transition-all duration-300 transform active:scale-95 cursor-pointer whitespace-nowrap text-center">
                          {t("banner.explore")}
                        </button>
                        <Link to="/register/community" className="px-3 sm:px-5 py-2.5 text-[10px] sm:text-xs rounded-xl border border-[#F97316] text-[#F97316] hover:bg-[#F97316] hover:text-white font-bold transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-1 bg-white/70 backdrop-blur-xs shadow-2xs whitespace-nowrap">
                          <Plus className="w-3.5 h-3.5" /> {t("banner.register")}
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Two-Column Grid: Left Main Section (News + Widgets) & Right Section (Events + Highlights) */}
                  <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
                    {/* Left main column: Spans 9 of 12 columns */}
                    <div className="xl:col-span-9 space-y-6">

                      {/* Latest Samachar */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.latestSamachar")}</h3>
                          <button onClick={() => handleNavClick("Samachar")} className="text-xs font-bold text-[#F97316] hover:text-[#EA580C] transition flex items-center gap-0.5">
                            {t("dashboardindex.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="rounded-[24px] border border-[#EBE3DB] bg-white/90 shadow-sm p-3 overflow-hidden">
                          <style>{`@keyframes samachar-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
                          <div
                            className="flex w-max gap-4 will-change-transform"
                            style={{
                              animation: samacharPaused ? 'none' : 'samachar-scroll 22s linear infinite',
                              animationPlayState: samacharPaused ? 'paused' : 'running',
                              transform: 'translate3d(0,0,0)',
                            }}
                          >
                            {[...displaySamachar, ...displaySamachar].map((item, idx) => {
                              const displayImg = getImageUrl(item.img || item.img_url);
                              const displayLocation = item.location || item.community_name || "Samaj";
                              const formatDate = (dateStr: string) => {
                                if (!dateStr) return "";
                                try {
                                  const d = new Date(dateStr);
                                  if (isNaN(d.getTime())) return dateStr;
                                  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
                                } catch (e) {
                                  return dateStr;
                                }
                              };
                              const displayTime = item.time || formatDate(item.date);
                              return (
                                <article key={`${item.id}-${idx}`} onMouseEnter={() => setSamacharPaused(true)} onMouseLeave={() => setSamacharPaused(false)} onClick={() => setSelectedNews(item)} className="group w-64 bg-[#FFFDFB] rounded-2xl border border-[#EBE3DB]/80 overflow-hidden shadow-sm hover:shadow-md hover:border-[#F97316]/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer">
                                  <div className="relative overflow-hidden h-24">
                                    <img src={displayImg} alt={t(item.title)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                  </div>
                                  <div className="p-3.5 space-y-1.5 text-left">
                                    <h4 className="text-xs font-bold leading-snug line-clamp-2 text-[#3E2723] group-hover:text-[#F97316] transition-colors duration-200">{t(item.title)}</h4>
                                    <div className="flex items-center justify-between text-[10px] text-warm-muted pt-1 border-t border-[#FAF3EC]">
                                      <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3 text-[#F97316]" />{t(displayLocation)}</span>
                                      <span>{t(displayTime)}</span>
                                    </div>
                                  </div>
                                </article>
                              );
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Three Column Grid for Matrimony + Jobs + Quick Access */}
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Matrimony Widget */}
                        <motion.div
                          onHoverStart={() => setPartnerPaused(true)}
                          onHoverEnd={() => setPartnerPaused(false)}
                          className="lg:col-span-6 bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 space-y-4 shadow-xs text-left"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.findYourLifePartner")}</h3>
                              <p className="text-[10px] text-[#8C6D58]">{t("dashboardindex.findYourLifePartnerDesc")}</p>
                            </div>
                            <button onClick={() => handleNavClick("Matrimony")} className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5 cursor-pointer">
                              {t("dashboardindex.viewProfiles")} <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid gap-4 md:grid-cols-[1.02fr_0.98fr]">
                            <AnimatePresence mode="wait">
                              <motion.article
                                key={partnerIndex}
                                initial={{ opacity: 0, x: 24, rotate: 2 }}
                                animate={{ opacity: 1, x: 0, rotate: 0 }}
                                exit={{ opacity: 0, x: -24, rotate: -2 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="relative overflow-hidden rounded-[24px] border border-[#F1E7DE] bg-gradient-to-br from-[#FFF9F5] via-white to-[#FFF5EE] p-4 shadow-sm"
                              >
                                <div className="absolute inset-x-0 top-0 h-20 bg-gradient-to-r from-[#FFF7ED] via-transparent to-[#FFE9D6]" />
                                <div className="relative flex items-start gap-4">
                                  <motion.img
                                    src={PARTNERS[partnerIndex].photo}
                                    alt={t(PARTNERS[partnerIndex].name)}
                                    className="h-24 w-24 rounded-3xl object-cover border border-white shadow-md"
                                    animate={{ y: [0, -3, 0] }}
                                    transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                                  />
                                  <div className="space-y-2 text-left">
                                    <p className="text-[10px] uppercase tracking-[0.35em] text-[#F97316]">{t("dashboardindex.featuredMatch")}</p>
                                    <h4 className="text-base font-black text-[#3E2723]">{t(PARTNERS[partnerIndex].name)}</h4>
                                    <p className="text-[11px] text-[#7A6458]">{t(PARTNERS[partnerIndex].age.toString())} {t("yrs")} · {t(PARTNERS[partnerIndex].location)}</p>
                                    <span className="inline-flex rounded-full bg-[#FFF1E7] px-2.5 py-1 text-[10px] font-bold text-[#F97316]">{t(PARTNERS[partnerIndex].profession)}</span>
                                    <p className="text-[10px] text-[#8C6D58]">{t("Education")}: {t(PARTNERS[partnerIndex].education)}</p>
                                  </div>
                                </div>
                                <div className="mt-4 flex items-center justify-between gap-2 text-[10px] text-[#8C6D58]">
                                  <span>{t("dashboardindex.autoSwoops")}</span>
                                  <button
                                    onClick={() => setPartnerIndex((prev) => (prev + 1) % PARTNERS.length)}
                                    className="rounded-full bg-[#F97316] px-3 py-1.5 font-bold text-white shadow-sm hover:bg-[#EA580C] transition"
                                  >
                                    {t("dashboardindex.nextMatch")}
                                  </button>
                                </div>
                              </motion.article>
                            </AnimatePresence>

                            <div className="space-y-3">
                              {PARTNERS.map((partner, i) => (
                                <button
                                  key={i}
                                  onClick={() => setPartnerIndex(i)}
                                  className={"flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition " + (partnerIndex === i ? "border-[#F97316] bg-[#FFF8F3] shadow-sm" : "border-[#EFE5DD] bg-white hover:border-[#F5D7C0]")}
                                >
                                  <img src={partner.photo} alt={t(partner.name)} className="h-12 w-12 rounded-2xl object-cover" />
                                  <div className="min-w-0">
                                    <p className="text-[11px] font-bold text-[#3E2723] truncate">{t(partner.name)}</p>
                                    <p className="text-[10px] text-[#8C6D58] truncate">{t(partner.profession)} · {t(partner.location)}</p>
                                  </div>
                                  {partnerIndex === i && <Sparkles className="ml-auto h-4 w-4 text-[#F97316]" />}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex gap-1.5">
                              {PARTNERS.map((partner, i) => (
                                <button
                                  key={i}
                                  onClick={() => setPartnerIndex(i)}
                                  className={"h-2 rounded-full transition-all " + (partnerIndex === i ? "w-6 bg-[#F97316]" : "w-2.5 bg-[#EBE3DB]")}
                                  aria-label={`Open partner ${i + 1}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-warm-muted">{t("Profile")} {partnerIndex + 1} / {PARTNERS.length}</span>
                          </div>
                        </motion.div>

                        {/* Jobs Widget */}
                        <motion.div
                          onMouseEnter={() => setJobsPaused(true)}
                          onMouseLeave={() => setJobsPaused(false)}
                          className="lg:col-span-3 bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 space-y-4 shadow-xs text-left flex flex-col justify-between"
                        >
                          <div className="flex-1 flex flex-col min-h-0 space-y-3 pb-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.jobsForYou")}</h3>
                                <p className="text-[10px] text-[#8C6D58]">{t("dashboardindex.jobsDesc")}</p>
                              </div>
                              <button onClick={() => handleNavClick("Jobs")} className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5 cursor-pointer">
                                {t("dashboardindex.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <style>{`@keyframes jobs-scroll { from { transform: translateY(0); } to { transform: translateY(-50%); } }`}</style>
                            <div className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-[#F3E8DE]/70 bg-[#FFF8F2]/70 p-1.5">
                              <div
                                className="space-y-2 will-change-transform"
                                style={{
                                  animation: jobsPaused ? 'none' : 'jobs-scroll 18s linear infinite',
                                  animationPlayState: jobsPaused ? 'paused' : 'running',
                                }}
                              >
                                {visibleJobs.map((job, idx) => (
                                  <div key={`${(job as any).role ?? (job as any).title ?? 'job'}-${idx}`} className="group flex items-center justify-between p-2.5 rounded-xl border border-[#F3E8DE]/60 bg-white hover:bg-[#FDF2E9] hover:border-orange-200 transition-all duration-200">
                                    <div className="flex items-center gap-2 min-w-0">
                                      <div className="w-7 h-7 rounded-xl bg-[#F0E6FF] text-[#8B5CF6] font-bold flex items-center justify-center text-[10px] flex-shrink-0">
                                        {(job as any).logo ?? (job as any).company?.charAt(0)?.toUpperCase() ?? "J"}
                                      </div>
                                      <div className="text-left leading-tight min-w-0">
                                        <h4 className="text-[11px] font-bold text-[#3E2723] truncate flex items-center gap-1">
                                          {t((job as any).role ?? (job as any).title ?? "Opportunity")}
                                          {(job as any).isNew && (
                                            <span className="bg-emerald-100 text-emerald-700 text-[7px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0">{t("New")}</span>
                                          )}
                                        </h4>
                                        <p className="text-[9px] text-warm-muted truncate">{t((job as any).company ?? (job as any).employer ?? "Community")} · {t((job as any).location ?? "")}</p>
                                      </div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-[#8C6D58] group-hover:text-[#F97316] transition-colors flex-shrink-0" />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          <button onClick={() => setShowPostJob(true)} className="w-full py-2 rounded-xl border border-dashed border-[#F97316] text-[#F97316] text-xs font-bold hover:bg-orange-50/50 transition flex items-center justify-center gap-1 mt-1 cursor-pointer">
                            <Plus className="w-3.5 h-3.5" /> {t("dashboardindex.postJob")}
                          </button>
                        </motion.div>

                        {/* Quick Access Widget */}
                        <div className="lg:col-span-3 bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 shadow-xs text-left flex flex-col">
                          <div className="flex-1 flex flex-col min-h-0 space-y-4">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.quickAccess")}</h3>
                              <button onClick={() => handleNavClick("Samachar")} className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5 cursor-pointer">
                                {t("dashboardindex.viewAll")} →
                              </button>
                            </div>
                            <div className="grid grid-cols-2 gap-x-4 gap-y-3 flex-1 py-1">
                              {quickAccessItems.map((item, i) => {
                                const Icon = item.icon;
                                return (
                                  <button
                                    key={i}
                                    onClick={() => handleNavClick(item.label)}
                                    className="flex flex-col items-center justify-center gap-1.5 group transition duration-200 cursor-pointer"
                                  >
                                    <div className={`w-10 h-10 rounded-full ${item.color} flex items-center justify-center shadow-2xs group-hover:-translate-y-0.5 group-hover:shadow-xs transition duration-200`}>
                                      <Icon className="w-4.5 h-4.5" />
                                    </div>
                                    <span className="text-[9px] font-bold text-[#8C6D58] group-hover:text-[#F97316] text-center truncate w-full transition duration-150">
                                      {t("sidebar." + item.label.charAt(0).toLowerCase() + item.label.slice(1).replace(/\s+/g, ""))}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right column: Spans 3 of 12 columns (Upcoming Events & Today's Highlights) */}
                    <div className="xl:col-span-3 space-y-6">

                      {/* Upcoming Events */}
                      <div className="bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 space-y-4 shadow-xs text-left">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.label_upcomingEvents")}</h3>
                            <p className="text-[10px] text-[#8C6D58]">{t("dashboardindex.eventsDesc")}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => eventTrackRef.current?.scrollBy({ left: -320, behavior: "smooth" })} className="h-8 w-8 rounded-full border border-[#EBE3DB] bg-white hover:bg-[#FFF5EE] flex items-center justify-center text-[#F97316] transition"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={() => eventTrackRef.current?.scrollBy({ left: 320, behavior: "smooth" })} className="h-8 w-8 rounded-full border border-[#EBE3DB] bg-white hover:bg-[#FFF5EE] flex items-center justify-center text-[#F97316] transition"><ChevronRight className="w-4 h-4" /></button>
                          </div>
                        </div>

                        <div ref={eventTrackRef} className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2">
                          {displayEvents.map((ev, i) => {
                            let day = ev.day;
                            let month = ev.month;
                            if (ev.date) {
                              try {
                                const d = new Date(ev.date);
                                if (!isNaN(d.getTime())) {
                                  day = d.getDate().toString().padStart(2, "0");
                                  month = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
                                }
                              } catch (e) {
                                // use default values if parsing fails
                              }
                            }
                            const displayLocation = ev.venue || ev.location || "Samaj";
                            const displayTime = ev.time || ev.start_time || "10:00 AM";
                            return (
                              <motion.article key={ev.id || i} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, delay: i * 0.04 }} className="min-w-[260px] snap-start rounded-2xl border border-[#F3E8DE] bg-[#FFFDFB] p-3 shadow-sm hover:shadow-md transition">
                                <div className="flex items-center gap-3 group cursor-pointer" onClick={() => handleNavClick("Events")}>
                                  <div className="w-10 h-10 rounded-xl bg-[#FFF5EE] border border-[#F3E8DE] flex flex-col items-center justify-center flex-shrink-0 group-hover:border-[#F97316]/30 group-hover:bg-[#FDF2E9] transition duration-200">
                                    <span className="text-xs font-extrabold text-[#F97316] leading-none">{t(day)}</span>
                                    <span className="text-[8px] font-bold text-warm-muted leading-none mt-0.5">{t(month)}</span>
                                  </div>
                                  <div className="text-xs leading-snug text-left min-w-0 flex-1">
                                    <h4 className="font-bold text-[#3E2723] line-clamp-1 group-hover:text-[#F97316] transition duration-200">{t(ev.title)}</h4>
                                    <p className="text-[9px] text-warm-muted flex items-center gap-0.5 mt-0.5 truncate"><MapPin className="w-2.5 h-2.5 text-[#F97316]" /> {t(displayLocation)} · {t(displayTime)}</p>
                                  </div>
                                </div>
                              </motion.article>
                            );
                          })}
                        </div>
                      </div>

                      {/* Today's Highlights Timeline */}
                      <div className="bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 space-y-4 shadow-xs text-left relative overflow-hidden">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.todaysHighlights")}</h3>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-600"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{t("dashboardindex.live")}</span>
                        </div>
                        <div className="rounded-2xl border border-[#F3E8DE] bg-gradient-to-br from-[#FFF9F5] via-white to-[#FFF4EA] p-3 min-h-[115px] overflow-hidden relative">
                          <AnimatePresence mode="wait">
                            <motion.div
                              key={activeHighlight.type + activeHighlight.name}
                              initial={{ x: 40, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              exit={{ x: -30, opacity: 0 }}
                              transition={{ duration: 0.35, ease: "easeOut" }}
                              className="absolute inset-3 rounded-2xl border border-white/80 bg-white/95 p-3 shadow-sm"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`w-9 h-9 rounded-xl ${activeHighlight.color} flex items-center justify-center border border-[#F3E8DE]/40`}>
                                  <activeHighlight.icon className="w-4 h-4" />
                                </div>
                                <div className="text-left">
                                  <p className="text-[10px] uppercase tracking-[0.3em] text-[#F97316]">{t("dashboardindex.highlight")}</p>
                                  <h4 className="text-sm font-bold text-[#3E2723] mt-0.5">{t(activeHighlight.name)}</h4>
                                  <p className="text-[10px] text-[#8C6D58] mt-1">{t(activeHighlight.type)} · {t(activeHighlight.detail)}</p>
                                </div>
                              </div>
                              <div className="mt-2.5 flex items-center gap-2 text-[10px] text-emerald-600 font-semibold"><span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />{t("dashboardindex.updatedNow")}</div>
                            </motion.div>
                          </AnimatePresence>
                        </div>
                        <div className="flex gap-2">
                          {HIGHLIGHTS.map((item, i) => (
                            <button key={i} onClick={() => setHighlightIndex(i)} className={"h-2 rounded-full transition-all " + (highlightIndex === i ? "w-6 bg-[#F97316]" : "w-2.5 bg-[#EBE3DB]")} aria-label={`Show highlight ${i + 1}`} />
                          ))}
                        </div>
                      </div>

                      {/* Photo Gallery */}
                      <motion.div
                        onHoverStart={() => setGalleryPaused(true)}
                        onHoverEnd={() => setGalleryPaused(false)}
                        className="bg-white rounded-[24px] border border-[#EBE3DB]/60 p-5 space-y-4 shadow-xs text-left"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.photoGallery")}</h3>
                            <p className="text-[10px] text-[#8C6D58]">{t("dashboardindex.galleryDesc")}</p>
                          </div>
                          <button onClick={() => handleNavClick("Gallery")} className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5">
                            {t("dashboardindex.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div
                          onTouchStart={handleTouchStart}
                          onTouchEnd={handleTouchEnd}
                          className="rounded-2xl border border-[#EBE3DB]/70 bg-gradient-to-br from-[#FFF9F5] via-white to-[#FFF4EA] p-3"
                        >
                          <button
                            type="button"
                            onClick={() => setSelectedPhoto(activeGallery)}
                            className="relative h-[115px] w-full overflow-hidden rounded-[20px] border border-white/80 bg-white shadow-sm text-left"
                            aria-label="Open featured gallery image"
                          >
                            {galleryLoading && (
                              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-[20px] bg-white/75 backdrop-blur-sm">
                                <span className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#F97316] shadow-sm border border-[#EBE3DB]">
                                  <Loader className="w-3.5 h-3.5 animate-spin" /> {t("dashboardindex.loadingImage")}
                                </span>
                              </div>
                            )}
                            <AnimatePresence mode="wait">
                              <motion.img
                                key={activeGallery}
                                src={activeGallery}
                                alt="Featured gallery"
                                onLoad={() => setGalleryLoading(false)}
                                initial={{ opacity: 0, scale: 1.04, y: 8 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.98, y: -8 }}
                                transition={{ duration: 0.35, ease: "easeOut" }}
                                className="h-full w-full object-cover"
                              />
                            </AnimatePresence>
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent p-4 text-white">
                              <p className="text-[10px] uppercase tracking-[0.25em] text-white/80">{t("dashboardindex.featuredPhoto")}</p>
                              <p className="text-sm font-semibold mt-1">{t("dashboardindex.communityMemory").replace("{number}", (galleryIndex + 1).toString())}</p>
                              <p className="text-[11px] text-white/80 mt-1">{t("dashboardindex.tapToOpenGallery")}</p>
                            </div>
                          </button>
                          <div className="mt-3 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              {GALLERY_IMAGES.map((_, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => setGalleryIndex(index)}
                                  className={"h-2 rounded-full transition-all " + (galleryIndex === index ? "w-6 bg-[#F97316]" : "w-2.5 bg-[#EBE3DB]")}
                                  aria-label={`Show gallery image ${index + 1}`}
                                />
                              ))}
                            </div>
                            <span className="text-[10px] text-[#8C6D58]">{galleryPaused ? t("dashboardindex.pausedOnHover") : t("dashboardindex.autoRotating")}</span>
                          </div>
                        </div>
                      </motion.div>

                    </div>
                  </div>

                  {/* Popular Videos */}
                  <div className="space-y-3 pb-16 lg:pb-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-[#3E2723] tracking-tight">{t("dashboardindex.popularVideos")}</h3>
                      <button onClick={() => handleNavClick("Videos")} className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-0.5">
                        {t("dashboardindex.viewAll")} <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-[1.05fr_0.95fr] gap-4">
                      <motion.div key={activeVideo.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-[24px] border border-[#EBE3DB]/70 bg-[#FFFDFB] p-3 shadow-sm overflow-hidden relative">
                        <img src={activeVideo.img} alt={activeVideo.title} className="h-56 w-full rounded-[18px] object-cover" />
                        <div className="absolute inset-x-5 bottom-5 rounded-[18px] bg-black/65 p-4 text-white backdrop-blur-sm">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.25em] text-white/80"><span>{t("dashboardindex.spotlight")}</span><span>{activeVideo.duration}</span></div>
                          <h4 className="text-sm font-bold mt-1">{t(activeVideo.title)}</h4>
                          <motion.div className="mt-3 h-1.5 rounded-full bg-white/20 overflow-hidden">
                            <motion.div key={videoIndex} className="h-full rounded-full bg-[#FBBF24]" initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 5, ease: "linear" }} />
                          </motion.div>
                        </div>
                      </motion.div>
                      <div className="space-y-3">
                        {POPULAR_VIDEOS.map((vid, i) => (
                          <button key={i} onClick={() => setVideoIndex(i)} className={"w-full rounded-2xl border p-3 text-left flex gap-3 transition " + (i === videoIndex ? "border-[#F97316] bg-[#FFF8F3] shadow-sm" : "border-[#EBE3DB] bg-white hover:bg-[#FFF8F3]")}>
                            <img src={vid.img} alt={t(vid.title)} className="h-16 w-24 rounded-xl object-cover" />
                            <div className="flex-1 min-w-0">
                              <div className="text-[10px] uppercase tracking-[0.25em] text-[#F97316]">{t("Video")} {i + 1}</div>
                              <div className="text-xs font-bold text-[#3E2723] mt-0.5 line-clamp-2">{t(vid.title)}</div>
                              <div className="text-[10px] text-[#8C6D58] mt-1">{vid.duration}</div>
                            </div>
                            <Play className="w-4 h-4 text-[#F97316] mt-1" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* SAMACHAR VIEW */}
              {activeNav === "Samachar" && (
                <motion.div key="samachar" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-[#3E2723]">{t("dashboardindex.samajSamacharBoard")}</h2>
                    <span className="text-xs text-warm-muted">{news.length || NEWS.length} {t("articles published")}</span>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    {(news.length > 0 ? news : NEWS).map((item: any) => (
                      <div key={item.id} onClick={() => setSelectedNews(item)} className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden flex flex-col md:flex-row hover:shadow-md transition cursor-pointer">
                        <img src={item.img} alt="" className="w-full md:w-44 h-32 object-cover" />
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider text-[#F97316] bg-[#FFF5EE] px-2.5 py-0.5 rounded-full">{t(item.category)}</span>
                            <h3 className="font-bold text-sm text-[#3E2723] mt-2 line-clamp-2">{t(item.title)}</h3>
                            <p className="text-xs text-warm-muted mt-1 line-clamp-2">{t(item.excerpt)}</p>
                          </div>
                          <div className="text-[10px] text-warm-muted flex justify-between items-center mt-3 pt-2 border-t border-[#F3E8DE]">
                            <span>📅 {t(item.date)}</span>
                            <span className="text-[#F97316] font-semibold">{t("Read More")} →</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* COMMUNITIES VIEW */}
              {activeNav === "Communities" && (
                <motion.div key="communities" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  {/* Header & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#3E2723] flex items-center gap-2">
                        <Users className="w-6 h-6 text-[#F97316]" />
                        {t("sidebar.communities")}
                      </h2>
                      <p className="text-xs text-warm-muted mt-1">
                        Discover, join, and collaborate with regional Samaj communities & local chapters.
                      </p>
                    </div>
                  </div>

                  {/* Search Bar */}
                  <div className="bg-white border border-[#EBE3DB] rounded-3xl p-5 shadow-sm">
                    <div className="relative w-full">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D58]" />
                      <input
                        type="text"
                        value={communitySearch}
                        onChange={(e) => setCommunitySearch(e.target.value)}
                        placeholder="Search community by name, district, village, or state..."
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] text-xs font-semibold text-[#3E2723] transition"
                      />
                    </div>
                  </div>

                  {/* Communities Grid */}
                  {loading ? (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {[1, 2, 3, 4, 5, 6].map(n => (
                        <div key={n} className="bg-white border border-[#EBE3DB] rounded-3xl p-4 h-64 animate-pulse space-y-3">
                          <div className="h-28 bg-amber-100/50 rounded-2xl" />
                          <div className="h-4 bg-amber-100/50 rounded-lg w-3/4" />
                          <div className="h-3 bg-amber-100/50 rounded-lg w-1/2" />
                        </div>
                      ))}
                    </div>
                  ) : filteredCommunities.length === 0 ? (
                    <div className="bg-white border border-[#EBE3DB] rounded-3xl p-12 text-center space-y-3">
                      <div className="w-16 h-16 rounded-full bg-amber-50 text-[#F97316] flex items-center justify-center mx-auto text-2xl font-bold">🏘️</div>
                      <h3 className="font-extrabold text-base text-[#3E2723]">No Communities Found</h3>
                      <p className="text-xs text-warm-muted max-w-sm mx-auto">
                        No communities matched your search criteria. Try clearing search or changing type filters.
                      </p>
                      <button
                        onClick={() => { setCommunitySearch(""); setCommunityTypeFilter("All"); }}
                        className="px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] transition cursor-pointer"
                      >
                        Reset Filters
                      </button>
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                      {filteredCommunities.map((c: any, i: number) => (
                        <div 
                          key={c.id || i} 
                          className="bg-white border border-[#EBE3DB] rounded-3xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-lg hover:border-[#F97316]/50 transition duration-300 group"
                        >
                          <div 
                            onClick={() => setSelectedCommunityDetails(c)}
                            className="h-32 bg-[#FAF3EC] relative flex items-center justify-center overflow-hidden cursor-pointer"
                          >
                            <img 
                              src={c.cover || c.cover_url || "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60"} 
                              alt={c.name}
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60";
                              }}
                              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                            
                            <div className="absolute top-3 right-3 bg-black/50 backdrop-blur-md text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border border-white/20 uppercase tracking-wider">
                              {c.type || "Community"}
                            </div>

                            <div className="absolute bottom-2.5 left-3 right-3 text-white">
                              <h3 className="font-extrabold text-sm leading-tight text-white drop-shadow-sm group-hover:text-[#FFEDD5] transition">{c.name}</h3>
                            </div>
                          </div>

                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <p className="text-xs text-warm-muted flex items-center gap-1.5 font-medium">
                                <MapPin className="w-3.5 h-3.5 text-[#F97316] shrink-0" />
                                {c.village ? `${c.village}, ${c.district}` : c.district || c.state || "Gujarat"}
                              </p>
                              {c.desc && (
                                <p className="text-[11px] text-[#5C4033]/80 mt-2 line-clamp-2 leading-relaxed">
                                  {c.desc}
                                </p>
                              )}
                            </div>

                            <div className="flex items-center justify-between border-t border-[#F3E8DE] pt-3">
                              <span className="text-xs font-bold text-[#3E2723] flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#F97316]" /> {c.member_count || 150} Members
                              </span>

                              <div className="flex items-center gap-2">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCommunityDetails(c);
                                  }}
                                  className="text-xs px-2.5 py-1.5 rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] text-[#5C4033] font-bold hover:bg-[#FDF2E9] hover:border-[#F97316] transition cursor-pointer"
                                  title="View Details"
                                >
                                  View
                                </button>
                                <button
                                  onClick={(e) => handleJoinCommunityClick(c, e)}
                                  className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition shadow-xs cursor-pointer ${
                                    c.joined
                                      ? "bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1"
                                      : "bg-[#F97316] text-white hover:bg-[#EA580C]"
                                  }`}
                                >
                                  {c.joined ? <><Clock className="w-3.5 h-3.5" /> Pending</> : "Join"}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* MATRIMONY VIEW */}
              {activeNav === "Matrimony" && (
                <motion.div key="matrimony" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3E2723]">{t("dashboardmatrimony.title_matrimony")}</h2>
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-bold">✓ {t("Verified Profiles Only")}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {matrimonyList.map((m, i) => (
                      <div key={i} className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                        <div className="aspect-[4/5] relative">
                          <img src={m.photo} alt={t(m.name)} className="w-full h-full object-cover" />
                          <div className="absolute top-2 left-2 bg-white/95 px-2 py-0.5 rounded-full text-[10px] font-bold text-[#F97316]">
                            {m.match}% {t("Match")}
                          </div>
                        </div>
                        <div className="p-4 flex-grow flex flex-col justify-between">
                          <div>
                            <h3 className="font-bold text-xs text-[#3E2723]">{t(m.name)}, {t(m.age.toString())}</h3>
                            <p className="text-[10px] text-warm-muted">{t(m.education)} · {t(m.profession)}</p>
                            <p className="text-[10px] text-[#F97316] font-semibold mt-1 flex items-center gap-0.5">
                              <MapPin className="w-3 h-3" /> {t(m.location)}
                            </p>
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                const copy = [...matrimonyList];
                                copy[i].interested = !copy[i].interested;
                                setMatrimonyList(copy);
                              }}
                              className={`w-full py-2 rounded-lg text-xs font-semibold transition ${m.interested
                                ? "bg-emerald-50 text-emerald-600 border border-emerald-200"
                                : "border border-[#F97316] text-[#F97316] hover:bg-[#FFF5EE]"
                                }`}
                            >
                              {m.interested ? t("Interest Sent") + " ✓" : t("Express Interest")}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* JOBS VIEW */}
              {activeNav === "Jobs" && (
                <motion.div key="jobs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  {/* Header & Action */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-black text-[#3E2723] flex items-center gap-2">
                        <Briefcase className="w-6 h-6 text-[#F97316]" />
                        {t("dashboardjobs.title_jobPortal")}
                      </h2>
                      <p className="text-xs text-warm-muted mt-1">
                        Explore, filter, and apply for opportunities posted by community businesses and members.
                      </p>
                    </div>
                    <button 
                      onClick={() => setShowPostJob(true)} 
                      className="px-5 py-2.5 text-xs bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-95 transition cursor-pointer"
                    >
                      <Plus className="w-4 h-4 stroke-[3]" /> {t("dashboardindex.postJob")}
                    </button>
                  </div>

                  {/* Search Bar & Type Filter Pills */}
                  <div className="bg-white border border-[#EBE3DB] rounded-3xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col md:flex-row gap-3">
                      <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C6D58]" />
                        <input
                          type="text"
                          value={jobSearch}
                          onChange={(e) => setJobSearch(e.target.value)}
                          placeholder="Search job roles, company name, location, or keywords..."
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] text-xs font-semibold text-[#3E2723] transition"
                        />
                      </div>
                      <select
                        value={jobCategoryFilter}
                        onChange={(e) => setJobCategoryFilter(e.target.value)}
                        className="px-4 py-3 rounded-2xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] text-xs font-bold text-[#5C4033] cursor-pointer"
                      >
                        {["All", "Technology", "Finance", "Sales", "Healthcare", "Engineering", "Retail", "Services", "Other"].map(cat => (
                          <option key={cat} value={cat}>{cat === "All" ? "All Categories" : cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Filter Pills */}
                    <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-1 border-t border-[#F3E8DE]">
                      <span className="text-[11px] font-bold text-warm-muted shrink-0 flex items-center gap-1 mr-1">
                        <Filter className="w-3.5 h-3.5" /> Type:
                      </span>
                      {["All", "Full-time", "Part-time", "Remote", "Contract", "Internship"].map(typeVal => (
                        <button
                          key={typeVal}
                          onClick={() => setJobTypeFilter(typeVal)}
                          className={`px-3.5 py-1.5 rounded-full text-[11px] font-bold whitespace-nowrap transition cursor-pointer border ${
                            jobTypeFilter === typeVal
                              ? "bg-[#F97316] text-white border-[#F97316] shadow-xs"
                              : "border-[#EBE3DB] text-[#5C4033] bg-[#FFF8F2] hover:bg-[#FDF2E9]"
                          }`}
                        >
                          {typeVal === "All" ? "All Types" : typeVal}
                        </button>
                      ))}
                      <span className="ml-auto text-[11px] text-warm-muted font-semibold shrink-0">
                        {filteredJobs.length} {filteredJobs.length === 1 ? "Opportunity" : "Opportunities"}
                      </span>
                    </div>
                  </div>

                  {/* Jobs List Grid */}
                  {loading ? (
                    <div className="space-y-3">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="bg-white border border-[#EBE3DB] rounded-3xl p-5 animate-pulse space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex gap-3 items-center">
                              <div className="w-12 h-12 rounded-2xl bg-[#F3E8DE]" />
                              <div className="space-y-1.5">
                                <div className="h-4 w-48 bg-[#F3E8DE] rounded" />
                                <div className="h-3 w-32 bg-[#F3E8DE] rounded" />
                              </div>
                            </div>
                            <div className="h-8 w-24 bg-[#F3E8DE] rounded-xl" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : filteredJobs.length === 0 ? (
                    <div className="bg-white border border-[#EBE3DB] rounded-3xl p-12 text-center shadow-sm space-y-3">
                      <div className="w-12 h-12 rounded-full bg-orange-50 text-[#F97316] flex items-center justify-center mx-auto">
                        <Briefcase className="w-6 h-6" />
                      </div>
                      <h3 className="font-extrabold text-base text-[#3E2723]">No Jobs Found Matching Filters</h3>
                      <p className="text-xs text-warm-muted max-w-sm mx-auto">
                        Try adjusting your search query or reset category filters to view more community career postings.
                      </p>
                      <button
                        onClick={() => { setJobSearch(""); setJobTypeFilter("All"); setJobCategoryFilter("All"); }}
                        className="px-4 py-2 bg-[#FFF8F2] border border-[#EBE3DB] text-[#F97316] text-xs font-bold rounded-xl hover:bg-orange-50 transition"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredJobs.map((job: any, i: number) => {
                        const roleTitle = job.role || job.title || "Career Opportunity";
                        const companyName = job.company || "Samaj Enterprise";
                        const locationName = job.location || "Gujarat";
                        const salaryText = job.salary || job.salary_range || "Competitive";
                        const typeText = job.type || job.job_type || "Full-time";
                        const descText = job.desc || job.description || "Exciting career opportunity posted by community member business.";
                        const initialLogo = job.logo ?? job.logo_letter ?? companyName.charAt(0).toUpperCase();

                        return (
                          <div 
                            key={job.id || i} 
                            className="bg-white border border-[#EBE3DB] rounded-3xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition duration-200 gap-5 relative group"
                          >
                            <div className="flex items-start gap-4 flex-1">
                              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-100 to-amber-100 text-[#F97316] font-black flex items-center justify-center text-xl shrink-0 shadow-2xs border border-orange-200/50">
                                {initialLogo}
                              </div>
                              <div className="space-y-1.5 flex-1">
                                <div className="flex flex-wrap items-center gap-2">
                                  <h3 className="font-extrabold text-base text-[#3E2723] group-hover:text-[#F97316] transition">
                                    {roleTitle}
                                  </h3>
                                  <span className="text-[10px] bg-orange-50 text-[#F97316] font-bold px-2.5 py-0.5 rounded-full border border-orange-200/50">
                                    {typeText}
                                  </span>
                                </div>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-warm-muted font-medium">
                                  <span className="font-semibold text-[#5C4033] flex items-center gap-1">
                                    <Building2 className="w-3.5 h-3.5 text-[#F97316]" /> {companyName}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {locationName}
                                  </span>
                                  <span>•</span>
                                  <span className="flex items-center gap-1 font-bold text-emerald-600">
                                    <Tag className="w-3.5 h-3.5" /> {salaryText}
                                  </span>
                                </div>
                                <p className="text-xs text-warm-muted/90 line-clamp-2 pt-1">
                                  {descText}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2.5 w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-[#F3E8DE] shrink-0">
                              <button
                                onClick={() => setSelectedJobDetails(job)}
                                className="px-4 py-2.5 bg-[#FFF8F2] hover:bg-[#FAF3EC] text-[#5C4033] text-xs font-bold rounded-2xl border border-[#EBE3DB] transition duration-150 cursor-pointer"
                              >
                                View Details
                              </button>
                              <button
                                onClick={() => {
                                  if (!job.applied) {
                                    setSelectedJobApply(job);
                                  }
                                }}
                                className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition duration-150 shadow-2xs cursor-pointer ${
                                  job.applied
                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default"
                                    : "bg-[#F97316] text-white hover:bg-[#EA580C] hover:shadow-md"
                                }`}
                              >
                                {job.applied ? "Applied ✓" : "Apply Now"}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {/* EVENTS VIEW */}
              {activeNav === "Events" && (
                <motion.div key="events" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3E2723]">{t("dashboardevents.title_events")}</h2>
                    <span className="text-xs text-warm-muted">{t("dashboardevents.desc_sammelanSportsMarriagesAndMore")}</span>
                  </div>
                  {loading ? (
                    <div className="grid md:grid-cols-3 gap-5">
                      {[1,2,3,4,5,6].map(i => (
                        <div key={i} className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden animate-pulse shadow-sm">
                          <div className="h-40 bg-[#F3E8DE]" />
                          <div className="p-4 space-y-2">
                            <div className="h-3 w-24 bg-[#F3E8DE] rounded" />
                            <div className="h-4 w-3/4 bg-[#F3E8DE] rounded" />
                            <div className="h-3 w-1/2 bg-[#F3E8DE] rounded" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : displayEvents.length === 0 ? (
                    <div className="bg-white border border-[#EBE3DB] rounded-2xl p-12 text-center shadow-sm">
                      <Calendar className="w-10 h-10 text-[#F97316] mx-auto mb-3 opacity-50" />
                      <h3 className="font-bold text-[#3E2723] text-base">No Upcoming Events</h3>
                      <p className="text-xs text-warm-muted mt-1">Check back soon for new community events.</p>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-3 gap-5">
                      {displayEvents.slice(0, 6).map((ev: any, i) => (
                        <div key={i} className="bg-white border border-[#EBE3DB] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:shadow-md transition">
                          <img src={ev.img ?? ev.image ?? ev.cover ?? "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=200&fit=crop"} alt="" className="w-full h-40 object-cover" />
                          <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                            <div>
                              <div className="text-[10px] text-[#F97316] font-bold">{ev.date ? new Date(ev.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : (ev.day && ev.month ? `${ev.day} ${ev.month}` : "TBD")} · {ev.venue || ev.location || ev.city || "Community Hall"}</div>
                              <h3 className="font-bold text-sm text-[#3E2723] mt-1">{ev.title}</h3>
                              <p className="text-xs text-warm-muted line-clamp-2 mt-1">{ev.desc || ev.description}</p>
                            </div>
                            <div className="flex items-center justify-between border-t border-[#F3E8DE] pt-3">
                              <span className="text-[10px] text-warm-muted">{ev.attendees || ev.registered_count || 0} {t("Attending")}</span>
                              <button
                                onClick={() => {
                                  if (ev.registered) {
                                    const copy = [...eventList];
                                    copy[i].registered = false;
                                    copy[i].attendees = Math.max(0, (copy[i].attendees || 0) - 1);
                                    setEventList(copy);
                                    toast.success(`Unregistered from ${ev.title}`);
                                  } else {
                                    setRegisteringEvent({ event: ev, index: i });
                                    setRegForm({
                                      name: userProfile.name,
                                      email: userProfile.email,
                                      phone: userProfile.phone,
                                      attendees: 1
                                    });
                                  }
                                }}
                                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition cursor-pointer ${ev.registered
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-[#F97316] text-white hover:bg-[#EA580C]"
                                  }`}
                              >
                                {ev.registered ? t("Registered") + " ✓" : t("dashboardevents.register")}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* DIRECTORY VIEW */}
              {activeNav === "Directory" && (
                <motion.div key="directory" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-[#3E2723]">{t("dashboarddirectory.title_memberDirectory")}</h2>
                    <span className="text-xs bg-[#FDF2E9] text-[#F97316] px-3 py-1 rounded-full font-bold">1.2M+ {t("Verified Members")}</span>
                  </div>
                  <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                    {PARTNERS.map((m, i) => (
                      <div key={i} className="bg-white border border-[#EBE3DB] rounded-2xl p-4 flex flex-col items-center text-center space-y-3 shadow-sm hover:shadow-md transition">
                        <img src={m.photo} alt={t(m.name)} className="w-16 h-16 rounded-full object-cover border border-[#F3E8DE]" />
                        <div>
                          <span className="text-[8px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{t("KYC Verified")}</span>
                          <h3 className="font-bold text-sm text-[#3E2723] mt-1.5">{t(m.name)}</h3>
                          <p className="text-[10px] text-warm-muted">{t(m.profession)} · {t(m.education)}</p>
                          <p className="text-[10px] text-[#F97316] font-semibold mt-1 flex items-center gap-0.5 justify-center">
                            <MapPin className="w-3 h-3" /> {t(m.location)}
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            const lastName = m.name.split(" ").pop();
                            const matched = families.find((f: any) => f.head.includes(lastName));

                            if (matched && matched.members) {
                              const spouse = matched.members.find((mb: any) => mb.relation === "Spouse") || { name: t("communityadminfamilies.label_spouse"), occupation: "Homemaker" };
                              const son = matched.members.find((mb: any) => mb.relation === "Son") || { name: t("dashboardfamily.son"), occupation: "Student" };
                              const daughter = matched.members.find((mb: any) => mb.relation === "Daughter") || { name: t("dashboardfamily.daughter"), occupation: "Student" };

                              setSelectedFamilyTree({
                                name: m.name,
                                profession: m.profession,
                                father: { name: matched.head, occupation: matched.members[0]?.occupation || "Retired" },
                                mother: { name: spouse.name, occupation: spouse.occupation },
                                siblings: [
                                  { name: son.name, relation: "Brother", occupation: son.occupation },
                                  { name: daughter.name, relation: "Sister", occupation: daughter.occupation }
                                ]
                              });
                            } else {
                              setSelectedFamilyTree({
                                name: m.name,
                                profession: m.profession,
                                father: { name: `Arvindbhai ${lastName}`, occupation: "Business Owner" },
                                mother: { name: `Geetaben ${lastName}`, occupation: "Homemaker" },
                                siblings: [
                                  { name: `Hardik ${lastName}`, relation: "Brother", occupation: "Software Engineer" },
                                  { name: `Pooja ${lastName}`, relation: "Sister", occupation: "Doctor" }
                                ]
                              });
                            }
                          }}
                          className="w-full py-1.5 rounded-lg border border-[#F3E8DE] hover:bg-[#FAF3EC] text-xs font-semibold text-[#5C4033] transition cursor-pointer"
                        >
                          View Family Tree
                        </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* BUSINESS DIRECTORY VIEW */}
              {activeNav === "Business Directory" && (
                <BusinessDirectorySection t={t} />
              )}

              {/* DONATIONS VIEW */}
              {activeNav === "Donations" && (
                <motion.div key="donations" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-6 text-left">
                  <div className="flex justify-between items-center flex-wrap gap-4">
                    <div>
                      <h2 className="text-2xl font-bold text-[#3E2723]">{t("dashboarddonations.title_donations")}</h2>
                      <p className="text-xs text-warm-muted mt-1">{t("dashboarddonations.desc_activeCommunityFundraisingCampaigns")}</p>
                    </div>
                    {/* Tabs switcher */}
                    <div className="flex bg-[#FAF3EC] border border-[#EBE3DB] rounded-xl p-1 gap-1">
                      <button
                        onClick={() => setDonationTab("campaigns")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${donationTab === "campaigns" ? "bg-white text-[#F97316] shadow-2xs font-bold" : "text-[#5C4033] hover:text-[#3E2723]"
                          }`}
                      >
                        {t("dashboarddonations.activeCampaigns")}
                      </button>
                      <button
                        onClick={() => setDonationTab("history")}
                        className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${donationTab === "history" ? "bg-white text-[#F97316] shadow-2xs font-bold" : "text-[#5C4033] hover:text-[#3E2723]"
                          }`}
                      >
                        {t("dashboarddonations.donationHistory")}
                      </button>
                    </div>
                  </div>

                  {donationTab === "campaigns" ? (
                    <div className="grid md:grid-cols-2 gap-6">
                      {campaignList.map((item) => {
                        const goalVal = item.goal || 1000000;
                        const raisedVal = item.raised || 0;
                        const pct = Math.min(100, Math.round((raisedVal / goalVal) * 100));
                        return (
                          <div key={item.id} className="bg-white border border-[#EBE3DB] rounded-[20px] p-5 space-y-4 shadow-xs flex flex-col justify-between">
                            <div>
                              <h3 className="font-bold text-base text-[#3E2723]">{item.title}</h3>
                              <p className="text-xs text-warm-muted mt-1">{item.desc}</p>

                              {/* Progress bar */}
                              <div className="space-y-1.5 mt-4">
                                <div className="flex justify-between text-xs font-bold">
                                  <span>₹{raisedVal.toLocaleString()} {t("dashboarddonations.raised")}</span>
                                  <span>{t("dashboarddonations.goal")}: ₹{goalVal.toLocaleString()}</span>
                                </div>
                                <div className="h-2 bg-[#FFF5EE] rounded-full overflow-hidden border border-[#F3E8DE]">
                                  <div className="h-full bg-[#F97316] rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <div className="text-[10px] text-[#F97316] font-bold text-right">{pct}% {t("dashboarddonations.completed")}</div>
                              </div>
                            </div>

                            <div className="border-t border-[#F3E8DE] pt-4 flex gap-3 items-center">
                              <div className="relative flex-1">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-[#8C6D58]">₹</span>
                                <input
                                  type="number"
                                  placeholder={t("dashboarddonations.placeholder_enterAmount")}
                                  value={donateAmount[item.id] || ""}
                                  onChange={(e) => setDonateAmount({ ...donateAmount, [item.id]: e.target.value })}
                                  className="w-full pl-6 pr-3 py-2 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                                />
                              </div>
                              <button
                                onClick={async () => {
                                  const amt = parseInt(donateAmount[item.id]);
                                  if (!amt || amt <= 0) return alert("Please enter valid amount");
                                  try {
                                    const createdDonation = await api.createDonation({
                                      campaign: item.id,
                                      campaign_title: item.title,
                                      donor: userProfile.name,
                                      amount: amt
                                    });

                                    const nextRaised = item.raised + amt;
                                    await api.updateCampaign(item.id, { raised: nextRaised }).catch(() => null);

                                    setCampaignList(prev => prev.map(c => c.id === item.id ? { ...c, raised: nextRaised } : c));
                                    setUserDonations(prev => [createdDonation, ...prev]);
                                    setDonateAmount({ ...donateAmount, [item.id]: "" });
                                    toast.success("Thank you for your generous contribution!");
                                  } catch (err) {
                                    console.error("Donation failed:", err);
                                    toast.error("Donation process failed.");
                                  }
                                }}
                                className="px-4 py-2 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] shadow-sm transition"
                              >
                                {t("dashboarddonations.donateNow")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-white border border-[#EBE3DB] rounded-[20px] p-5 shadow-xs space-y-4">
                      <h3 className="font-bold text-sm text-[#3E2723]">{t("dashboarddonations.yourDonationHistory")}</h3>
                      {userDonations.length === 0 ? (
                        <p className="text-xs text-warm-muted py-4 text-center">{t("dashboarddonations.noDonationsFound")}</p>
                      ) : (
                        <div className="space-y-3">
                          {userDonations.map((d: any, idx: number) => (
                            <div key={idx} className="flex justify-between items-center text-xs p-3 bg-[#FFF8F2] rounded-xl border border-[#EBE3DB]/60">
                              <div>
                                <div className="font-bold text-[#3E2723]">{d.campaign_title || "General Fund"}</div>
                                <div className="text-[10px] text-warm-muted">{d.created_at ? new Date(d.created_at).toLocaleDateString() : "Today"}</div>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="font-extrabold text-[#F97316]">₹{d.amount}</span>
                                <button onClick={() => downloadReceiptPdf(d)} className="text-[11px] font-bold text-[#5C4033] hover:text-[#F97316] underline">Receipt</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </main>
        </div>
      </div>

      {/* Register Community Modal */}
      {showRegisterCommunity && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-md w-full p-6 space-y-4 relative shadow-2xl text-left">
            <button onClick={() => setShowRegisterCommunity(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4 text-[#5C4033]" />
            </button>
            <div>
              <h3 className="font-extrabold text-lg text-[#3E2723]">Register New Community</h3>
              <p className="text-xs text-[#8C6D58]">Add a new Samaj community or local chapter to the platform</p>
            </div>

            <form onSubmit={handleRegisterCommunitySubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Community Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Surat Leva Patel Samaj"
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Community Type</label>
                  <select
                    value={newCommunity.type}
                    onChange={(e) => setNewCommunity({ ...newCommunity, type: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  >
                    <option value="Super">Super (Apex)</option>
                    <option value="Subsidiary">Subsidiary (Local Chapter)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">District</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad"
                    value={newCommunity.district}
                    onChange={(e) => setNewCommunity({ ...newCommunity, district: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Taluka / Area</label>
                  <input
                    type="text"
                    placeholder="e.g. Navrangpura"
                    value={newCommunity.village}
                    onChange={(e) => setNewCommunity({ ...newCommunity, village: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">State</label>
                  <input
                    type="text"
                    placeholder="e.g. Gujarat"
                    value={newCommunity.state}
                    onChange={(e) => setNewCommunity({ ...newCommunity, state: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Description / Purpose</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of the community goals..."
                  value={newCommunity.desc}
                  onChange={(e) => setNewCommunity({ ...newCommunity, desc: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingCommunity}
                className="w-full mt-2 py-2.5 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingCommunity && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmittingCommunity ? "Registering..." : "Register Community"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      
      {/* Login Required Modal */}
      {showLoginPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-sm w-full p-6 space-y-4 relative shadow-2xl text-center">
            <button onClick={() => setShowLoginPromptModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4 text-[#5C4033]" />
            </button>
            <div className="w-14 h-14 rounded-full bg-amber-100 text-[#F97316] flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#3E2723]">Login Required to Join</h3>
              <p className="text-xs text-warm-muted leading-relaxed">
                You must be logged in to your BHOI account to join communities, request membership, and interact with community admins.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLoginPromptModal(false)}
                className="flex-1 py-2.5 bg-[#FAF3EC] text-[#5C4033] font-bold text-xs rounded-xl hover:bg-[#FDF2E9] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPromptModal(false);
                  navigate({ to: "/login" });
                }}
                className="flex-1 py-2.5 bg-[#F97316] text-white font-bold text-xs rounded-xl hover:bg-[#EA580C] shadow-md transition cursor-pointer"
              >
                Log In Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 4. Post Job Form Modal */}
      {showPostJob && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-[#EBE3DB] rounded-3xl max-w-md w-full p-6 space-y-4 relative shadow-2xl text-left">
            <button onClick={() => setShowPostJob(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition">
              <X className="w-4 h-4" />
            </button>
            <h3 className="font-extrabold text-base text-[#3E2723]">Post a New Job Opportunity</h3>

            <form onSubmit={async (e) => {
              e.preventDefault();
              if (!newJob.role || !newJob.company || !newJob.location) return;
              try {
                const jobPayload = {
                  role: newJob.role,
                  company: newJob.company,
                  location: newJob.location,
                  salary: newJob.salary || "Competitive",
                  type: "Full-time",
                  category: "Tech",
                  logo_letter: newJob.company.charAt(0).toUpperCase(),
                  applicants: 0,
                  desc: newJob.desc || "No description provided."
                };

                const createdJob = await api.createJob(jobPayload);
                const mappedJob = {
                  ...createdJob,
                  logo: createdJob.logo ?? createdJob.logo_letter ?? (createdJob.company ? createdJob.company.charAt(0).toUpperCase() : "J"),
                  applied: false
                };
                setJobList([mappedJob, ...jobList]);
                setNewJob({ role: "", company: "", location: "", desc: "", salary: "" });
                setShowPostJob(false);
              } catch (err) {
                console.error("Failed to save job to Django backend:", err);
                alert("Failed to save job to database.");
              }
            }} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Job Role / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior Accountant, Flutter Developer"
                  value={newJob.role}
                  onChange={(e) => setNewJob({ ...newJob, role: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Company Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Patel Exports Ltd."
                  value={newJob.company}
                  onChange={(e) => setNewJob({ ...newJob, company: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Location</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ahmedabad, Surat"
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Salary Range</label>
                  <input
                    type="text"
                    placeholder="e.g. ₹6-8 LPA"
                    value={newJob.salary}
                    onChange={(e) => setNewJob({ ...newJob, salary: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Brief Job Description</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities, requirements, skills..."
                  value={newJob.desc}
                  onChange={(e) => setNewJob({ ...newJob, desc: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] resize-none"
                />
              </div>
              <button type="submit" className="w-full mt-2 py-2.5 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] shadow-md transition">
                Submit Job Post
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJobDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-lg w-full p-6 space-y-5 relative shadow-2xl text-left">
            <button onClick={() => setSelectedJobDetails(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4 text-[#5C4033]" />
            </button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/80 text-[#F97316] border border-amber-200/60 font-black text-2xl flex items-center justify-center shadow-inner">
                {selectedJobDetails.logo || selectedJobDetails.role?.charAt(0) || "J"}
              </div>
              <div>
                <h3 className="font-extrabold text-xl text-[#3E2723] leading-snug">{selectedJobDetails.role || selectedJobDetails.title}</h3>
                <p className="text-xs font-semibold text-[#8C6D58]">{selectedJobDetails.company}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-[#FFF8F2] rounded-xl border border-[#EBE3DB]/60">
                <span className="text-warm-muted text-[10px] uppercase font-bold block mb-1">Location</span>
                <span className="font-medium text-[#3E2723] flex items-center gap-1"><MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {selectedJobDetails.location}</span>
              </div>
              <div className="p-3 bg-[#FFF8F2] rounded-xl border border-[#EBE3DB]/60">
                <span className="text-warm-muted text-[10px] uppercase font-bold block mb-1">Offered Salary</span>
                <span className="font-medium text-[#3E2723] flex items-center gap-1"><IndianRupee className="w-3.5 h-3.5 text-[#F97316]" /> {selectedJobDetails.salary}</span>
              </div>
              <div className="p-3 bg-[#FFF8F2] rounded-xl border border-[#EBE3DB]/60">
                <span className="text-warm-muted text-[10px] uppercase font-bold block mb-1">Job Type</span>
                <span className="font-medium text-[#3E2723] flex items-center gap-1"><Briefcase className="w-3.5 h-3.5 text-[#F97316]" /> {selectedJobDetails.type || "Full-time"}</span>
              </div>
              <div className="p-3 bg-[#FFF8F2] rounded-xl border border-[#EBE3DB]/60">
                <span className="text-warm-muted text-[10px] uppercase font-bold block mb-1">Category</span>
                <span className="font-medium text-[#3E2723] flex items-center gap-1"><Tag className="w-3.5 h-3.5 text-[#F97316]" /> {selectedJobDetails.category || "General"}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-[#5C4033]">Job Overview & Requirements</h4>
              <p className="text-xs text-[#5C4033]/90 leading-relaxed bg-[#FFF8F2] p-3.5 rounded-2xl border border-[#EBE3DB]/60 max-h-40 overflow-y-auto">
                {selectedJobDetails.desc || selectedJobDetails.description || "No full description provided for this opening."}
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setSelectedJobDetails(null)}
                className="flex-1 py-2.5 bg-[#FAF3EC] text-[#5C4033] font-bold text-xs rounded-xl hover:bg-[#FDF2E9] transition cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const jobToApply = selectedJobDetails;
                  setSelectedJobDetails(null);
                  setSelectedJobApply(jobToApply);
                }}
                disabled={selectedJobDetails.applied}
                className={`flex-1 py-2.5 font-bold text-xs rounded-xl shadow-md transition cursor-pointer ${selectedJobDetails.applied ? "bg-emerald-100 text-emerald-700 cursor-not-allowed" : "bg-[#F97316] text-white hover:bg-[#EA580C]"}`}
              >
                {selectedJobDetails.applied ? "Already Applied" : "Apply for Job"}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Job Apply Modal */}
      {selectedJobApply && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-md w-full p-6 space-y-4 relative shadow-2xl text-left">
            <button onClick={() => setSelectedJobApply(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4 text-[#5C4033]" />
            </button>
            <div>
              <h3 className="font-extrabold text-lg text-[#3E2723]">Apply for Position</h3>
              <p className="text-xs text-[#8C6D58] font-medium">{selectedJobApply.role || selectedJobApply.title} at {selectedJobApply.company}</p>
            </div>

            <form onSubmit={handleApplyJobSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Your full name"
                  value={applyForm.name}
                  onChange={(e) => setApplyForm({ ...applyForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Email Address</label>
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={applyForm.email}
                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[#5C4033]">Phone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 9876543210"
                    value={applyForm.phone}
                    onChange={(e) => setApplyForm({ ...applyForm, phone: e.target.value })}
                    className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Experience Level</label>
                <select
                  value={applyForm.exp}
                  onChange={(e) => setApplyForm({ ...applyForm, exp: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316]"
                >
                  <option value="Fresher / Entry Level">Fresher / Entry Level</option>
                  <option value="1-3 years">1 - 3 Years</option>
                  <option value="3-5 years">3 - 5 Years</option>
                  <option value="5+ years">5+ Years Senior</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">Cover Note / Why you are a good fit</label>
                <textarea
                  rows={3}
                  placeholder="Share a brief overview of your background or relevant experience..."
                  value={applyForm.letter}
                  onChange={(e) => setApplyForm({ ...applyForm, letter: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-[#FFF8F2] focus:outline-none focus:border-[#F97316] resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingApp}
                className="w-full mt-2 py-2.5 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] shadow-md transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmittingApp && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmittingApp ? "Submitting Application..." : "Submit Application"}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* 5. Event Registration Modal */}
      {registeringEvent && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-md w-full p-6 space-y-5 relative shadow-2xl text-left">
            <button onClick={() => setRegisteringEvent(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h3 className="font-extrabold text-lg text-[#3E2723]">{t("Register for Event")}</h3>
              <p className="text-xs text-warm-muted">{t(registeringEvent.event.title)}</p>
            </div>

            <form onSubmit={async (e) => {
              e.preventDefault();
              const payload = {
                attendees: (registeringEvent.event.attendees || 0) + regForm.attendees
              };
              try {
                await api.updateEvent(registeringEvent.event.id, payload);
                await api.createEventRegistration({
                  event: registeringEvent.event.id,
                  name: regForm.name,
                  email: regForm.email,
                  phone: regForm.phone,
                  attendees: regForm.attendees
                });
                const copy = [...eventList];
                copy[registeringEvent.index].registered = true;
                copy[registeringEvent.index].attendees = payload.attendees;
                setEventList(copy);
                setRegisteringEvent(null);
                toast.success("Successfully registered for the event!");
              } catch (err) {
                console.error("Failed to register for event", err);
                toast.error("Failed to register. Please try again.");
              }
            }} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">{t("registercommunity.fullName")}</label>
                <input
                  type="text"
                  required
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-white focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">{t("registercommunity.emailAddress")}</label>
                <input
                  type="email"
                  required
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-white focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">{t("registercommunity.phoneNumber")}</label>
                <input
                  type="text"
                  required
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-white focus:outline-none focus:border-[#F97316]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#5C4033]">{t("Number of Attendees")}</label>
                <select
                  value={regForm.attendees}
                  onChange={(e) => setRegForm({ ...regForm, attendees: parseInt(e.target.value) })}
                  className="w-full p-2.5 text-xs rounded-xl border border-[#EBE3DB] bg-white focus:outline-none focus:border-[#F97316]"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n} {n === 1 ? t("Person") : t("People")}</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="w-full py-2.5 bg-[#F97316] text-white text-xs font-bold rounded-xl hover:bg-[#EA580C] shadow-md transition cursor-pointer">
                {t("Confirm Registration")}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Community Details Modal */}
      {selectedCommunityDetails && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-lg w-full overflow-hidden relative shadow-2xl text-left">
            <button onClick={() => setSelectedCommunityDetails(null)} className="absolute top-4 right-4 z-10 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
            <div className="h-36 relative bg-amber-100 flex items-center justify-center overflow-hidden">
              <img 
                src={selectedCommunityDetails.cover || selectedCommunityDetails.cover_url || "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60"} 
                alt="" 
                onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1543341724-66ca0d39b133?w=800&auto=format&fit=crop&q=60"; }}
                className="w-full h-full object-cover" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
              <div className="absolute bottom-3 left-5 right-5 text-white">
                <span className="text-[10px] font-extrabold bg-[#F97316] text-white px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {selectedCommunityDetails.type || "Community"}
                </span>
                <h3 className="font-extrabold text-xl text-white mt-1 drop-shadow-md">{selectedCommunityDetails.name}</h3>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#FFF8F2] rounded-2xl border border-[#EBE3DB]/60">
                  <span className="text-warm-muted text-[10px] uppercase font-bold block mb-0.5">Location</span>
                  <span className="font-semibold text-[#3E2723] flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-[#F97316]" /> {selectedCommunityDetails.village ? `${selectedCommunityDetails.village}, ${selectedCommunityDetails.district}` : selectedCommunityDetails.district || selectedCommunityDetails.state || "Gujarat"}
                  </span>
                </div>
                <div className="p-3 bg-[#FFF8F2] rounded-2xl border border-[#EBE3DB]/60">
                  <span className="text-warm-muted text-[10px] uppercase font-bold block mb-0.5">Total Members</span>
                  <span className="font-semibold text-[#3E2723] flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-[#F97316]" /> {selectedCommunityDetails.member_count || 150} Members
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <h4 className="text-xs font-bold text-[#5C4033]">About Community</h4>
                <p className="text-xs text-[#5C4033]/90 leading-relaxed bg-[#FFF8F2] p-4 rounded-2xl border border-[#EBE3DB]/60">
                  {selectedCommunityDetails.desc || selectedCommunityDetails.description || "Official community organization providing platform for family registration, events, matrimonials, and social welfare programs."}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setSelectedCommunityDetails(null)}
                  className="flex-1 py-2.5 bg-[#FAF3EC] text-[#5C4033] font-bold text-xs rounded-xl hover:bg-[#FDF2E9] transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={(e) => handleJoinCommunityClick(selectedCommunityDetails, e)}
                  className={`flex-1 py-2.5 font-bold text-xs rounded-xl shadow-md transition cursor-pointer ${
                    selectedCommunityDetails.joined
                      ? "bg-amber-100 text-amber-800 border border-amber-300 flex items-center justify-center gap-1"
                      : "bg-[#F97316] text-white hover:bg-[#EA580C]"
                  }`}
                >
                  {selectedCommunityDetails.joined ? "Request Pending ✓" : "Join Community"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Login Required Modal */}
      {showLoginPromptModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-sm w-full p-6 space-y-4 relative shadow-2xl text-center">
            <button onClick={() => setShowLoginPromptModal(false)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4 text-[#5C4033]" />
            </button>
            <div className="w-14 h-14 rounded-full bg-amber-100 text-[#F97316] flex items-center justify-center mx-auto text-2xl font-bold">
              🔒
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-[#3E2723]">Login Required to Join</h3>
              <p className="text-xs text-warm-muted leading-relaxed">
                You must be logged in to your BHOI account to join communities, request membership, and interact with community admins.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLoginPromptModal(false)}
                className="flex-1 py-2.5 bg-[#FAF3EC] text-[#5C4033] font-bold text-xs rounded-xl hover:bg-[#FDF2E9] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowLoginPromptModal(false);
                  navigate({ to: "/login", search: { redirect: "/?page=communities" } });
                }}
                className="flex-1 py-2.5 bg-[#F97316] text-white font-bold text-xs rounded-xl hover:bg-[#EA580C] shadow-md transition cursor-pointer"
              >
                Log In Now
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* 6. Family Tree Modal */}
      {selectedFamilyTree && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[#FFF5EE] border border-[#EBE3DB] rounded-[32px] max-w-lg w-full p-6 text-center space-y-6 relative shadow-2xl">
            <button onClick={() => setSelectedFamilyTree(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="text-center space-y-1">
              <h3 className="font-extrabold text-[#3E2723] text-lg flex items-center justify-center gap-1.5">
                <Network className="w-5 h-5 text-[#F97316]" /> {t("Family Tree of")} {t(selectedFamilyTree.name)}
              </h3>
              <p className="text-xs text-warm-muted">{t("Genealogy and relationships within the samaj")}</p>
            </div>

            {/* Visual Family Tree Representation */}
            <div className="bg-white rounded-2xl p-5 border border-[#EBE3DB]/60 space-y-6 shadow-2xs relative overflow-hidden text-left">
              {/* Gen 1: Parents */}
              <div className="flex justify-center gap-6 relative">
                {/* Connector Line to Children */}
                <div className="absolute bottom-[-16px] left-1/2 -translate-x-1/2 w-0.5 h-4 bg-[#EBE3DB]" />

                <div className="bg-[#FFF8F2] border border-[#EBE3DB] p-2.5 rounded-xl text-center w-28 shadow-2xs">
                  <span className="text-[9px] font-bold text-[#F97316] bg-[#FDF2E9] px-2 py-0.5 rounded-full block w-max mx-auto mb-1">Father</span>
                  <div className="text-[11px] font-bold text-[#3E2723] truncate">{selectedFamilyTree.father.name}</div>
                  <div className="text-[8px] text-warm-muted truncate">{selectedFamilyTree.father.occupation}</div>
                </div>

                <div className="bg-[#FFF8F2] border border-[#EBE3DB] p-2.5 rounded-xl text-center w-28 shadow-2xs">
                  <span className="text-[9px] font-bold text-[#F97316] bg-[#FDF2E9] px-2 py-0.5 rounded-full block w-max mx-auto mb-1">Mother</span>
                  <div className="text-[11px] font-bold text-[#3E2723] truncate">{selectedFamilyTree.mother.name}</div>
                  <div className="text-[8px] text-warm-muted truncate">{selectedFamilyTree.mother.occupation}</div>
                </div>
              </div>

              {/* Gen 2: Self & Siblings */}
              <div className="pt-2 relative">
                {/* Horizontal Connector Line for siblings */}
                <div className="absolute top-0 left-1/4 right-1/4 h-0.5 bg-[#EBE3DB]" />
                <div className="absolute top-0 left-1/4 w-0.5 h-2 bg-[#EBE3DB]" />
                <div className="absolute top-0 right-1/4 w-0.5 h-2 bg-[#EBE3DB]" />

                <div className="flex justify-center gap-6 pt-2">
                  <div className="bg-[#FAF3EC] border-2 border-[#F97316] p-2.5 rounded-xl text-center w-28 shadow-2xs relative">
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[8px] font-bold text-white bg-[#F97316] px-1.5 py-0.5 rounded-full">Self</span>
                    <div className="text-[11px] font-bold text-[#3E2723] truncate mt-1">{selectedFamilyTree.name}</div>
                    <div className="text-[8px] text-warm-muted truncate">{selectedFamilyTree.profession}</div>
                  </div>

                  {selectedFamilyTree.siblings.map((sib: any, idx: number) => (
                    <div key={idx} className="bg-[#FFF8F2] border border-[#EBE3DB] p-2.5 rounded-xl text-center w-28 shadow-2xs">
                      <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full block w-max mx-auto mb-1">{sib.relation}</span>
                      <div className="text-[11px] font-bold text-[#3E2723] truncate">{sib.name}</div>
                      <div className="text-[8px] text-warm-muted truncate">{sib.occupation}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* 7. Donation Receipt Modal */}
      {showReceipt && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white border border-[#EBE3DB] rounded-3xl max-w-sm w-full p-6 text-center space-y-4 relative shadow-2xl text-left">
            <button onClick={() => setShowReceipt(null)} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-[#FAF3EC] flex items-center justify-center hover:bg-[#FDF2E9] hover:text-[#F97316] transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>

            <div className="text-center">
              <h3 className="font-extrabold text-[#3E2723]">{t("dashboarddonations.donationSuccessful")}</h3>
              <p className="text-xs text-warm-muted mt-1 font-medium">{t("dashboarddonations.thankYouForSupportingYourSamajCommunity")}</p>
            </div>

            <div className="bg-[#FAF3EC] rounded-2xl p-4 text-xs space-y-2 border border-[#EBE3DB]/60">
              <div className="flex justify-between">
                <span className="text-warm-muted">{t("dashboarddonations.donorName")}:</span>
                <span className="font-bold text-[#3E2723]">{userProfile.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-muted">{t("dashboarddonations.campaign")}:</span>
                <span className="font-bold text-[#3E2723]">{showReceipt.campaign}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-muted">{t("dashboarddonations.transactionId")}:</span>
                <span className="font-mono text-[#3E2723]">{showReceipt.txnId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-warm-muted">{t("dashboarddonations.date")}:</span>
                <span className="font-bold text-[#3E2723]">{showReceipt.date}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#EBE3DB] text-sm">
                <span className="font-bold text-[#3E2723]">{t("dashboarddonations.amountPaid")}:</span>
                <span className="font-extrabold text-[#F97316]">₹{parseInt(showReceipt.amount).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => {
                downloadReceiptPdf({
                  campaign: showReceipt.campaign,
                  amount: showReceipt.amount,
                  txnId: showReceipt.txnId,
                  date: showReceipt.date
                });
              }}
              className="w-full py-2 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:shadow-lg transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> {t("dashboarddonations.downloadPdfReceipt")}
            </button>
            <button onClick={() => setShowReceipt(null)} className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer">
              {t("dashboarddonations.closeReceipt")}
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}




const SAMACHAR_ITEMS = [
  {
    id: "s1",
    title: "Samaj Yuva Sammelan 2024",
    location: "Ahmedabad, Gujarat",
    time: "2h ago",
    category: "Meeting Notice",
    excerpt: "The 42nd Annual Samaj Sammelan is scheduled for July 15, 2026 at Rajula Community Hall. All members are requested to attend.",
    img: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=250&fit=crop"
  },
  {
    id: "s2",
    title: "Samajna Agraynio Sanman Samaroh",
    location: "Gandhinagar",
    time: "5h ago",
    category: "Achievement",
    excerpt: "Felicitation ceremony of community members with stellar academic and business performances this year at Gandhinagar Town Hall.",
    img: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=400&h=250&fit=crop"
  },
  {
    id: "s3",
    title: "Nava Samaj Bhavan nu Lokarpan",
    location: "Surat",
    time: "1d ago",
    category: "General",
    excerpt: "Inauguration ceremony of the newly constructed Samaj Bhavan building in Surat with modern facilities.",
    img: "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=400&h=250&fit=crop"
  },
  {
    id: "s4",
    title: "500 Vruksh Ropan Karyakram",
    location: "Rajkot",
    time: "2d ago",
    category: "Eco Event",
    excerpt: "Tree plantation drive by youths of the community planted over 500 saplings in Rajkot green belt area.",
    img: "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=250&fit=crop"
  }
];

const PARTNERS = [
  { name: "Kinjal Patel", age: 27, location: "Ahmedabad", education: "B.Tech", profession: "Software Engineer", photo: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop" },
  { name: "Meet Shah", age: 29, location: "Rajkot", education: "MBA", profession: "Business Owner", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop" },
  { name: "Priya Joshi", age: 25, location: "Vadodara", education: "M.Ed", profession: "Teacher", photo: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop" },
  { name: "Dhaval Mehta", age: 30, location: "Surat", education: "MBBS, MD", profession: "Doctor", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&h=150&fit=crop" }
];

const DASHBOARD_JOBS = [
  { role: "Account Manager", company: "Shree Samaj Pvt. Ltd.", location: "Ahmedabad", logo: "A", applied: false, isNew: true },
  { role: "Software Developer", company: "Samaj Infotech", location: "Rajkot", logo: "S", applied: false, isNew: true },
  { role: "Sales Executive", company: "Community Services", location: "Surat", logo: "C", applied: false, isNew: false }
];

const EVENTS_ITEMS = [
  { day: "28", month: "MAY", title: "Samaj Yuva Sammelan 2024", location: "Ahmedabad, Gujarat", time: "10:00 AM" },
  { day: "02", month: "JUN", title: "Samuh Lagna Samaroh", location: "Surat, Gujarat", time: "11:00 AM" },
  { day: "15", month: "JUN", title: "Samaj Khel Mahotsav", location: "Rajkot, Gujarat", time: "09:00 AM" },
  { day: "30", month: "JUN", title: "Blood Donation Camp", location: "Vadodara, Gujarat", time: "08:00 AM" }
];

const GALLERY_IMAGES = [
  "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1528605248644-14dd04022da1?w=300&h=200&fit=crop",
  "https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=300&h=200&fit=crop"
];

const POPULAR_VIDEOS = [
  { title: "Sammelan Highlights", duration: "03:18", img: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=350&h=200&fit=crop" },
  { title: "Matrimony Meet 2026", duration: "02:45", img: "https://images.unsplash.com/photo-1519741497674-611481863552?w=350&h=200&fit=crop" },
  { title: "Samaj Bhavan Tour", duration: "04:12", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=350&h=200&fit=crop" }
];

const HIGHLIGHTS = [
  { type: "New Member Joined", name: "Dharmik Jain", detail: "from Mumbai", icon: Users, color: "text-[#F97316] bg-[#FFF5EE]" },
  { type: "New Community Added", name: "Shree Umiya Samaj", detail: "USA", icon: Building2, color: "text-emerald-600 bg-emerald-50" },
  { type: "New Business Listed", name: "Patel Traders", detail: "Ahmedabad", icon: Briefcase, color: "text-blue-600 bg-blue-50" },
  { type: "New Event Added", name: "Blood Donation Camp", detail: "", icon: Calendar, color: "text-red-600 bg-red-50" }
];
