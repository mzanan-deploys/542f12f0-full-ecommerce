export const clearScrollPosition = (key: string) => {
    if (typeof window !== 'undefined') {
        localStorage.removeItem(key);
    }
};

export const clearHomeScrollPosition = () => {
    clearScrollPosition('homeScrollPos');
}; 