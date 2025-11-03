// Test script to check if generate-ai endpoint exists
const express = require('express');
const axios = require('axios');

async function testEndpoint() {
    try {
        console.log('Testing endpoint: POST /api/admin/articles/generate-ai');
        
        // First test without auth (should return 401, not 404)
        const response = await axios.post('http://localhost:3000/api/admin/articles/generate-ai', {
            keyword: 'test'
        }).catch(err => {
            if (err.response) {
                console.log(`Status: ${err.response.status}`);
                console.log(`Response: ${JSON.stringify(err.response.data)}`);
                return err.response;
            } else {
                console.log('Error:', err.message);
                throw err;
            }
        });
        
        if (response.status === 404) {
            console.log('❌ ERROR: Endpoint not found (404)');
            console.log('The server needs to be restarted to load the new routes!');
            return false;
        } else if (response.status === 401) {
            console.log('✅ Endpoint exists! (401 means auth required, which is correct)');
            return true;
        } else {
            console.log(`✅ Endpoint exists! (Status: ${response.status})`);
            return true;
        }
    } catch (error) {
        console.error('❌ Error testing endpoint:', error.message);
        return false;
    }
}

testEndpoint();

