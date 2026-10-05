import shell from "@/assets/p-shell.jpg";
import merino from "@/assets/p-merino.jpg";
import trail from "@/assets/p-trail.jpg";
import vest from "@/assets/p-vest.jpg";
import puffer from "@/assets/p-puffer.jpg";
import road from "@/assets/p-road.jpg";
import tights from "@/assets/p-tights.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  tagline: string;
  description: string;
  image: string;
};

export const CATEGORIES = ["Outerwear", "Base layers", "Footwear", "Accessories"];
export const FALLBACK_IMAGE = shell;

export const initialProducts: Product[] = [
  { id: "p1", name: "Cinder Shell", category: "Outerwear", price: 148, stock: 42, tagline: "Windproof · 240g", image: shell, description: "A featherweight hooded shell that blocks wind and sheds light rain. Packs into its own chest pocket." },
  { id: "p2", name: "Merino 180", category: "Base layers", price: 82, stock: 7, tagline: "Thermal base · 180gsm", image: merino, description: "Soft merino wool base layer that stays warm when wet and never holds odour. Raglan sleeves for free arm swing." },
  { id: "p3", name: "Vector Trail", category: "Footwear", price: 175, stock: 128, tagline: "Carbon plate · grip 8mm", image: trail, description: "Carbon-plated trail shoe with aggressive 8mm lugs for wet roots, loose gravel and icy mornings." },
  { id: "p4", name: "Lumen Vest", category: "Accessories", price: 64, stock: 0, tagline: "360° reflective", image: vest, description: "Breathable mesh vest with full-wrap reflective panels so drivers see you from every angle." },
  { id: "p5", name: "Drift Puffer", category: "Outerwear", price: 229, stock: 18, tagline: "800 fill · hooded", image: puffer, description: "Lofty insulated jacket for warm-ups and cool-downs on the coldest days. Weighs less than a water bottle." },
  { id: "p6", name: "Pulse Road", category: "Footwear", price: 139, stock: 54, tagline: "Daily trainer · 8mm drop", image: road, description: "Cushioned everyday road shoe with a springy foam midsole built for high weekly mileage." },
  { id: "p7", name: "Core Tight", category: "Base layers", price: 72, stock: 4, tagline: "Brushed fleece · zip pocket", image: tights, description: "Brushed-back running tights with a secure zip pocket and reflective ankle hits." },
];
