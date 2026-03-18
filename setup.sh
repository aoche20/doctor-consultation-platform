#!/bin/bash

echo "🚀 Initialisation de Doctor Consultation Platform"
echo "=================================================="

# Installation du backend
echo "📦 Installation du backend..."
cd server
npm install
echo "✅ Backend installé avec succès"

# Installation du frontend
echo "📦 Installation du frontend..."
cd ../client
npm install
echo "✅ Frontend installé avec succès"

cd ..

echo ""
echo "✨ Initialisation terminée !"
echo ""
echo "Pour démarrer le projet :"
echo "  Backend : cd server && npm run dev"
echo "  Frontend : cd client && npm run dev"
echo ""
echo "📁 Structure du projet :"
echo "  server/ - Backend Node.js/Express"
echo "  client/ - Frontend Next.js"