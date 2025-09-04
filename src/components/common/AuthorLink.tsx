import Link from 'next/link';

interface AuthorLinkProps {
  name: string;
  slug: string;
  className?: string;
  children?: React.ReactNode;
}

/**
 * Reusable component for linking to author pages consistently
 * Uses /author/[slug] pattern as specified in requirements
 */
export function AuthorLink({ name, slug, className, children }: AuthorLinkProps) {
  return (
    <Link 
      href={`/author/${encodeURIComponent(slug)}`}
      className={className}
    >
      {children || name}
    </Link>
  );
}

export default AuthorLink;
