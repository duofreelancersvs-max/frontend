import { 
  Video, 
  Image as ImageIcon, 
  Clapperboard, 
  Share2, 
  Layers, 
  Camera,
  Play
} from "lucide-react";

export const CATEGORY_STYLES: Record<string, { gradient: string; icon: any }> = {
  "Product Videos": { gradient: "from-blue-500 to-cyan-400", icon: Video },
  "Motion Graphics": { gradient: "from-purple-500 to-pink-500", icon: Layers },
  "Wedding Videos": { gradient: "from-rose-400 to-orange-300", icon: Camera },
  "Social Media": { gradient: "from-indigo-500 to-purple-600", icon: Share2 },
  "Video Editing": { gradient: "from-cyan-500 to-blue-600", icon: Video },
  "3D Animation": { gradient: "from-orange-500 to-red-600", icon: Layers },
  "Graphic Design": { gradient: "from-pink-500 to-rose-600", icon: ImageIcon },
  "Content Writing": { gradient: "from-emerald-500 to-green-600", icon: Clapperboard },
  "Intros & Outros": { gradient: "from-amber-400 to-orange-500", icon: Clapperboard },
  "Real Estate": { gradient: "from-emerald-500 to-teal-400", icon: ImageIcon },
  "Photography": { gradient: "from-zinc-500 to-slate-700", icon: Camera },
  "Digital Marketing": { gradient: "from-sky-400 to-blue-500", icon: Share2 },
  "Default": { gradient: "from-slate-400 to-slate-500", icon: Play },
};

export const getCategoryStyle = (category: string) => {
  return CATEGORY_STYLES[category] || CATEGORY_STYLES["Default"];
};
