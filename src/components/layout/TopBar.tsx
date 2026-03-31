import { useState, useRef, useEffect, useCallback } from "react";
import { Search, MapPin, ChevronDown, Eye, Users, Globe, Crosshair, Loader2, User, FileText, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useUpdateProfile } from "@/hooks/useProfile";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import debounce from "lodash/debounce";

const visibilityOptions = [
  { id: "nearby", label: "Nearby Only", desc: "~2km radius", icon: Crosshair, color: "text-success" },
  { id: "friends", label: "Friends Only", desc: "Only people you connect with", icon: Users, color: "text-primary" },
  { id: "blurred", label: "Blurred", desc: "500m approximate area", icon: Eye, color: "text-accent" },
  { id: "public", label: "Public", desc: "Anyone can see your area", icon: Globe, color: "text-karma" },
];

interface SearchResult {
  type: 'user' | 'post';
  id: string;
  title: string;
  subtitle: string;
  avatar?: string | null;
}

export function TopBar() {
  const { profile, user } = useAuth();
  const navigate = useNavigate();
  const updateProfile = useUpdateProfile();
  const [showDropdown, setShowDropdown] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const currentVisibility = profile?.privacy_level || "blurred";
  const currentOption = visibilityOptions.find(o => o.id === currentVisibility) || visibilityOptions[2];

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setShowDropdown(false);
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowResults(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const performSearch = useCallback(
    debounce(async (q: string) => {
      if (!q.trim() || q.trim().length < 2) {
        setResults([]);
        setSearching(false);
        return;
      }

      setSearching(true);
      const searchTerm = `%${q.trim()}%`;

      const [usersRes, postsRes] = await Promise.all([
        supabase
          .from('profiles_public')
          .select('user_id, display_name, avatar_url, bio, karma')
          .or(`display_name.ilike.${searchTerm},bio.ilike.${searchTerm}`)
          .limit(5),
        supabase
          .from('posts')
          .select('id, title, description, author_id, category')
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const userResults: SearchResult[] = (usersRes.data || [])
        .filter((u) => u.user_id !== user?.id)
        .map((u) => ({
          type: 'user' as const,
          id: u.user_id,
          title: u.display_name,
          subtitle: u.bio || `${u.karma} karma`,
          avatar: u.avatar_url,
        }));

      const postResults: SearchResult[] = (postsRes.data || []).map((p) => ({
        type: 'post' as const,
        id: p.id,
        title: p.title,
        subtitle: p.description?.slice(0, 60) || p.category,
      }));

      setResults([...userResults, ...postResults]);
      setSearching(false);
    }, 300),
    [user?.id]
  );

  const handleSearch = (value: string) => {
    setQuery(value);
    setShowResults(true);
    performSearch(value);
  };

  const handleSelect = (result: SearchResult) => {
    setShowResults(false);
    setQuery("");
    if (result.type === 'user') {
      navigate(`/user/${result.id}`);
    }
    // Posts don't have a dedicated page yet, navigate to feed
  };

  const handleVisibility = (id: string) => {
    updateProfile.mutate({ privacy_level: id });
    setShowDropdown(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-card/80 backdrop-blur-lg border-b border-border">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 shrink-0">
          <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-lg text-foreground hidden sm:block">Neighborly</span>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative" ref={searchRef}>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search people, posts..."
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => query.trim().length >= 2 && setShowResults(true)}
              className="w-full h-9 pl-9 pr-8 rounded-full bg-muted text-sm text-foreground placeholder:text-muted-foreground border-none outline-none focus:ring-2 focus:ring-primary/20 transition-all"
            />
            {query && (
              <button onClick={() => { setQuery(""); setResults([]); setShowResults(false); }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <AnimatePresence>
            {showResults && query.trim().length >= 2 && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="absolute left-0 right-0 top-full mt-2 bg-card rounded-2xl border border-border shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto"
              >
                {searching ? (
                  <div className="flex items-center justify-center py-6">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  </div>
                ) : results.length === 0 ? (
                  <div className="py-6 text-center">
                    <p className="text-sm text-muted-foreground">No results for "{query}"</p>
                  </div>
                ) : (
                  <div className="p-1.5">
                    {results.some(r => r.type === 'user') && (
                      <>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">People</p>
                        {results.filter(r => r.type === 'user').map((r) => (
                          <button key={r.id} onClick={() => handleSelect(r)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left">
                            <img
                              src={r.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.id}`}
                              alt="" className="h-9 w-9 rounded-lg bg-muted flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{r.subtitle}</p>
                            </div>
                            <User className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
                          </button>
                        ))}
                      </>
                    )}
                    {results.some(r => r.type === 'post') && (
                      <>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5 mt-1">Posts</p>
                        {results.filter(r => r.type === 'post').map((r) => (
                          <button key={r.id} onClick={() => handleSelect(r)}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-muted transition-colors text-left">
                            <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <FileText className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{r.title}</p>
                              <p className="text-[11px] text-muted-foreground truncate">{r.subtitle}</p>
                            </div>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative shrink-0" ref={dropdownRef}>
          <button onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1.5 rounded-xl hover:bg-muted">
            <currentOption.icon className={`h-3.5 w-3.5 ${currentOption.color}`} />
            <span className="hidden sm:inline">{currentOption.label}</span>
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showDropdown ? "rotate-180" : ""}`} />
          </button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="absolute right-0 top-full mt-2 w-64 bg-card rounded-2xl border border-border shadow-xl p-2 z-50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 py-1.5">Who can discover you</p>
                {visibilityOptions.map(opt => (
                  <button key={opt.id} onClick={() => handleVisibility(opt.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      currentVisibility === opt.id ? "bg-primary/10" : "hover:bg-muted"
                    }`}>
                    <div className={`h-8 w-8 rounded-lg ${currentVisibility === opt.id ? "bg-primary/20" : "bg-muted"} flex items-center justify-center`}>
                      <opt.icon className={`h-4 w-4 ${opt.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${currentVisibility === opt.id ? "text-primary" : "text-foreground"}`}>{opt.label}</p>
                      <p className="text-[11px] text-muted-foreground">{opt.desc}</p>
                    </div>
                    {currentVisibility === opt.id && <div className="h-2 w-2 rounded-full bg-primary" />}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
