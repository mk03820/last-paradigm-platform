/**
 * Testimonial data types and static content
 * Structured for easy CMS migration in future
 */

/**
 * Testimonial interface for social proof elements
 * CMS-ready structure with optional fields
 */
export interface Testimonial {
  /** Unique identifier for the testimonial */
  id: string;
  /** The testimonial quote text */
  quote: string;
  /** Author information */
  author: {
    /** Full name of the testimonial author */
    name: string;
    /** Job title or role */
    title: string;
    /** Company name (optional) */
    company?: string;
    /** URL to author's avatar image (optional) */
    avatarUrl?: string;
  };
  /** Whether this testimonial should be featured prominently */
  featured?: boolean;
  /** ISO date string when testimonial was added */
  createdAt?: string;
}

/**
 * Static testimonials for MVP launch
 * Structured to match CMS output for seamless future migration
 */
export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-1',
    quote:
      "The diagnostic tools helped us identify $2.3M in hidden alignment costs. The Playbook 2 templates gave us a clear path to address them.",
    author: {
      name: 'Sarah Chen',
      title: 'VP of Operations',
      company: 'TechScale Inc.',
    },
    featured: true,
    createdAt: '2024-01-15T00:00:00.000Z',
  },
  {
    id: 'testimonial-2',
    quote:
      "Finally, a methodology that quantifies what we've always felt but couldn't prove. Worth every penny.",
    author: {
      name: 'Michael Torres',
      title: 'Chief of Staff',
    },
    featured: false,
    createdAt: '2024-02-01T00:00:00.000Z',
  },
  {
    id: 'testimonial-3',
    quote:
      'We reduced meeting overhead by 40% in the first quarter. The ROI was immediate and measurable.',
    author: {
      name: 'Jennifer Walsh',
      title: 'Director of Strategy',
      company: 'Meridian Partners',
    },
    featured: false,
    createdAt: '2024-02-20T00:00:00.000Z',
  },
];

/**
 * Get the featured testimonial for prominent display
 */
export function getFeaturedTestimonial(): Testimonial | undefined {
  return testimonials.find((t) => t.featured);
}

/**
 * Get all testimonials sorted by creation date (newest first)
 */
export function getAllTestimonials(): Testimonial[] {
  return [...testimonials].sort((a, b) => {
    if (!a.createdAt || !b.createdAt) return 0;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
}
