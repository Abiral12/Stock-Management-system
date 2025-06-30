// Generate unique SKU based on category, style, and size
const generateSKU = (category, size) => {
  // Extract first 3 letters of each word in category
  const catAbbr = category.split(' ')
    .map(word => word.substring(0, 3).toUpperCase())
    .join('-');
  
  // Get size abbreviation
  const sizeAbbr = size === 'Universal' ? 'UNI' : size.toUpperCase();
  
  // Add timestamp for uniqueness
  const timestamp = Date.now().toString().slice(-4);
  
  return `${catAbbr}-${sizeAbbr}-${timestamp}`;
};

module.exports = { generateSKU };