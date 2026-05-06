# Changelog

## [1.1.0] - 2026-05-06

### Performance & Stability Audit
- **Lazy Loading**: Implemented route-based code splitting for Admin and Collections pages, reducing initial JS payload by 90KB.
- **Image Optimization**: Hardened Supabase image delivery and Cloudinary video transcoding (1.5Mbps cap).
- **Admin Console Fixes**: 
    - Resolved critical state errors (`session`, `userRole`, `authChecking`).
    - Fixed "white screen" crash caused by missing imports.
    - Improved mobile rendering and navigation for admin tasks.
    - Added comprehensive error toasts for all database operations.
- **Animation Optimization**: Migrated WhatsApp pulse animation to hardware-accelerated `transform` and `opacity` properties.
- **Documentation**: Added `ARCHITECTURE.md`, `SUPABASE_SETUP.md`, and `CONTRIBUTING.md`.

## [1.0.0] - 2026-05-06

### Added
- Full product catalog with image and video support
- WhatsApp ordering integration
- Admin dashboard with role-based access (Owner / Admin)
- Product management — add, edit, delete, toggle visibility, stock, new arrival, bestseller
- Review management — verify, feature as testimonial, hide, delete
- Team management — invite admins, restrict, remove
- Activity log with admin filtering
- Cloudinary video upload (mobile compatible)
- Supabase storage for product images
- SEO optimizations — meta tags, Schema.org, sitemap, robots.txt
- Fully responsive design for all screen sizes
- Google Fonts integration
- PageSpeed optimizations — lazy loading, image compression, preconnect hints
