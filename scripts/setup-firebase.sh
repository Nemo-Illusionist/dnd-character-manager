#!/bin/bash
# Firebase Project Setup Script
# Автоматизирует настройку Firebase для проекта

set -e  # Exit on error

echo "🔥 Firebase Project Setup"
echo "========================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo -e "${RED}❌ Firebase CLI not installed${NC}"
    echo "Install it with: npm install -g firebase-tools"
    exit 1
fi

echo -e "${GREEN}✅ Firebase CLI installed${NC}"

# Check if logged in
if ! firebase projects:list &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Firebase${NC}"
    echo "Running: firebase login"
    firebase login
fi

echo -e "${GREEN}✅ Logged in to Firebase${NC}"
echo ""

# List available projects
echo "📋 Available Firebase Projects:"
firebase projects:list

echo ""
echo "⚙️  Current project configuration:"
cat .firebaserc 2>/dev/null || echo "No .firebaserc found"

echo ""
echo -e "${YELLOW}🔧 Choose environment to setup:${NC}"
echo "1) staging"
echo "2) production"
echo "3) local (emulators only)"
read -p "Enter choice [1-3]: " choice

case $choice in
    1)
        ENV="staging"
        ;;
    2)
        ENV="production"
        ;;
    3)
        ENV="local"
        echo -e "${GREEN}✅ Local setup - no Firebase project needed${NC}"
        echo "Starting emulators..."
        npm run emulators
        exit 0
        ;;
    *)
        echo -e "${RED}Invalid choice${NC}"
        exit 1
        ;;
esac

echo ""
echo -e "${GREEN}Setting up ${ENV} environment...${NC}"

# Switch to the environment
if grep -q "\"$ENV\":" .firebaserc 2>/dev/null; then
    firebase use $ENV
    echo -e "${GREEN}✅ Switched to $ENV project${NC}"
else
    echo -e "${YELLOW}⚠️  Project alias '$ENV' not found in .firebaserc${NC}"
    echo "Adding new project alias..."
    firebase use --add
fi

echo ""
echo "📦 Deploying Firestore Rules..."
if firebase deploy --only firestore:rules; then
    echo -e "${GREEN}✅ Firestore rules deployed${NC}"
else
    echo -e "${RED}❌ Failed to deploy Firestore rules${NC}"
    echo "You may need to:"
    echo "1. Enable Firestore Database in Firebase Console"
    echo "   https://console.firebase.google.com/project/$(firebase use --project | awk '{print $4}')/firestore"
    exit 1
fi

echo ""
echo "📦 Deploying Firestore Indexes..."
firebase deploy --only firestore:indexes

echo ""
echo "🔐 Checking Authentication setup..."
PROJECT_ID=$(firebase use --project | awk '{print $4}' | tr -d "'()")

echo ""
echo -e "${YELLOW}⚠️  Manual steps required:${NC}"
echo ""
echo "1. Enable Authentication:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/authentication"
echo "   → Get started → Email/Password → Enable"
echo ""
echo "2. Enable Firestore Database (if not already enabled):"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "   → Create database → Production mode → Choose region"
echo ""
echo "3. Verify your domain is authorized:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/authentication/settings"
echo "   → Authorized domains → Add your hosting domain"
echo ""

read -p "Press Enter once you've completed these steps..."

echo ""
echo "🧪 Testing Firestore connection..."

# Create a test document
cat > /tmp/test-firestore.js << 'EOF'
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, serverTimestamp } = require('firebase/firestore');

const config = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
};

const app = initializeApp(config);
const db = getFirestore(app);

(async () => {
  try {
    const docRef = await addDoc(collection(db, '_setup_test'), {
      test: true,
      createdAt: serverTimestamp()
    });
    console.log('✅ Firestore write test successful:', docRef.id);
    process.exit(0);
  } catch (error) {
    console.error('❌ Firestore write test failed:', error.message);
    process.exit(1);
  }
})();
EOF

if [ -f "frontend/.env.$ENV" ]; then
    export $(cat "frontend/.env.$ENV" | xargs)
    echo "Testing with .env.$ENV configuration..."

    if node /tmp/test-firestore.js; then
        echo -e "${GREEN}✅ Firestore is working!${NC}"
    else
        echo -e "${YELLOW}⚠️  Firestore test failed (this is normal if you haven't enabled it yet)${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  No .env.$ENV file found - skipping connection test${NC}"
fi

rm /tmp/test-firestore.js

echo ""
echo -e "${GREEN}✅ Setup complete for $ENV environment!${NC}"
echo ""
echo "Next steps:"
echo "1. Build and deploy:"
echo "   npm run deploy:$ENV"
echo ""
echo "2. Or run locally with emulators:"
echo "   npm run emulators    # in one terminal"
echo "   npm run dev          # in another terminal"
