"use client";
import { useEffect } from 'react';

export default function GlobalError({ error }: { error: Error & { digest?: string } }) {
  useEffect(() => {
    console.error('[GlobalError]', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <html>
      <body>
        <h2>Something went wrong.</h2>
        <p>Digest: {error.digest || 'n/a'}</p>
      </body>
    </html>
  );
}
