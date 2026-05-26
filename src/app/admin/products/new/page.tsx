import Link from 'next/link';
import { ProductForm } from '@/components/admin/products/ProductForm/ProductForm';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { getSetsForSelection } from '@/lib/actions/setActions';

export const dynamic = 'force-dynamic';

export default async function NewProductPage() {
  const setsResult = await getSetsForSelection();
  const availableSets = setsResult.success ? setsResult.data?.sets : [];

  if (!setsResult.success) {
    console.warn("Failed to fetch sets for product form:", setsResult.error);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-black dark:text-white">Create New Product</h1>
        <Button asChild variant="outline" size="sm">
          <Link href="/admin/products">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Products
          </Link>
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Product Details</CardTitle>
          <CardDescription>Fill in the details for the new product.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm availableSets={availableSets} />
        </CardContent>
      </Card>
    </div>
  );
}