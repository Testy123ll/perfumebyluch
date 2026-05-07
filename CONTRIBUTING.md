# Contributing to Perfumes By Luch 🌸

Thank you for contributing to the Perfumes By Luch project! This guide outlines the workflow for making updates.

## 🌿 Branching Strategy

- **`main`**: The production-ready branch. All merges to `main` are automatically deployed to `perfumesbyluch.com`.
- **Feature Branches**: Use descriptive names like `feature/performance-audit` or `fix/admin-mobile-rendering`.

## 🛠 Development Workflow

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Environment Setup**:
   Ensure you have a `.env` file with valid Supabase credentials. Refer to `.env.example`.

3. **Local Development**:
   ```bash
   npm run dev
   ```

4. **Code Quality**:
   - Follow the design system (Premium, Dark Mode, Framer Motion).
   - Use TypeScript for all new logic.
   - Ensure all `img` and `video` tags use the `getOptimisedImageUrl` utility.

## 🚀 Performance Standards

All changes must maintain or improve the site's performance:
- **JS Bundle**: Keep the initial bundle under 100KB. Use `React.lazy` for new pages.
- **Images**: Enforce WebP format and avoid loading images larger than 1200px for hero sections or 400px for products.
- **Animations**: Use composited properties (`transform`, `opacity`) for all continuous animations to avoid main-thread jank.

## 📝 Commit Messages

Use conventional commit messages:
- `feat`: A new feature
- `fix`: A bug fix
- `perf`: A performance improvement
- `docs`: Documentation changes
- `chore`: Maintenance tasks

---

*For technical support, contact the project lead.*
