import type { StaticSectionItem, SortableListItem, SortableSetItem, SortablePageItem } from '@/types/db';

export function isStaticSection(item: SortableListItem): item is StaticSectionItem {
    return 'item_type' in item && item.item_type === 'static';
}

export function isPageComponent(item: SortableListItem): item is SortablePageItem {
    return 'item_type' in item && item.item_type === 'page_component';
}

export function isSetItem(item: SortableListItem): item is SortableSetItem {
    return 'item_type' in item && item.item_type === 'set';
}
