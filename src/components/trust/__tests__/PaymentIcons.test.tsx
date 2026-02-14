import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  StripeBadge,
  VisaLogo,
  MastercardLogo,
  AmexLogo,
  SecureLockIcon,
  ShieldCheckIcon,
  BookIcon,
  ChevronDownIcon,
  QuoteIcon,
} from '@/components/icons/PaymentIcons';

describe('PaymentIcons', () => {
  describe('StripeBadge', () => {
    it('renders with proper aria-label', () => {
      render(<StripeBadge />);

      const badge = screen.getByRole('img', { name: /Powered by Stripe/i });
      expect(badge).toBeInTheDocument();
    });

    it('has title element for accessibility', () => {
      render(<StripeBadge />);

      expect(screen.getByTitle(/Powered by Stripe/i)).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<StripeBadge className="custom-stripe" />);

      const svg = document.querySelector('.custom-stripe');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('VisaLogo', () => {
    it('renders with proper aria-label', () => {
      render(<VisaLogo />);

      const logo = screen.getByRole('img', { name: /Visa accepted/i });
      expect(logo).toBeInTheDocument();
    });

    it('has title element', () => {
      render(<VisaLogo />);

      expect(screen.getByTitle('Visa')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<VisaLogo className="custom-visa" />);

      const svg = document.querySelector('.custom-visa');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('MastercardLogo', () => {
    it('renders with proper aria-label', () => {
      render(<MastercardLogo />);

      const logo = screen.getByRole('img', { name: /Mastercard accepted/i });
      expect(logo).toBeInTheDocument();
    });

    it('has title element', () => {
      render(<MastercardLogo />);

      expect(screen.getByTitle('Mastercard')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<MastercardLogo className="custom-mc" />);

      const svg = document.querySelector('.custom-mc');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('AmexLogo', () => {
    it('renders with proper aria-label', () => {
      render(<AmexLogo />);

      const logo = screen.getByRole('img', { name: /American Express accepted/i });
      expect(logo).toBeInTheDocument();
    });

    it('has title element', () => {
      render(<AmexLogo />);

      expect(screen.getByTitle('American Express')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<AmexLogo className="custom-amex" />);

      const svg = document.querySelector('.custom-amex');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('SecureLockIcon', () => {
    it('renders with proper aria-label', () => {
      render(<SecureLockIcon />);

      const icon = screen.getByRole('img', { name: /Secure checkout/i });
      expect(icon).toBeInTheDocument();
    });

    it('has title element', () => {
      render(<SecureLockIcon />);

      expect(screen.getByTitle('Secure')).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<SecureLockIcon className="custom-lock" />);

      const svg = document.querySelector('.custom-lock');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('ShieldCheckIcon', () => {
    it('renders as decorative (aria-hidden)', () => {
      render(<ShieldCheckIcon />);

      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ShieldCheckIcon className="custom-shield" />);

      const svg = document.querySelector('.custom-shield');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('BookIcon', () => {
    it('renders as decorative (aria-hidden)', () => {
      render(<BookIcon />);

      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<BookIcon className="custom-book" />);

      const svg = document.querySelector('.custom-book');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('ChevronDownIcon', () => {
    it('renders as decorative (aria-hidden)', () => {
      render(<ChevronDownIcon />);

      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<ChevronDownIcon className="custom-chevron" />);

      const svg = document.querySelector('.custom-chevron');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('QuoteIcon', () => {
    it('renders as decorative (aria-hidden)', () => {
      render(<QuoteIcon />);

      const svg = document.querySelector('svg[aria-hidden="true"]');
      expect(svg).toBeInTheDocument();
    });

    it('applies custom className', () => {
      render(<QuoteIcon className="custom-quote" />);

      const svg = document.querySelector('.custom-quote');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('All icons', () => {
    it('all payment/security icons use role="img"', () => {
      render(
        <>
          <StripeBadge />
          <VisaLogo />
          <MastercardLogo />
          <AmexLogo />
          <SecureLockIcon />
        </>
      );

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(5);
    });

    it('all decorative icons use aria-hidden', () => {
      render(
        <>
          <ShieldCheckIcon />
          <BookIcon />
          <ChevronDownIcon />
          <QuoteIcon />
        </>
      );

      const hiddenSvgs = document.querySelectorAll('svg[aria-hidden="true"]');
      expect(hiddenSvgs).toHaveLength(4);
    });
  });
});
