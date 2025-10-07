# Vercel Setup Instructions

## 1. Import Project to Vercel
1. Go to https://vercel.com/new
2. Import Git Repository: `ericbreslin1-coder/Parkeasy`
3. **IMPORTANT**: Set Root Directory to `parkeasy-frontend-clean`
4. Framework Preset: Create React App (auto-detected)
5. Build Command: `npm run build`
6. Output Directory: `build`

## 2. Add Environment Variable
In Project Settings → Environment Variables:
- Name: `REACT_APP_API_URL`
- Value: `https://YOUR-RENDER-BACKEND.onrender.com/api`
- Environment: Production

## 3. Create Deploy Hook
1. Project → Settings → Git → Deploy Hooks
2. Create Hook:
   - Name: `main-deploy`
   - Branch: `main` (should be available after import)
3. Copy the URL (looks like: https://api.vercel.com/v1/integrations/deploy/prj_xxx/xxx)

## 4. Add GitHub Secret
1. Go to https://github.com/ericbreslin1-coder/Parkeasy/settings/secrets/actions
2. New repository secret:
   - Name: `VERCEL_DEPLOY_HOOK`
   - Value: (paste the hook URL)

## 5. Update Backend CORS
On Render, add/update environment variable:
- Name: `CORS_ORIGIN`
- Value: `http://localhost:3001,https://YOUR-APP-NAME.vercel.app`

## 6. Test
Push any commit to main branch - should trigger auto-deploy.