# Amma ❤️ - Healthcare Platform Landing Page

A professional, minimalist landing page for an AI-powered healthcare platform with pink/purple gradient accents. Designed with clean aesthetics and comprehensive sections for maximum conversion.

## Features

- 🎨 **Minimalist Design** - Clean, professional layout with generous whitespace
- 💜 **Gradient Accents** - Strategic pink/purple highlights throughout
- 📱 **Fully Responsive** - Works perfectly on all devices
- 📋 **Demo Booking Form** - 3-field form to capture leads (Name, Email, Organization)
- 🎯 **Multiple Sections** - Complete homepage with all essential components
- ⚡ **Interactive FAQ** - Expandable accordion for common questions
- 🌟 **Professional UI** - Modern card layouts, smooth animations, hover effects

## Page Sections

1. **Navigation** - Sticky header with CTAs
2. **Hero Section** - Headline, description, stats, and demo form
3. **Problem Statement** - Highlights pain points
4. **Features Showcase** - Large feature sections with mockup visuals
5. **Testimonial** - Social proof from healthcare organizations
6. **Benefits Grid** - 4-card layout showing value proposition
7. **FAQ Section** - Interactive accordion for common questions
8. **Final CTA** - Conversion-focused call-to-action
9. **Footer** - Branding and links

## Tech Stack

- **React** - UI Framework
- **Vite** - Build tool and dev server
- **CSS3** - Custom styling with gradients and animations

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation & Running

```bash
# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Your app will be running at `http://localhost:5173`

### Deploying to GitHub Pages

This project is configured to deploy automatically to GitHub Pages:

```bash
# Build, commit, and push to GitHub Pages (one command!)
npm run deploy:pages
```

**What this does:**
1. Builds the production version of your app
2. Copies the build files to the repository root
3. Commits the changes with message "Deploy: GitHub Pages update"
4. Pushes to the `main` branch

**GitHub Pages will automatically update** within 1-2 minutes after pushing.

**Your live site:** `https://princecharming001.github.io/ammalanding/`

**Note:** Make sure you have:
- A git remote named `origin` pointing to your GitHub repo
- GitHub Pages enabled in repo settings (Settings → Pages → Source: main branch, / root folder)

## Design Features

### Color Palette
- **Primary Gradient**: Pink (#E879F9) to Purple (#A855F7)
- **Background**: Off-white (#fafafa) and white sections
- **Text**: Dark gray (#1a1a1a) and medium gray (#666)
- **Borders**: Light gray (#e5e5e5)

### Key Design Elements
- **Clean Typography** - Clear hierarchy with large, bold headings
- **Whitespace** - Generous spacing for readability
- **Card Layouts** - Elevated cards with subtle shadows
- **Gradient Highlights** - Strategic use of gradient for CTAs and accents
- **Mock Dashboards** - Visual representations of platform features
- **Smooth Animations** - Hover effects and transitions

## Customization

### Update Company Name
Find and replace "Amma" in `src/App.jsx`

### Modify Colors
Update gradient colors in `src/App.css`:
```css
background: linear-gradient(135deg, #E879F9 0%, #A855F7 100%);
```

### Add Backend Integration
The demo form submission is currently a placeholder. Add your backend API in the `handleSubmit` function in `src/App.jsx`:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault()
  
  // Add your API call here
  const response = await fetch('/api/demo-request', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData)
  })
  
  // Handle response
}
```

### Customize Content
All content is in `src/App.jsx` and can be easily modified:
- Hero headline and description
- Feature titles and descriptions
- Testimonial quotes
- FAQ questions and answers
- Stats and metrics

## Sections Breakdown

### Hero Section
- Announcement badge with pulse animation
- Large headline with gradient text
- Stats display (patients, organizations)
- Demo booking form with 3 inputs

### Features Showcase
Three large feature sections with:
- Mock dashboard visualizations
- Descriptive text
- Alternating left/right layout

### Benefits Grid
Four benefit cards highlighting:
- Better patient outcomes
- Reduced readmissions
- Provider efficiency
- Patient satisfaction

### FAQ Section
Five common questions with:
- Expandable accordion interface
- Smooth animations
- Mobile-friendly design

## Responsive Breakpoints

- **Desktop**: 1024px+
- **Tablet**: 768px - 1023px
- **Mobile**: < 768px

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Design Inspiration

This design takes inspiration from modern SaaS landing pages with a focus on:
- Clean minimalism
- Strategic use of color
- Clear value proposition
- Professional healthcare branding

## License

MIT License - Feel free to use this for your project!

## Support

For questions or issues, please open an issue on the repository.

---

Built with ❤️ for modern healthcare platforms.
