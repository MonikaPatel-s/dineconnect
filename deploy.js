const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Starting DineConnect deployment...\n');

try {
  // Check if Vercel CLI is installed
  console.log('📋 Checking Vercel CLI...');
  try {
    execSync('vercel --version', { stdio: 'pipe' });
    console.log('✅ Vercel CLI found\n');
  } catch (error) {
    console.log('❌ Vercel CLI not found. Installing...');
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed\n');
  }

  // Build client
  console.log('📦 Building client application...');
  execSync('cd client && npm run build', { stdio: 'inherit' });
  console.log('✅ Client build complete\n');

  // Deploy backend
  console.log('🌐 Deploying backend to Vercel...');
  execSync('cd server && vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Backend deployed\n');

  // Deploy frontend
  console.log('🌐 Deploying frontend to Vercel...');
  execSync('cd client && vercel --prod --yes', { stdio: 'inherit' });
  console.log('✅ Frontend deployed\n');

  console.log('🎉 Deployment complete!');
  console.log('\n📱 Your DineConnect application is now live!');
  console.log('🔗 Check your Vercel dashboard for the live URLs');
  console.log('\n🔑 Demo Credentials:');
  console.log('👑 Admin: admin@restaurant.com / admin123');
  console.log('👨‍🍳 Staff: staff@restaurant.com / staff123');
  console.log('🛍️ Customer: test@example.com / 123456');

} catch (error) {
  console.error('❌ Deployment failed:', error.message);
  console.log('\n💡 Manual deployment steps:');
  console.log('1. Install Vercel CLI: npm install -g vercel');
  console.log('2. Deploy backend: cd server && vercel --prod');
  console.log('3. Deploy frontend: cd client && vercel --prod');
}