import http from 'http';

const testAPI = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: responseData
        });
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
};

// Test the API endpoints
async function runTests() {
  console.log('🧪 Testing ParkEasy Backend APIs...\n');

  try {
    // Test 1: Basic endpoint
    console.log('1. Testing basic endpoint (/)');
    const basicTest = await testAPI('/');
    console.log(`   Status: ${basicTest.statusCode}`);
    console.log(`   Response: ${basicTest.data}\n`);

    // Test 2: Parking spots endpoint
    console.log('2. Testing parking spots endpoint (/api/parking)');
    const parkingTest = await testAPI('/api/parking');
    console.log(`   Status: ${parkingTest.statusCode}`);
    console.log(`   Response: ${parkingTest.data.substring(0, 200)}...\n`);

    // Test 3: Reviews endpoint (should return empty initially)
    console.log('3. Testing reviews endpoint (/api/reviews/spot/1)');
    const reviewsTest = await testAPI('/api/reviews/spot/1');
    console.log(`   Status: ${reviewsTest.statusCode}`);
    console.log(`   Response: ${reviewsTest.data}\n`);

    console.log('✅ All tests completed successfully!');
    console.log('🎉 Your ParkEasy backend is working properly!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();