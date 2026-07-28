import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ButtonLink } from './button';

describe('ButtonLink', () => {
  it('renders an internal Next link for site-relative hrefs', () => {
    render(<ButtonLink href="/careers">Careers</ButtonLink>);
    const link = screen.getByRole('link', { name: 'Careers' });
    expect(link).toHaveAttribute('href', '/careers');
    expect(link).not.toHaveAttribute('target');
  });

  it('opens external links in a new tab with safe rel', () => {
    render(<ButtonLink href="https://example.com">External</ButtonLink>);
    const link = screen.getByRole('link', { name: 'External' });
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });
});
