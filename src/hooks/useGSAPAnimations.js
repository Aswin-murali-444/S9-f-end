import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TextPlugin } from 'gsap/TextPlugin';

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger, TextPlugin);

export const useGSAPAnimations = () => {
  const elementRef = useRef(null);

  // Text reveal animation
  const animateTextReveal = (text, duration = 2) => {
    return gsap.timeline()
      .from(text, {
        duration,
        text: "",
        ease: "power2.out",
        stagger: 0.1
      });
  };

  // Stagger animation for multiple elements
  const staggerAnimation = (elements, animationProps = {}) => {
    const defaults = {
      y: 50,
      opacity: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "power2.out"
    };

    return gsap.fromTo(elements, 
      { y: defaults.y, opacity: defaults.opacity },
      { ...defaults, ...animationProps }
    );
  };

  // Parallax effect
  const createParallax = (element, speed = 0.5) => {
    gsap.to(element, {
      yPercent: -50 * speed,
      ease: "none",
      scrollTrigger: {
        trigger: element,
        start: "top bottom",
        end: "bottom top",
        scrub: true
      }
    });
  };

  // Floating animation
  const createFloat = (element, amplitude = 20, duration = 2) => {
    gsap.to(element, {
      y: amplitude,
      duration,
      ease: "power1.inOut",
      yoyo: true,
      repeat: -1
    });
  };

  // Morphing background
  const createMorphingBackground = (element, colors = ['#4f9cf9', '#6366f1', '#8b5cf6']) => {
    const tl = gsap.timeline({ repeat: -1, yoyo: true });
    
    colors.forEach((color, index) => {
      tl.to(element, {
        backgroundColor: color,
        duration: 2,
        ease: "power2.inOut"
      }, index * 2);
    });

    return tl;
  };

  // Magnetic effect
  const createMagneticEffect = (element, strength = 0.3) => {
    const handleMouseMove = (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      
      gsap.to(element, {
        x: x * strength,
        y: y * strength,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        x: 0,
        y: 0,
        duration: 0.5,
        ease: "power2.out"
      });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  // Scroll-triggered animations
  const createScrollAnimation = (element, animationProps = {}) => {
    const defaults = {
      y: 100,
      opacity: 0,
      duration: 1,
      ease: "power2.out"
    };

    return ScrollTrigger.create({
      trigger: element,
      start: "top 80%",
      animation: gsap.fromTo(element, 
        { y: defaults.y, opacity: defaults.opacity },
        { ...defaults, ...animationProps }
      )
    });
  };

  // Loading animation
  const createLoadingAnimation = (element, duration = 2) => {
    return gsap.timeline()
      .from(element, {
        scale: 0,
        rotation: 180,
        opacity: 0,
        duration: duration * 0.5,
        ease: "back.out(1.7)"
      })
      .to(element, {
        scale: 1.1,
        duration: duration * 0.2,
        ease: "power2.out"
      })
      .to(element, {
        scale: 1,
        duration: duration * 0.3,
        ease: "power2.out"
      });
  };

  // Hover animations
  const createHoverAnimation = (element, scale = 1.05, duration = 0.3) => {
    const handleMouseEnter = () => {
      gsap.to(element, {
        scale,
        duration,
        ease: "power2.out"
      });
    };

    const handleMouseLeave = () => {
      gsap.to(element, {
        scale: 1,
        duration,
        ease: "power2.out"
      });
    };

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  };

  // Page transition
  const createPageTransition = (element, direction = 'left') => {
    const directions = {
      left: { x: -100, y: 0 },
      right: { x: 100, y: 0 },
      up: { x: 0, y: -100 },
      down: { x: 0, y: 100 }
    };

    const { x, y } = directions[direction] || directions.left;

    return gsap.timeline()
      .from(element, {
        x,
        y,
        opacity: 0,
        duration: 0.8,
        ease: "power2.out"
      });
  };

  // Cleanup function
  const cleanup = () => {
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };

  return {
    animateTextReveal,
    staggerAnimation,
    createParallax,
    createFloat,
    createMorphingBackground,
    createMagneticEffect,
    createScrollAnimation,
    createLoadingAnimation,
    createHoverAnimation,
    createPageTransition,
    cleanup
  };
};
