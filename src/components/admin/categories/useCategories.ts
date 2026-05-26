import { fetchCategoriesAction } from '@/lib/actions/categoryActions';

export async function fetchCategoriesData() {
  const { data: initialCategories, error } = await fetchCategoriesAction();

  if (error) {
    console.error("Error fetching categories:", error);
    throw new Error('Error loading categories. Please try again.');
  }

  return initialCategories || [];
} 