// Ensure global CSS is imported from the root layout so Next.js includes styles in production
import '../src/app/globals.css'
export { default, generateMetadata } from '../src/app/layout'
