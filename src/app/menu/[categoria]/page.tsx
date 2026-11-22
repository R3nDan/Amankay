import { notFound } from "next/navigation";
import { CategoryContent } from "@/components/category-content";
import { categories } from "@/data/bakery";

export const dynamicParams = false;
export function generateStaticParams() {
  return categories.map(category => ({ categoria: category.slug }));
}

export default async function CategoryPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params;
  const category = categories.find(item => item.slug === categoria);
  if (!category) notFound();
  return <CategoryContent slug={category.slug} />;
}
