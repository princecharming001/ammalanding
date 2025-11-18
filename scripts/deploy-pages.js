#!/usr/bin/env node

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, errorMessage) {
  try {
    return execSync(command, { cwd: rootDir, encoding: 'utf-8' });
  } catch (error) {
    log(`❌ ${errorMessage}`, 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Check if git is initialized and has remote
function checkGitSetup() {
  try {
    exec('git rev-parse --git-dir', 'Not a git repository');
    
    const remotes = exec('git remote', 'Failed to check git remotes').trim();
    if (!remotes.includes('origin')) {
      log('❌ No git remote named "origin" found!', 'red');
      log('Add a remote with: git remote add origin <url>', 'yellow');
      process.exit(1);
    }
    
    const branch = exec('git branch --show-current', 'Failed to get current branch').trim();
    if (branch !== 'main') {
      log(`⚠️  Warning: Current branch is "${branch}", not "main"`, 'yellow');
      log('GitHub Pages is configured to deploy from "main" branch', 'yellow');
    }
    
    return branch;
  } catch (error) {
    log('❌ Git setup check failed', 'red');
    process.exit(1);
  }
}

// Build the project
function buildProject() {
  log('\n📦 Building project...', 'blue');
  exec('npm run build', 'Build failed');
  log('✅ Build completed successfully', 'green');
  
  if (!fs.existsSync(distDir)) {
    log(`❌ Build output directory not found: ${distDir}`, 'red');
    process.exit(1);
  }
}

// Copy files from dist to root
function copyDistToRoot() {
  log('\n📋 Copying build files to root...', 'blue');
  
  // Files/folders to exclude from deletion (keep these in root)
  const exclude = new Set([
    '.git',
    'node_modules',
    'src',
    'public',
    'scripts',
    'dist',
    'vite.config.js',
    'package.json',
    'package-lock.json',
    'eslint.config.js',
    '.gitignore',
    'videogenagentt',
    'venv',
    '.env'
  ]);
  
  // Get all files in dist
  const distFiles = fs.readdirSync(distDir);
  
  // Copy each file/folder from dist to root
  distFiles.forEach(file => {
    const srcPath = path.join(distDir, file);
    const destPath = path.join(rootDir, file);
    
    // Copy file or directory
    if (fs.statSync(srcPath).isDirectory()) {
      // Remove existing directory if it exists and not in exclude list
      if (fs.existsSync(destPath) && !exclude.has(file)) {
        fs.rmSync(destPath, { recursive: true, force: true });
      }
      // Copy directory recursively
      fs.cpSync(srcPath, destPath, { recursive: true });
    } else {
      // Copy file
      fs.copyFileSync(srcPath, destPath);
    }
    
    log(`  ✓ Copied: ${file}`, 'green');
  });
  
  log('✅ Files copied successfully', 'green');
}

// Commit and push changes
function commitAndPush(branch) {
  log('\n🔍 Checking for changes...', 'blue');
  
  // Check if there are changes
  const status = exec('git status --porcelain', 'Failed to check git status').trim();
  
  if (!status) {
    log('✅ No changes to commit - site is up to date!', 'green');
    return;
  }
  
  log('\n📝 Committing changes...', 'blue');
  exec('git add .', 'Failed to stage files');
  
  try {
    exec('git commit -m "Deploy: GitHub Pages update"', 'Failed to commit changes');
    log('✅ Changes committed', 'green');
  } catch (error) {
    log('⚠️  No changes to commit', 'yellow');
    return;
  }
  
  log(`\n🚀 Pushing to origin/${branch}...`, 'blue');
  exec(`git push origin ${branch}`, 'Failed to push to remote');
  log('✅ Successfully pushed to GitHub!', 'green');
}

// Main deployment function
async function deploy() {
  log('\n🚀 Starting GitHub Pages Deployment', 'blue');
  log('='.repeat(50), 'blue');
  
  try {
    const branch = checkGitSetup();
    buildProject();
    copyDistToRoot();
    commitAndPush(branch);
    
    log('\n' + '='.repeat(50), 'green');
    log('✅ Deployment completed successfully!', 'green');
    log('='.repeat(50), 'green');
    log('\n📍 Your site will be available at:', 'blue');
    log('   https://princecharming001.github.io/ammalanding/', 'blue');
    log('\n⏱️  GitHub Pages may take 1-2 minutes to update', 'yellow');
    
  } catch (error) {
    log('\n❌ Deployment failed', 'red');
    log(error.message, 'red');
    process.exit(1);
  }
}

// Run deployment
deploy();

