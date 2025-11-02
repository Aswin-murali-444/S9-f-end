// Utility functions for handling service pricing and offers

/**
 * Calculate offer price based on original price and percentage discount
 * @param {number} originalPrice - The original price
 * @param {number} percentage - The discount percentage (0-100)
 * @returns {number} The calculated offer price
 */
export const calculateOfferPrice = (originalPrice, percentage) => {
  if (!originalPrice || !percentage) return originalPrice;
  const discountAmount = (originalPrice * percentage) / 100;
  return Math.round(originalPrice - discountAmount);
};

/**
 * Format service pricing with offer information
 * @param {Object} service - The service object
 * @param {number} service.price - Original price
 * @param {number} service.offer_percentage - Discount percentage
 * @param {boolean} service.offer_enabled - Whether offer is enabled
 * @returns {Object} Formatted pricing information
 */
export const formatServicePricing = (service) => {
  if (!service.price) {
    return {
      hasOffer: false,
      originalPrice: null,
      offerPrice: null,
      discountPercentage: 0,
      savings: 0
    };
  }

  const originalPrice = parseFloat(service.price);
  const hasOffer = service.offer_enabled && service.offer_percentage && service.offer_percentage > 0;
  
  if (hasOffer) {
    const discountPercentage = parseFloat(service.offer_percentage);
    const offerPrice = calculateOfferPrice(originalPrice, discountPercentage);
    const savings = originalPrice - offerPrice;
    
    return {
      hasOffer: true,
      originalPrice,
      offerPrice,
      discountPercentage,
      savings
    };
  }
  
  return {
    hasOffer: false,
    originalPrice,
    offerPrice: originalPrice,
    discountPercentage: 0,
    savings: 0
  };
};

/**
 * Get display text for pricing
 * @param {Object} service - The service object
 * @returns {string} Formatted price text
 */
export const getPriceDisplayText = (service) => {
  const pricing = formatServicePricing(service);
  
  if (!pricing.originalPrice) return 'Price not set';
  
  if (pricing.hasOffer) {
    return `₹${pricing.offerPrice} (${pricing.discountPercentage}% off)`;
  }
  
  return `₹${pricing.originalPrice}`;
};

/**
 * Get savings amount for offers
 * @param {Object} service - The service object
 * @returns {number} Amount saved in rupees
 */
export const getSavingsAmount = (service) => {
  const pricing = formatServicePricing(service);
  return pricing.savings;
};
