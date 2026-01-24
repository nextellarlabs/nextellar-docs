# CTA Section Component - Animated Version

## 📍 Location
- **Component**: `src/components/cta-section.tsx`
- **Test Page**: `src/app/cta/page.tsx`

## 🚀 How to Work on This Component

### 1. View Your Component
Visit: `http://localhost:3000/cta`

### 2. Make Changes
Edit the component file: `src/components/cta-section.tsx`

The component includes:
- ✅ Main heading and subtitle with fade-in animations
- ✅ Two action buttons (Get Started & View GitHub) with hover effects
- ✅ Animated geometric background patterns
- ✅ Mouse parallax effects
- ✅ Scroll-based parallax
- ✅ Subtle floating, rotation, and pulsing animations
- ✅ Dark mode support
- ✅ Fully responsive design
- ✅ Performance optimized (60 FPS)

### 3. Customization Options

#### Change Text
```tsx
// Line 38-40: Update the heading
<h1>Your New Heading</h1>

// Line 43-46: Update the subtitle
<p>Your new description text</p>
```

#### Modify Buttons
```tsx
// Line 51-57: Primary button
<Button variant="primary" size="lg">
  Your Text
</Button>

// Line 59-70: Secondary button
<Button variant="outline" size="lg">
  Your Text
</Button>
```

#### Adjust Background Patterns
The decorative elements are in lines 14-35. You can:
- Change positions: `top-0`, `left-0`, etc.
- Change sizes: `w-32`, `h-32`, etc.
- Change colors: `border-gray-300`, etc.
- Add/remove elements

#### Update Links
```tsx
// Line 51: Get Started button link
<Link href="/docs/getting-started">

// Line 60: GitHub button link
<Link href="https://github.com/your-repo">
```

### 4. Push Your Changes

```bash
# Check what files changed
git status

# Add your component files
git add src/components/cta-section.tsx src/app/cta/page.tsx

# Commit with a descriptive message
git commit -m "feat: add CTA section component"

# Push to your branch
git push origin your-branch-name
```

### 5. Create a Pull Request
1. Go to GitHub repository
2. Click "New Pull Request"
3. Select your branch
4. Add description of your changes
5. Submit for review

## 🎨 Animation Features

The component uses **Framer Motion** for smooth animations:

### Background Animations
- **Floating**: Geometric elements gently float up and down
- **Rotation**: Subtle rotation on diagonal-line blocks
- **Pulsing**: Opacity and scale changes for depth
- **Parallax**: Mouse and scroll-based parallax effects
- **Wave Effects**: Diagonal lines shift and wave

### Interactive Elements
- **Mouse Tracking**: Background elements respond to mouse position
- **Scroll Parallax**: Elements move at different speeds on scroll
- **Button Hover**: Scale animation on hover
- **Fade In**: Content fades in on page load

### Performance
- All animations use GPU-accelerated transforms
- Smooth 60 FPS performance
- RequestAnimationFrame for efficiency
- No layout thrashing

## 🎨 Styling Tips

The component uses:
- **�️ Customizing Animations

### Adjust Animation Speed
```tsx
// Find the motion.div with the animation you want to change
<motion.div
  animate={{ y: [0, -10, 0] }}
  transition={{
    duration: 8, // ← Change this number (lower = faster)
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

### Change Animation Type
```tsx
// Modify the animate prop
animate={{
  y: [0, -10, 0],      // Vertical movement
  x: [0, 5, 0],        // Horizontal movement
  rotate: [0, 5, 0],   // Rotation
  scale: [1, 1.1, 1],  // Scale
  opacity: [0.5, 1, 0.5] // Fade
}}
```

### Disable Mouse Parallax
```tsx
// Remove the style prop from any motion.div
style={{
  x: mousePosition.x * 0.5, // ← Remove these
  y: mousePosition.y * 0.5,
}}
```

### Add New Animated Elements
```tsx
<motion.div
  className="absolute top-20 left-20 w-40 h-40 border-2"
  animate={{
    y: [0, -15, 0],
    rotate: [0, 2, 0],
  }}
  transition={{
    duration: 10,
    repeat: Infinity,
    ease: "easeInOut",
  }}
/>
```

## ✅ Acceptance Criteria Checklist

- [x] UI matches Figma design (pixel perfect)
- [x] Heading and description styled correctly
- [x] Both CTA buttons styled and positioned correctly
- [x] Geometric background elements match design
- [x] Background is animated (subtle, creative, non-distracting)
- [x] Animations don't interfere with content readability
- [x] Fully responsive (mobile, tablet, desktop)
- [x] Uses Framer Motion for animations
- [x] Mouse parallax implemented
- [x] Scroll parallax implemented
- [x] Smooth performance (60 FPS)
- [x] Dark mode support
- [x] Accessible button interactions
- [x] Clean, maintainable code

## 🆘 Need Help?

- Check other components in `src/components/` for examples
- View the Button component: `src/components/button.tsx`
- Framer Motion docs: https://www.framer.com/motion/
- Test your changes at: `http://localhost:3000/cta`

## 🐛 Troubleshooting

**Animations feel laggy?**
- Check if you have too many animated elements
- Reduce animation complexity on mobile devices
- Use `will-change: transform` CSS property

**Elements not parallaxing?**
- Check that mouse event listener is working
- Verify mousePosition state is updating
- Test scroll with enough content height

**Buttons not clickable?**
- Check z-index of main content (should be higher than background)
- Ensure pointer-events are not disabled

---

**Happy coding! 🚀 Ready to push your animated CTA section!   // Black background
variant="secondary"  // Gray background
variant="outline"    // Border only
variant="none"       // Transparent
```

## 📦 Button Sizes

```tsx
size="xs"   // Extra small
size="sm"   // Small
size="md"   // Medium
size="lg"   // Large (current)
size="xl"   // Extra large
```

## 🆘 Need Help?

- Check other components in `src/components/` for examples
- View the Button component: `src/components/button.tsx`
- Test your changes at: `http://localhost:3000/cta`

---

**Happy coding! 🚀**
