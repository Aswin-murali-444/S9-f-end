// BookingModal Integration with Database
// This file shows how to integrate the BookingModal with the new bookings table

import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

// Function to create a new booking
export const createBooking = async (bookingData) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert(bookingData)
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to create booking:', error);
    throw error;
  }
};

// Function to update booking status
export const updateBookingStatus = async (bookingId, status, additionalData = {}) => {
  try {
    const updateData = {
      booking_status: status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Booking update error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw error;
  }
};

// Function to assign provider to booking
export const assignProviderToBooking = async (bookingId, providerId) => {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({
        assigned_provider_id: providerId,
        provider_assigned_at: new Date().toISOString(),
        booking_status: 'assigned',
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Provider assignment error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to assign provider:', error);
    throw error;
  }
};

// Function to get user bookings
export const getUserBookings = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('booking_details_view')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Get bookings error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get user bookings:', error);
    throw error;
  }
};

// Function to get provider bookings
export const getProviderBookings = async (providerId) => {
  try {
    const { data, error } = await supabase
      .from('booking_details_view')
      .select('*')
      .eq('assigned_provider_id', providerId)
      .order('scheduled_date', { ascending: true });

    if (error) {
      console.error('Get provider bookings error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get provider bookings:', error);
    throw error;
  }
};

// Function to add rating and feedback
export const addBookingFeedback = async (bookingId, rating, feedback, isProvider = false) => {
  try {
    const updateData = isProvider 
      ? {
          provider_rating: rating,
          provider_feedback: feedback,
          feedback_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      : {
          customer_rating: rating,
          customer_feedback: feedback,
          feedback_submitted_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select()
      .single();

    if (error) {
      console.error('Feedback submission error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to submit feedback:', error);
    throw error;
  }
};

// Updated handleBooking function for BookingModal
export const handleBookingSubmission = async (formData, userProfile, service) => {
  const {
    selectedDate,
    selectedTime,
    address,
    phone,
    notes,
    paymentMethod
  } = formData;

  try {
    // Build the complete address from user profile if available
    const addressParts = [
      address,
      userProfile?.user_profiles?.city,
      userProfile?.user_profiles?.state,
      userProfile?.user_profiles?.country,
      userProfile?.user_profiles?.postal_code
    ].filter(Boolean);

    const fullAddress = addressParts.length > 0 
      ? addressParts.join(', ')
      : address;

    const bookingData = {
      user_id: userProfile.id,
      service_id: service.id,
      category_id: service.category_id,
      scheduled_date: selectedDate,
      scheduled_time: selectedTime,
      service_address: fullAddress,
      service_city: userProfile?.user_profiles?.city || null,
      service_state: userProfile?.user_profiles?.state || null,
      service_country: userProfile?.user_profiles?.country || null,
      service_postal_code: userProfile?.user_profiles?.postal_code || null,
      service_location_latitude: userProfile?.user_profiles?.location_latitude || null,
      service_location_longitude: userProfile?.user_profiles?.location_longitude || null,
      contact_phone: phone,
      contact_email: userProfile?.email || null,
      special_instructions: notes || null,
      payment_method: paymentMethod,
      booking_status: 'pending',
      payment_status: 'pending',
      priority_level: 'normal',
      booking_source: 'web'
    };

    const booking = await createBooking(bookingData);
    
    toast.success('Booking created successfully! You will receive a confirmation shortly.');
    return booking;

  } catch (error) {
    console.error('Booking submission failed:', error);
    toast.error('Failed to create booking. Please try again.');
    throw error;
  }
};

// Function to get booking statistics
export const getBookingStatistics = async () => {
  try {
    const { data, error } = await supabase.rpc('get_booking_statistics');

    if (error) {
      console.error('Get statistics error:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to get statistics:', error);
    throw error;
  }
};

// Real-time subscription for booking updates
export const subscribeToBookingUpdates = (callback) => {
  const subscription = supabase
    .channel('booking-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings'
      },
      callback
    )
    .subscribe();

  return subscription;
};

// Helper function to format booking data for display
export const formatBookingForDisplay = (booking) => {
  return {
    id: booking.id,
    status: booking.booking_status,
    paymentStatus: booking.payment_status,
    scheduledDate: booking.scheduled_date,
    scheduledTime: booking.scheduled_time,
    totalAmount: booking.total_amount,
    paymentMethod: booking.payment_method,
    customerName: booking.customer_name,
    serviceName: booking.service_name,
    categoryName: booking.category_name,
    providerName: booking.provider_name,
    serviceAddress: booking.service_address,
    specialInstructions: booking.special_instructions,
    customerRating: booking.customer_rating,
    customerFeedback: booking.customer_feedback,
    createdAt: booking.created_at
  };
};

export default {
  createBooking,
  updateBookingStatus,
  assignProviderToBooking,
  getUserBookings,
  getProviderBookings,
  addBookingFeedback,
  handleBookingSubmission,
  getBookingStatistics,
  subscribeToBookingUpdates,
  formatBookingForDisplay
};
