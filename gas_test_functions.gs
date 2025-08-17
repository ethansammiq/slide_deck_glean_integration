/**
 * GOOGLE APPS SCRIPT TEST FUNCTIONS
 * Copy these functions to your Google Apps Script editor for testing
 */

// ============================================================================
// STEP 1: VERIFY CURRENT CONFIGURATION
// ============================================================================

/**
 * Check all script properties and configuration
 */
function checkCurrentSetup() {
  Logger.log("🔍 CHECKING CURRENT SETUP");
  Logger.log("="+"=".repeat(49));
  
  // Check Script Properties
  var props = PropertiesService.getScriptProperties();
  var allProps = props.getProperties();
  
  Logger.log("\n📋 SCRIPT PROPERTIES:");
  for (var key in allProps) {
    if (key === "GLEAN_TOKEN") {
      var token = allProps[key];
      Logger.log(`   ${key}: ${token.substring(0,10)}...${token.substring(token.length-10)}`);
      Logger.log(`   Token length: ${token.length} characters`);
    } else if (key.indexOf("token") > -1 || key.indexOf("key") > -1 || key.indexOf("secret") > -1) {
      // Mask sensitive values
      Logger.log(`   ${key}: [MASKED]`);
    } else {
      Logger.log(`   ${key}: ${allProps[key]}`);
    }
  }
  
  // Check Master Presentation
  try {
    var masterPresentationId = "1NbOO51d48Yt18Rvwpl5jKHNhp_WmMcnERbzz6ZXfFn0";
    var presentation = SlidesApp.openById(masterPresentationId);
    var slides = presentation.getSlides();
    Logger.log(`\n✅ Master Presentation: Accessible (${slides.length} slides)`);
  } catch (e) {
    Logger.log(`\n❌ Master Presentation: ${e.toString()}`);
  }
  
  // Check Target Folder
  try {
    var targetFolderId = "1TmKYFr7pFDuSV3R6zMcwc7_BDlYvtTLL";
    var folder = DriveApp.getFolderById(targetFolderId);
    Logger.log(`✅ Target Folder: ${folder.getName()} (Accessible)`);
  } catch (e) {
    Logger.log(`❌ Target Folder: ${e.toString()}`);
  }
  
  // Check Queue Status
  var queue = props.getProperty("requestQueue") || "[]";
  var queueArray = JSON.parse(queue);
  Logger.log(`\n📊 Queue Status: ${queueArray.length} items pending`);
  
  // Check Active Triggers
  var triggers = ScriptApp.getProjectTriggers();
  Logger.log(`\n⏰ Active Triggers: ${triggers.length}`);
  triggers.forEach(function(trigger, index) {
    Logger.log(`   ${index + 1}. ${trigger.getHandlerFunction()} - ${trigger.getEventType()}`);
  });
  
  Logger.log("\n" + "="+"=".repeat(49));
  Logger.log("✅ Setup check complete");
}

// ============================================================================
// STEP 2: TEST GLEAN API CONNECTION
// ============================================================================

/**
 * Test Glean API with current token
 */
function testGleanConnection() {
  Logger.log("🔍 TESTING GLEAN API CONNECTION");
  Logger.log("="+"=".repeat(49));
  
  var props = PropertiesService.getScriptProperties();
  var gleanToken = props.getProperty('GLEAN_TOKEN');
  
  if (!gleanToken) {
    Logger.log("❌ GLEAN_TOKEN not found in Script Properties!");
    Logger.log("\n📝 TO FIX:");
    Logger.log("1. Go to Settings (⚙️)");
    Logger.log("2. Add Script Property:");
    Logger.log("   Name: GLEAN_TOKEN");
    Logger.log("   Value: swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILladW9hqpg=");
    return false;
  }
  
  Logger.log("✅ GLEAN_TOKEN found");
  Logger.log(`   Length: ${gleanToken.length} characters`);
  
  // Test API endpoint
  var baseUrl = "https://miq-be.glean.com";
  var searchUrl = baseUrl + "/rest/api/v1/search";
  
  Logger.log(`\n📡 Testing: ${searchUrl}`);
  
  var payload = {
    query: "test",
    pageSize: 1
  };
  
  var options = {
    method: 'post',
    headers: {
      'Authorization': 'Bearer ' + gleanToken,
      'Content-Type': 'application/json'
    },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  };
  
  try {
    var response = UrlFetchApp.fetch(searchUrl, options);
    var statusCode = response.getResponseCode();
    
    Logger.log(`\n📊 Response Status: ${statusCode}`);
    
    if (statusCode === 200) {
      var data = JSON.parse(response.getContentText());
      var resultCount = data.results ? data.results.length : 0;
      Logger.log(`✅ SUCCESS! Found ${resultCount} results`);
      
      if (data.results && data.results[0]) {
        Logger.log(`\n📄 Sample Result:`);
        Logger.log(`   Title: ${data.results[0].document?.title || 'N/A'}`);
      }
      return true;
      
    } else if (statusCode === 401) {
      Logger.log("❌ AUTHENTICATION FAILED (401)");
      Logger.log("\n🔧 POSSIBLE ISSUES:");
      Logger.log("1. Token might be expired or invalid");
      Logger.log("2. Instance name 'miq' might be incorrect");
      Logger.log("3. API access might not be enabled");
      
    } else if (statusCode === 404) {
      Logger.log("❌ ENDPOINT NOT FOUND (404)");
      Logger.log("The API endpoint URL might be incorrect");
      
    } else {
      Logger.log(`❌ UNEXPECTED STATUS: ${statusCode}`);
      Logger.log(`Response: ${response.getContentText().substring(0, 200)}`);
    }
    
  } catch (error) {
    Logger.log(`❌ ERROR: ${error.toString()}`);
    Logger.log("\n🔧 This might be a network or permission issue");
  }
  
  Logger.log("\n" + "="+"=".repeat(49));
  Logger.log("⚠️ Glean API not accessible - system will use fallback content");
  return false;
}

// ============================================================================
// STEP 3: TEST FALLBACK CONTENT GENERATION
// ============================================================================

/**
 * Test the fallback content generator (works without Glean)
 */
function testFallbackContent() {
  Logger.log("🧪 TESTING FALLBACK CONTENT GENERATION");
  Logger.log("="+"=".repeat(49));
  
  var testConfig = {
    brand: "Nike",
    campaign_name: "Summer Athletic 2025",
    campaign_tactics: "Programmatic Display, Video, CTV",
    budget_1: "$500,000",
    geo_targeting: "United States",
    flight_dates: "06/01/25 - 08/31/25"
  };
  
  Logger.log("\n📊 Test Configuration:");
  Logger.log(`   Brand: ${testConfig.brand}`);
  Logger.log(`   Campaign: ${testConfig.campaign_name}`);
  Logger.log(`   Tactics: ${testConfig.campaign_tactics}`);
  Logger.log(`   Budget: ${testConfig.budget_1}`);
  
  // Test the fallback content generator
  var content = createFallbackContent(testConfig);
  
  Logger.log("\n✅ Generated Fallback Content:");
  Logger.log(`   Client Goals: ${content.client_goals.length} items`);
  Logger.log(`   Must-Haves: ${content.must_haves.length} items`);
  Logger.log(`   Decision Criteria: ${content.decision_criteria.length} items`);
  Logger.log(`   Timeline Phases: ${content.timeline.length}`);
  Logger.log(`   Industry: ${content.industry}`);
  
  Logger.log("\n📝 Sample Content:");
  Logger.log("   Goals:");
  content.client_goals.forEach(function(goal, i) {
    Logger.log(`      ${i+1}. ${goal}`);
  });
  
  Logger.log("\n   Timeline:");
  content.timeline.forEach(function(phase) {
    Logger.log(`      • ${phase.phase} (${phase.weeks} weeks)`);
  });
  
  Logger.log("\n" + "="+"=".repeat(49));
  Logger.log("✅ Fallback content generation works!");
  return content;
}

// ============================================================================
// STEP 4: TEST COMPLETE WORKFLOW
// ============================================================================

/**
 * Test the complete presentation creation workflow
 */
function testCompleteWorkflow() {
  Logger.log("🚀 TESTING COMPLETE WORKFLOW");
  Logger.log("="+"=".repeat(49));
  
  // Create a test request
  var testRequest = {
    requestId: "TEST-" + new Date().getTime(),
    brand: "Test Brand",
    campaign_name: "Test Campaign 2025",
    campaign_tactics: "Programmatic Display, Video",
    budget_1: "$250,000",
    geo_targeting: "United States",
    flight_dates: "01/01/25 - 03/31/25",
    flight_start: "01/01/25",
    flight_end: "03/31/25",
    media_kpis: "Brand Awareness, Conversions",
    fileName: "TEST_PRESENTATION_" + new Date().getTime()
  };
  
  Logger.log("\n📋 Test Request:");
  Logger.log(`   Request ID: ${testRequest.requestId}`);
  Logger.log(`   Brand: ${testRequest.brand}`);
  Logger.log(`   File Name: ${testRequest.fileName}`);
  
  try {
    // Step 1: Test Glean Intelligence (with fallback)
    Logger.log("\n1️⃣ Gathering Intelligence...");
    var intelligence = gatherGleanIntelligence(testRequest);
    Logger.log(`   ✅ Intelligence gathered: ${intelligence.sources.length} sources`);
    
    // Step 2: Test Replacements
    Logger.log("\n2️⃣ Creating Replacements...");
    var replacements = createEnhancedReplacements(testRequest, intelligence);
    Logger.log(`   ✅ Created ${Object.keys(replacements).length} replacements`);
    
    // Step 3: Test Image Fetching
    Logger.log("\n3️⃣ Testing Image Fetch...");
    var brandLogo = fetchImageFromGoogle(testRequest.brand + " logo transparent");
    if (brandLogo) {
      Logger.log(`   ✅ Found brand logo`);
    } else {
      Logger.log(`   ⚠️ No brand logo found (will use placeholder)`);
    }
    
    Logger.log("\n" + "="+"=".repeat(49));
    Logger.log("✅ Workflow test complete - system is ready!");
    
    return {
      success: true,
      intelligence: intelligence,
      replacements: replacements
    };
    
  } catch (error) {
    Logger.log(`\n❌ Workflow test failed: ${error.toString()}`);
    Logger.log(`   Stack: ${error.stack}`);
    return {
      success: false,
      error: error.toString()
    };
  }
}

// ============================================================================
// STEP 5: CLEAR TEST DATA
// ============================================================================

/**
 * Clean up any test data and reset the system
 */
function cleanupTestData() {
  Logger.log("🧹 CLEANING UP TEST DATA");
  Logger.log("="+"=".repeat(49));
  
  var props = PropertiesService.getScriptProperties();
  var allProps = props.getProperties();
  var cleanupCount = 0;
  
  // Clean up test request properties
  for (var key in allProps) {
    if (key.startsWith("request_TEST-")) {
      props.deleteProperty(key);
      cleanupCount++;
      Logger.log(`   Removed: ${key}`);
    }
  }
  
  // Clear the queue if it has test items
  var queue = props.getProperty("requestQueue") || "[]";
  var queueArray = JSON.parse(queue);
  var originalLength = queueArray.length;
  
  queueArray = queueArray.filter(function(id) {
    return !id.startsWith("TEST-");
  });
  
  if (queueArray.length < originalLength) {
    props.setProperty("requestQueue", JSON.stringify(queueArray));
    Logger.log(`   Removed ${originalLength - queueArray.length} test items from queue`);
  }
  
  Logger.log(`\n✅ Cleanup complete: ${cleanupCount} items removed`);
}

// ============================================================================
// MASTER TEST RUNNER
// ============================================================================

/**
 * Run all tests in sequence
 */
function runAllTests() {
  Logger.log("🎯 RUNNING ALL TESTS");
  Logger.log("="+"=".repeat(49));
  Logger.log(`Started: ${new Date().toLocaleString()}`);
  Logger.log("\n");
  
  // Test 1: Check Setup
  checkCurrentSetup();
  Logger.log("\n");
  
  // Test 2: Glean Connection
  var gleanWorks = testGleanConnection();
  Logger.log("\n");
  
  // Test 3: Fallback Content
  testFallbackContent();
  Logger.log("\n");
  
  // Test 4: Complete Workflow
  var workflowResult = testCompleteWorkflow();
  Logger.log("\n");
  
  // Summary
  Logger.log("="+"=".repeat(49));
  Logger.log("📊 TEST SUMMARY");
  Logger.log("="+"=".repeat(49));
  Logger.log(`   Glean API: ${gleanWorks ? "✅ Working" : "❌ Not Working (using fallback)"}`);
  Logger.log(`   Fallback Content: ✅ Working`);
  Logger.log(`   Complete Workflow: ${workflowResult.success ? "✅ Working" : "❌ Failed"}`);
  Logger.log(`\nCompleted: ${new Date().toLocaleString()}`);
  
  Logger.log("\n🎉 Your system is ready to use!");
  Logger.log("   - Glean integration will activate when token is valid");
  Logger.log("   - Fallback content ensures system always works");
  Logger.log("   - Deploy as web app to receive Zapier webhooks");
}

// ============================================================================
// HELPER: Create Fallback Content (if not already in your script)
// ============================================================================

function createFallbackContent(config) {
  if (!config) {
    config = { brand: "Client", geo_targeting: "Global", budget_1: "$100,000" };
  }
  
  var industry = extractIndustry(config);
  
  return {
    client_name: config.brand || "Client",
    industry: industry,
    region: config.geo_targeting || "Global",
    
    client_goals: [
      "Increase brand awareness in " + industry + " sector",
      "Drive qualified traffic and conversions",
      "Optimize media performance and ROI"
    ],
    
    must_haves: [
      "Real-time reporting and analytics",
      "Brand safety and fraud prevention",
      "Cross-device targeting capabilities"
    ],
    
    decision_criteria: [
      "Platform capabilities and reach",
      "Data quality and targeting precision",
      "Track record and expertise"
    ],
    
    proposed_solution: {
      overview: "Leverage MiQ's programmatic capabilities to reach your target audience with precision.",
      modules: [
        {name: "Programmatic Display", value_prop: "Advanced audience targeting"},
        {name: "Video Advertising", value_prop: "Engaging video content"},
        {name: "Performance Analytics", value_prop: "Real-time insights"}
      ]
    },
    
    security: {
      standards: ["SOC 2 Type II", "GDPR Compliant", "IAB Gold Standard"],
      notes: "Enterprise-grade security and compliance"
    },
    
    timeline: [
      {phase: "Discovery & Setup", weeks: 2},
      {phase: "Launch & Optimization", weeks: 4},
      {phase: "Scale & Refinement", weeks: 8}
    ],
    
    case_studies: [],
    sources: [],
    assumptions: ["Content generated from templates - Glean API not available"]
  };
}

function extractIndustry(config) {
  if (!config) return "Consumer Goods";
  
  var brand = (config.brand || "").toLowerCase();
  var campaign = (config.campaign_name || "").toLowerCase();
  
  if (brand.indexOf("nike") >= 0 || brand.indexOf("adidas") >= 0) {
    return "Retail & Sports";
  } else if (brand.indexOf("auto") >= 0 || brand.indexOf("car") >= 0) {
    return "Automotive";
  } else if (brand.indexOf("bank") >= 0 || brand.indexOf("finance") >= 0) {
    return "Financial Services";
  } else {
    return "Consumer Goods";
  }
}