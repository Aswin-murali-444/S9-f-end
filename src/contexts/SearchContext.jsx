import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { apiService } from '../services/api';

// Helper function to format duration
const formatDuration = (duration) => {
  if (!duration) return null;
  
  // If duration is already a string with units, return as is
  if (typeof duration === 'string' && (duration.includes('hour') || duration.includes('day') || duration.includes('minute') || duration.includes('week') || duration.includes('month'))) {
    return duration;
  }
  
  // If duration is a number, assume it's hours
  if (typeof duration === 'number') {
    if (duration < 1) {
      return `${Math.round(duration * 60)} minutes`;
    } else if (duration < 24) {
      return `${duration} ${duration === 1 ? 'hour' : 'hours'}`;
    } else if (duration < 168) { // 7 days
      const days = Math.floor(duration / 24);
      const hours = duration % 24;
      if (hours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
    } else {
      const weeks = Math.floor(duration / 168);
      const days = Math.floor((duration % 168) / 24);
      if (days === 0) {
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
      } else {
        return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ${days} ${days === 1 ? 'day' : 'days'}`;
      }
    }
  }
  
  // If duration is a string without units, try to parse it
  const numDuration = parseFloat(duration);
  if (!isNaN(numDuration)) {
    if (numDuration < 1) {
      return `${Math.round(numDuration * 60)} minutes`;
    } else if (numDuration < 24) {
      return `${numDuration} ${numDuration === 1 ? 'hour' : 'hours'}`;
    } else {
      const days = Math.floor(numDuration / 24);
      const hours = numDuration % 24;
      if (hours === 0) {
        return `${days} ${days === 1 ? 'day' : 'days'}`;
      } else {
        return `${days} ${days === 1 ? 'day' : 'days'} ${hours} ${hours === 1 ? 'hour' : 'hours'}`;
      }
    }
  }
  
  return duration.toString();
};

const SearchContext = createContext();

export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
};

export const SearchProvider = ({ children }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  const performSearch = useCallback(async (query, searchType = 'general') => {
    if (!query.trim()) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    try {
      let results = [];
      
      // Use real API calls based on searchType
      switch (searchType) {
        case 'categories':
          try {
            const categories = await apiService.getCategories();
            console.log('Fetched categories for search:', categories);
            results = Array.isArray(categories) ? categories.filter(cat => 
              cat.name && cat.name.toLowerCase().includes(query.toLowerCase()) ||
              (cat.description && cat.description.toLowerCase().includes(query.toLowerCase()))
            ) : [];
            
            // Sort categories by name alphabetically
            results.sort((a, b) => {
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            });
            
            console.log('Filtered and sorted categories:', results);
          } catch (error) {
            console.error('Error fetching categories for search:', error);
            results = [];
          }
          break;
          
        case 'services':
          try {
            const services = await apiService.getServices();
            const categories = await apiService.getCategories();
            
            // Create a map of category IDs to names for quick lookup
            const categoryMap = {};
            if (Array.isArray(categories)) {
              categories.forEach(cat => {
                if (cat.id && cat.name) {
                  categoryMap[cat.id] = cat.name;
                }
              });
            }
            
            // Debug logging to see categories and mapping
            console.log('Categories fetched:', categories);
            console.log('Category Map created:', categoryMap);
            
            results = Array.isArray(services) ? services.filter(service => 
              service.name && service.name.toLowerCase().includes(query.toLowerCase()) ||
              (service.description && service.description.toLowerCase().includes(query.toLowerCase()))
            ) : [];
            
            // Add category name and formatted duration to each service
            results = results.map(service => {
              let categoryName = 'No Category';
              
              // Try different possible category field names
              if (service.category_id && categoryMap[service.category_id]) {
                categoryName = categoryMap[service.category_id];
              } else if (service.category && typeof service.category === 'string') {
                // Check if category is already a name or if it's an ID that needs mapping
                if (categoryMap[service.category]) {
                  categoryName = categoryMap[service.category];
                } else {
                  categoryName = service.category;
                }
              } else if (service.category_name) {
                categoryName = service.category_name;
              } else if (service.categoryId && categoryMap[service.categoryId]) {
                categoryName = categoryMap[service.categoryId];
              }
              
              // Debug logging to see what's happening
              console.log('Service:', service.name, 'Category ID:', service.category_id, 'Category field:', service.category, 'Category Map:', categoryMap, 'Resolved Name:', categoryName);
              
              return {
                ...service,
                categoryName,
                formattedDuration: formatDuration(service.duration)
              };
            });
            
            // Sort services by name alphabetically
            results.sort((a, b) => {
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            });
          } catch (error) {
            console.error('Error fetching services for search:', error);
            results = [];
          }
          break;
          
        case 'users':
          try {
            const users = await apiService.getUsers();
            results = Array.isArray(users) ? users.filter(user => 
              (user.name && user.name.toLowerCase().includes(query.toLowerCase())) ||
              (user.email && user.email.toLowerCase().includes(query.toLowerCase()))
            ) : [];
            
            // Sort users by name alphabetically
            results.sort((a, b) => {
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            });
          } catch (error) {
            console.error('Error fetching users for search:', error);
            results = [];
          }
          break;
          
        default:
          // For general search, search across all types
          try {
            const [categoriesData, servicesData, usersData] = await Promise.all([
              apiService.getCategories().catch(() => []),
              apiService.getServices().catch(() => []),
              apiService.getUsers().catch(() => [])
            ]);
            
            // Create a map of category IDs to names for services
            const categoryMap = {};
            if (Array.isArray(categoriesData)) {
              categoriesData.forEach(cat => {
                if (cat.id && cat.name) {
                  categoryMap[cat.id] = cat.name;
                }
              });
            }
            
            // Debug logging for general search
            console.log('General Search - Categories fetched:', categoriesData);
            console.log('General Search - Category Map created:', categoryMap);
            
            const allResults = [
              ...(Array.isArray(categoriesData) ? categoriesData.map(item => ({ 
                ...item, 
                type: 'category',
                formattedDuration: formatDuration(item.duration)
              })) : []),
              ...(Array.isArray(servicesData) ? servicesData.map(item => {
                let categoryName = 'No Category';
                
                // Try different possible category field names
                if (item.category_id && categoryMap[item.category_id]) {
                  categoryName = categoryMap[item.category_id];
                } else if (item.category && typeof item.category === 'string') {
                  // Check if category is already a name or if it's an ID that needs mapping
                  if (categoryMap[item.category]) {
                    categoryName = categoryMap[item.category];
                  } else {
                    categoryName = item.category;
                  }
                } else if (item.category_name) {
                  categoryName = item.category_name;
                } else if (item.categoryId && categoryMap[item.categoryId]) {
                  categoryName = categoryMap[item.categoryId];
                }
                
                // Debug logging for general search
                console.log('General Search - Service:', item.name, 'Category ID:', item.category_id, 'Category field:', item.category, 'Category Map:', categoryMap, 'Resolved Name:', categoryName);
                
                return {
                  ...item, 
                  type: 'service',
                  categoryName,
                  formattedDuration: formatDuration(item.duration)
                };
              }) : []),
              ...(Array.isArray(usersData) ? usersData.map(item => ({ ...item, type: 'user' })) : [])
            ];
            
            results = allResults.filter(item => 
              (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
              (item.description && item.description.toLowerCase().includes(query.toLowerCase())) ||
              (item.email && item.email.toLowerCase().includes(query.toLowerCase()))
            );
            
            // Sort general results by type first, then by name alphabetically
            results.sort((a, b) => {
              // First sort by type: categories, services, users
              const typeOrder = { 'category': 1, 'service': 2, 'user': 3 };
              const typeA = typeOrder[a.type] || 4;
              const typeB = typeOrder[b.type] || 4;
              
              if (typeA !== typeB) {
                return typeA - typeB;
              }
              
              // Then sort by name alphabetically within each type
              const nameA = (a.name || '').toLowerCase();
              const nameB = (b.name || '').toLowerCase();
              return nameA.localeCompare(nameB);
            });
          } catch (error) {
            console.error('Error in general search:', error);
            results = [];
          }
      }
      
      console.log('Search results:', { query, searchType, results });
      setSearchResults(results);
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
    setIsSearching(false);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
  };

  const debouncedSearch = useCallback((query, searchType = 'general') => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      performSearch(query, searchType);
    }, 300); // 300ms debounce
  }, [performSearch]);

  const value = {
    searchQuery,
    setSearchQuery,
    searchResults,
    setSearchResults,
    isSearching,
    performSearch,
    debouncedSearch,
    clearSearch
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
};

