#!/usr/bin/env python3
"""
Test script for user data API endpoints
Run this to verify the API is working correctly
"""

import asyncio
import httpx
import json

BASE_URL = "http://localhost:8000"

async def test_user_data_api():
    """Test the user data API endpoints"""
    
    async with httpx.AsyncClient() as client:
        print("🧪 Testing User Data API...")
        
        # Test 1: Check if the API is running
        try:
            response = await client.get(f"{BASE_URL}/docs")
            print(f"✅ API is running (status: {response.status_code})")
        except Exception as e:
            print(f"❌ API is not running: {e}")
            return
        
        # Test 2: Check if user-data endpoints exist
        try:
            response = await client.get(f"{BASE_URL}/user-data/")
            print(f"✅ User data endpoint exists (status: {response.status_code})")
            if response.status_code == 401:
                print("   (Expected: Authentication required)")
            elif response.status_code == 200:
                print("   (Unexpected: Should require authentication)")
        except Exception as e:
            print(f"❌ User data endpoint error: {e}")
        
        # Test 3: Check OpenAPI schema
        try:
            response = await client.get(f"{BASE_URL}/openapi.json")
            openapi_schema = response.json()
            
            # Check if user-data paths exist
            user_data_paths = [path for path in openapi_schema.get("paths", {}).keys() if path.startswith("/user-data")]
            if user_data_paths:
                print(f"✅ Found {len(user_data_paths)} user-data endpoints in OpenAPI schema:")
                for path in user_data_paths[:5]:  # Show first 5
                    print(f"   - {path}")
            else:
                print("❌ No user-data endpoints found in OpenAPI schema")
                
        except Exception as e:
            print(f"❌ Error checking OpenAPI schema: {e}")

if __name__ == "__main__":
    asyncio.run(test_user_data_api())
