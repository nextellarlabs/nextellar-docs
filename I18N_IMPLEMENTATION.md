# i18n Implementation for Nextellar Docs

## Overview

This document outlines the i18n (internationalization) scaffolding implemented for nextellar-docs, supporting multiple locales with routing, locale switching, and content management.

## Implementation Summary

### 1. **Locale Configuration** (`src/lib/i18n.ts`)
- **Supported Locales**: English (`en`) and Spanish (`es`)
- **Default Locale**: English (`en`)
- **Utilities**:
  - `isValidLocale()` - validates locale strings
  - `parseLocaleFromPathname()` - extracts locale from URL
  - `formatLocaleForPath()` - formats locale for URLs
  - `getFallbackLocale()` - returns fallback locale
- **UI Metadata**: Locale labels and flag emojis for switcher

### 2. **URL Routing Structure**

The implementation uses Next.js App Router with locale prefixes:

```
/{locale}                          # Home page (en, es)
/{locale}/docs                     # Docs index (redirects to first page)
/{locale}/docs/current/...         # Unversioned docs
/{locale}/docs/v{version}/...      # Versioned docs
```

**Examples**:
- `/en/docs/getting-started/introduction`
- `/es/docs/v1.0.0/cli/commands`
- `/es` (Spanish home)
- `/en` (English home, default)

### 3. **App Structure**

```
src/app/
├── layout.tsx                              # Minimal root layout
├── [locale]/
│   ├── layout.tsx                          # Main layout with styles, locale validation
│   ├── page.tsx                            # Home page (locale-aware)
│   └── docs/
│       ├── layout.tsx                      # Docs sidebar layout + LocaleSwitcher
│       ├── page.tsx                        # Docs index (redirects to intro)
│       └── [version]/[...slug]/
│           └── page.tsx                    # Content pages (with locale support)
├── not-found.tsx                           # 404 page
└── globals.css                             # Global styles (at root level)

src/middleware.ts                           # Locale detection & redirection
```

### 4. **Middleware** (`src/middleware.ts`)

- Detects locale from URL pathname
- Validates locale against `LOCALES`
- Redirects unlocalized paths to default locale (`/en`)
- Preserves valid locale-prefixed paths
- Excludes static assets (`_next`, `api`, images)

**Redirect behavior**:
- `/` → `/en/`
- `/docs` → `/en/docs`
- `/fr/docs` → `/en/docs` (invalid locale falls back)
- `/en/docs` → (preserved as-is)
- `/es/docs` → (preserved as-is)

### 5. **Locale-Aware Components**

#### Locale Switcher (`src/components/locale-switcher.tsx`)
- Dropdown menu component
- Shows current locale with flag emoji
- Allows switching between available locales
- Uses Next.js routing hooks (`useParams`, `usePathname`, `useRouter`)
- Preserves path structure when switching locales

#### Navigation (`src/components/navigation.tsx`)
- Updated to be locale-aware
- Routes include locale prefix: `/{locale}/docs`, `/{locale}/...`
- Integrated LocaleSwitcher in header (desktop & mobile)
- Maintained alongside theme toggle

### 6. **Content Organization**

**English Content** (default):
- Existing docs in `docs/**/*.mdx`
- Contentlayer treats root `docs/` as English (`en`)

**Spanish Content** (sample locale):
- Translated docs in `docs/i18n/es/**/*.mdx`
- Example: `docs/i18n/es/index.mdx` - Spanish homepage translation
- Contentlayer extracts locale from path pattern: `i18n/{locale}/`

**Contentlayer Configuration** (`contentlayer.config.ts`):
- Added `locale` computed field to `Post` document type
- Extracts locale from file path pattern `i18n/{locale}/` or defaults to `en`
- Both English and Spanish content loaded into `allDocs`

### 7. **Static Generation**

All page components generate static params for both locales:

```typescript
export const generateStaticParams = () => {
  return LOCALES.map((locale) => ({ locale }));
};
```

This ensures:
- `/en/docs/...` pages are pre-built
- `/es/docs/...` pages are pre-built
- Middleware redirects unknown locales to default

### 8. **Testing**

**Unit Tests** (`src/lib/i18n.test.ts`):
- Locale validation
- Pathname parsing
- Fallback behavior
- Edge cases (invalid locales, malformed paths)

**Integration Tests** (`src/app/routing.test.ts`):
- Locale detection from URLs
- Valid route patterns
- Static params generation
- Middleware redirect logic
- URL structure validation

### 9. **Locale Switcher UI**

Located in docs navigation header:
- Shows current locale: 🇬🇧 English / 🇪🇸 Español
- Dropdown menu with both options
- Current locale highlighted with checkmark
- Clicking an option preserves path and switches locale

**Example navigation path switch**:
- On `/en/docs/cli/commands`
- Click "Español"
- Navigate to `/es/docs/cli/commands`

### 10. **Backward Compatibility**

✅ **Preserved**:
- All existing English content at original paths still accessible
- Original docs URLs now prefixed with `/en/`
- Middleware automatically redirects to localized paths
- Default routes go to English (`en`)
- Theme switcher and all existing components unchanged

⚠️ **Breaking Changes**:
- Direct URLs must now include locale prefix: `/docs/...` → `/en/docs/...`
- Middleware handles most redirects automatically for end users
- Internal links updated to include locale

### 11. **How to Add More Locales**

To add a new locale (e.g., French `fr`):

1. **Update `src/lib/i18n.ts`**:
   ```typescript
   export type Locale = 'en' | 'es' | 'fr';
   export const LOCALES: Locale[] = ['en', 'es', 'fr'];
   export const LOCALE_LABELS: Record<Locale, string> = {
     en: 'English',
     es: 'Español',
     fr: 'Français',
   };
   export const LOCALE_FLAGS: Record<Locale, string> = {
     en: '🇬🇧',
     es: '🇪🇸',
     fr: '🇫🇷',
   };
   ```

2. **Create content directory**:
   ```
   docs/i18n/fr/
   docs/i18n/fr/index.mdx
   docs/i18n/fr/getting-started/
   ```

3. **Rebuild**: Static params will automatically generate for all locales

### 12. **Known Limitations & Future Work**

- **Content Scope**: Only landing page (`index.mdx`) is translated for Spanish. Full docs translation is a separate effort.
- **Sidebar Navigation**: Currently shows English labels; could be translated per locale in future
- **Metadata**: SEO metadata (og:title, descriptions) not yet localized
- **Search**: Search index treats all locales as one corpus; could be split per locale
- **Analytics**: No locale-specific tracking yet

### 13. **Files Created/Modified**

**New Files**:
- `src/lib/i18n.ts` - Locale configuration
- `src/middleware.ts` - Locale detection middleware
- `src/components/locale-switcher.tsx` - Locale switcher component
- `src/lib/i18n.test.ts` - Unit tests
- `src/app/routing.test.ts` - Integration tests
- `docs/i18n/es/index.mdx` - Spanish landing page
- `src/app/[locale]/layout.tsx` - Locale-scoped layout
- `src/app/[locale]/page.tsx` - Locale-scoped home page
- `src/app/[locale]/docs/layout.tsx` - Docs layout with switcher
- `src/app/[locale]/docs/page.tsx` - Docs index page
- `src/app/[locale]/docs/[version]/[...slug]/page.tsx` - Docs content
- `src/app/not-found.tsx` - 404 page

**Modified Files**:
- `src/app/layout.tsx` - Simplified to minimal wrapper
- `src/components/navigation.tsx` - Added locale awareness and switcher
- `contentlayer.config.ts` - Added locale field extraction

### 14. **Verification Checklist**

- ✅ Locale configuration in place with EN/ES support
- ✅ Middleware redirects unlocalized paths to default locale
- ✅ LocaleSwitcher component renders in docs header
- ✅ Spanish translation of landing page created
- ✅ Routing supports `/{locale}/docs/[version]/[...slug]` pattern
- ✅ Navigation updated to be locale-aware
- ✅ Static params generate for all locales
- ✅ Locale validation in layouts
- ✅ Tests cover locale utilities and routing patterns
- ✅ Existing English content preserved and accessible at `/en/...`

## Usage

### For End Users

**Navigate to Spanish docs**:
1. Visit `/en/docs/...` (English docs)
2. Click locale switcher (🇬🇧 English dropdown)
3. Select 🇪🇸 Español
4. Now viewing `/es/docs/...`

**Direct Spanish URLs**:
- Homepage: `https://docs.nextellar.dev/es`
- Docs: `https://docs.nextellar.dev/es/docs/getting-started`

### For Developers

**Add Spanish content**:
```bash
# Create Spanish docs alongside English
docs/i18n/es/getting-started/introduction.mdx
docs/i18n/es/getting-started/installation.mdx
```

**Test locale routing**:
```bash
npm run build          # Builds all locales
npm run dev            # Local development server
# Visit http://localhost:3000/en and http://localhost:3000/es
```

## References

- **Next.js i18n Routing**: https://nextjs.org/docs/app/building-your-application/routing/internationalization
- **Middleware**: https://nextjs.org/docs/app/building-your-application/routing/middleware
- **Contentlayer**: https://contentlayer.dev/
