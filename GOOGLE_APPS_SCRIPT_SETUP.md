# Google Apps Script Setup Guide for Glean Integration

## Current Status
- **Script ID**: `1wyVbOsfuTlw5PcakfwkTVcBK-d2546BgTzDmJpfdmzU-8VnTyOT5mLBA`
- **Master Presentation ID**: `1NbOO51d48Yt18Rvwpl5jKHNhp_WmMcnERbzz6ZXfFn0`
- **Target Folder ID**: `1TmKYFr7pFDuSV3R6zMcwc7_BDlYvtTLL`
- **Glean API Status**: ⚠️ Token authentication issue (401 error)

## Step 1: Add GLEAN_TOKEN to Script Properties

### In Google Apps Script Editor:
1. Open your script: [https://script.google.com/](https://script.google.com/)
2. Select your project (Script ID: `1wyVbOsfuTlw5PcakfwkTVcBK-d2546BgTzDmJpfdmzU-8VnTyOT5mLBA`)
3. Click **Settings** (⚙️ gear icon) in the left sidebar
4. Scroll down to **Script properties** section
5. Click **Add script property**
6. Add the following property:
   - **Property**: `GLEAN_TOKEN`
   - **Value**: `swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILladW9hqpg=`
7. Click **Save script properties**

## Step 2: Run Test Functions

### Test 1: Quick Setup Test
```javascript
// Run this function first
function quickSetupTest() {
  // This will verify:
  // 1. GLEAN_TOKEN is properly set
  // 2. Token format is correct
  // 3. Basic API connectivity
}
```

**To Run:**
1. Select `quickSetupTest` from the function dropdown
2. Click the **Run** button (▶️)
3. Check the **Execution log** at the bottom

**Expected Output:**
```
✅ GLEAN_TOKEN found
✅ Token length correct (45 characters)
🔍 Testing Glean API connection...
```

### Test 2: Enhanced Workflow Test
```javascript
// Run this after quickSetupTest passes
function testEnhancedWorkflow() {
  // This will test:
  // 1. Glean intelligence gathering
  // 2. Content synthesis
  // 3. Enhanced replacements
}
```

## Step 3: Handle API Authentication Issues

Since we're getting 401 errors, you have several options:

### Option A: Use Fallback Content (Recommended for Now)
The script already has a fallback mechanism that will use standard templates when Glean is unavailable. This allows the system to work while you resolve the token issue.

### Option B: Get a New API Token
1. Log into your Glean admin panel
2. Navigate to **Settings** → **API Keys**
3. Generate a new API token
4. Update the `GLEAN_TOKEN` in Script Properties

### Option C: Verify Instance Name
The current configuration uses `miq` as the instance name. This might need to be:
- Your company's actual Glean subdomain
- A different instance identifier
- Contact your Glean administrator to confirm

## Step 4: Test Without Glean (Fallback Mode)

Even without a working Glean token, your system will still function using the fallback content generator:

```javascript
function testFallbackMode() {
  // Create a test configuration
  var testConfig = {
    brand: "Nike",
    campaign_tactics: "Programmatic Display, Video",
    budget_1: "$500,000",
    geo_targeting: "United States"
  };
  
  // Test fallback content generation
  var content = createFallbackContent(testConfig);
  
  Logger.log("Fallback content generated:");
  Logger.log("  Goals: " + content.client_goals.length);
  Logger.log("  Must-haves: " + content.must_haves.length);
  Logger.log("  Timeline phases: " + content.timeline.length);
  
  return content;
}
```

## Step 5: Deploy and Test Webhook

Once basic testing is complete:

1. **Deploy as Web App:**
   - Click **Deploy** → **New deployment**
   - Type: **Web app**
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**
   - Copy the Web app URL

2. **Test with Sample Request:**
```bash
curl -X POST [YOUR_WEB_APP_URL] \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "requestId=TEST-001" \
  -d "brand=Nike" \
  -d "campaign_name=Summer 2025" \
  -d "budget_1=$500,000" \
  -d "geo_targeting=United States" \
  -d "campaign_tactics=Programmatic Display, Video"
```

## Troubleshooting Guide

### Issue: GLEAN_TOKEN not found
**Solution:**
- Ensure you've added it to Script Properties (not User Properties)
- Property name must be exactly `GLEAN_TOKEN` (case-sensitive)
- Save properties and refresh the script editor

### Issue: 401 Unauthorized from Glean API
**Possible Causes:**
1. **Invalid Token**: The token may be expired or incorrect
2. **Wrong Instance**: `miq` might not be the correct instance name
3. **API Not Enabled**: Glean API access might not be enabled for your account

**Solutions:**
1. Generate a new token from Glean admin
2. Verify the correct instance name with your Glean administrator
3. Ensure API access is enabled in your Glean account settings

### Issue: Presentation creation fails
**Check:**
1. Master Presentation ID is accessible
2. Target Folder ID has write permissions
3. Drive and Slides APIs are enabled in your Google Apps Script

## Current Working Features (Without Glean)

Even without Glean API access, your system still provides:

✅ **Queue Management**: Handles multiple requests efficiently
✅ **Text Replacements**: All placeholders are replaced with provided data
✅ **Image Fetching**: Google Search API for brand logos and lifestyle images
✅ **Webhook Integration**: Zapier and Replit status updates work
✅ **Slide Selection**: Custom slide indices from master presentation
✅ **Error Handling**: Timeout management and stale request cleanup

## Next Steps

1. **Immediate**: Add `GLEAN_TOKEN` to Script Properties
2. **Test**: Run `quickSetupTest()` and `showQueueStatus()`
3. **Deploy**: Update deployment if needed
4. **Monitor**: Check execution logs for any errors

## Support Resources

- **Glean Documentation**: [developers.glean.com](https://developers.glean.com)
- **Google Apps Script**: [developers.google.com/apps-script](https://developers.google.com/apps-script)
- **Your Script**: [Open in Editor](https://script.google.com/d/1wyVbOsfuTlw5PcakfwkTVcBK-d2546BgTzDmJpfdmzU-8VnTyOT5mLBA/edit)

## Contact for Help

If the Glean API token continues to fail:
1. Contact your Glean administrator for the correct token and instance name
2. Check if your organization has API access enabled
3. Verify firewall/network restrictions aren't blocking the API calls

---

**Note**: The system is designed to work with or without Glean. When Glean is unavailable, it uses intelligent fallback content based on industry best practices.