# Installing Supabase CLI - macOS Solutions

You're getting an EACCES permission error. Here are several solutions:

---

## ✅ Solution 1: Use Homebrew (RECOMMENDED for macOS)

This is the cleanest and easiest method for macOS:

```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Supabase CLI
brew install supabase/tap/supabase

# Verify installation
supabase --version
```

**Pros:** No permission issues, easy updates, recommended by Supabase  
**Cons:** Requires Homebrew

---

## ✅ Solution 2: Use npm with sudo (Quick Fix)

```bash
sudo npm install -g supabase

# Verify installation
supabase --version
```

**Pros:** Quick and simple  
**Cons:** Requires sudo, not recommended for security reasons

---

## ✅ Solution 3: Fix npm Permissions (Best Long-Term)

This fixes the root cause and prevents future permission issues:

```bash
# Create a directory for global packages
mkdir ~/.npm-global

# Configure npm to use the new directory
npm config set prefix '~/.npm-global'

# Add to your PATH (choose based on your shell)
# For zsh (default on macOS):
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# For bash:
# echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bash_profile
# source ~/.bash_profile

# Now install Supabase CLI without sudo
npm install -g supabase

# Verify installation
supabase --version
```

**Pros:** Fixes the issue permanently, no sudo needed  
**Cons:** Requires shell configuration

---

## ✅ Solution 4: Use npx (No Installation Required)

You can use Supabase CLI without installing it globally:

```bash
# Use npx to run Supabase commands
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase gen types typescript --linked > src/types/supabase.ts

# Or add to package.json scripts
```

**Pros:** No installation needed, no permission issues  
**Cons:** Slightly slower (downloads on first use)

---

## 🎯 Recommended Approach for You

Since you're on macOS, I recommend **Solution 1 (Homebrew)**:

```bash
# Install Homebrew (if not installed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install Supabase CLI
brew install supabase/tap/supabase

# Verify
supabase --version
```

---

## 🔧 After Installing Supabase CLI

Once installed, continue with deployment:

```bash
# 1. Login to Supabase
supabase login

# 2. Link your project
supabase link --project-ref YOUR_PROJECT_REF

# 3. Generate types
npm run gen:types

# 4. Continue with deployment
npm run verify:prod
npm run build
vercel --prod
```

---

## 🚨 If Homebrew Installation Fails

Try the npm permission fix (Solution 3) or use npx (Solution 4).

---

## 📞 Need Help?

If you continue to have issues, you can:

1. Use npx instead: `npx supabase login`
2. Check Homebrew installation: `brew doctor`
3. Verify your shell: `echo $SHELL`

---

**Next Step:** Choose a solution above and install Supabase CLI, then continue with `./deploy.sh`
