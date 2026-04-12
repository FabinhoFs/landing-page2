/**
 * Lightweight icon lookup for the PUBLIC landing page.
 *
 * This file imports ONLY the ~25 icons actually used in the landing page
 * (Hero bullets, SocialProofBar, etc.), keeping the initial bundle small.
 *
 * The full IconPicker with 100+ icons remains in the admin-only module
 * and is only loaded when the admin panel is opened.
 */
import type { LucideIcon } from "lucide-react";
import {
  MessageCircle, Video, Headphones, ShieldCheck, Zap, Clock, Lock, Target,
  Rocket, Star, Heart, CheckCircle, Globe, Eye, Sparkles, Shield, Award,
  Fingerprint, FileCheck, UserCheck, FastForward, Phone, Mail, MapPin,
  Building, Calendar, Users,
} from "lucide-react";

const LANDING_ICONS: Record<string, LucideIcon> = {
  MessageCircle, Video, Headphones, ShieldCheck, Zap, Clock, Lock, Target,
  Rocket, Star, Heart, CheckCircle, Globe, Eye, Sparkles, Shield, Award,
  Fingerprint, FileCheck, UserCheck, FastForward, Phone, Mail, MapPin,
  Building, Calendar, Users,
};

/**
 * Returns an icon component by name.
 * Falls back to null if the icon isn't in the lightweight landing set.
 */
export function getLandingIcon(name: string): LucideIcon | null {
  return LANDING_ICONS[name] || null;
}
