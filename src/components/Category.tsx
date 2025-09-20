import Link from 'next/link';
import React from 'react';

import { decodeEntities } from '@/lib/entities';

interface CategoryProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

const Category: React.FC<CategoryProps> = ({ category }) => {
  const name = decodeEntities(category.name || '');
  return (
    <Link href={`/category/${category.slug}`}>
      {name}
    </Link>
  );
};

export default Category;