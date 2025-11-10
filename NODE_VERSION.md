# Node.js Version Requirement

This project requires **Node.js 18 or higher** to run.

## Current Issue

Your current Node.js version is **v12.22.9**, which is too old for Vite 5.x.

## Solutions

### Option 1: Install/Update Node.js (Recommended)

#### Using Node Version Manager (nvm) - Recommended

1. Install nvm:
```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
```

2. Restart your terminal or run:
```bash
source ~/.bashrc
```

3. Install Node.js 18:
```bash
nvm install 18
nvm use 18
```

4. Verify installation:
```bash
node --version  # Should show v18.x.x or higher
```

#### Using Package Manager (Ubuntu/Debian)

```bash
# Using NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify
node --version
```

#### Download from Official Website

Visit https://nodejs.org/ and download Node.js 18 LTS or higher.

### Option 2: Use Docker (Alternative)

If you can't update Node.js system-wide, you can use Docker:

```bash
docker run -it -v $(pwd):/app -w /app -p 5173:5173 node:18 npm install && npm run dev
```

## After Updating Node.js

1. Delete `node_modules` and reinstall:
```bash
rm -rf node_modules package-lock.json
npm install
```

2. Run the dev server:
```bash
npm run dev
```






