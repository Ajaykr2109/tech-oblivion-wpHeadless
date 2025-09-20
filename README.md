# Tech Oblivion - WordPress Headless Frontend

A modern, high-performance headless WordPress frontend built with Next.js 15, featuring advanced caching, security, and user experience optimizations.

## 🚀 Features

### Core Capabilities
- **Headless WordPress Integration** - Seamless proxy to WordPress REST API
- **Advanced Caching** - ISR with surgical cache invalidation via webhooks
- **Secure Authentication** - JWT-based sessions with HttpOnly cookies
- **Role-Based Access Control** - WordPress-compatible user roles and permissions
- **Modern UI/UX** - Responsive design with dark/light theme support
- **Performance Optimized** - Server-side rendering with intelligent prefetching

### Content Management
- **Rich Blog System** - Full WordPress post rendering with embedded media
- **SEO Optimization** - Meta tags, OpenGraph, Twitter cards, structured data
- **Media Management** - WordPress media library with Next.js image optimization
- **Author Profiles** - Comprehensive user profiles with activity tracking
- **Content Discovery** - Related posts, categories, tags, and search functionality

### Admin & Analytics
- **Unified Dashboard** - Analytics, moderation, and settings in one interface
- **Real-time Analytics** - View tracking and engagement metrics
- **User Management** - Role assignment and permission control
- **Content Moderation** - Comment management and approval workflows
- **Site Health** - System diagnostics and monitoring tools

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - App Router with Server Components
- **React 18** - Modern React with Suspense and Streaming
- **TypeScript** - Full type safety and developer experience
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible component primitives

### Backend Integration
- **WordPress REST API** - Headless CMS integration
- **API Proxy Pattern** - Secure server-side WordPress communication
- **JWT Authentication** - Session management with automatic renewal
- **CSRF Protection** - Double-submit cookie pattern for security

### Development Tools
- **Turbopack** - Lightning-fast development builds
- **Jest** - Comprehensive testing framework
- **ESLint** - Code quality and consistency
- **React Query** - Powerful data fetching and caching

## 📦 Installation & Development

### Quick Start (Development)
```bash
# Clone the repository
git clone https://github.com/Ajaykr2109/tech-oblivion-wpHeadless.git
cd tech-oblivion-wpHeadless

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Configure your WordPress API endpoint
# Edit .env.local with your WordPress site URL

# Start development server
npm run dev
```

### Production Build
```bash
# Build for production (includes automatic static asset copying)
npm run build

# Start production server
npm run start:prod
```

### Available Scripts
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production with static asset copying
- `npm run build:quick` - Build without static asset copying
- `npm run copy-static` - Copy static assets to standalone build
- `npm run start` - Start production server (local env)
- `npm run start:prod` - Start production server (production env)
- `npm run typecheck` - Run TypeScript type checking
- `npm run lint` - Run ESLint checks
- `npm run test` - Run Jest tests

## 🐧 Linux Production Deployment

For detailed Linux server deployment instructions, see [LINUX_DEPLOYMENT_GUIDE.md](./LINUX_DEPLOYMENT_GUIDE.md)

**Quick Production Setup:**
1. Setup Node.js 18+ and PM2 on your Linux server
2. Clone repository and install dependencies
3. Configure `.env.production` with your settings
4. Run `npm run build` (automatically copies static assets)
5. Start with PM2 using the provided ecosystem config
6. Configure Nginx reverse proxy and SSL

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- WordPress backend with REST API enabled

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd tech-oblivion-wpHeadless
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment configuration**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure environment variables** (see [Environment Variables](#environment-variables))

5. **Start development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3200`

## ⚙️ Environment Variables

### Required Variables
```env
# WordPress Backend
WP_URL=https://your-wordpress-site.com

# Authentication
JWT_SECRET=your-super-secret-jwt-key-64-chars-minimum
SESSION_COOKIE_NAME=session

# Caching & Revalidation
NEXT_REVALIDATE_SECRET=your-webhook-secret
WP_CACHE_TTL=300

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://your-frontend-domain.com
```

### Optional Variables
```env
# Profile API Caching
PROFILE_CACHE_SECONDS=60

# Analytics
ANALYTICS_ENABLED=true

# Development
NODE_ENV=development
```

### Generate Secure Secrets
```bash
# Generate JWT secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Generate revalidation secret
openssl rand -hex 32
```

## 🚦 Available Scripts

### Development
```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Type checking with TypeScript
```

### Testing
```bash
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
```

### WordPress Integration
```bash
npm run wp-api       # Test WordPress API connectivity
npm run check-env    # Validate environment variables
```

### Documentation & Analysis
```bash
npm run build:docs   # Generate role matrix documentation
npm run audit:rbac   # Audit role-based access control
npm run build:api-map # Generate API endpoint mapping
```

## 🏗️ Project Structure

```
├── app/                    # Next.js App Router (Production)
│   ├── api/               # API routes and WordPress proxy
│   ├── admin/             # Admin dashboard
│   ├── blog/              # Blog pages and post details
│   ├── auth/              # Authentication pages
│   └── dashboard/         # User dashboard
├── src/                   # Core source code
│   ├── components/        # Reusable UI components
│   ├── lib/              # Utilities and WordPress integration
│   ├── hooks/            # Custom React hooks
│   ├── contexts/         # React context providers
│   └── __tests__/        # Test suites
├── scripts/              # Build and maintenance scripts
├── types/               # TypeScript type definitions
└── data/               # Static configuration data
```

## 🔒 Security Model

### Authentication Flow
1. **Login** - Credentials sent to `/api/auth/login`
2. **JWT Creation** - Server creates signed JWT with user data
3. **Cookie Storage** - JWT stored in HttpOnly cookie (7 days)
4. **Route Protection** - Middleware validates sessions for protected routes
5. **Automatic Renewal** - Sessions refreshed on valid requests

### Protected Routes
- `/dashboard/*` - User dashboard and settings
- `/account/*` - Profile management
- `/admin/*` - Administrative functions (admin only)
- `/editor/*` - Content creation (contributor+ roles)

### CSRF Protection
- All state-changing operations require CSRF token
- Double-submit cookie pattern implementation
- Automatic token validation in middleware

## 📊 Caching Strategy

### Multi-Layer Caching
1. **Browser Cache** - Standard HTTP caching headers
2. **CDN Cache** - Edge caching for static assets
3. **ISR Cache** - Next.js Incremental Static Regeneration
4. **API Cache** - React Query for client-side data

### Cache Tags
- `wp:posts` - All posts listings
- `wp:post:{slug}` - Individual post pages
- `wp:page:{slug}` - Static pages
- Surgical invalidation via webhook

### Webhook Revalidation
```bash
# Revalidate specific post
curl -X POST https://your-site.com/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"slug":"post-slug"}'

# Revalidate all posts
curl -X POST https://your-site.com/api/revalidate?secret=YOUR_SECRET \
  -H "Content-Type: application/json" \
  -d '{"all":true}'
```

## 🧪 Testing

### Test Categories
- **Unit Tests** - Component and utility testing
- **Integration Tests** - API route testing
- **Permission Tests** - Role-based access validation
- **Smoke Tests** - Critical path verification

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test file
npm test -- auth.test.ts

# Watch mode for development
npm run test:watch
```

## 🚀 Deployment

### Build Process
```bash
# Production build
npm run build

# Verify build
npm run start

# Run deployment checks
npm run typecheck
npm run lint:check
npm test
```

### Environment Setup
1. **Production Secrets** - Use hosting provider's secret management
2. **WordPress Configuration** - Install revalidation webhook plugin
3. **CDN Setup** - Configure caching rules for static assets
4. **Monitoring** - Set up error tracking and performance monitoring

### Hosting Platforms
- **Vercel** - Optimized for Next.js with automatic deployments
- **Netlify** - Static site hosting with serverless functions
- **Railway** - Full-stack application hosting
- **Self-hosted** - Docker containerization support

## 📚 API Reference

### Authentication Endpoints
```bash
POST /api/auth/login      # User login
POST /api/auth/register   # User registration
POST /api/auth/logout     # User logout
GET  /api/auth/me         # Current user info
```

### WordPress Proxy Endpoints
```bash
GET  /api/wp/posts        # Blog posts listing
GET  /api/wp/posts/[slug] # Individual post
GET  /api/wp/users        # Authors listing
GET  /api/wp/users/[slug] # User profile
GET  /api/wp/media/[id]   # Media assets
```

### Admin Endpoints
```bash
GET  /api/admin/analytics # Site analytics
GET  /api/admin/users     # User management
POST /api/admin/settings  # Site configuration
```

## 🤝 Contributing

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### Code Standards
- **TypeScript** - All code must be properly typed
- **ESLint** - Follow established linting rules
- **Testing** - Maintain test coverage for new features
- **Documentation** - Update relevant documentation

### Commit Convention
```bash
feat: add new feature
fix: bug fix
docs: documentation update
test: add or update tests
refactor: code refactoring
style: formatting changes
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Documentation
- **API Documentation** - `/docs/api` (when available)
- **Component Storybook** - `/docs/components` (when available)
- **Deployment Guide** - See deployment section above

### Community
- **Issues** - Report bugs or request features via GitHub Issues
- **Discussions** - Community discussions and Q&A
- **Discord** - Join our community Discord server

### Professional Support
For enterprise support, custom development, or consulting services, please contact the development team.

---

**Built with ❤️ by the Tech Oblivion team**