import Link from 'next/link';
import React from 'react';

interface CategoryProps {
  category: {
    id: number;
    name: string;
    slug: string;
  };
}

const Category: React.FC<CategoryProps> = ({ category }) => {
  return (
    <Link href={`/category/${category.slug}`}>
      {category.name}
    </Link>
  );
};

export default Category;