/**
 * Test script for cloud storage functionality
 * Run this in the browser console to test the API connection
 */

import { cloudStorageManager } from './cloudStorageManager';

export const testCloudStorage = async () => {
  console.log('🧪 Testing Cloud Storage API...');
  
  try {
    // Test 1: Check if API is reachable
    console.log('Testing API connection...');
    const storages = await cloudStorageManager.getStorages();
    console.log('✅ API connection successful');
    console.log('Storages:', storages);
    
  } catch (error) {
    console.error('❌ API connection failed:', error);
    
    // Check common issues
    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.error('❌ No authentication token found. Please log in first.');
    } else {
      console.log('✅ Authentication token found');
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    console.log('API URL:', apiUrl);
    
    // Test basic connectivity
    try {
      const response = await fetch(`${apiUrl}/docs`);
      if (response.ok) {
        console.log('✅ Backend is running');
      } else {
        console.error('❌ Backend returned error:', response.status);
      }
    } catch (e) {
      console.error('❌ Cannot reach backend:', e);
    }
  }
};

// Make it available globally for testing
if (typeof window !== 'undefined') {
  (window as any).testCloudStorage = testCloudStorage;
}
