export { createSetAction } from './createSetAction';

export { updateSetAction } from './updateSetAction';

export { deleteSetAction } from './deleteSetAction';

export { 
    addProductToSet, 
    getSetsForSelection, 
    updateSet 
} from './setProductActions';

export {
    getPublicSetsList,
    getAdminSetsList,
    getAdminSetById,
    getSetPageBySlug,
    getProductsInSetAction,
    getAvailableProductsForSetAction,
    getSetsByIdsAction
} from '@/lib/queries/setQueries.server';

export type {
    SetRow,
    ProductRow,
    ProductWithPosition,
    ActionResponse,
    SelectOption,
    PublicSetListItem,
    AdminSetListItem,
    ProductWithThumbnail,
    SetPageProduct,
    SetPageData,
    SetPageResult,
    AdminSetsListResult,
    AvailableProductsResult,
    SetImageRow,
    UploadedSetImageInfo,
    PublicSetsListResult,
    AdminSetsListParams,
    AvailableProductsParams,
    UpdateSetParams
} from '@/types/setActions'; 