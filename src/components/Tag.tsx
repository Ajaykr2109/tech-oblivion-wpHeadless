import Link from 'next/link';

interface TagProps {
  tag: {
    id: number;
    name: string;
    slug: string;
  };
}

const Tag: React.FC<TagProps> = ({ tag }) => {
  return (
    <Link href={`/tags/${tag.slug}`}>
      {tag.name}
    </Link>
  );
};

export default Tag;