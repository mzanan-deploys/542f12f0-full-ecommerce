'use client';

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from "@/components/ui/card";
import { AdminPageTitle } from '@/components/admin/layout/AdminPageTitle/AdminPageTitle';
import CategoriesTable from '@/components/admin/categories/CategoriesTable/CategoriesTable';
import CategoryForm from '@/components/admin/categories/CategoryForm/CategoryForm';
import { fetchCategoriesAction } from '@/lib/actions/categoryActions';
import type { ProductCategoryRow } from '@/types/category';

interface CategoriesClientPageProps {
  initialCategories: ProductCategoryRow[];
}

export default function CategoriesClientPage({ initialCategories }: CategoriesClientPageProps) {
  const [categories, setCategories] = useState<ProductCategoryRow[]>(initialCategories);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ProductCategoryRow | null>(null);
  const queryClient = useQueryClient();

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const result = await fetchCategoriesAction();
      if (result.data) {
        setCategories(result.data);
        queryClient.invalidateQueries({ queryKey: ['categories'] });
      } else {
        toast.error(result.error || 'Failed to fetch categories');
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleEdit = (category: ProductCategoryRow) => {
    setEditingCategory(category);
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingCategory(null);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingCategory(null);
  };

  const handleCategoryUpdated = () => {
    fetchCategories();
    handleDialogClose();
  };

  const handleCategoryDeleted = (categoryId: string) => {
    setCategories(prev => prev.filter(cat => cat.id !== categoryId));
  };

  return (
    <>
      <AdminPageTitle 
        title="Categories"
        description="Manage your product categories."
      >
        <Button onClick={handleAdd} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </AdminPageTitle>

      <Card>
        <CardContent className="pt-0">
        <CategoriesTable
          categories={categories}
          onEdit={handleEdit}
          onDeleted={handleCategoryDeleted}
          isLoading={isLoading}
            refreshData={fetchCategories}
        />
        </CardContent>
      </Card>

      <CategoryForm
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        category={editingCategory}
        onSuccess={handleCategoryUpdated}
      />
    </>
  );
} 