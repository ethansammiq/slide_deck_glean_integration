# 🚀 Implementation & Troubleshooting Guide

## Quick Setup Overview

This guide provides step-by-step instructions for implementing and troubleshooting the intelligent slide automation system with Glean integration.

## 📋 Prerequisites

### **Required Accounts & Access**
- ✅ Google Apps Script project access
- ✅ Glean API token for MiQ instance  
- ✅ Google Slides API permissions
- ✅ Zapier webhook integration (optional optimization)
- ✅ Salesforce data access

### **System Requirements**
- Google Apps Script runtime environment
- Glean API access from Google servers (IP allowlisted)
- Google Drive and Slides API quotas
- Modern web browser for testing interface

## 🔧 Step-by-Step Implementation

### **Phase 1: Google Apps Script Setup**

**1. Create Google Apps Script Project**
```javascript
// Navigate to script.google.com
// Create new project: "MiQ Slide Automation"
// Set project timezone and permissions
```

**2. Upload Core Files**
```bash
# Required files to upload:
# - enhanced_complete_automation_REVISED.gs (main system)
# - glean_slide_intelligence.gs (intelligence engine)  
# - test_revised_script.gs (testing functions)
```

**3. Configure Script Properties**
```javascript
// In Google Apps Script, go to Project Settings > Script Properties
// Add the following properties:

PropertiesService.getScriptProperties().setProperties({
  'GLEAN_TOKEN': 'swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILladW9hqpg=',
  'GOOGLE_SEARCH_API_KEY': 'AIzaSyAul1eges5--cASjIOznfmhVzEmV0CXUeM',
  'SEARCH_ENGINE_ID': 'b1648f7dc36d748a6'
});
```

**4. Enable Required APIs**
```javascript
// In Google Cloud Console, enable:
// - Google Slides API
// - Google Drive API  
// - Google Search API (for images)

// Grant permissions in Apps Script:
// - External API access
// - Google Services access
// - UrlFetch permissions
```

### **Phase 2: Glean Integration Setup**

**1. Validate Glean Token**
```javascript
function setupGleanIntegration() {
  Logger.log("🔍 SETTING UP GLEAN INTEGRATION");
  
  // Test token validation
  var token = getValidGleanToken();
  if (!token) {
    Logger.log("❌ Invalid token - check Script Properties");
    return false;
  }
  
  // Test connectivity
  if (!testGleanConnection()) {
    Logger.log("❌ Connection failed - check network access");
    return false;
  }
  
  Logger.log("✅ Glean integration setup complete");
  return true;
}
```

**2. Test Search Functionality**
```javascript
function testGleanSetup() {
  Logger.log("🧪 TESTING GLEAN SETUP");
  
  var testQueries = [
    "MiQ campaign successful",
    "slide template best practices", 
    "programmatic advertising recommendations"
  ];
  
  testQueries.forEach((query, index) => {
    Logger.log(`\n🔍 Test ${index + 1}: "${query}"`);
    
    var results = searchGleanWithRetry(query, [], getValidGleanToken());
    
    if (results && results.results) {
      Logger.log(`✅ Success: ${results.results.length} results found`);
    } else {
      Logger.log(`❌ Failed: No results for "${query}"`);
    }
  });
}
```

### **Phase 3: Intelligent System Configuration**

**1. Configure Slide Mapping**
```javascript
// Verify slide indices are correct for your presentation
function validateSlideMappings() {
  var slideMap = {
    'dooh': [28, 29, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168],
    'audio': [140, 141, 142],
    'location': [16, 17, 189],
    // ... verify all mappings match your master deck
  };
  
  // Check if all indices are valid (0-207 range)
  Object.keys(slideMap).forEach(tactic => {
    var slides = slideMap[tactic];
    var invalid = slides.filter(slide => slide < 0 || slide > 207);
    
    if (invalid.length > 0) {
      Logger.log(`⚠️ Invalid slide indices for ${tactic}: ${invalid.join(', ')}`);
    } else {
      Logger.log(`✅ Valid slide mapping for ${tactic}: ${slides.length} slides`);
    }
  });
}
```

**2. Test Intelligence Engine**
```javascript
function testIntelligenceEngine() {
  Logger.log("🧠 TESTING INTELLIGENCE ENGINE");
  
  // Use real campaign data for testing
  var testData = {
    notes: `DOOH and audio campaign with location-based targeting, 
            ACR retargeting, programmatic buying, YouTube video ads`,
    budget: "500000",
    campaign_name: "Test Intelligence Campaign",
    brand: "Test Client"
  };
  
  var result = getIntelligentSlideIndices(testData);
  
  Logger.log(`\n📊 INTELLIGENCE TEST RESULTS:`);
  Logger.log(`   Slides recommended: ${result.indices.length}`);
  Logger.log(`   Confidence: ${result.confidence}%`);
  Logger.log(`   Tactics detected: ${result.tacticsDetected || 0}`);
  
  result.reasoning.forEach((reason, i) => {
    Logger.log(`   ${i + 1}. ${reason}`);
  });
  
  return result.confidence >= 70; // Pass threshold
}
```

### **Phase 4: Webhook Integration**

**1. Deploy as Web App**
```javascript
// In Google Apps Script:
// 1. Click "Deploy" > "New Deployment"
// 2. Choose type: "Web app"
// 3. Execute as: "Me"
// 4. Access: "Anyone" (for webhooks)
// 5. Copy the Web App URL
```

**2. Configure Zapier Webhook**
```javascript
// Replace Zapier steps 10-14 with single webhook call to:
// https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec

// Payload format:
{
  "notes": "Salesforce Notes__c content",
  "budget": "Campaign budget",
  "campaign_name": "Campaign name",
  "brand": "Client brand name"
}
```

**3. Test Webhook Integration**
```javascript
function testWebhookIntegration() {
  // Simulate Zapier POST request
  var mockRequest = {
    parameter: {
      notes: "Test DOOH and audio campaign",
      budget: "100000", 
      campaign_name: "Webhook Test",
      brand: "Test Client"
    }
  };
  
  // Test the doPost function
  var response = doPost(mockRequest);
  
  Logger.log("🔗 WEBHOOK TEST RESULT:");
  Logger.log(JSON.stringify(response, null, 2));
  
  return response.success === true;
}
```

## 🐛 Troubleshooting Guide

### **Common Issues & Solutions**

**1. Glean Authentication Errors**
```
❌ Error: 401 Unauthorized
✅ Solution: Check token in Script Properties
```
```javascript
function fixGleanAuth() {
  // Re-validate token format
  var token = PropertiesService.getScriptProperties().getProperty('GLEAN_TOKEN');
  
  if (!token || token.length < 20) {
    Logger.log("❌ Token missing or too short");
    Logger.log("💡 Add valid token to Script Properties: GLEAN_TOKEN");
    return false;
  }
  
  // Test connection with new token
  return testGleanConnection();
}
```

**2. Network Connectivity Issues**
```
❌ Error: Connection timeout / Network error
✅ Solution: Verify Google Apps Script network access
```
```javascript
function diagnoseNetworkIssues() {
  try {
    // Test basic connectivity
    var response = UrlFetchApp.fetch('https://httpbin.org/json');
    Logger.log("✅ Basic internet connectivity working");
    
    // Test Glean endpoint accessibility
    var gleanTest = UrlFetchApp.fetch(CONFIG.GLEAN.BASE_URL, {method: 'HEAD'});
    Logger.log("✅ Glean endpoint accessible");
    
  } catch (error) {
    Logger.log("❌ Network issue detected: " + error.toString());
    Logger.log("💡 Check Google Apps Script service status");
  }
}
```

**3. Slide Index Mapping Errors**
```
❌ Error: Invalid slide indices / Out of range
✅ Solution: Verify slide mapping against master presentation
```
```javascript
function fixSlideMappings() {
  var masterPresentationId = CONFIG.SLIDES.MASTER_PRESENTATION_ID;
  
  try {
    // Get actual slide count from master presentation
    var presentation = Slides.Presentations.get(masterPresentationId);
    var actualSlideCount = presentation.slides.length;
    
    Logger.log(`📊 Master presentation has ${actualSlideCount} slides`);
    
    // Validate all mappings are within range
    var slideMap = getSlideIndicesForTactic('dooh'); // Test with DOOH
    var invalidIndices = slideMap.filter(index => index >= actualSlideCount);
    
    if (invalidIndices.length > 0) {
      Logger.log(`❌ Invalid indices found: ${invalidIndices.join(', ')}`);
      Logger.log("💡 Update slide mappings in getSlideIndicesForTactic()");
    } else {
      Logger.log("✅ All slide mappings are valid");
    }
    
  } catch (error) {
    Logger.log(`❌ Cannot access master presentation: ${error.toString()}`);
  }
}
```

**4. Confidence Score Issues**
```
❌ Error: Low confidence scores (<70%)
✅ Solution: Improve tactic detection patterns
```
```javascript
function improveConfidenceScoring() {
  // Test with known campaign data
  var testCampaign = {
    notes: "DOOH digital out-of-home audio podcast location-based targeting",
    budget: "500000"
  };
  
  var tactics = analyzeNotesForTactics(testCampaign.notes);
  var detectedCount = Object.keys(tactics).filter(t => tactics[t]).length;
  
  Logger.log(`🎯 Tactics detected: ${detectedCount}`);
  
  if (detectedCount < 3) {
    Logger.log("⚠️ Low tactic detection - consider expanding detection patterns");
    Logger.log("💡 Add more keywords to analyzeNotesForTactics()");
  }
  
  return detectedCount >= 3;
}
```

### **Performance Optimization**

**1. Search Query Optimization**
```javascript
function optimizeSearchQueries() {
  // Test different query strategies
  var testQueries = [
    "MiQ successful campaign", // Generic
    "MiQ DOOH audio campaign successful results", // Specific
    "slide template DOOH best practices" // Tactical
  ];
  
  testQueries.forEach((query, i) => {
    Logger.log(`\n🔍 Testing query ${i + 1}: "${query}"`);
    
    var start = Date.now();
    var results = searchGleanWithRetry(query, [], getValidGleanToken());
    var duration = Date.now() - start;
    
    Logger.log(`   ⏱️ Duration: ${duration}ms`);
    Logger.log(`   📊 Results: ${results ? results.results.length : 0}`);
  });
}
```

**2. Caching Strategy**
```javascript
// Cache search results to improve performance
var searchCache = {};

function searchGleanWithCache(query, filters, token) {
  var cacheKey = query + JSON.stringify(filters || []);
  
  // Check cache first
  if (searchCache[cacheKey]) {
    Logger.log(`📦 Cache hit for: "${query}"`);
    return searchCache[cacheKey];
  }
  
  // Search and cache result
  var results = searchGleanWithRetry(query, filters, token);
  if (results) {
    searchCache[cacheKey] = results;
    Logger.log(`💾 Cached results for: "${query}"`);
  }
  
  return results;
}
```

### **Monitoring & Debugging**

**1. Enhanced Logging**
```javascript
function enableDebugLogging() {
  // Add comprehensive logging to key functions
  var originalSearch = searchGleanWithRetry;
  
  searchGleanWithRetry = function(query, filters, token) {
    Logger.log(`🔍 SEARCH START: "${query}"`);
    Logger.log(`   📊 Filters: ${JSON.stringify(filters)}`);
    Logger.log(`   🔑 Token length: ${token ? token.length : 0}`);
    
    var start = Date.now();
    var result = originalSearch.call(this, query, filters, token);
    var duration = Date.now() - start;
    
    Logger.log(`   ⏱️ Duration: ${duration}ms`);
    Logger.log(`   📈 Results: ${result ? result.results.length : 0}`);
    Logger.log(`🔍 SEARCH END\n`);
    
    return result;
  };
}
```

**2. System Health Check**
```javascript
function systemHealthCheck() {
  Logger.log("🏥 SYSTEM HEALTH CHECK");
  Logger.log("====================");
  
  var health = {
    gleanToken: !!getValidGleanToken(),
    gleanConnectivity: false,
    slideAccess: false,
    webhookReady: false
  };
  
  // Test Glean connectivity
  try {
    health.gleanConnectivity = testGleanConnection();
  } catch (e) {
    Logger.log(`❌ Glean test failed: ${e.toString()}`);
  }
  
  // Test slide access
  try {
    var presentation = Slides.Presentations.get(CONFIG.SLIDES.MASTER_PRESENTATION_ID);
    health.slideAccess = !!presentation;
  } catch (e) {
    Logger.log(`❌ Slide access failed: ${e.toString()}`);
  }
  
  // Test webhook function
  try {
    var mockRequest = {parameter: {notes: "test", budget: "100000"}};
    var response = doPost(mockRequest);
    health.webhookReady = !!response;
  } catch (e) {
    Logger.log(`❌ Webhook test failed: ${e.toString()}`);
  }
  
  // Report health status
  Object.keys(health).forEach(check => {
    var status = health[check] ? "✅" : "❌";
    Logger.log(`${status} ${check}: ${health[check]}`);
  });
  
  var overall = Object.values(health).every(v => v);
  Logger.log(`\n🏥 Overall Health: ${overall ? "✅ HEALTHY" : "❌ ISSUES FOUND"}`);
  
  return overall;
}
```

## 📊 Performance Benchmarks

### **Expected Performance Metrics**
- **Glean Search**: <10 seconds per query
- **Intelligence Processing**: <30 seconds total
- **Slide Generation**: <60 seconds for full deck
- **Confidence Score**: 85-95% for complete campaigns

### **Optimization Targets**
- **Search Success Rate**: >95%
- **Tactic Detection Accuracy**: >90%
- **System Uptime**: >99%
- **Error Recovery**: <5% fallback rate

This implementation guide ensures successful deployment and operation of the intelligent slide automation system with comprehensive troubleshooting support.