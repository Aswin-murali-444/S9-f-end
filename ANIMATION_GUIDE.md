# Animation Guide for Nexus Frontend

This guide covers all the animations and Bootstrap animations available in your project, including how to use them effectively.

## 🎨 Available Animation Classes

### Basic Animations
- `animate-fade-in` - Fade in from bottom with slight upward movement
- `animate-slide-up` - Slide up from below
- `animate-slide-down` - Slide down from above
- `animate-slide-left` - Slide in from the right
- `animate-slide-right` - Slide in from the left
- `animate-scale-in` - Scale up from 0.8 to 1
- `animate-bounce-in` - Bounce in with scale effect
- `animate-rotate-in` - Rotate in from -200deg to 0deg

### Special Effects
- `animate-pulse-glow` - Pulsing glow effect with box-shadow
- `animate-float` - Continuous floating animation
- `animate-shimmer` - Shimmer effect with gradient
- `text-reveal` - Text reveal animation
- `loading-spinner` - Rotating spinner animation

### Bootstrap Animations
- `fade-in-up` - Bootstrap fade in from bottom
- `fade-in-down` - Bootstrap fade in from top
- `spinner-border` - Bootstrap spinner with variants
- `spinner-primary`, `spinner-secondary`, etc. - Bootstrap spinner colors

### Hover Effects
- `hover-lift` - Lift element on hover with shadow
- `hover-scale` - Scale element on hover
- `hover-glow` - Add glow effect on hover
- `card-hover` - Card hover with lift and shadow
- `btn-animate` - Button with shimmer effect

### Stagger Delays
- `stagger-1` through `stagger-6` - Delays from 0.1s to 0.6s

### Animation Duration
- `animate-fast` - 0.3s duration
- `animate-normal` - 0.6s duration (default)
- `animate-slow` - 1s duration

## 🎯 Usage Examples

### Basic Element Animation
```jsx
<div className="animate-fade-in">
  This element will fade in
</div>
```

### Staggered Animations
```jsx
<div className="container">
  <div className="item animate-slide-up stagger-1">Item 1</div>
  <div className="item animate-slide-up stagger-2">Item 2</div>
  <div className="item animate-slide-up stagger-3">Item 3</div>
</div>
```

### Hover Effects
```jsx
<div className="card card-hover">
  <h3>Card Title</h3>
  <p>Card content with hover lift effect</p>
</div>
```

### Bootstrap Spinner
```jsx
<div className="spinner-border spinner-primary" role="status">
  <span className="visually-hidden">Loading...</span>
</div>
```

## 🛠️ Custom Animation Hook

The `useAnimations` hook provides programmatic control over animations:

```jsx
import { useAnimations } from '../hooks/useAnimations';

const MyComponent = () => {
  const {
    useTypingAnimation,
    useFloat,
    usePulse,
    useAnimatedInView,
    staggerAnimation
  } = useAnimations();

  // Typing animation
  const typedText = useTypingAnimation("Hello World", 100);

  // Floating animation
  const floatOffset = useFloat(10, 3);

  // Pulse animation
  const isPulsing = usePulse(2000);

  // Intersection observer with animation
  const { ref, triggerAnimation } = useAnimatedInView(0.2);

  return (
    <div>
      <h1>{typedText}</h1>
      <div style={{ transform: `translateY(${floatOffset}px)` }}>
        Floating element
      </div>
      <div className={isPulsing ? 'animate-pulse-glow' : ''}>
        Pulsing element
      </div>
    </div>
  );
};
```

## 🎨 Animation Variants

### Loading Spinner Variants
```jsx
<LoadingSpinner 
  size="large" 
  variant="success" 
  text="Processing..." 
/>
```

Available variants:
- `primary` - Blue (#646cff)
- `secondary` - Gray (#6c757d)
- `success` - Green (#198754)
- `danger` - Red (#dc3545)
- `warning` - Yellow (#ffc107)
- `info` - Cyan (#0dcaf0)

### Size Options
- `small` - 2rem
- `medium` - 3rem (default)
- `large` - 4rem

## 🎭 Advanced Animation Techniques

### Parallax Effect
```jsx
const { useParallax } = useAnimations();
const parallaxRef = useParallax(0.5);

<div ref={parallaxRef} className="parallax-element">
  This element moves with scroll
</div>
```

### Shimmer Effect
```jsx
const { useShimmer } = useAnimations();
const shimmerOffset = useShimmer(2);

<div 
  className="shimmer-element"
  style={{ 
    backgroundPosition: `${shimmerOffset}% 0` 
  }}
>
  Shimmering content
</div>
```

### Page Transitions
```jsx
const { usePageTransition } = useAnimations();
const { isTransitioning, startTransition } = usePageTransition();

const handleNavigation = () => {
  startTransition();
  // Navigate after animation starts
  setTimeout(() => navigate('/new-page'), 300);
};
```

## 🎨 CSS Custom Properties

You can customize animation timing and easing:

```css
:root {
  --animation-duration-fast: 0.3s;
  --animation-duration-normal: 0.6s;
  --animation-duration-slow: 1s;
  --animation-easing: ease-out;
}
```

## 🎯 Best Practices

### Performance
1. Use `transform` and `opacity` for smooth animations
2. Avoid animating `width`, `height`, or `margin` properties
3. Use `will-change` sparingly and only when needed

### Accessibility
1. Respect `prefers-reduced-motion` media query
2. Provide alternative content for screen readers
3. Ensure sufficient color contrast for animated elements

### User Experience
1. Keep animations under 300ms for micro-interactions
2. Use easing functions for natural movement
3. Provide visual feedback for interactive elements

## 🎨 Animation Combinations

### Hero Section Animation
```jsx
<div className="hero-section">
  <div className="hero-badge animate-bounce-in animate-pulse-glow">
    Badge
  </div>
  <h1 className="hero-title text-reveal">
    Main Title
  </h1>
  <p className="hero-description animate-fade-in">
    Description
  </p>
</div>
```

### Card Grid Animation
```jsx
<div className="cards-grid">
  {cards.map((card, index) => (
    <div 
      key={card.id}
      className={`card card-hover animate-scale-in stagger-${index + 1}`}
    >
      {card.content}
    </div>
  ))}
</div>
```

### Button Animation
```jsx
<button className="btn-primary btn-animate hover-glow">
  Click Me
</button>
```

## 🎨 Responsive Animations

Animations automatically adapt to screen size:

```css
@media (max-width: 768px) {
  .animate-float {
    animation-duration: 2s; /* Slower on mobile */
  }
  
  .stagger-1 { animation-delay: 0.05s; } /* Faster stagger */
  .stagger-2 { animation-delay: 0.1s; }
  .stagger-3 { animation-delay: 0.15s; }
}
```

## 🎨 Dark Mode Support

All animations work seamlessly with dark mode:

```css
@media (prefers-color-scheme: dark) {
  .animate-pulse-glow {
    box-shadow: 0 0 20px rgba(165, 180, 252, 0.6);
  }
  
  .animate-shimmer {
    background: linear-gradient(90deg, transparent, rgba(165, 180, 252, 0.2), transparent);
  }
}
```

## 🎨 Troubleshooting

### Animation Not Working
1. Check if the element is visible in the viewport
2. Ensure the animation class is properly applied
3. Verify no conflicting CSS is overriding the animation

### Performance Issues
1. Reduce the number of simultaneous animations
2. Use `transform` instead of layout-changing properties
3. Consider using `will-change` for complex animations

### Accessibility Issues
1. Test with screen readers
2. Ensure keyboard navigation works
3. Check color contrast ratios

## 🎨 Future Enhancements

Consider adding these animations in the future:
- Morphing animations
- 3D transforms
- SVG path animations
- Canvas-based animations
- WebGL effects

This comprehensive animation system provides a solid foundation for creating engaging, accessible, and performant user interfaces. 