#!/usr/bin/env node

/**
 * Deployment Test Script
 * Verifies that the app is configured correctly before deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🧪 Running deployment tests...\n');

// Test 1: Check if .env file exists and has required variables
function testEnvironmentVariables() {
  console.log('1. Testing environment variables...');

  const envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) {
    console.log('   ❌ .env file not found');
    return false;
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const requiredVars = [
    'SLACK_BOT_TOKEN',
    'SLACK_SIGNING_SECRET',
    'SLACK_APP_TOKEN',
    'GITHUB_TOKEN',
  ];

  let allPresent = true;
  requiredVars.forEach((varName) => {
    if (
      !envContent.includes(`${varName}=`) ||
      envContent.includes(`${varName}=your-`)
    ) {
      console.log(`   ❌ ${varName} not configured`);
      allPresent = false;
    } else {
      console.log(`   ✅ ${varName} configured`);
    }
  });

  return allPresent;
}

// Test 2: Check if dependencies are installed
function testDependencies() {
  console.log('\n2. Testing dependencies...');

  const nodeModulesPath = path.join(__dirname, '..', 'node_modules');
  if (!fs.existsSync(nodeModulesPath)) {
    console.log('   ❌ node_modules not found - run npm install');
    return false;
  }

  const packageJson = require('../package.json');
  const requiredDeps = Object.keys(packageJson.dependencies);

  let allInstalled = true;
  requiredDeps.forEach((dep) => {
    const depPath = path.join(nodeModulesPath, dep);
    if (!fs.existsSync(depPath)) {
      console.log(`   ❌ ${dep} not installed`);
      allInstalled = false;
    } else {
      console.log(`   ✅ ${dep} installed`);
    }
  });

  return allInstalled;
}

// Test 3: Check if main files exist
function testFiles() {
  console.log('\n3. Testing required files...');

  const requiredFiles = [
    'src/app.js',
    'src/services/GitHubService.js',
    'src/services/SlackMessageBuilder.js',
    'package.json',
  ];

  let allExist = true;
  requiredFiles.forEach((file) => {
    const filePath = path.join(__dirname, '..', file);
    if (!fs.existsSync(filePath)) {
      console.log(`   ❌ ${file} not found`);
      allExist = false;
    } else {
      console.log(`   ✅ ${file} exists`);
    }
  });

  return allExist;
}

// Test 4: Try to load the main modules
function testModuleLoading() {
  console.log('\n4. Testing module loading...');

  try {
    require('../src/services/GitHubService');
    console.log('   ✅ GitHubService loads correctly');
  } catch (error) {
    console.log(`   ❌ GitHubService failed to load: ${error.message}`);
    return false;
  }

  try {
    require('../src/services/SlackMessageBuilder');
    console.log('   ✅ SlackMessageBuilder loads correctly');
  } catch (error) {
    console.log(`   ❌ SlackMessageBuilder failed to load: ${error.message}`);
    return false;
  }

  return true;
}

// Test 5: Check token formats
function testTokenFormats() {
  console.log('\n5. Testing token formats...');

  require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

  const tests = [
    {
      name: 'SLACK_BOT_TOKEN',
      value: process.env.SLACK_BOT_TOKEN,
      pattern: /^xoxb-/,
      description: 'should start with xoxb-',
    },
    {
      name: 'SLACK_APP_TOKEN',
      value: process.env.SLACK_APP_TOKEN,
      pattern: /^xapp-/,
      description: 'should start with xapp-',
    },
    {
      name: 'GITHUB_TOKEN',
      value: process.env.GITHUB_TOKEN,
      pattern: /^ghp_/,
      description: 'should start with ghp_',
    },
  ];

  let allValid = true;
  tests.forEach((test) => {
    if (!test.value) {
      console.log(`   ❌ ${test.name} not set`);
      allValid = false;
    } else if (!test.pattern.test(test.value)) {
      console.log(`   ❌ ${test.name} format invalid (${test.description})`);
      allValid = false;
    } else {
      console.log(`   ✅ ${test.name} format valid`);
    }
  });

  return allValid;
}

// Run all tests
async function runTests() {
  const results = [
    testEnvironmentVariables(),
    testDependencies(),
    testFiles(),
    testModuleLoading(),
    testTokenFormats(),
  ];

  const passed = results.filter((r) => r).length;
  const total = results.length;

  console.log(`\n📊 Test Results: ${passed}/${total} passed`);

  if (passed === total) {
    console.log('\n🎉 All tests passed! Your app is ready for deployment.');
    console.log('\n🚀 Next steps:');
    console.log('   1. Choose a deployment platform (see DEPLOYMENT.md)');
    console.log('   2. Set environment variables on your platform');
    console.log('   3. Deploy your app');
    console.log('   4. Test by pasting a GitHub PR link in Slack');
    process.exit(0);
  } else {
    console.log(
      '\n❌ Some tests failed. Please fix the issues above before deploying.'
    );
    console.log('\n💡 Common fixes:');
    console.log('   - Run: npm install');
    console.log('   - Copy env.example to .env and fill in your tokens');
    console.log('   - Check that all files are present');
    process.exit(1);
  }
}

runTests();
