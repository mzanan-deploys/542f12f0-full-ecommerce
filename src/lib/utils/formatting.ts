/**
 * Formats a number as a US dollar currency string.
 * Returns '-' if the amount is null or undefined.
 * 
 * @param amount The number to format.
 * @returns The formatted currency string (e.g., "$99.99") or '-'.
 */
export const formatCurrency = (amount: number | null | undefined): string => {
    if (amount == null) return '-';
    const numericAmount = Number(amount);
    if (isNaN(numericAmount)) return 'Invalid Number'; 
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numericAmount);
};

/**
 * Formats a date string or Date object into a US locale date string (MM/DD/YYYY).
 * Returns '-' if the date string is null, undefined, or empty.
 * Returns 'Invalid Date' if the string cannot be parsed.
 * 
 * @param dateInput The date string or Date object to format.
 * @returns The formatted date string or '-' or 'Invalid Date'.
 */
export const formatDate = (dateInput: string | Date | null | undefined): string => {
    if (!dateInput) return '-';
    try {
        const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
        if (isNaN(date.getTime())) {
            return 'Invalid Date';
        }
        return new Intl.DateTimeFormat('en-US', { 
            year: 'numeric', 
            month: 'numeric', 
            day: 'numeric' 
        }).format(date);
    } catch (error) {
        console.error("Error formatting date:", error);
        return 'Invalid Date';
    }
};

export function formatPrice(price: number | string | null | undefined): string {
    const numericPrice = Number(price);
    if (isNaN(numericPrice) || price === null || price === undefined) {
        return '-'; 
    }

    return new Intl.NumberFormat('en-US', { 
        style: 'currency',
        currency: 'USD', 
        minimumFractionDigits: 2,
    }).format(numericPrice);
}

