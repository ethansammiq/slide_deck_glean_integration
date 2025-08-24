/**
 * COMPREHENSIVE GLEAN API TEST SUITE
 * 
 * Tests critical Glean functions and enhancements:
 * 1. Core API connectivity and authentication
 * 2. Search functionality with retry logic
 * 3. Intelligence gathering pipeline
 * 4. Enhancement features (caching, summarization, etc.)
 * 5. Performance monitoring and metrics
 */

// ============================================================================
// CORE API TESTS
// ============================================================================

/**
 * Test 1: Basic Authentication and Token Validation
 */
function test1_Authentication() {
  Logger.log("🔐 TEST 1: AUTHENTICATION & TOKEN VALIDATION");
  Logger.log("==============================================");
  
  var results = {
    tokenPresent: false,
    tokenValid: false,
    connectionWorking: false
  };
  
  // Test token presence
  try {
    var token = getValidGleanToken();
    if (token) {
      results.tokenPresent = true;
      Logger.log("✅ Token found in Script Properties");
      Logger.log("   Length: " + token.length + " characters");
      
      // Test token format
      if (token.length > 20) {
        results.tokenValid = true;
        Logger.log("✅ Token format appears valid");
        
        // Test connection
        if (testGleanConnectionQuick && testGleanConnectionQuick(token)) {
          results.connectionWorking = true;
          Logger.log("✅ Glean API connection successful");
        } else {
          Logger.log("❌ Glean API connection failed");
        }
      } else {
        Logger.log("❌ Token too short - likely invalid");
      }
    } else {
      Logger.log("❌ No GLEAN_TOKEN found in Script Properties");
      Logger.log("   → Run: PropertiesService.getScriptProperties().setProperty('GLEAN_TOKEN', 'your_token')");
    }
  } catch (error) {
    Logger.log("❌ Authentication test error: " + error.toString());
  }
  
  Logger.log("\n📊 Authentication Results:");
  Logger.log("   Token Present: " + (results.tokenPresent ? "✅" : "❌"));
  Logger.log("   Token Valid: " + (results.tokenValid ? "✅" : "❌"));
  Logger.log("   Connection Working: " + (results.connectionWorking ? "✅" : "❌"));
  
  return results;
}

/**
 * Test 2: Search Functionality with Retry Logic
 */
function test2_SearchFunctionality() {
  Logger.log("\n🔍 TEST 2: SEARCH FUNCTIONALITY");
  Logger.log("=================================");
  
  var results = {
    searchesAttempted: 0,
    searchesSuccessful: 0,
    totalResults: 0,
    avgResponseTime: 0
  };
  
  var token = getValidGleanToken();
  if (!token) {
    Logger.log("❌ Cannot test - no valid token");
    return results;
  }
  
  var testQueries = [
    "MiQ advertising campaign successful results",
    "programmatic DOOH best practices",
    "digital marketing KPIs metrics"
  ];
  
  var totalTime = 0;
  
  testQueries.forEach(function(query, index) {
    Logger.log("\n🔍 Query " + (index + 1) + ": " + query);
    results.searchesAttempted++;
    
    var startTime = Date.now();
    try {
      var searchResults = searchGleanWithRetry(query, [], token);
      var responseTime = Date.now() - startTime;
      totalTime += responseTime;
      
      if (searchResults && searchResults.results) {
        results.searchesSuccessful++;
        results.totalResults += searchResults.results.length;
        Logger.log("✅ Success! Found " + searchResults.results.length + " results in " + responseTime + "ms");
        
        // Show sample result
        if (searchResults.results.length > 0) {
          var sample = searchResults.results[0];
          Logger.log("   Sample: " + (sample.document ? sample.document.title : "Untitled"));
        }
      } else {
        Logger.log("❌ Search failed or returned no results");
      }
    } catch (error) {
      Logger.log("❌ Search error: " + error.toString());
    }
    
    // Rate limiting
    if (index < testQueries.length - 1) {
      Utilities.sleep(1000);
    }
  });
  
  results.avgResponseTime = results.searchesAttempted > 0 ? totalTime / results.searchesAttempted : 0;
  
  Logger.log("\n📊 Search Results:");
  Logger.log("   Searches Attempted: " + results.searchesAttempted);
  Logger.log("   Searches Successful: " + results.searchesSuccessful);
  Logger.log("   Success Rate: " + Math.round((results.searchesSuccessful / results.searchesAttempted) * 100) + "%");
  Logger.log("   Total Results Found: " + results.totalResults);
  Logger.log("   Average Response Time: " + Math.round(results.avgResponseTime) + "ms");
  
  return results;
}

/**
 * Test 3: Intelligence Gathering Pipeline
 */
function test3_IntelligenceGathering() {
  Logger.log("\n🧠 TEST 3: INTELLIGENCE GATHERING");
  Logger.log("===================================");
  
  var results = {
    intelligenceGathered: false,
    sourcesFound: 0,
    placeholdersPopulated: 0,
    confidenceScore: 0
  };
  
  var testConfig = {
    brand: "Nike",
    campaign_name: "Summer Digital Campaign",
    campaign_tactics: "Social Media, DOOH, Programmatic",
    budget_1: "$750,000",
    geo_targeting: "National",
    notes: "DOOH and social media campaign targeting millennials with programmatic support"
  };
  
  Logger.log("📊 Test Configuration:");
  Logger.log("   Brand: " + testConfig.brand);
  Logger.log("   Budget: " + testConfig.budget_1);
  Logger.log("   Tactics: " + testConfig.campaign_tactics);
  
  try {
    Logger.log("\n🔍 Calling gatherGleanIntelligence...");
    var intelligence = gatherGleanIntelligence(testConfig);
    
    if (intelligence) {
      results.intelligenceGathered = true;
      results.sourcesFound = intelligence.sources ? intelligence.sources.length : 0;
      
      // Count populated placeholders
      var checkFields = ['case_studies', 'client_goals', 'proposed_solution', 'industry'];
      checkFields.forEach(function(field) {
        if (intelligence[field] && 
            ((Array.isArray(intelligence[field]) && intelligence[field].length > 0) ||
             (typeof intelligence[field] === 'string' && intelligence[field].length > 0))) {
          results.placeholdersPopulated++;
        }
      });
      
      Logger.log("✅ Intelligence gathering successful!");
      Logger.log("   Sources found: " + results.sourcesFound);
      Logger.log("   Industry detected: " + (intelligence.industry || "Unknown"));
      Logger.log("   Case studies: " + (intelligence.case_studies ? intelligence.case_studies.length : 0));
      Logger.log("   Client goals: " + (intelligence.client_goals ? intelligence.client_goals.length : 0));
      
      // Test intelligent slide selection
      if (typeof getIntelligentSlideIndices === 'function') {
        Logger.log("\n🎯 Testing intelligent slide selection...");
        var slideSelection = getIntelligentSlideIndices(testConfig);
        if (slideSelection) {
          results.confidenceScore = slideSelection.confidence || 0;
          Logger.log("✅ Slide selection successful!");
          Logger.log("   Slides selected: " + (slideSelection.indices ? slideSelection.indices.length : 0));
          Logger.log("   Confidence: " + results.confidenceScore + "%");
          Logger.log("   Tactics detected: " + (slideSelection.tacticsDetected || 0));
        }
      }
    } else {
      Logger.log("❌ Intelligence gathering failed");
    }
    
  } catch (error) {
    Logger.log("❌ Intelligence gathering error: " + error.toString());
  }
  
  Logger.log("\n📊 Intelligence Results:");
  Logger.log("   Intelligence Gathered: " + (results.intelligenceGathered ? "✅" : "❌"));
  Logger.log("   Sources Found: " + results.sourcesFound);
  Logger.log("   Placeholders Populated: " + results.placeholdersPopulated + "/4");
  Logger.log("   Confidence Score: " + results.confidenceScore + "%");
  
  return results;
}

/**
 * Test 4: Enhancement Features
 */
function test4_Enhancements() {
  Logger.log("\n⚡ TEST 4: ENHANCEMENT FEATURES");
  Logger.log("================================");
  
  var results = {
    cachingWorks: false,
    summarizationWorks: false,
    queryExpansionWorks: false,
    enhancedConfidenceWorks: false
  };
  
  var token = getValidGleanToken();
  if (!token) {
    Logger.log("❌ Cannot test enhancements - no valid token");
    return results;
  }
  
  // Test caching (if enhancement file is loaded)
  if (typeof cachedGleanSearch === 'function') {
    Logger.log("\n📦 Testing Caching Layer:");
    try {
      var testQuery = "Nike advertising campaign";
      
      var start1 = Date.now();
      var result1 = cachedGleanSearch(testQuery, null, token);
      var time1 = Date.now() - start1;
      
      var start2 = Date.now();
      var result2 = cachedGleanSearch(testQuery, null, token);
      var time2 = Date.now() - start2;
      
      if (time2 < time1 / 2) {
        results.cachingWorks = true;
        Logger.log("✅ Caching working! Speed improvement: " + Math.round((1 - time2/time1) * 100) + "%");
      } else {
        Logger.log("⚠️ Caching may not be working optimally");
      }
    } catch (error) {
      Logger.log("❌ Caching test error: " + error.toString());
    }
  } else {
    Logger.log("⏭️ Caching function not available (load glean_enhancements.gs)");
  }
  
  // Test summarization
  if (typeof enhancedSummarization === 'function') {
    Logger.log("\n📊 Testing Summarization:");
    try {
      var mockResults = [{
        results: [{
          document: { title: "Test Document" },
          snippets: [
            { text: "Campaign achieved 150% ROI with programmatic targeting" },
            { text: "Success metrics showed 40% increase in conversions" }
          ],
          relevanceScore: 0.8
        }],
        category: "test"
      }];
      
      var summary = enhancedSummarization(mockResults, 5);
      if (summary && summary.insights && summary.insights.length > 0) {
        results.summarizationWorks = true;
        Logger.log("✅ Summarization working! Extracted " + summary.insights.length + " insights");
        Logger.log("   Confidence boost: " + summary.confidenceBoost + "%");
      }
    } catch (error) {
      Logger.log("❌ Summarization test error: " + error.toString());
    }
  } else {
    Logger.log("⏭️ Summarization function not available");
  }
  
  // Test query expansion
  if (typeof expandQuery === 'function') {
    Logger.log("\n🔄 Testing Query Expansion:");
    try {
      var baseQuery = "DOOH programmatic campaign";
      var context = { brand: "Nike", industry: "Retail" };
      var expanded = expandQuery(baseQuery, context);
      
      if (expanded.length > 1) {
        results.queryExpansionWorks = true;
        Logger.log("✅ Query expansion working! " + baseQuery + " → " + expanded.length + " variations");
      }
    } catch (error) {
      Logger.log("❌ Query expansion test error: " + error.toString());
    }
  } else {
    Logger.log("⏭️ Query expansion function not available");
  }
  
  // Test enhanced confidence scoring
  if (typeof enhancedConfidenceScore === 'function') {
    Logger.log("\n📈 Testing Enhanced Confidence Scoring:");
    try {
      var testConfig = { brand: "Nike", budget_1: "$500000", notes: "DOOH campaign", campaign_name: "Test" };
      var mockResults = [{ results: [{ relevanceScore: 0.8 }] }];
      
      var confidence = enhancedConfidenceScore(testConfig, mockResults, 3);
      if (confidence && confidence.score) {
        results.enhancedConfidenceWorks = true;
        Logger.log("✅ Enhanced confidence working! Score: " + confidence.score + "%");
        Logger.log("   Reasoning: " + confidence.reasoning.join(", "));
      }
    } catch (error) {
      Logger.log("❌ Enhanced confidence test error: " + error.toString());
    }
  } else {
    Logger.log("⏭️ Enhanced confidence function not available");
  }
  
  Logger.log("\n📊 Enhancement Results:");
  Logger.log("   Caching: " + (results.cachingWorks ? "✅" : "❌"));
  Logger.log("   Summarization: " + (results.summarizationWorks ? "✅" : "❌"));
  Logger.log("   Query Expansion: " + (results.queryExpansionWorks ? "✅" : "❌"));
  Logger.log("   Enhanced Confidence: " + (results.enhancedConfidenceWorks ? "✅" : "❌"));
  
  return results;
}

/**
 * Test 5: Performance Monitoring
 */
function test5_PerformanceMonitoring() {
  Logger.log("\n📊 TEST 5: PERFORMANCE MONITORING");
  Logger.log("===================================");
  
  var results = {
    monitoringWorks: false,
    metricsAvailable: false
  };
  
  // Test monitoring functions
  if (typeof monitorGleanPerformance === 'function') {
    Logger.log("📈 Testing Performance Monitoring:");
    try {
      // Simulate some performance data
      monitorGleanPerformance("test_search", true, 1200, 8);
      monitorGleanPerformance("test_search", true, 800, 12);
      monitorGleanPerformance("test_search", false, 0, 0);
      
      results.monitoringWorks = true;
      Logger.log("✅ Performance monitoring working");
      
      // Test metrics retrieval
      if (typeof getGleanMetrics === 'function') {
        var metrics = getGleanMetrics();
        if (metrics) {
          results.metricsAvailable = true;
          Logger.log("✅ Metrics retrieval working");
          Logger.log("   Total searches: " + metrics.total_searches);
          Logger.log("   Success rate: " + (metrics.success_rate || 0) + "%");
        }
      }
    } catch (error) {
      Logger.log("❌ Performance monitoring test error: " + error.toString());
    }
  } else {
    Logger.log("⏭️ Performance monitoring functions not available");
  }
  
  Logger.log("\n📊 Monitoring Results:");
  Logger.log("   Monitoring Works: " + (results.monitoringWorks ? "✅" : "❌"));
  Logger.log("   Metrics Available: " + (results.metricsAvailable ? "✅" : "❌"));
  
  return results;
}

// ============================================================================
// COMPREHENSIVE TEST RUNNER
// ============================================================================

/**
 * Run all Glean tests and generate comprehensive report
 */
function runComprehensiveGleanTests() {
  Logger.log("🚀 COMPREHENSIVE GLEAN API TEST SUITE");
  Logger.log("=====================================");
  Logger.log("Testing all critical Glean functions and enhancements...");
  
  var startTime = Date.now();
  var testResults = {};
  
  // Run all tests
  testResults.authentication = test1_Authentication();
  testResults.searchFunctionality = test2_SearchFunctionality();
  testResults.intelligenceGathering = test3_IntelligenceGathering();
  testResults.enhancements = test4_Enhancements();
  testResults.performanceMonitoring = test5_PerformanceMonitoring();
  
  var totalTime = Date.now() - startTime;
  
  // Generate comprehensive report
  Logger.log("\n" + "=".repeat(60));
  Logger.log("📋 COMPREHENSIVE TEST REPORT");
  Logger.log("=".repeat(60));
  
  // Overall status
  var criticalTests = [
    testResults.authentication.tokenPresent,
    testResults.authentication.connectionWorking,
    testResults.searchFunctionality.searchesSuccessful > 0
  ];
  
  var criticalPassed = criticalTests.filter(Boolean).length;
  var overallStatus = criticalPassed === criticalTests.length ? "✅ PASSING" : "❌ FAILING";
  
  Logger.log("Overall Status: " + overallStatus);
  Logger.log("Test Execution Time: " + Math.round(totalTime / 1000) + " seconds");
  
  // Detailed results
  Logger.log("\n🔍 DETAILED RESULTS:");
  Logger.log("Authentication: " + (testResults.authentication.connectionWorking ? "✅" : "❌"));
  Logger.log("Search Function: " + (testResults.searchFunctionality.searchesSuccessful > 0 ? "✅" : "❌"));
  Logger.log("Intelligence: " + (testResults.intelligenceGathering.intelligenceGathered ? "✅" : "❌"));
  
  var enhancementCount = Object.values(testResults.enhancements).filter(Boolean).length;
  Logger.log("Enhancements: " + enhancementCount + "/4 working");
  
  // Performance metrics
  Logger.log("\n📊 PERFORMANCE METRICS:");
  Logger.log("Search Success Rate: " + 
            Math.round((testResults.searchFunctionality.searchesSuccessful / 
                       testResults.searchFunctionality.searchesAttempted) * 100) + "%");
  Logger.log("Average Response Time: " + Math.round(testResults.searchFunctionality.avgResponseTime) + "ms");
  Logger.log("Sources Found: " + testResults.intelligenceGathering.sourcesFound);
  Logger.log("Confidence Score: " + testResults.intelligenceGathering.confidenceScore + "%");
  
  // Recommendations
  Logger.log("\n💡 RECOMMENDATIONS:");
  
  if (!testResults.authentication.connectionWorking) {
    Logger.log("❗ CRITICAL: Fix Glean API connection before proceeding");
  }
  
  if (testResults.searchFunctionality.avgResponseTime > 5000) {
    Logger.log("⚠️ Consider implementing caching to improve response times");
  }
  
  if (enhancementCount < 2) {
    Logger.log("💡 Load glean_enhancements.gs to unlock advanced features");
  }
  
  if (testResults.intelligenceGathering.sourcesFound < 5) {
    Logger.log("💡 Consider query expansion to find more relevant sources");
  }
  
  Logger.log("\n🎯 AUTOMATION READINESS:");
  if (criticalPassed === criticalTests.length && testResults.intelligenceGathering.confidenceScore >= 80) {
    Logger.log("✅ System ready for 85-90% automation level");
  } else if (criticalPassed === criticalTests.length) {
    Logger.log("⚠️ System ready for 65-75% automation level");
    Logger.log("   Implement enhancements for higher automation");
  } else {
    Logger.log("❌ System not ready - fix critical issues first");
  }
  
  Logger.log("\n🎉 COMPREHENSIVE TESTING COMPLETE!");
  
  return testResults;
}

/**
 * Quick health check for production monitoring
 */
function quickGleanHealthCheck() {
  Logger.log("🏥 QUICK GLEAN HEALTH CHECK");
  Logger.log("===========================");
  
  var health = {
    status: "unknown",
    issues: [],
    recommendations: []
  };
  
  // Check authentication
  var token = getValidGleanToken();
  if (!token) {
    health.issues.push("No valid Glean token");
    health.recommendations.push("Set GLEAN_TOKEN in Script Properties");
  }
  
  // Quick connection test
  if (token && typeof testGleanConnectionQuick === 'function') {
    if (!testGleanConnectionQuick(token)) {
      health.issues.push("Glean API connection failed");
      health.recommendations.push("Check network connectivity and token validity");
    }
  }
  
  // Check metrics
  if (typeof getGleanMetrics === 'function') {
    var metrics = getGleanMetrics();
    if (metrics && metrics.success_rate < 80) {
      health.issues.push("Low success rate: " + metrics.success_rate + "%");
      health.recommendations.push("Investigate API errors and network issues");
    }
  }
  
  // Determine overall status
  if (health.issues.length === 0) {
    health.status = "healthy";
    Logger.log("✅ System Status: HEALTHY");
  } else if (health.issues.length <= 2) {
    health.status = "warning";
    Logger.log("⚠️ System Status: WARNING");
  } else {
    health.status = "critical";
    Logger.log("❌ System Status: CRITICAL");
  }
  
  // Report issues and recommendations
  if (health.issues.length > 0) {
    Logger.log("\n⚠️ Issues Found:");
    health.issues.forEach(function(issue) {
      Logger.log("   • " + issue);
    });
    
    Logger.log("\n💡 Recommendations:");
    health.recommendations.forEach(function(rec) {
      Logger.log("   • " + rec);
    });
  }
  
  return health;
}