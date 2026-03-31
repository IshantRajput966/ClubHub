// pagination.ts

/**
 * paginate - Utility function to paginate an array.
 * @param array - The array to paginate.
 * @param page - The page number (1-based).
 * @param limit - The number of items per page.
 * @returns A slice of the array representing the requested page.
 */
const paginate = (array: any[], page: number, limit: number): any[] => {
    const startIndex = (page - 1) * limit;
    return array.slice(startIndex, startIndex + limit);
};

export { paginate };