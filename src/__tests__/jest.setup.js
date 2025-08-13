// Jest setup file to load environment variables
const fs = require('fs');
const path = require('path');

// Load .env file
const envPath = path.resolve(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const lines = envContent.split('\n');
  
  lines.forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#') && line.includes('=')) {
      const [key, value] = line.split('=');
      process.env[key.trim()] = value.trim();
    }
  });
}