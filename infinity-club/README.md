<div align="center">

# ♾️ Infinity Club

**The official web presence of Infinity Club — Faculty of MI, University of El Bashir El Ibrahimi (Bordj Bou Arréridj).**  
*Hosting **AIVEX** — National AI Innovation & Development Tournament.*

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Three.js](https://img.shields.io/badge/Three.js-r185-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![Blender](https://img.shields.io/badge/Blender-3D%20%26%20Animation-F5792A?style=for-the-badge&logo=blender&logoColor=white)](https://www.blender.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev/)
[![License](https://img.shields.io/badge/License-MIT-crimson?style=for-the-badge)](../LICENSE)

</div>

---

## 📸 Preview

### Desktop Experience

| 3D Model Hero & Stats | Flipping Event Cards | Video Transformation |
| :---: | :---: | :---: |
| ![3D Queen Model](src/assets/3D%20model.png) | ![Flipping Cards](src/assets/flipping%20cards.png) | ![Video Transformation](src/assets/vid%20transformation.png) |

| Team Registration | Connect Section |
| :---: | :---: |
| ![Team Registration](src/assets/registration.png) | ![Connect Section](src/assets/connect.png) |

### Responsive Design

| **Tablet View (iPad)** | **Mobile View (Hero)** | **Mobile View (Connect)** |
| :---: | :---: | :---: |
| ![iPad Responsive](src/assets/ipad%20responsive.png) | ![Phone Responsive](src/assets/phone%20responsive.png) | ![Mobile Connect](src/assets/mobile-connect.png) |

---

## ✨ Features

- ♾️ **Hand-crafted 3D Queen & Pawn** — Fully modeled, sculpted, textured, and animated in Blender, rendered smoothly in real-time with Three.js (WebGL, smooth vertex normals, gold rim lighting, and studio shadows).
- 🎬 **Pawn-to-Queen Transformation** — Embedded video animation honoring the club's motto: *"Every Queen was once a pawn. Enter the competition and make your move."*
- 🃏 **Flipping Event Cards** — Interactive CSS 3D cards that flip 180° on hover to reveal timeline stages and schedule details for the AIVEX tournament.
- 📋 **Team & Delegation Registration** — Dynamic multi-participant registration system with real-time validation and persistent storage powered by Supabase.
- 📱 **Fully Responsive Layout** — Fluid presentation across widescreen desktops, tablets, and smartphones with an animated mobile navigation drawer.
- 🔗 **Interactive Connect Section** — One-click clipboard copy for email addresses and phone lines, plus quick navigation to campus location and social media channels.

---

## 🛠️ Tech Stack

| Layer | Technology | Description |
|---|---|---|
| **Frontend Framework** | **React 19** | Component-driven architecture and hooks-based state management |
| **3D Modeling & Animation** | **Blender** | High-precision mesh sculpting, PBR materials, and transformation animation |
| **3D Web Rendering** | **Three.js (r185)** | GLTFLoader, OrbitControls, custom multi-point lighting, and ACESFilmic tone mapping |
| **Backend & Database** | **Supabase** | Cloud database persistence for registrations via `@supabase/supabase-js` |
| **Build Tooling** | **Vite 8** | High-speed bundler with Fast Refresh (HMR) |
| **Styling** | **Pure CSS3** | Custom design system using CSS variables, 3D perspective transforms, and glassmorphism |
| **Code Quality** | **ESLint** | Strict linting rules with React Hooks & React Refresh plugins |

---

## ⚙️ Technical Highlights

- 🧊 **Custom 3D Blender Pipeline**: The signature mechanical chess pieces were sculpted and animated from scratch in Blender, exported as binary `.glb` containers, and rendered in the browser with `GLTFLoader` and `AnimationMixer`.
- 💡 **Dynamic Lighting & Shaders**: Studio-grade lighting setup featuring ambient illumination, directional key light with PCF soft shadows, warm gold rim highlights, and ACESFilmic tone mapping.
- 📐 **Adaptive Three.js Viewport**: Smooth camera calculations and dynamic canvas resizing avoid aspect ratio distortion on mobile, tablet, and high-DPI displays.
- 🛡️ **Resilient Registration**: Multi-tiered participant and delegation form handling with live field verification, sanitized inputs, and Supabase database submission with toast feedback.

---

## 📂 Project Structure

```text
infinity-club/
├── public/
│   ├── images/              # Logos, sponsor badges & UI assets
│   ├── models/              # Blender 3D GLTF/GLB models (queen.glb, etc.)
│   └── videos/              # Transformation video animations
├── src/
│   ├── assets/              # Showcase previews and screenshots
│   ├── lib/
│   │   └── SupabaClient.js  # Supabase client initialization
│   ├── App.css              # Custom styling, 3D card flips, responsive styles
│   ├── App.jsx              # Main application, Navbar, Hero, Events, Registration
│   ├── Queen3d.jsx          # Standalone Three.js 3D canvas component
│   ├── index.css            # Global resets and CSS variables
│   └── main.jsx             # React DOM root entry
├── package.json             # Dependencies and scripts
└── vite.config.js           # Vite configuration
```

---

## 🚀 Running Locally

### Prerequisites

- [Node.js](https://nodejs.org/) (version 18 or newer recommended)
- [npm](https://www.npmjs.com/) or [pnpm](https://pnpm.io/)

### Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Alae-bng/cometition.git
   cd cometition/infinity-club
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env` file in the `infinity-club` directory (or use `.env.example`):
   ```env
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

5. **Build for production:**
   ```bash
   npm run build
   ```

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
