import { upsertHeroContentAction } from '@/lib/actions/heroContentActions';
import type { ActionResponse } from '@/types/actions';
import type { HeroDbRow } from '@/types/hero';

export const wrappedUpsertHeroContentAction = async (
  prevState: ActionResponse<Omit<HeroDbRow, 'id'> & { id: string }> | null,
  formData: FormData
): Promise<ActionResponse<Omit<HeroDbRow, 'id'> & { id: string }>> => {
  let originalPrevState: ActionResponse<HeroDbRow> | null = null;
  if (prevState && prevState.data) {
    originalPrevState = {
      ...prevState,
      data: {
        id: parseInt(prevState.data.id, 10),
        image_url: prevState.data.image_url,
        updated_at: prevState.data.updated_at,
      } as HeroDbRow,
    };
  }

  const result = await upsertHeroContentAction(originalPrevState, formData);

  if (result.success) {
    let transformedData: (Omit<HeroDbRow, 'id'> & { id: string }) | null = null;
    if (result.data) {
      const { id, ...restOfDataFromDb } = result.data;
      transformedData = {
        ...restOfDataFromDb,
        id: String(id),
      };
    }
    const successResponse = {
      success: true,
      message: result.message || 'Hero image updated successfully!',
      data: transformedData === null ? undefined : transformedData,
      error: null 
    };
    return successResponse;
  }

  return result as unknown as ActionResponse<Omit<HeroDbRow, 'id'> & { id: string }>;
}; 