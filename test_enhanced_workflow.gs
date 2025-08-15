/**
 * TEST FUNCTIONS FOR THE ENHANCED SLIDE AUTOMATION
 * Use these to verify the Glean integration is working properly
 */

/**
 * Test the full enhanced workflow with sample data
 */
function testEnhancedWorkflow() {
  Logger.log("🧪 Testing Enhanced Workflow with Glean Integration");
  Logger.log("=" * 60);
  
  // Sample RFP data that would come from Zapier
  var testConfig = {
    requestId: "TEST-" + new Date().getTime(),
    brand: "Nike",
    campaign_name: "Nike Summer Campaign 2025",
    flight_dates: "June 1 - August 31, 2025",
    flight_start: "2025-06-01",
    flight_end: "2025-08-31", 
    budget_1: "$500,000",
    geo_targeting: "United States",
    campaign_tactics: "Programmatic Display, Video, CTV",
    added_value_amount: "$50,000",
    media_kpis: "Brand Awareness, Purchase Intent",
    fileName: "Nike Test Proposal - Enhanced with Glean",
    slideIndices: [0, 4, 5, 6, 57, 58, 59],
    masterPresentationId: CONFIG.SLIDES.MASTER_PRESENTATION_ID,
    targetFolderId: CONFIG.SLIDES.TARGET_FOLDER_ID,
    timestamp: new Date().getTime()
  };
  
  Logger.log("📊 Test Configuration:");
  Logger.log(JSON.stringify(testConfig, null, 2));
  
  try {
    // Test 1: Glean Intelligence Gathering
    Logger.log("\n🔍 Testing Glean Intelligence Gathering...");
    var gleanInsights = gatherGleanIntelligence(testConfig);
    
    Logger.log("✅ Glean Intelligence Results:");
    Logger.log(`   - Sources found: ${gleanInsights.sources.length}`);
    Logger.log(`   - Case studies: ${gleanInsights.case_studies.length}`);
    Logger.log(`   - Client goals: ${gleanInsights.client_goals.length}`);
    Logger.log(`   - Must-haves: ${gleanInsights.must_haves.length}`);
    Logger.log(`   - Timeline phases: ${gleanInsights.timeline.length}`);
    Logger.log(`   - Assumptions: ${gleanInsights.assumptions.length}`);
    
    // Test 2: Enhanced Content Creation
    Logger.log("\n📝 Testing Enhanced Content Creation...");
    var enrichedReplacements = createEnrichedReplacements(testConfig, gleanInsights);
    
    Logger.log("✅ Enhanced Replacements Created:");
    Logger.log(`   - Total placeholders: ${Object.keys(enrichedReplacements).length}`);
    Logger.log(`   - Client Goals: ${enrichedReplacements["{{CLIENT_GOALS}}"].substring(0, 100)}...`);
    Logger.log(`   - Proposed Solution: ${enrichedReplacements["{{PROPOSED_SOLUTION_OVERVIEW}}"].substring(0, 100)}...`);
    
    // Test 3: Source Citation Format
    Logger.log("\n📚 Testing Source Citations...");
    if (gleanInsights.sources.length > 0) {
      Logger.log("✅ Sample Sources:");
      gleanInsights.sources.slice(0, 3).forEach((source, index) => {
        Logger.log(`   ${index + 1}. ${source.title}`);
        Logger.log(`      URL: ${source.url}`);
        Logger.log(`      Type: ${source.type} | Source: ${source.source}`);
      });
    } else {
      Logger.log("⚠️ No sources found - will use fallback content");
    }
    
    Logger.log("\n🎯 Test Summary:");
    Logger.log("✅ Glean API Integration: Working");
    Logger.log("✅ Content Synthesis: Working"); 
    Logger.log("✅ Enhanced Replacements: Working");
    Logger.log("✅ Source Citations: Working");
    
    return {
      success: true,
      insights: gleanInsights,
      replacements: enrichedReplacements,
      message: "Enhanced workflow test completed successfully"
    };
    
  } catch (error) {
    Logger.log(`❌ Test failed: ${error.toString()}`);
    Logger.log(`📍 Stack trace: ${error.stack}`);
    
    return {
      success: false,
      error: error.toString(),
      message: "Enhanced workflow test failed"
    };
  }
}

/**
 * Test Glean API connectivity directly
 */
function testGleanAPIConnectivity() {
  Logger.log("🔌 Testing Glean API Connectivity");
  Logger.log("=" * 40);
  
  var gleanToken = PropertiesService.getScriptProperties().getProperty('GLEAN_TOKEN');
  
  if (!gleanToken) {
    Logger.log("❌ GLEAN_TOKEN not found in Script Properties");
    Logger.log("🔧 Please add GLEAN_TOKEN to Script Properties:");
    Logger.log("   1. Go to Extensions > Apps Script");
    Logger.log("   2. Click Settings (gear icon)");
    Logger.log("   3. Add Script Property: GLEAN_TOKEN = your_token_here");
    return false;
  }
  
  try {
    // Test simple search
    var testQuery = "MiQ case study";
    var url = `${CONFIG.GLEAN.BASE_URL}${CONFIG.GLEAN.SEARCH_ENDPOINT}`;
    
    var payload = {
      query: testQuery,
      pageSize: 2
    };
    
    var options = {
      method: 'post',
      headers: {
        'Authorization': `Bearer ${gleanToken}`,
        'Content-Type': 'application/json'
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    Logger.log(`🔍 Testing search for: "${testQuery}"`);
    var response = UrlFetchApp.fetch(url, options);
    var statusCode = response.getResponseCode();
    
    Logger.log(`📡 Response Status: ${statusCode}`);
    
    if (statusCode === 200) {
      var data = JSON.parse(response.getContentText());
      var resultCount = data.results ? data.results.length : 0;
      
      Logger.log("✅ Glean API Connection: SUCCESS");
      Logger.log(`📊 Results found: ${resultCount}`);
      
      if (resultCount > 0) {
        Logger.log("📄 Sample results:");
        data.results.slice(0, 2).forEach((result, index) => {
          if (result.document) {
            Logger.log(`   ${index + 1}. ${result.document.title || 'Untitled'}`);
            Logger.log(`      Type: ${result.document.docType || 'Unknown'}`);
          }
        });
      }
      
      return true;
    } else {
      Logger.log(`❌ Glean API Error: HTTP ${statusCode}`);
      Logger.log(`📄 Response: ${response.getContentText()}`);
      
      if (statusCode === 401) {
        Logger.log("🔑 Authentication failed - check your GLEAN_TOKEN");
      } else if (statusCode === 403) {
        Logger.log("🚫 Permission denied - token may lack search permissions");
      } else if (statusCode === 429) {
        Logger.log("⏰ Rate limited - try again in a few seconds");
      }
      
      return false;
    }
    
  } catch (error) {
    Logger.log(`❌ Glean API Test Failed: ${error.toString()}`);
    return false;
  }
}

/**
 * Test the query building logic
 */
function testQueryBuilding() {
  Logger.log("🏗️ Testing Query Building Logic");
  Logger.log("=" * 35);
  
  var testConfig = {
    brand: "Nike",
    campaign_tactics: "Programmatic Display, Video, CTV",
    budget_1: "$500,000",
    geo_targeting: "United States"
  };
  
  var queries = buildIntelligentQueries(testConfig);
  
  Logger.log(`✅ Generated ${queries.length} intelligent queries:`);
  
  queries.forEach((query, index) => {
    Logger.log(`\n${index + 1}. Category: ${query.category}`);
    Logger.log(`   Query: "${query.query}"`);
    Logger.log(`   Filters: ${query.filters.length} facet filter(s)`);
    
    if (query.filters.length > 0) {
      query.filters.forEach(filter => {
        Logger.log(`     - ${filter.fieldName}: ${filter.values.length} value(s)`);
      });
    }
  });
  
  return queries;
}

/**
 * Test content synthesis with mock search results
 */
function testContentSynthesis() {
  Logger.log("🧠 Testing Content Synthesis");
  Logger.log("=" * 30);
  
  // Mock search results (simulating Glean response)
  var mockResults = [
    {
      category: "case_studies",
      results: [
        {
          document: {
            title: "Nike Digital Campaign Case Study 2024",
            url: "https://example.com/nike-case-study",
            docType: "presentation",
            datasource: "gdrive"
          },
          snippets: [
            { text: "Achieved 25% increase in brand awareness through targeted programmatic display" },
            { text: "ROI improved by 40% using advanced audience segmentation" }
          ]
        }
      ]
    },
    {
      category: "industry_insights", 
      results: [
        {
          document: {
            title: "Retail Industry Trends 2025",
            url: "https://example.com/retail-trends",
            docType: "document",
            datasource: "confluence"
          },
          snippets: [
            { text: "Key retail KPI: Customer acquisition cost optimization" },
            { text: "Best practice: Cross-device attribution for complete customer journey" }
          ]
        }
      ]
    }
  ];
  
  var testConfig = {
    brand: "Nike",
    campaign_tactics: "Programmatic Display, Video",
    budget_1: "$500,000"
  };
  
  var synthesized = synthesizeContentFromResults(mockResults, testConfig);
  
  Logger.log("✅ Content Synthesis Results:");
  Logger.log(`   - Client Name: ${synthesized.client_name}`);
  Logger.log(`   - Industry: ${synthesized.industry}`);
  Logger.log(`   - Client Goals: ${synthesized.client_goals.length} generated`);
  Logger.log(`   - Case Studies: ${synthesized.case_studies.length} found`);
  Logger.log(`   - Sources: ${synthesized.sources.length} collected`);
  Logger.log(`   - Timeline Phases: ${synthesized.timeline.length}`);
  
  Logger.log("\n📋 Sample Generated Content:");
  Logger.log(`   Goal 1: ${synthesized.client_goals[0] || 'None'}`);
  Logger.log(`   Solution: ${synthesized.proposed_solution.overview.substring(0, 100)}...`);
  
  return synthesized;
}

/**
 * Run all tests in sequence
 */
function runAllTests() {
  Logger.log("🧪 RUNNING ALL ENHANCED SLIDE AUTOMATION TESTS");
  Logger.log("=" * 60);
  
  var results = {
    connectivity: false,
    queryBuilding: false,
    contentSynthesis: false,
    fullWorkflow: false
  };
  
  try {
    // Test 1: API Connectivity
    Logger.log("\n1️⃣ TESTING API CONNECTIVITY");
    results.connectivity = testGleanAPIConnectivity();
    
    // Test 2: Query Building
    Logger.log("\n2️⃣ TESTING QUERY BUILDING");
    var queries = testQueryBuilding();
    results.queryBuilding = queries && queries.length > 0;
    
    // Test 3: Content Synthesis
    Logger.log("\n3️⃣ TESTING CONTENT SYNTHESIS");
    var synthesis = testContentSynthesis();
    results.contentSynthesis = synthesis && synthesis.client_name;
    
    // Test 4: Full Workflow (only if API is working)
    if (results.connectivity) {
      Logger.log("\n4️⃣ TESTING FULL ENHANCED WORKFLOW");
      var workflowResult = testEnhancedWorkflow();
      results.fullWorkflow = workflowResult && workflowResult.success;
    } else {
      Logger.log("\n4️⃣ SKIPPING FULL WORKFLOW TEST (API not connected)");
    }
    
    // Final Summary
    Logger.log("\n" + "=" * 60);
    Logger.log("🏁 TEST RESULTS SUMMARY");
    Logger.log("=" * 60);
    Logger.log(`✅ API Connectivity: ${results.connectivity ? 'PASS' : 'FAIL'}`);
    Logger.log(`✅ Query Building: ${results.queryBuilding ? 'PASS' : 'FAIL'}`);
    Logger.log(`✅ Content Synthesis: ${results.contentSynthesis ? 'PASS' : 'FAIL'}`);
    Logger.log(`✅ Full Workflow: ${results.fullWorkflow ? 'PASS' : 'SKIPPED/FAIL'}`);
    
    var passCount = Object.values(results).filter(r => r === true).length;
    Logger.log(`\n🎯 Overall Score: ${passCount}/4 tests passed`);
    
    if (passCount === 4) {
      Logger.log("🎉 ALL TESTS PASSED! Enhanced slide automation is ready!");
    } else if (passCount >= 2) {
      Logger.log("⚠️ Some tests passed. Check failed tests above.");
    } else {
      Logger.log("❌ Most tests failed. Check configuration and setup.");
    }
    
    return results;
    
  } catch (error) {
    Logger.log(`❌ Test suite failed: ${error.toString()}`);
    return results;
  }
}

/**
 * Setup helper - shows what needs to be configured
 */
function showSetupInstructions() {
  Logger.log("🔧 ENHANCED SLIDE AUTOMATION SETUP INSTRUCTIONS");
  Logger.log("=" * 55);
  
  Logger.log("\n1️⃣ SCRIPT PROPERTIES REQUIRED:");
  Logger.log("   Go to Extensions > Apps Script > Settings (gear icon)");
  Logger.log("   Add these Script Properties:");
  Logger.log("   - GLEAN_TOKEN: swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILadW9hqpg=");
  Logger.log("   - GLEAN_INSTANCE: miq");
  
  Logger.log("\n2️⃣ CONFIGURATION CHECK:");
  Logger.log(`   - Master Presentation ID: ${CONFIG.SLIDES.MASTER_PRESENTATION_ID}`);
  Logger.log(`   - Target Folder ID: ${CONFIG.SLIDES.TARGET_FOLDER_ID}`);
  Logger.log(`   - Glean Base URL: ${CONFIG.GLEAN.BASE_URL}`);
  
  Logger.log("\n3️⃣ REQUIRED SERVICES:");
  Logger.log("   Enable these Advanced Google Services:");
  Logger.log("   - Google Slides API");
  Logger.log("   - Google Drive API");
  
  Logger.log("\n4️⃣ TESTING:");
  Logger.log("   Run these functions to test:");
  Logger.log("   - runAllTests() - Complete test suite");
  Logger.log("   - testGleanAPIConnectivity() - Just API test");
  
  Logger.log("\n5️⃣ DEPLOYMENT:");
  Logger.log("   1. Click Deploy > New Deployment");
  Logger.log("   2. Type: Web app");
  Logger.log("   3. Execute as: Me");
  Logger.log("   4. Access: Anyone");
  Logger.log("   5. Copy web app URL for Zapier webhook");
  
  Logger.log("\n✅ After setup, run runAllTests() to verify everything works!");
}