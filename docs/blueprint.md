# **App Name**: Tech Oblivion Client

## Core Features:

- Responsive Layout: Mobile-First Responsive Layout using CSS Flexbox/Grid.
- Navbar Component: Mobile-optimized Navbar: hamburger menu on mobile, horizontal navbar on larger screens.
- Feed Component: Feed Component with Angular CDK Virtual Scrolling for efficient rendering of posts.
- Optimized images: Image optimization using srcset and loading=lazy attribute to load the most efficient version of the image depending on device
- CI/CD Pipeline: Configurable GitHub Actions CI/CD pipeline for linting, testing, and deployment to a self-hosted server.
- Theme Toggle Button: Button for switching between light and dark modes.

## Style Guidelines:

- Primary color: #468189. A desaturated blue-green, suggesting technology, objectivity, and knowledge.
- Background color: #F4F4F4. A light gray for a clean and modern backdrop.
- Accent color: #FCA311. A vibrant orange used for highlights, interactive elements, and calls to action to draw the user's attention.
- Font: 'Inter', a sans-serif font, is recommended for both headers and body text. Note: currently only Google Fonts are supported.
- Mobile-first design with a single-column layout on mobile, expanding to multi-column on larger screens. Single-column layout by default to provide information clearly on mobile
- Use skeleton loaders while data is loading. Improve performance perception by use of skeleton loaders for visual feedback while content loads
- Subtle loading animations for smooth transitions.