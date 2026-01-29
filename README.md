# ChamaSmart 🚀

A **Progressive Web App (PWA)** for managing Kenyan Investment Groups (Chamas), with comprehensive member management, savings tracking, table banking (loans), and investment portfolio management.

[![PWA Ready](https://img.shields.io/badge/PWA-Ready-success)](https://web.dev/progressive-web-apps/)
[![SEO Optimized](https://img.shields.io/badge/SEO-Optimized-blue)](https://developers.google.com/search)
[![Next.js](https://img.shields.io/badge/Next.js-16.1.5-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)

## ✨ Features

### 📱 Progressive Web App
- **Installable** on desktop and mobile devices
- **Offline Support** with intelligent caching
- **Fast Loading** with service worker optimization
- **App Shortcuts** for quick access to key features
- **Native-like Experience** with standalone display mode

### 🔍 SEO Optimized
- **Comprehensive Meta Tags** for better search rankings
- **Structured Data (JSON-LD)** for rich search results
- **Dynamic Sitemap** generation
- **Open Graph** tags for social media sharing
- **Twitter Cards** for enhanced Twitter previews
- **Robots.txt** for proper search engine crawling

### 💼 Core Business Features
1. **Dashboard** - Real-time overview of group finances and activities
2. **Member Management** - Role-based access (Admin, Treasurer, Member)
3. **Transactions** - Complete ledger with M-Pesa integration support
4. **Table Banking** - Loan management with guarantor approval system
5. **Investment Tracking** - Portfolio management with valuation tracking
6. **Financial Reports** - Automated reporting and analytics

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.5 (App Router, Turbopack)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS v4
- **UI Components:** Shadcn/ui (Radix UI) + Lucide React icons
- **Database:** Neon Postgres (Serverless)
- **Auth:** NextAuth.js v5
- **ORM:** Prisma 5
- **PWA:** next-pwa 5.6.0
- **Deployment:** Vercel
- **Theme:** next-themes (Dark/Light mode)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ installed
- A Neon Postgres database ([sign up at neon.tech](https://neon.tech))

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd chama-smart
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
# Copy the example file
cp .env.example .env

# Update the following variables in .env:
DATABASE_URL="your-neon-postgres-url"
DIRECT_URL="your-neon-direct-url"
NEXT_PUBLIC_APP_URL="http://localhost:3000"  # Change to your domain in production
```

4. **Run database migrations:**
```bash
npx prisma migrate dev --name init
```

5. **Generate Prisma client:**
```bash
npx prisma generate
```

6. **Start the development server:**
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see your app!

## 📱 PWA Installation

### Desktop (Chrome/Edge)
1. Visit your ChamaSmart website
2. Look for the install icon (⊕) in the address bar
3. Click "Install"

### Android
1. Open Chrome and visit your website
2. Tap menu (⋮) → "Add to Home Screen"

### iOS (Safari)
1. Open Safari and visit your website
2. Tap Share button → "Add to Home Screen"

## 📊 Database Schema

### Core Models

- **Chama** - Investment group organization
- **User** - Members with role-based permissions
- **Transaction** - All financial movements
- **Loan** - Table banking loans with interest
- **LoanGuarantor** - Guarantor approval workflow
- **Asset** - Investment portfolio items

See `prisma/schema.prisma` for the complete schema.

## 📁 Project Structure

```
chama-smart/
├── app/
│   ├── (auth)/              # Authentication pages
│   ├── dashboard/           # Protected dashboard routes
│   │   ├── overview/        # Dashboard home
│   │   ├── members/         # Member management
│   │   ├── wallet/          # Transactions
│   │   ├── loans/           # Loan management
│   │   └── investments/     # Asset tracking
│   ├── api/                 # API routes
│   ├── layout.tsx           # Root layout with SEO metadata
│   ├── page.tsx             # Landing page with structured data
│   ├── sitemap.ts           # Dynamic sitemap
│   ├── opengraph-image.tsx  # OG image generator
│   └── twitter-image.tsx    # Twitter card image
├── components/
│   ├── ui/                  # Shadcn UI components
│   └── shared/              # Custom reusable components
├── lib/
│   ├── actions.ts           # Server actions
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── public/
│   ├── manifest.json        # PWA manifest
│   ├── robots.txt           # SEO crawler rules
│   ├── browserconfig.xml    # Windows tiles
│   └── icon-*.png           # PWA icons (all sizes)
├── prisma/
│   └── schema.prisma        # Database schema
├── PWA_SEO_GUIDE.md         # Detailed PWA/SEO guide
├── PWA_SEO_SUMMARY.md       # Implementation summary
└── QUICK_START.md           # Quick start guide
```

## 🔧 Available Scripts

```bash
# Development
npm run dev              # Start dev server with Turbopack
npm run build            # Build for production
npm start                # Start production server
npm run lint             # Run ESLint

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Run migrations
npx prisma studio        # Open Prisma Studio
npm run seed             # Seed database

# PWA
npm run generate-icons   # Generate all PWA icon sizes
```

## 🎨 PWA Icons

All PWA icons are auto-generated from `public/icon.png`:

```bash
# Regenerate all icon sizes
npm run generate-icons
```

**Generated sizes:** 72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512, and Apple Touch icons.

## 🔍 SEO Features

### Implemented
- ✅ Comprehensive meta tags
- ✅ Open Graph tags
- ✅ Twitter Cards
- ✅ Structured Data (JSON-LD)
- ✅ Dynamic sitemap (`/sitemap.xml`)
- ✅ Robots.txt (`/robots.txt`)
- ✅ Dynamic OG images
- ✅ Canonical URLs

### Testing SEO
```bash
# Build and check
npm run build

# Test with Lighthouse
# Open Chrome DevTools → Lighthouse → Run SEO audit
```

**Useful Tools:**
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)

## 🚢 Deployment

### Vercel (Recommended)

1. **Push to GitHub**
```bash
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Import your repository
   - Add environment variables:
     - `DATABASE_URL`
     - `DIRECT_URL`
     - `NEXT_PUBLIC_APP_URL` (your production domain)
   - Deploy!

3. **Post-Deployment**
   - Ensure HTTPS is enabled (required for PWA)
   - Test PWA installation
   - Submit sitemap to Google Search Console
   - Run Lighthouse audits

### Environment Variables for Production

```bash
DATABASE_URL="your-production-db-url"
DIRECT_URL="your-production-direct-url"
NEXT_PUBLIC_APP_URL="https://your-domain.com"
NEXTAUTH_URL="https://your-domain.com"
NEXTAUTH_SECRET="your-secret-key"
```

## 📚 Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Quick start guide for users
- **[PWA_SEO_GUIDE.md](./PWA_SEO_GUIDE.md)** - Comprehensive PWA & SEO guide
- **[PWA_SEO_SUMMARY.md](./PWA_SEO_SUMMARY.md)** - Implementation checklist

## 🧪 Testing

### PWA Testing
1. Open Chrome DevTools (F12)
2. Go to "Lighthouse" tab
3. Select "Progressive Web App"
4. Run audit

### SEO Testing
1. Run Lighthouse SEO audit
2. Check `/sitemap.xml` accessibility
3. Validate structured data
4. Test social media sharing

## 🎯 Performance

- **Lighthouse Score:** 90+ (PWA, Performance, SEO, Accessibility)
- **Service Worker:** Intelligent caching strategies
- **Code Splitting:** Automatic route-based splitting
- **Image Optimization:** Next.js Image component
- **Font Optimization:** Google Fonts with caching

## 🔐 Security

- **HTTPS Required** for PWA features
- **Row Level Security** with Prisma
- **Input Validation** with Zod
- **Authentication** with NextAuth.js
- **Environment Variables** for sensitive data

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Neon](https://neon.tech/) - Serverless Postgres
- [Vercel](https://vercel.com/) - Deployment platform

## 📞 Support

For issues and questions:
- Check the [documentation](./PWA_SEO_GUIDE.md)
- Open an issue on GitHub
- Review the troubleshooting section in guides

---

**Built with ❤️ for Kenyan Investment Groups**
