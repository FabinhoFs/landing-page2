import { useState, useMemo } from "react";
import {
  MessageCircle, Video, Headphones, ShieldCheck, Zap, Clock, Lock, Target,
  Rocket, Star, Heart, CheckCircle, Globe, Eye, Sparkles, Shield, Award,
  Fingerprint, FileCheck, UserCheck, FastForward, Phone, Mail, MapPin,
  Building, Calendar, CreditCard, Download, Upload, FileText, File,
  Folder, Home, Image, Info, Key, Layers, Link, List, Monitor,
  Moon, Sun, Search, Settings, Share, Tag, ThumbsUp, Trash, User,
  Users, Wifi, AlertTriangle, ArrowRight, Bell, Bookmark, Camera,
  Check, ChevronRight, Clipboard, Cloud, Code, Coffee, Cpu, Database,
  Edit, ExternalLink, Flag, Gift, HardDrive, Hash, Inbox, Laptop,
  Layout, LifeBuoy, LogIn, Map, Maximize, Menu, Mic, Minus,
  MoreHorizontal, Package, Paperclip, Pen, Percent, Play, Plus,
  Power, Printer, Radio, RefreshCw, RotateCw, Save, Send, Server,
  Smartphone, Speaker, Square, Terminal, TrendingUp, Trophy, Tv, Type,
  Umbrella, Unlock, Volume2, Watch, Wrench, X, Activity, Airplay,
  AlignCenter, Archive, AtSign, BarChart, Battery, Bold, Box, Briefcase,
  Cast, Compass, Copy, Crosshair, Disc, DollarSign, Droplet, Feather,
  Film, Filter, Flame, Truck, Voicemail, Wind, Smile, Frown, Meh,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

const ALL_ICONS: { name: string; icon: LucideIcon; tags: string }[] = [
  { name: "MessageCircle", icon: MessageCircle, tags: "mensagem chat conversa" },
  { name: "Video", icon: Video, tags: "vídeo câmera videoconferência" },
  { name: "Headphones", icon: Headphones, tags: "fone suporte atendimento" },
  { name: "ShieldCheck", icon: ShieldCheck, tags: "segurança escudo verificado" },
  { name: "Zap", icon: Zap, tags: "raio rápido energia velocidade" },
  { name: "Clock", icon: Clock, tags: "relógio tempo hora" },
  { name: "Lock", icon: Lock, tags: "cadeado segurança bloqueio" },
  { name: "Target", icon: Target, tags: "alvo objetivo meta" },
  { name: "Rocket", icon: Rocket, tags: "foguete lançamento rápido" },
  { name: "Star", icon: Star, tags: "estrela favorito destaque" },
  { name: "Heart", icon: Heart, tags: "coração amor favorito" },
  { name: "CheckCircle", icon: CheckCircle, tags: "check ok aprovado círculo" },
  { name: "Globe", icon: Globe, tags: "globo mundo internet" },
  { name: "Eye", icon: Eye, tags: "olho visão ver" },
  { name: "Sparkles", icon: Sparkles, tags: "brilho destaque novo" },
  { name: "Shield", icon: Shield, tags: "escudo proteção segurança" },
  { name: "Award", icon: Award, tags: "prêmio troféu medalha" },
  { name: "Fingerprint", icon: Fingerprint, tags: "digital biometria identidade" },
  { name: "FileCheck", icon: FileCheck, tags: "arquivo documento aprovado" },
  { name: "UserCheck", icon: UserCheck, tags: "usuário verificado aprovado" },
  { name: "FastForward", icon: FastForward, tags: "avançar rápido agilidade" },
  { name: "Phone", icon: Phone, tags: "telefone ligação contato" },
  { name: "Mail", icon: Mail, tags: "email carta correio" },
  { name: "MapPin", icon: MapPin, tags: "mapa local endereço" },
  { name: "Building", icon: Building, tags: "prédio empresa escritório" },
  { name: "Calendar", icon: Calendar, tags: "calendário data agenda" },
  { name: "CreditCard", icon: CreditCard, tags: "cartão pagamento crédito" },
  { name: "Download", icon: Download, tags: "baixar download" },
  { name: "Upload", icon: Upload, tags: "enviar upload" },
  { name: "FileText", icon: FileText, tags: "arquivo texto documento" },
  { name: "File", icon: File, tags: "arquivo documento" },
  { name: "Folder", icon: Folder, tags: "pasta diretório" },
  { name: "Home", icon: Home, tags: "casa início home" },
  { name: "Image", icon: Image, tags: "imagem foto" },
  { name: "Info", icon: Info, tags: "informação ajuda" },
  { name: "Key", icon: Key, tags: "chave acesso" },
  { name: "Layers", icon: Layers, tags: "camadas níveis" },
  { name: "Link", icon: Link, tags: "link conexão" },
  { name: "List", icon: List, tags: "lista itens" },
  { name: "Monitor", icon: Monitor, tags: "monitor tela computador" },
  { name: "Search", icon: Search, tags: "busca pesquisa" },
  { name: "Settings", icon: Settings, tags: "configurações engrenagem" },
  { name: "Share", icon: Share, tags: "compartilhar enviar" },
  { name: "Tag", icon: Tag, tags: "etiqueta rótulo" },
  { name: "ThumbsUp", icon: ThumbsUp, tags: "curtir positivo" },
  { name: "User", icon: User, tags: "usuário pessoa" },
  { name: "Users", icon: Users, tags: "usuários pessoas grupo" },
  { name: "AlertTriangle", icon: AlertTriangle, tags: "alerta aviso atenção" },
  { name: "Bell", icon: Bell, tags: "sino notificação" },
  { name: "Bookmark", icon: Bookmark, tags: "marcador salvar" },
  { name: "Camera", icon: Camera, tags: "câmera foto" },
  { name: "Check", icon: Check, tags: "check ok confirmar" },
  { name: "Clipboard", icon: Clipboard, tags: "clipboard copiar" },
  { name: "Cloud", icon: Cloud, tags: "nuvem cloud" },
  { name: "Code", icon: Code, tags: "código programação" },
  { name: "Coffee", icon: Coffee, tags: "café pausa" },
  { name: "Cpu", icon: Cpu, tags: "processador tecnologia" },
  { name: "Database", icon: Database, tags: "banco dados" },
  { name: "ExternalLink", icon: ExternalLink, tags: "link externo" },
  { name: "Flag", icon: Flag, tags: "bandeira" },
  { name: "Gift", icon: Gift, tags: "presente brinde" },
  { name: "Hash", icon: Hash, tags: "hashtag número" },
  { name: "Layout", icon: Layout, tags: "layout design" },
  { name: "LifeBuoy", icon: LifeBuoy, tags: "suporte ajuda" },
  { name: "Map", icon: Map, tags: "mapa local" },
  { name: "Package", icon: Package, tags: "pacote entrega" },
  { name: "Pen", icon: Pen, tags: "caneta escrever editar" },
  { name: "Percent", icon: Percent, tags: "porcentagem desconto" },
  { name: "Play", icon: Play, tags: "play iniciar reproduzir" },
  { name: "Power", icon: Power, tags: "energia ligar" },
  { name: "RefreshCw", icon: RefreshCw, tags: "atualizar recarregar" },
  { name: "Save", icon: Save, tags: "salvar gravar" },
  { name: "Send", icon: Send, tags: "enviar mensagem" },
  { name: "Server", icon: Server, tags: "servidor hosting" },
  { name: "Smartphone", icon: Smartphone, tags: "celular mobile" },
  { name: "Terminal", icon: Terminal, tags: "terminal console" },
  { name: "TrendingUp", icon: TrendingUp, tags: "tendência crescimento" },
  { name: "Trophy", icon: Trophy, tags: "troféu prêmio" },
  { name: "Unlock", icon: Unlock, tags: "desbloqueado aberto" },
  { name: "Watch", icon: Watch, tags: "relógio smartwatch" },
  { name: "Wrench", icon: Wrench, tags: "ferramenta manutenção" },
  { name: "Activity", icon: Activity, tags: "atividade pulso saúde" },
  { name: "Archive", icon: Archive, tags: "arquivo guardar" },
  { name: "BarChart", icon: BarChart, tags: "gráfico métricas" },
  { name: "Briefcase", icon: Briefcase, tags: "maleta trabalho negócios" },
  { name: "Compass", icon: Compass, tags: "bússola direção" },
  { name: "Copy", icon: Copy, tags: "copiar duplicar" },
  { name: "DollarSign", icon: DollarSign, tags: "dinheiro dólar valor" },
  { name: "Droplet", icon: Droplet, tags: "gota água" },
  { name: "Filter", icon: Filter, tags: "filtro funnel" },
  { name: "Flame", icon: Flame, tags: "fogo chama quente" },
  { name: "Truck", icon: Truck, tags: "caminhão entrega transporte" },
  { name: "Wind", icon: Wind, tags: "vento ar" },
  { name: "Smile", icon: Smile, tags: "sorriso feliz emoji" },
  { name: "Disc", icon: Disc, tags: "disco cd" },
  { name: "Feather", icon: Feather, tags: "pena leve" },
  { name: "Film", icon: Film, tags: "filme cinema" },
  { name: "Sun", icon: Sun, tags: "sol luz dia" },
  { name: "Moon", icon: Moon, tags: "lua noite escuro" },
];

// Build a lookup map for rendering selected icon
const ICON_LOOKUP: Record<string, LucideIcon> = {};
ALL_ICONS.forEach((i) => { ICON_LOOKUP[i.name] = i.icon; });

interface IconPickerProps {
  value: string;
  onChange: (iconName: string) => void;
}

export function getIconComponent(name: string): LucideIcon | null {
  return ICON_LOOKUP[name] || null;
}

export const IconPicker = ({ value, onChange }: IconPickerProps) => {
  const [search, setSearch] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return ALL_ICONS;
    const q = search.toLowerCase();
    return ALL_ICONS.filter(
      (i) => i.name.toLowerCase().includes(q) || i.tags.includes(q)
    );
  }, [search]);

  const SelectedIcon = ICON_LOOKUP[value] || MessageCircle;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="gap-2 h-10 px-3 justify-start min-w-[180px]">
          <SelectedIcon className="h-5 w-5 text-primary" />
          <span className="text-sm font-mono text-muted-foreground truncate">{value || "Escolher ícone"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b border-border">
          <Input
            placeholder="Buscar ícone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
            autoFocus
          />
        </div>
        <ScrollArea className="h-64">
          <div className="grid grid-cols-8 gap-1 p-2">
            {filtered.map((item) => {
              const isSelected = value === item.name;
              return (
                <button
                  key={item.name}
                  type="button"
                  title={item.name}
                  onClick={() => { onChange(item.name); setOpen(false); setSearch(""); }}
                  className={`flex items-center justify-center rounded-lg p-2 transition-all border ${
                    isSelected
                      ? "border-primary bg-primary/10 ring-2 ring-primary/30"
                      : "border-transparent hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <item.icon className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="col-span-8 text-center text-xs text-muted-foreground py-6">Nenhum ícone encontrado</p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
