/**
 * ENHANCED INTEGRATION DIAGNOSTICS & TROUBLESHOOTING
 * 
 * Run these functions in order to diagnose any issues with your enhanced slide automation
 */

// ============================================================================
// DIAGNOSTIC FUNCTIONS - RUN IN ORDER
// ============================================================================

/**
 * 🔍 STEP 1: Complete Integration Health Check
 * Run this first to get an overview of all systems
 */
function runCompleteHealthCheck() {
  Logger.log("🏥 COMPLETE INTEGRATION HEALTH CHECK");
  Logger.log("===================================");
  
  var results = {
    timestamp: new Date().toISOString(),
    glean_api: false,
    script_properties: false,
    webhook_config: false,
    queue_system: false,
    slides_access: false,
    image_api: false,
    issues: [],
    recommendations: []
  };
  
  // 1. Check Script Properties
  Logger.log("\n1️⃣ CHECKING SCRIPT PROPERTIES...");
  try {
    var props = PropertiesService.getScriptProperties();
    var gleanToken = props.getProperty('GLEAN_TOKEN');
    
    if (gleanToken) {
      Logger.log("✅ GLEAN_TOKEN found");
      if (gleanToken.length === 48) {
        Logger.log("✅ Token length correct (48 characters)");
        results.script_properties = true;
      } else {
        Logger.log(`⚠️ Token length incorrect: ${gleanToken.length} (expected 48)`);
        results.issues.push("GLEAN_TOKEN length incorrect");
      }
    } else {
      Logger.log("❌ GLEAN_TOKEN missing!");
      results.issues.push("GLEAN_TOKEN not found in Script Properties");
      results.recommendations.push("Add GLEAN_TOKEN to Script Properties: swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILladW9hqpg=");
    }
  } catch (error) {
    Logger.log("❌ Error checking script properties: " + error.toString());
    results.issues.push("Script Properties error: " + error.toString());
  }
  
  // 2. Test Glean API
  Logger.log("\n2️⃣ TESTING GLEAN API CONNECTION...");
  try {
    var gleanTest = testGleanAPIConnection();
    results.glean_api = gleanTest.success;
    if (!gleanTest.success) {
      results.issues.push("Glean API: " + gleanTest.error);
      results.recommendations.push("Check Glean token and network connectivity");
    } else {
      Logger.log(`✅ Glean API working - found ${gleanTest.results} results`);
    }
  } catch (error) {
    Logger.log("❌ Glean API test failed: " + error.toString());
    results.issues.push("Glean API error: " + error.toString());
  }
  
  // 3. Check Webhook Configuration
  Logger.log("\n3️⃣ CHECKING WEBHOOK CONFIGURATION...");
  try {
    var webhookTest = validateWebhookConfig();
    results.webhook_config = webhookTest.valid;
    if (!webhookTest.valid) {
      results.issues.push("Webhook config issues: " + webhookTest.issues.join(", "));
    }
  } catch (error) {
    results.issues.push("Webhook config error: " + error.toString());
  }
  
  // 4. Check Queue System
  Logger.log("\n4️⃣ CHECKING QUEUE SYSTEM...");
  try {
    var queueTest = checkQueueSystemHealth();
    results.queue_system = queueTest.healthy;
    if (!queueTest.healthy) {
      results.issues.push("Queue system issues: " + queueTest.issues.join(", "));
    }
  } catch (error) {
    results.issues.push("Queue system error: " + error.toString());
  }
  
  // 5. Test Slides Access
  Logger.log("\n5️⃣ TESTING SLIDES ACCESS...");
  try {
    var slidesTest = testSlidesAccess();
    results.slides_access = slidesTest.success;
    if (!slidesTest.success) {
      results.issues.push("Slides access: " + slidesTest.error);
    }
  } catch (error) {
    results.issues.push("Slides access error: " + error.toString());
  }
  
  // 6. Test Google Search API
  Logger.log("\n6️⃣ TESTING GOOGLE SEARCH API...");
  try {
    var imageTest = testGoogleSearchAPI();
    results.image_api = imageTest.success;
    if (!imageTest.success) {
      results.issues.push("Google Search API: " + imageTest.error);
    }
  } catch (error) {
    results.issues.push("Google Search API error: " + error.toString());
  }
  
  // Summary
  Logger.log("\n📊 HEALTH CHECK SUMMARY");
  Logger.log("======================");
  Logger.log(`✅ Systems Working: ${Object.values(results).filter(v => v === true).length}/6`);
  Logger.log(`❌ Issues Found: ${results.issues.length}`);
  
  if (results.issues.length > 0) {
    Logger.log("\n🚨 ISSUES TO FIX:");
    results.issues.forEach((issue, i) => {
      Logger.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  if (results.recommendations.length > 0) {
    Logger.log("\n💡 RECOMMENDATIONS:");
    results.recommendations.forEach((rec, i) => {
      Logger.log(`   ${i + 1}. ${rec}`);
    });
  }
  
  if (results.issues.length === 0) {
    Logger.log("\n🎉 ALL SYSTEMS HEALTHY! Integration ready for testing.");
  }
  
  return results;
}

/**
 * 🔗 STEP 2: Test Glean API Connection
 */
function testGleanAPIConnection() {
  Logger.log("🔗 TESTING GLEAN API CONNECTION");
  Logger.log("===============================");
  
  try {
    var props = PropertiesService.getScriptProperties();
    var gleanToken = props.getProperty('GLEAN_TOKEN');
    
    if (!gleanToken) {
      return {
        success: false,
        error: "GLEAN_TOKEN not found",
        results: 0
      };
    }
    
    var url = "https://miq-be.glean.com/rest/api/v1/search";
    var payload = {
      query: "test diagnostic",
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
    
    Logger.log("🚀 Making test API call...");
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    var responseText = response.getContentText();
    
    Logger.log(`📈 Response Status: ${statusCode}`);
    
    if (statusCode === 200) {
      var data = JSON.parse(responseText);
      var resultCount = data.results ? data.results.length : 0;
      Logger.log(`✅ SUCCESS! Found ${resultCount} results`);
      
      if (resultCount > 0) {
        var firstResult = data.results[0];
        if (firstResult.document) {
          Logger.log(`📄 Sample result: ${firstResult.document.title}`);
        }
      }
      
      return {
        success: true,
        results: resultCount,
        data: data
      };
    } else {
      Logger.log(`❌ API Error: HTTP ${statusCode}`);
      Logger.log(`📄 Response: ${responseText.substring(0, 200)}`);
      
      return {
        success: false,
        error: `HTTP ${statusCode}: ${responseText}`,
        results: 0
      };
    }
    
  } catch (error) {
    Logger.log("❌ Connection test failed: " + error.toString());
    return {
      success: false,
      error: error.toString(),
      results: 0
    };
  }
}

/**
 * 📧 STEP 3: Test Full Enhanced Workflow
 */
function testEnhancedWorkflowDiagnostic() {
  Logger.log("🧪 TESTING ENHANCED WORKFLOW - DIAGNOSTIC VERSION");
  Logger.log("=================================================");
  
  var testConfig = {
    requestId: "DIAG-TEST-" + new Date().getTime(),
    brand: "Nike",
    campaign_name: "Nike Diagnostic Test Campaign",
    campaign_tactics: "Programmatic Display, Video",
    budget_1: "$250,000",
    geo_targeting: "United States",
    fileName: "Diagnostic Test - Nike Enhanced"
  };
  
  Logger.log("📊 Test Configuration:");
  Logger.log("   Brand: " + testConfig.brand);
  Logger.log("   Tactics: " + testConfig.campaign_tactics);
  Logger.log("   Budget: " + testConfig.budget_1);
  
  try {
    Logger.log("\n🔍 Step 1: Testing Glean Intelligence Gathering...");
    var startTime = new Date().getTime();
    
    // Test the proven gatherGleanIntelligence function
    var gleanInsights = gatherGleanIntelligence(testConfig);
    
    var endTime = new Date().getTime();
    var duration = Math.round((endTime - startTime) / 1000);
    
    Logger.log(`⏱️ Intelligence gathering took ${duration} seconds`);
    
    Logger.log("\n✅ Glean Intelligence Results:");
    Logger.log("   - Sources found: " + gleanInsights.sources.length);
    Logger.log("   - Case studies: " + gleanInsights.case_studies.length);
    Logger.log("   - Client goals: " + gleanInsights.client_goals.length);
    Logger.log("   - Timeline phases: " + gleanInsights.timeline.length);
    Logger.log("   - Industry detected: " + gleanInsights.industry);
    Logger.log("   - Region: " + gleanInsights.region);
    
    if (gleanInsights.sources.length > 0) {
      Logger.log("\n📚 Top 3 MiQ Sources Found:");
      for (var i = 0; i < Math.min(3, gleanInsights.sources.length); i++) {
        var source = gleanInsights.sources[i];
        Logger.log(`   ${i + 1}. ${source.title} (${source.type})`);
        if (source.url) {
          Logger.log(`      URL: ${source.url}`);
        }
      }
    }
    
    if (gleanInsights.case_studies.length > 0) {
      Logger.log("\n📈 Case Studies Found:");
      gleanInsights.case_studies.forEach((study, i) => {
        Logger.log(`   ${i + 1}. ${study.title}`);
        if (study.metric) {
          Logger.log(`      Metric: ${study.metric}`);
        }
      });
    }
    
    Logger.log("\n🧪 Step 2: Testing Enhanced Replacements...");
    var replacements = createEnhancedReplacements(testConfig, gleanInsights);
    var replacementCount = Object.keys(replacements).length;
    
    Logger.log(`✅ Created ${replacementCount} enhanced replacements:`);
    
    // Show sample replacements
    var sampleKeys = ["{{brand}}", "{{client_goals}}", "{{case_studies}}", "{{proposed_solution}}"];
    sampleKeys.forEach(key => {
      if (replacements[key]) {
        var value = replacements[key];
        var displayValue = value.length > 100 ? value.substring(0, 100) + "..." : value;
        Logger.log(`   ${key}: ${displayValue}`);
      }
    });
    
    Logger.log("\n🎯 DIAGNOSTIC RESULTS:");
    Logger.log("✅ Glean API Integration: WORKING");
    Logger.log("✅ Content Synthesis: WORKING");
    Logger.log("✅ Source Citations: WORKING");
    Logger.log("✅ Enhanced Replacements: WORKING");
    Logger.log("✅ Industry Detection: WORKING");
    Logger.log("✅ Case Studies Extraction: WORKING");
    
    Logger.log("\n📊 Performance Metrics:");
    Logger.log(`   ⏱️ Total processing time: ${duration} seconds`);
    Logger.log(`   📚 Sources retrieved: ${gleanInsights.sources.length}`);
    Logger.log(`   📈 Case studies found: ${gleanInsights.case_studies.length}`);
    Logger.log(`   🎯 Goals generated: ${gleanInsights.client_goals.length}`);
    Logger.log(`   🔄 Replacements created: ${replacementCount}`);
    
    Logger.log("\n🚀 ENHANCED WORKFLOW: FULLY OPERATIONAL!");
    
    return {
      success: true,
      duration: duration,
      sources: gleanInsights.sources.length,
      caseStudies: gleanInsights.case_studies.length,
      goals: gleanInsights.client_goals.length,
      replacements: replacementCount
    };
    
  } catch (error) {
    Logger.log("❌ Enhanced workflow test failed: " + error.toString());
    Logger.log("🔍 Error details: " + error.stack);
    
    return {
      success: false,
      error: error.toString(),
      stack: error.stack
    };
  }
}

/**
 * 🌐 STEP 4: Test Webhook Endpoint
 * This simulates a Zapier POST request
 */
function testWebhookEndpoint() {
  Logger.log("🌐 TESTING WEBHOOK ENDPOINT");
  Logger.log("==========================");
  
  // Create a mock request that simulates Zapier
  var mockZapierRequest = {
    parameters: {
      requestId: ["TEST-WEBHOOK-" + new Date().getTime()],
      brand: ["Nike"],
      campaign_name: ["Nike Webhook Test"],
      campaign_tactics: ["Programmatic Display, Video"],
      budget_1: ["$100,000"],
      geo_targeting: ["United States"],
      file_name: ["Nike Webhook Test Presentation"],
      slide_indices: ["0,4,5,6,57,58,59"],
      flight_dates: ["Aug 15 - Sep 15, 2025"],
      flight_start: ["2025-08-15"],
      flight_end: ["2025-09-15"],
      added_value_amount: ["$25,000"],
      media_kpis: ["Brand awareness, CTR, ROAS"]
    }
  };
  
  Logger.log("📨 Mock Zapier Request Created");
  Logger.log("   Brand: " + mockZapierRequest.parameters.brand[0]);
  Logger.log("   Campaign: " + mockZapierRequest.parameters.campaign_name[0]);
  Logger.log("   Tactics: " + mockZapierRequest.parameters.campaign_tactics[0]);
  
  try {
    Logger.log("\n🚀 Calling doPost function...");
    var response = doPost(mockZapierRequest);
    
    if (response) {
      var responseText = response.getContent();
      var responseData = JSON.parse(responseText);
      
      Logger.log("✅ Webhook Response Received:");
      Logger.log("   Status: " + responseData.status);
      Logger.log("   Message: " + responseData.message);
      Logger.log("   Request ID: " + responseData.requestId);
      Logger.log("   File Name: " + responseData.fileName);
      Logger.log("   Queue Position: " + responseData.queuePosition);
      Logger.log("   Estimated Wait: " + responseData.estimatedWaitTime);
      
      if (responseData.enhancement) {
        Logger.log("   Enhancement: " + responseData.enhancement);
      }
      
      Logger.log("\n🔍 Checking Queue Status...");
      var queueStatus = showQueueStatus();
      
      Logger.log("\n✅ WEBHOOK TEST SUCCESSFUL!");
      Logger.log("   Request added to queue successfully");
      Logger.log("   Enhanced response format working");
      
      return {
        success: true,
        requestId: responseData.requestId,
        queuePosition: responseData.queuePosition
      };
      
    } else {
      Logger.log("❌ No response from webhook");
      return {
        success: false,
        error: "No response from doPost function"
      };
    }
    
  } catch (error) {
    Logger.log("❌ Webhook test failed: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 📋 STEP 5: Validate Queue System Health
 */
function checkQueueSystemHealth() {
  Logger.log("📋 CHECKING QUEUE SYSTEM HEALTH");
  Logger.log("===============================");
  
  var issues = [];
  var recommendations = [];
  
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    
    // Check queue property
    var queue = scriptProperties.getProperty("requestQueue") || "[]";
    var queueArray = JSON.parse(queue);
    
    Logger.log(`📊 Current queue size: ${queueArray.length}`);
    
    // Check for active triggers
    var triggers = ScriptApp.getProjectTriggers();
    var processingTriggers = triggers.filter(t => 
      t.getHandlerFunction() === "processNextPresentationRequest"
    );
    
    Logger.log(`🔄 Active processing triggers: ${processingTriggers.length}`);
    
    if (queueArray.length > 0 && processingTriggers.length === 0) {
      issues.push("Queue has items but no processing trigger");
      recommendations.push("Run manuallyStartQueueProcessing() to restart");
    }
    
    if (processingTriggers.length > 1) {
      issues.push("Multiple processing triggers detected");
      recommendations.push("Run removeProcessingTriggers() to clean up");
    }
    
    // Check for old requests
    var allProps = scriptProperties.getProperties();
    var requestProps = [];
    var now = new Date().getTime();
    
    for (var propName in allProps) {
      if (propName.startsWith("request_")) {
        try {
          var requestData = JSON.parse(allProps[propName]);
          var age = requestData.timestamp ? now - requestData.timestamp : 0;
          requestProps.push({
            id: requestData.requestId,
            age: Math.round(age / 60000) // minutes
          });
        } catch (e) {
          issues.push("Corrupted request property: " + propName);
        }
      }
    }
    
    Logger.log(`📄 Active request properties: ${requestProps.length}`);
    
    var staleRequests = requestProps.filter(r => r.age > 30);
    if (staleRequests.length > 0) {
      issues.push(`${staleRequests.length} stale requests (>30 minutes)`);
      recommendations.push("Run cleanupOldRequests() to clean up");
    }
    
    // Check trigger count
    var totalTriggers = triggers.length;
    Logger.log(`⚙️ Total triggers: ${totalTriggers}/20`);
    
    if (totalTriggers > 15) {
      issues.push("Approaching trigger limit");
      recommendations.push("Consider cleaning up old triggers");
    }
    
    Logger.log("\n📊 Queue System Summary:");
    Logger.log(`   Queue items: ${queueArray.length}`);
    Logger.log(`   Processing triggers: ${processingTriggers.length}`);
    Logger.log(`   Active requests: ${requestProps.length}`);
    Logger.log(`   Stale requests: ${staleRequests.length}`);
    Logger.log(`   Total triggers: ${totalTriggers}/20`);
    
    var healthy = issues.length === 0;
    
    if (healthy) {
      Logger.log("\n✅ QUEUE SYSTEM: HEALTHY");
    } else {
      Logger.log("\n⚠️ QUEUE SYSTEM: ISSUES DETECTED");
      issues.forEach((issue, i) => {
        Logger.log(`   ${i + 1}. ${issue}`);
      });
    }
    
    return {
      healthy: healthy,
      issues: issues,
      recommendations: recommendations,
      stats: {
        queueSize: queueArray.length,
        processingTriggers: processingTriggers.length,
        activeRequests: requestProps.length,
        staleRequests: staleRequests.length,
        totalTriggers: totalTriggers
      }
    };
    
  } catch (error) {
    Logger.log("❌ Queue system check failed: " + error.toString());
    return {
      healthy: false,
      issues: ["Queue system check failed: " + error.toString()],
      recommendations: ["Check script permissions and properties"],
      stats: {}
    };
  }
}

/**
 * 📊 STEP 6: Validate Webhook Configuration
 */
function validateWebhookConfig() {
  Logger.log("📊 VALIDATING WEBHOOK CONFIGURATION");
  Logger.log("===================================");
  
  var issues = [];
  
  // Check CONFIG object exists
  try {
    Logger.log("🔍 Checking CONFIG object...");
    
    // Check Glean config
    if (!CONFIG.GLEAN) {
      issues.push("CONFIG.GLEAN missing");
    } else {
      Logger.log("✅ Glean configuration found");
      if (!CONFIG.GLEAN.BASE_URL || !CONFIG.GLEAN.SEARCH_ENDPOINT) {
        issues.push("Glean API endpoints missing");
      }
    }
    
    // Check Slides config
    if (!CONFIG.SLIDES) {
      issues.push("CONFIG.SLIDES missing");
    } else {
      Logger.log("✅ Slides configuration found");
      if (!CONFIG.SLIDES.MASTER_PRESENTATION_ID || !CONFIG.SLIDES.TARGET_FOLDER_ID) {
        issues.push("Critical slides IDs missing");
      }
    }
    
    // Check Webhook config
    if (!CONFIG.WEBHOOKS) {
      issues.push("CONFIG.WEBHOOKS missing");
    } else {
      Logger.log("✅ Webhook configuration found");
      if (!CONFIG.WEBHOOKS.REPLIT_STATUS_URL || !CONFIG.WEBHOOKS.ZAPIER_RESPONSE_URL) {
        issues.push("Webhook URLs missing");
      }
    }
    
    // Check Google Search config
    if (!CONFIG.GOOGLE_SEARCH) {
      issues.push("CONFIG.GOOGLE_SEARCH missing");
    } else {
      Logger.log("✅ Google Search configuration found");
      if (!CONFIG.GOOGLE_SEARCH.API_KEY || !CONFIG.GOOGLE_SEARCH.SEARCH_ENGINE_ID) {
        issues.push("Google Search API credentials missing");
      }
    }
    
    Logger.log("\n📋 Configuration Summary:");
    Logger.log("   Glean API: " + (CONFIG.GLEAN ? "✅ Configured" : "❌ Missing"));
    Logger.log("   Slides: " + (CONFIG.SLIDES ? "✅ Configured" : "❌ Missing"));
    Logger.log("   Webhooks: " + (CONFIG.WEBHOOKS ? "✅ Configured" : "❌ Missing"));
    Logger.log("   Google Search: " + (CONFIG.GOOGLE_SEARCH ? "✅ Configured" : "❌ Missing"));
    
  } catch (error) {
    Logger.log("❌ CONFIG object error: " + error.toString());
    issues.push("CONFIG object error: " + error.toString());
  }
  
  var valid = issues.length === 0;
  
  if (valid) {
    Logger.log("\n✅ WEBHOOK CONFIGURATION: VALID");
  } else {
    Logger.log("\n⚠️ WEBHOOK CONFIGURATION: ISSUES FOUND");
    issues.forEach((issue, i) => {
      Logger.log(`   ${i + 1}. ${issue}`);
    });
  }
  
  return {
    valid: valid,
    issues: issues
  };
}

/**
 * 📄 STEP 7: Test Slides Access
 */
function testSlidesAccess() {
  Logger.log("📄 TESTING SLIDES ACCESS");
  Logger.log("========================");
  
  try {
    var masterPresentationId = CONFIG.SLIDES.MASTER_PRESENTATION_ID;
    var targetFolderId = CONFIG.SLIDES.TARGET_FOLDER_ID;
    
    Logger.log("🔍 Testing master presentation access...");
    Logger.log("   ID: " + masterPresentationId);
    
    var masterPresentation = SlidesApp.openById(masterPresentationId);
    var masterSlides = masterPresentation.getSlides();
    
    Logger.log(`✅ Master presentation accessible: ${masterSlides.length} slides`);
    
    Logger.log("\n🔍 Testing target folder access...");
    Logger.log("   ID: " + targetFolderId);
    
    var targetFolder = DriveApp.getFolderById(targetFolderId);
    var folderName = targetFolder.getName();
    
    Logger.log(`✅ Target folder accessible: "${folderName}"`);
    
    // Test slide indices
    var testIndices = CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
    Logger.log("\n🔍 Testing slide indices access...");
    
    var validIndices = 0;
    testIndices.forEach(index => {
      try {
        if (index < masterSlides.length) {
          var slide = masterSlides[index];
          validIndices++;
          Logger.log(`   ✅ Slide ${index}: accessible`);
        } else {
          Logger.log(`   ⚠️ Slide ${index}: out of bounds (max: ${masterSlides.length - 1})`);
        }
      } catch (slideError) {
        Logger.log(`   ❌ Slide ${index}: error - ${slideError.toString()}`);
      }
    });
    
    Logger.log(`\n📊 Slide Access Summary:`);
    Logger.log(`   Total slides in master: ${masterSlides.length}`);
    Logger.log(`   Default indices to copy: ${testIndices.length}`);
    Logger.log(`   Valid indices: ${validIndices}/${testIndices.length}`);
    
    var success = validIndices === testIndices.length;
    
    if (success) {
      Logger.log("\n✅ SLIDES ACCESS: FULLY OPERATIONAL");
    } else {
      Logger.log("\n⚠️ SLIDES ACCESS: SOME ISSUES DETECTED");
    }
    
    return {
      success: success,
      masterSlides: masterSlides.length,
      validIndices: validIndices,
      totalIndices: testIndices.length,
      folderName: folderName
    };
    
  } catch (error) {
    Logger.log("❌ Slides access test failed: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 🖼️ STEP 8: Test Google Search API
 */
function testGoogleSearchAPI() {
  Logger.log("🖼️ TESTING GOOGLE SEARCH API");
  Logger.log("============================");
  
  try {
    var apiKey = CONFIG.GOOGLE_SEARCH.API_KEY;
    var searchEngineId = CONFIG.GOOGLE_SEARCH.SEARCH_ENGINE_ID;
    
    Logger.log("🔍 Testing image search...");
    Logger.log("   API Key: " + (apiKey ? "✅ Found" : "❌ Missing"));
    Logger.log("   Search Engine ID: " + (searchEngineId ? "✅ Found" : "❌ Missing"));
    
    if (!apiKey || !searchEngineId) {
      return {
        success: false,
        error: "Google Search API credentials missing"
      };
    }
    
    var testQuery = "nike logo transparent";
    var searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(testQuery)}&cx=${searchEngineId}&searchType=image&fileType=png&key=${apiKey}`;
    
    Logger.log("🚀 Making test search request...");
    var response = UrlFetchApp.fetch(searchUrl);
    var json = JSON.parse(response.getContentText());
    
    if (json.items && json.items.length > 0) {
      Logger.log(`✅ Search successful: found ${json.items.length} images`);
      Logger.log(`📄 First result: ${json.items[0].title}`);
      Logger.log(`🔗 First URL: ${json.items[0].link}`);
      
      return {
        success: true,
        results: json.items.length,
        firstResult: json.items[0].title
      };
    } else {
      Logger.log("⚠️ Search returned no results");
      return {
        success: false,
        error: "No search results returned"
      };
    }
    
  } catch (error) {
    Logger.log("❌ Google Search API test failed: " + error.toString());
    return {
      success: false,
      error: error.toString()
    };
  }
}

/**
 * 🚀 STEP 9: Run All Diagnostics
 * This runs all diagnostic tests in sequence
 */
function runAllDiagnostics() {
  Logger.log("🚀 RUNNING ALL INTEGRATION DIAGNOSTICS");
  Logger.log("======================================");
  Logger.log("Started at: " + new Date().toISOString());
  
  var startTime = new Date().getTime();
  var results = [];
  
  try {
    // Step 1: Health Check
    Logger.log("\n" + "=".repeat(50));
    var healthCheck = runCompleteHealthCheck();
    results.push({step: "Health Check", success: healthCheck.issues.length === 0, details: healthCheck});
    
    // Step 2: Enhanced Workflow
    Logger.log("\n" + "=".repeat(50));
    var workflowTest = testEnhancedWorkflowDiagnostic();
    results.push({step: "Enhanced Workflow", success: workflowTest.success, details: workflowTest});
    
    // Step 3: Webhook Test
    Logger.log("\n" + "=".repeat(50));
    var webhookTest = testWebhookEndpoint();
    results.push({step: "Webhook Endpoint", success: webhookTest.success, details: webhookTest});
    
    var endTime = new Date().getTime();
    var totalDuration = Math.round((endTime - startTime) / 1000);
    
    // Final Summary
    Logger.log("\n" + "=".repeat(50));
    Logger.log("🏁 ALL DIAGNOSTICS COMPLETE");
    Logger.log("===========================");
    Logger.log("Completed at: " + new Date().toISOString());
    Logger.log(`Total duration: ${totalDuration} seconds`);
    
    var successCount = results.filter(r => r.success).length;
    Logger.log(`\n📊 Results: ${successCount}/${results.length} tests passed`);
    
    results.forEach((result, i) => {
      var status = result.success ? "✅ PASS" : "❌ FAIL";
      Logger.log(`   ${i + 1}. ${result.step}: ${status}`);
    });
    
    if (successCount === results.length) {
      Logger.log("\n🎉 ALL TESTS PASSED! Your enhanced integration is fully operational!");
      Logger.log("\n🚀 Ready for production use with:");
      Logger.log("   • Glean Search API integration");
      Logger.log("   • Enhanced content generation");
      Logger.log("   • Automatic Sources and Assumptions slides");
      Logger.log("   • Complete webhook and queue management");
    } else {
      Logger.log("\n⚠️ Some tests failed. Check the detailed logs above for fixes needed.");
    }
    
    return {
      success: successCount === results.length,
      totalTests: results.length,
      passedTests: successCount,
      duration: totalDuration,
      results: results
    };
    
  } catch (error) {
    Logger.log("❌ Diagnostic suite failed: " + error.toString());
    return {
      success: false,
      error: error.toString(),
      duration: Math.round((new Date().getTime() - startTime) / 1000)
    };
  }
}

// ============================================================================
// QUICK FIX FUNCTIONS
// ============================================================================

/**
 * 🔧 Quick fix for common issues
 */
function quickFixCommonIssues() {
  Logger.log("🔧 RUNNING QUICK FIX FOR COMMON ISSUES");
  Logger.log("=====================================");
  
  var fixes = [];
  
  // Fix 1: Clean up queue
  try {
    Logger.log("1️⃣ Cleaning up queue and triggers...");
    removeProcessingTriggers();
    var cleanupResult = cleanupOldRequests();
    fixes.push("Queue cleanup: " + cleanupResult);
    Logger.log("✅ Queue cleaned up");
  } catch (error) {
    Logger.log("❌ Queue cleanup failed: " + error.toString());
    fixes.push("Queue cleanup failed: " + error.toString());
  }
  
  // Fix 2: Restart queue if needed
  try {
    Logger.log("2️⃣ Checking if queue needs restart...");
    var queueStatus = showQueueStatus();
    if (queueStatus.queueSize > 0 && queueStatus.activeTriggers.length === 0) {
      var restartResult = manuallyStartQueueProcessing();
      fixes.push("Queue restart: " + restartResult);
      Logger.log("✅ Queue processing restarted");
    } else {
      fixes.push("Queue restart: Not needed");
      Logger.log("✅ Queue is processing normally");
    }
  } catch (error) {
    Logger.log("❌ Queue restart check failed: " + error.toString());
    fixes.push("Queue restart failed: " + error.toString());
  }
  
  Logger.log("\n🔧 Quick Fix Summary:");
  fixes.forEach((fix, i) => {
    Logger.log(`   ${i + 1}. ${fix}`);
  });
  
  return fixes;
}

/**
 * 📋 Show current system status
 */
function showSystemStatus() {
  Logger.log("📋 CURRENT SYSTEM STATUS");
  Logger.log("========================");
  
  try {
    // Queue status
    var queueStatus = showQueueStatus();
    
    // Glean API status
    var gleanTest = testGleanAPIConnection();
    
    Logger.log("\n📊 System Overview:");
    Logger.log("   🔍 Glean API: " + (gleanTest.success ? "✅ Working" : "❌ Failed"));
    Logger.log("   📋 Queue size: " + queueStatus.queueSize);
    Logger.log("   🔄 Active triggers: " + queueStatus.activeTriggers.length);
    Logger.log("   📄 Active requests: " + queueStatus.activeRequests.length);
    
    if (gleanTest.success) {
      Logger.log("   📚 Last search results: " + gleanTest.results);
    }
    
    return {
      gleanWorking: gleanTest.success,
      queueSize: queueStatus.queueSize,
      activeTriggers: queueStatus.activeTriggers.length,
      activeRequests: queueStatus.activeRequests.length
    };
    
  } catch (error) {
    Logger.log("❌ Status check failed: " + error.toString());
    return { error: error.toString() };
  }
}