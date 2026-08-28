/**
 * Deduplicates an array of items by a specific field
 * Keeps the first occurrence, discards duplicates
 * @param {Array} items - Array of items to deduplicate
 * @param {String} identifierField - Field name to check for duplicates (default: 'email')
 * @returns {Array} Deduplicated array
 */
export const deduplicateByField = (items = [], identifierField = 'email') => {
  if (!Array.isArray(items)) return [];
  
  const seen = new Set();
  return items.filter(item => {
    const identifier = item?.[identifierField];
    if (!identifier) return true;
    
    if (seen.has(identifier)) {
      return false;
    }
    seen.add(identifier);
    return true;
  });
};

/**
 * Deduplicates an array of items by email
 * Convenient alias for common use case
 * @param {Array} items - Array of items to deduplicate
 * @returns {Array} Deduplicated array
 */
export const deduplicateByEmail = (items = []) => {
  return deduplicateByField(items, 'email');
};
