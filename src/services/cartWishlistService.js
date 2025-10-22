import { supabase } from '../lib/supabase';

class CartWishlistService {
  constructor() {
    this.baseUrl = '/api/cart-wishlist';
  }

  // Get authentication headers
  async getAuthHeaders() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) {
      throw new Error('No authentication token found');
    }
    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json'
    };
  }

  // =====================================================
  // CART OPERATIONS
  // =====================================================

  async getCart() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/cart`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch cart: ${response.statusText}`);
      }

      const cartItems = await response.json();
      
      // Handle case where services might be null or undefined
      return cartItems.map(item => {
        if (!item.services) {
          console.warn('Cart item missing services data:', item);
          return null;
        }
        
        return {
          ...item.services,
          cartItemId: item.id,
          quantity: item.quantity,
          addedAt: item.added_at,
          category_name: item.services?.service_categories?.name || 'Uncategorized',
          category: item.services?.service_categories?.name || 'Uncategorized',
          category_id: item.services?.category_id || item.services?.service_categories?.id
        };
      }).filter(item => item !== null); // Remove null items
    } catch (error) {
      console.error('Error fetching cart:', error);
      throw error;
    }
  }

  async addToCart(serviceId, quantity = 1) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/cart/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ service_id: serviceId, quantity })
      });

      if (!response.ok) {
        throw new Error(`Failed to add to cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to cart:', error);
      throw error;
    }
  }

  async updateCartItemQuantity(itemId, quantity) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/cart/update/${itemId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ quantity })
      });

      if (!response.ok) {
        throw new Error(`Failed to update cart item: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeFromCart(itemId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/cart/remove/${itemId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from cart:', error);
      throw error;
    }
  }

  async clearCart() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/cart/clear`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cart: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing cart:', error);
      throw error;
    }
  }

  // =====================================================
  // WISHLIST OPERATIONS
  // =====================================================

  async getWishlist() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/wishlist`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch wishlist: ${response.statusText}`);
      }

      const wishlistItems = await response.json();
      
      // Handle case where services might be null or undefined
      return wishlistItems.map(item => {
        if (!item.services) {
          console.warn('Wishlist item missing services data:', item);
          return null;
        }
        
        return {
          ...item.services,
          wishlistItemId: item.id,
          addedAt: item.added_at,
          category_name: item.services?.service_categories?.name || 'Uncategorized',
          category: item.services?.service_categories?.name || 'Uncategorized'
        };
      }).filter(item => item !== null); // Remove null items
    } catch (error) {
      console.error('Error fetching wishlist:', error);
      throw error;
    }
  }

  async addToWishlist(serviceId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/wishlist/add`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ service_id: serviceId })
      });

      if (!response.ok) {
        throw new Error(`Failed to add to wishlist: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      throw error;
    }
  }

  async removeFromWishlist(itemId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/wishlist/remove/${itemId}`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to remove from wishlist: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      throw error;
    }
  }

  async toggleWishlist(serviceId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/wishlist/toggle`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ service_id: serviceId })
      });

      if (!response.ok) {
        throw new Error(`Failed to toggle wishlist: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      throw error;
    }
  }

  async clearWishlist() {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/wishlist/clear`, {
        method: 'DELETE',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to clear wishlist: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error clearing wishlist:', error);
      throw error;
    }
  }

  // =====================================================
  // UTILITY OPERATIONS
  // =====================================================

  async checkServiceStatus(serviceId) {
    try {
      const headers = await this.getAuthHeaders();
      const response = await fetch(`${this.baseUrl}/check-status/${serviceId}`, {
        method: 'GET',
        headers
      });

      if (!response.ok) {
        throw new Error(`Failed to check service status: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error checking service status:', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const cartWishlistService = new CartWishlistService();
export default cartWishlistService;
