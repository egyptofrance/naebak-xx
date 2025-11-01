/**
 * Unified Color System
 * 
 * This file contains utility functions for consistent color usage across the website.
 * Based on the brand green color from the logo (#0a5c0a).
 */

/**
 * Get priority badge colors
 * Uses green shades for all priorities to maintain brand consistency
 */
export function getPriorityColors(priority: string): string {
  switch (priority) {
    case 'urgent':
      return 'bg-red-100 text-red-800'; // Keep red for urgent (safety/alert)
    case 'high':
      return 'bg-brand-green text-white'; // Brand green for high
    case 'medium':
      return 'bg-brand-green-light/20 text-brand-green-dark'; // Light green for medium
    case 'low':
      return 'bg-gray-100 text-gray-800'; // Gray for low
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get status badge colors
 * Uses green for positive states, gray for neutral, red for negative
 */
export function getStatusColors(status: string): string {
  switch (status) {
    // Positive states (green)
    case 'resolved':
    case 'completed':
    case 'approved':
    case 'active':
      return 'bg-brand-green text-white';
    
    // In progress (light green)
    case 'in_progress':
    case 'pending':
    case 'under_review':
      return 'bg-brand-green-light/20 text-brand-green-dark';
    
    // Negative states (red - for safety)
    case 'rejected':
    case 'closed':
    case 'cancelled':
      return 'bg-red-100 text-red-800';
    
    // Neutral (gray)
    case 'new':
    case 'draft':
    default:
      return 'bg-gray-100 text-gray-800';
  }
}

/**
 * Get category colors
 * All categories use green shades for consistency
 */
export function getCategoryColors(category?: string): string {
  // All categories use the same green color for consistency
  return 'bg-brand-green-light/20 text-brand-green-dark';
}

/**
 * Get button variant colors
 */
export function getButtonColors(variant: 'primary' | 'secondary' | 'danger' | 'success' = 'primary'): string {
  switch (variant) {
    case 'primary':
      return 'bg-brand-green hover:bg-brand-green-dark text-white';
    case 'secondary':
      return 'bg-gray-100 hover:bg-gray-200 text-gray-900';
    case 'danger':
      return 'bg-red-600 hover:bg-red-700 text-white';
    case 'success':
      return 'bg-brand-green-light hover:bg-brand-green text-white';
    default:
      return 'bg-brand-green hover:bg-brand-green-dark text-white';
  }
}

/**
 * Get card border colors for deputy cards
 * Replaces the colorful borders (blue, red, green, etc.) with subtle gray
 */
export function getDeputyCardBorderColor(): string {
  return 'border-gray-200 hover:border-brand-green-light';
}

/**
 * Get icon colors
 */
export function getIconColor(type: 'success' | 'warning' | 'error' | 'info' = 'info'): string {
  switch (type) {
    case 'success':
      return 'text-brand-green';
    case 'warning':
      return 'text-yellow-600'; // Keep yellow for warnings
    case 'error':
      return 'text-red-600'; // Keep red for errors
    case 'info':
      return 'text-brand-green-light';
    default:
      return 'text-brand-green';
  }
}
