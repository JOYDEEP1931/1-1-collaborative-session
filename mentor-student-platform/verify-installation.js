#!/usr/bin/env node

/**
 * 🚀 Mentor-Student Platform - Installation Verification Script
 * Checks if all dependencies are properly installed
 */

const fs = require('fs');
const path = require('path');

console.log('\n========================================');
console.log('  Installation Verification Script');
console.log('========================================\n');

const checks = [
  {
    name: 'Backend node_modules',
    path: './backend/node_modules',
    type: 'dir'
  },
  {
    name: 'Frontend node_modules',
    path: './frontend/node_modules',
    type: 'dir'
  },
  {
    name: 'Backend package.json',
    path: './backend/package.json',
    type: 'file'
  },
  {
    name: 'Frontend package.json',
    path: './frontend/package.json',
    type: 'file'
  },
  {
    name: 'Backend server.js',
    path: './backend/server.js',
    type: 'file'
  },
  {
    name: 'Frontend src/App.tsx',
    path: './frontend/src/App.tsx',
    type: 'file'
  }
];

let allChecked = true;

checks.forEach((check) => {
  try {
    const stats = fs.statSync(check.path);
    if (check.type === 'dir' && stats.isDirectory()) {
      console.log(`✅ ${check.name}`);
    } else if (check.type === 'file' && stats.isFile()) {
      console.log(`✅ ${check.name}`);
    } else {
      console.log(`❌ ${check.name} - Wrong type`);
      allChecked = false;
    }
  } catch (err) {
    console.log(`⏳ ${check.name} - Not found yet (npm install in progress)`);
    allChecked = false;
  }
});

console.log('\n========================================');
if (allChecked) {
  console.log('✅ All checks passed! Ready to run.');
  console.log('\nNext steps:');
  console.log('1. cd backend && npm start');
  console.log('2. cd frontend && npm run dev');
  console.log('3. Open http://localhost:5173');
} else {
  console.log('⏳ Installation in progress...');
  console.log('\nWaiting for npm install to complete.');
  console.log('Please wait 2-5 minutes for dependencies to install.');
  console.log('\nThen run: npm start (backend) and npm run dev (frontend)');
}
console.log('========================================\n');
