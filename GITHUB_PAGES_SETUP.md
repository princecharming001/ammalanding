# ✅ GitHub Pages Setup - Official Method

This project is configured following the [official GitHub Pages documentation](https://docs.github.com/en/pages) using **GitHub Actions workflows**.

---

## 🎯 Current Configuration

### ✅ What's Set Up:

1. **GitHub Actions Workflow** (`.github/workflows/deploy.yml`)
   - Automatically builds and deploys on every push to `main`
   - Uses official GitHub Pages actions
   - No build artifacts committed to repo

2. **Vite Configuration** (`vite.config.js`)
   - Base path: `/ammalanding/` (matches repo name)
   - Build output: `dist/`

3. **React Router Configuration** (`src/main.jsx`)
   - Basename: `/ammalanding`

---

## 🚀 How to Deploy

### Automatic (Recommended):

```bash
# Make changes and commit
git add .
git commit -m "Your changes"
git push origin main

# Or use the npm shortcut
npm run deploy
```

**That's it!** GitHub Actions automatically:
1. Detects the push
2. Runs `npm ci && npm run build`
3. Deploys `dist/` folder to GitHub Pages
4. Updates your live site in 1-2 minutes

### Manual Trigger:

1. Go to your repo on GitHub
2. Click **Actions** tab
3. Select **Deploy to GitHub Pages** workflow
4. Click **Run workflow** → **Run workflow**

---

## ⚙️ GitHub Pages Settings

**IMPORTANT:** You must configure GitHub Pages to use GitHub Actions:

1. Go to: `https://github.com/princecharming001/ammalanding/settings/pages`
2. Under **Source**, select: **GitHub Actions**
3. Save (if needed)

**Screenshot of correct settings:**
```
Source: GitHub Actions
```

---

## 📁 Repository Structure

```
ammalanding/
├── .github/
│   └── workflows/
│       └── deploy.yml          # ← Deployment workflow
├── src/                         # Source code (committed)
├── dist/                        # Build output (ignored, not committed)
├── index.html                   # Source HTML (committed)
├── vite.config.js               # Build config
└── package.json
```

**Key points:**
- ✅ Source code IS committed
- ❌ Build artifacts (`dist/`, `assets/`) are NOT committed
- ✅ GitHub Actions builds and deploys automatically

---

## 🌐 Your Live Site

**URL:** https://princecharming001.github.io/ammalanding/

**Deploy Status:** Check Actions tab for build status

---

## 🔍 Monitoring Deployments

### View Build Status:
1. Go to: `https://github.com/princecharming001/ammalanding/actions`
2. See all deployment runs
3. Click any run to see detailed logs

### Check Current Deployment:
- **Actions Tab:** Shows if build succeeded/failed
- **Environments:** Shows deployed version
- **Commits:** Green checkmark = deployed successfully

---

## 🛠️ Troubleshooting

### Build Fails:
1. Check Actions tab for error logs
2. Common issues:
   - Missing dependencies
   - Build errors in code
   - Node version mismatch

### Site Not Updating:
1. Check Actions tab - did workflow run?
2. Check Pages settings - is source set to "GitHub Actions"?
3. Clear browser cache
4. Wait 2-3 minutes for CDN to update

### 404 Errors:
- Ensure `base: '/ammalanding/'` in `vite.config.js`
- Ensure `basename="/ammalanding"` in `src/main.jsx`
- Check that Pages source is "GitHub Actions"

---

## 📚 Documentation References

- [GitHub Pages Docs](https://docs.github.com/en/pages)
- [Configuring Publishing Source](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)
- [Using Custom Workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

---

## ✨ Benefits of This Approach

✅ **Clean Repository:** No build artifacts in git history
✅ **Automatic Builds:** Every push triggers deployment
✅ **Official Method:** Follows GitHub's recommended practices
✅ **Easy Rollback:** Revert a commit = revert deployment
✅ **Build Logs:** Full visibility in Actions tab
✅ **Manual Control:** Can trigger builds manually

---

## 🎯 Quick Commands

```bash
# Local development
npm run dev

# Test production build locally
npm run build && npm run preview

# Deploy (push to main)
npm run deploy

# Or deploy manually
git push origin main
```

---

**Everything is configured and ready!** Just push to `main` and GitHub Actions handles the rest. 🚀

