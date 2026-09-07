# Company & Brand Context

**Product:** DocumentCollector
**Owner:** MBWays
**Product endorsement:** DocumentCollector - Powered by MBWays
**Source project:** `C:\Users\harsh\Downloads\MB_Ways_Website`

## Product Relationship

DocumentCollector is an MBWays-owned tool. It is not a separate company or
independent brand.

- Product name: **DocumentCollector**
- Functional descriptor: **Document Collection & Auto-PDF Generator**
- Parent company and brand: **MBWays**
- Required endorsement: **Powered by MBWays**
- The canonical MBWays logo is used across Admin and public User surfaces.
- Core MBWays ownership and logo must not be replaced by tenant-configurable
  branding.

## MBWays Identity

| Field        | Value                                                                                                                       |
| ------------ | --------------------------------------------------------------------------------------------------------------------------- |
| Company name | MBWays                                                                                                                      |
| Tagline      | Opening Pathways to Opportunities.                                                                                          |
| Journey      | Learn. Get Certified. Find a Job. Work Abroad.                                                                              |
| Company type | Career, professional development, and global opportunities consultancy                                                      |
| Description  | MBWays helps individuals build skills, enhance employability, and access suitable career opportunities in India and abroad. |

### Vision

To become a trusted global consultancy that empowers people through knowledge,
skills, career guidance and national and international opportunities.

### Mission

To provide transparent, ethical and individual career-focused consultancy
services that help people learn, get certified, find meaningful employment and
achieve long-term career growth.

### Values

Trust, Integrity, Transparency, Professionalism, Innovation, Growth, and
Customer Success.

## Contact and Social

| Field     | Value                                                               |
| --------- | ------------------------------------------------------------------- |
| Email     | `info@mbways.com`                                                   |
| Office    | Shop No. 14, Garg Plaza, Bhera Enclave, Paschim Vihar, Delhi 110087 |
| Hours     | Mon-Sat, 10:00 AM - 7:00 PM IST                                     |
| Instagram | https://www.instagram.com/mbways.official                           |
| LinkedIn  | https://www.linkedin.com/company/mb-ways/                           |

The current MBWays runtime constants do not define a business phone or WhatsApp
number. Do not hardcode the legacy number found in the MBWays README unless the
company explicitly confirms that it should be restored.

## Compliance Position

MBWays provides career consultancy only and is not a licensed Recruiting
Agency. Where overseas recruitment requires a licensed Recruiting Agent,
MBWays guides or coordinates through appropriate licensed partners.

DocumentCollector copy must not imply that the tool changes this legal
position or directly provides licensed recruitment services.

## Brand System

### Colors

| Token            | Value     | Use                                |
| ---------------- | --------- | ---------------------------------- |
| Primary          | `#FF6B00` | Primary actions, accents, and glow |
| Secondary        | `#FF8F1F` | Gradients and hover states         |
| Accent           | `#FFB347` | Highlights                         |
| Dark background  | `#090B11` | Default dark page background       |
| Dark card        | `#10131D` | Solid dark panels                  |
| Dark text        | `#FFFFFF` | Primary text on dark surfaces      |
| Dark muted text  | `#A8B0BF` | Secondary text on dark surfaces    |
| Light background | `#F3F5F9` | Light page background              |
| Light card       | `#FFFFFF` | Light solid panels                 |
| Light text       | `#0F1419` | Primary text on light surfaces     |
| Light muted text | `#5A6270` | Secondary text on light surfaces   |

Semantic capture, error, warning, and success colors remain distinct from the
orange brand palette.

### Typography

- Headings: Space Grotesk, weight 700
- Body: Inter, weight 400
- Buttons: Sora, weight 500-600

### Logo Assets

| Asset                                   | Purpose                                                     |
| --------------------------------------- | ----------------------------------------------------------- |
| `../public/brand/logo.png`              | Original transparent MBWays logo lockup                     |
| `../public/brand/logo.svg`              | Standalone theme-aware wrapper retained for non-Next.js use |
| `../public/brand/logo-neutral-mask.png` | Neutral layer used by the inline application logo           |
| `../public/brand/logo-orange-layer.png` | Orange layer used by the inline application logo            |

The application renders a unique-id inline SVG from the two PNG layers so nested
asset loading remains reliable on localhost and Vercel.
Do not rename, recolor, redraw, stretch, crop, or separate the logo elements.
Use the accessible label `MBWays - Opening Pathways to Opportunities`.

## DocumentCollector Presentation Rules

1. Shared Admin and public User shells display the MBWays logo.
2. The product name is shown as **DocumentCollector**.
3. The ownership line is shown exactly as **Powered by MBWays**.
4. Expired, locked, success, and download screens retain the same branding.
5. Generated document PDFs remain content-only by default. Do not add a logo,
   watermark, or branded cover unless a separate product requirement explicitly
   approves changing the collected-document output.

## Authoritative Sources

Company facts and assets were taken from:

- `MB_Ways_Website/src/lib/public/constants.ts`
- `MB_Ways_Website/src/data/public/values.ts`
- `MB_Ways_Website/.cursor/memory-bank/projectbrief.md`
- `MB_Ways_Website/.cursor/memory-bank/PRD.md`
- `MB_Ways_Website/.cursor/memory-bank/DESIGN_TOKENS.md`
- `MB_Ways_Website/public/brand/`

When MBWays company details change, update the MBWays website source first and
then synchronize this file and the copied brand assets.
