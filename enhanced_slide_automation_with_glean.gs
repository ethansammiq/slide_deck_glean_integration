/**
 * Enhanced Slide Deck Automation with Glean Intelligence
 * 
 * This Google Apps Script enhances presentation creation by:
 * 1. Receiving RFP data via Zapier webhook
 * 2. Searching MiQ's Glean knowledge base for relevant insights
 * 3. Synthesizing intelligent content from search results
 * 4. Creating data-driven slide content with citations
 * 5. Adding Sources and Assumptions slides
 * 
 * Setup Instructions:
 * 1. Set Script Properties:
 *    - GLEAN_TOKEN: Your Glean API token
 *    - GLEAN_INSTANCE: "miq"
 * 2. Configure master presentation ID and target folder
 * 3. Enable Drive and Slides advanced services
 * 4. Deploy as web app for webhook endpoint
 * 
 * @author Claude Code Enhanced
 * @version 2.0 with Glean Integration
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  // Glean API Configuration
  GLEAN: {
    BASE_URL: "https://miq-be.glean.com",
    SEARCH_ENDPOINT: "/rest/api/v1/search",
    PAGE_SIZE: 5,
    TIMEOUT: 30000,
    MAX_RETRIES: 3,
    FACETS: {
      DOCUMENT_TYPES: ["presentation", "document", "pdf"],
      APPS: ["gdrive", "confluence", "slack"],
      RECENCY: "past_year"
    }
  },
  
  // Presentation Configuration
  SLIDES: {
    MASTER_PRESENTATION_ID: "1NbOO51d48Yt18Rvwpl5jKHNhp_WmMcnERbzz6ZXfFn0",
    TARGET_FOLDER_ID: "1TmKYFr7pFDuSV3R6zMcwc7_BDlYvtTLL",
    DEFAULT_SLIDE_INDICES: [0, 4, 5, 6, 57, 58, 59],
    SOURCES_SLIDE_INDEX: 196,      // Slide to add sources
    ASSUMPTIONS_SLIDE_INDEX: 197   // Slide to add assumptions
  },
  
  // Webhook Configuration  
  WEBHOOKS: {
    REPLIT_STATUS_URL: "https://56c699e5-cfdd-4ae5-88dc-0d2cd3facd57-00-3q6ofzol8ics4.spock.replit.dev/api/webhooks/slide-deck-status",
    ZAPIER_RESPONSE_URL: "https://hooks.zapier.com/hooks/catch/8054460/2ac9iv0/",
    SECRET: "miq-planning-dashboard-webhook-secret"
  },
  
  // Google Search API for Images
  GOOGLE_SEARCH: {
    API_KEY: "AIzaSyAul1eges5--cASjIOznfmhVzEmV0CXUeM",
    SEARCH_ENGINE_ID: "b1648f7dc36d748a6"
  }
};

// ============================================================================
// GLEAN INTEGRATION FUNCTIONS
// ============================================================================

/**
 * Gather intelligent insights from Glean based on RFP data
 * @param {Object} config - The request configuration from Zapier
 * @return {Object} Enriched content for slides
 */
function gatherGleanIntelligence(config) {
  const gleanToken = PropertiesService.getScriptProperties().getProperty('GLEAN_TOKEN');
  
  if (!gleanToken) {
    Logger.log('⚠️ GLEAN_TOKEN not found in Script Properties. Using fallback content.');
    return createFallbackContent(config);
  }
  
  Logger.log(`🔍 Gathering Glean intelligence for ${config.brand} in ${extractIndustry(config)}`);
  
  try {
    // Build targeted search queries
    const searchQueries = buildIntelligentQueries(config);
    Logger.log(`📝 Built ${searchQueries.length} intelligent queries`);
    
    // Execute searches with exponential backoff
    const allResults = [];
    let successfulSearches = 0;
    
    searchQueries.forEach((queryConfig, index) => {
      try {
        const results = searchGleanWithRetry(queryConfig.query, queryConfig.filters, gleanToken);
        if (results && results.results) {
          allResults.push({
            category: queryConfig.category,
            results: results.results
          });
          successfulSearches++;
          Logger.log(`✅ Search ${index + 1} (${queryConfig.category}): Found ${results.results.length} results`);
        }
      } catch (searchError) {
        Logger.log(`⚠️ Search ${index + 1} failed: ${searchError.toString()}`);
      }
    });
    
    Logger.log(`📊 Completed ${successfulSearches}/${searchQueries.length} searches successfully`);
    
    // Synthesize content from search results
    const enrichedContent = synthesizeContentFromResults(allResults, config);
    
    Logger.log(`🎯 Generated enriched content with ${enrichedContent.sources.length} sources`);
    return enrichedContent;
    
  } catch (error) {
    Logger.log(`❌ Glean intelligence gathering failed: ${error.toString()}`);
    return createFallbackContent(config);
  }
}

/**
 * Build intelligent search queries based on RFP data
 * @param {Object} config - Request configuration
 * @return {Array} Array of search query configurations
 */
function buildIntelligentQueries(config) {
  const industry = extractIndustry(config);
  const tactics = config.campaign_tactics || "";
  const brand = config.brand || "";
  const budget = config.budget_1 || "";
  
  const queries = [
    // Case Studies Search
    {
      category: "case_studies",
      query: `case study ${industry} campaign success metrics results ROI`,
      filters: [
        {
          fieldName: "type",
          values: CONFIG.GLEAN.FACETS.DOCUMENT_TYPES.map(type => ({
            relationType: "EQUALS",
            value: type
          }))
        }
      ]
    },
    
    // Industry Best Practices
    {
      category: "industry_insights", 
      query: `${industry} advertising trends KPIs benchmarks best practices`,
      filters: [
        {
          fieldName: "app",
          values: CONFIG.GLEAN.FACETS.APPS.map(app => ({
            relationType: "EQUALS", 
            value: app
          }))
        }
      ]
    },
    
    // Tactical Expertise
    {
      category: "tactical_expertise",
      query: `programmatic display video CTV optimization targeting strategies`,
      filters: [
        {
          fieldName: "type",
          values: [
            {relationType: "EQUALS", value: "document"},
            {relationType: "EQUALS", value: "presentation"}
          ]
        }
      ]
    },
    
    // Client-Specific Search (if brand is well-known)
    {
      category: "client_specific",
      query: `${brand} proposal RFP campaign previous work`,
      filters: []
    },
    
    // Compliance and Security
    {
      category: "compliance",
      query: `${industry} compliance security standards SOC2 GDPR brand safety`,
      filters: [
        {
          fieldName: "app",
          values: [
            {relationType: "EQUALS", value: "confluence"},
            {relationType: "EQUALS", value: "gdrive"}
          ]
        }
      ]
    }
  ];
  
  // Add budget-specific searches for larger budgets
  if (budget.includes("500") || budget.includes("1")) {
    queries.push({
      category: "enterprise_solutions",
      query: `enterprise campaign large budget premium solutions managed service`,
      filters: []
    });
  }
  
  return queries;
}

/**
 * Search Glean with retry logic and exponential backoff
 * @param {string} query - Search query
 * @param {Array} filters - Facet filters
 * @param {string} token - Glean API token
 * @return {Object} Search results
 */
function searchGleanWithRetry(query, filters, token) {
  const maxRetries = CONFIG.GLEAN.MAX_RETRIES;
  let delay = 500; // Start with 500ms delay
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const url = `${CONFIG.GLEAN.BASE_URL}${CONFIG.GLEAN.SEARCH_ENDPOINT}`;
      
      const payload = {
        query: query,
        pageSize: CONFIG.GLEAN.PAGE_SIZE
      };
      
      if (filters && filters.length > 0) {
        payload.requestOptions = {
          facetFilters: filters
        };
      }
      
      const options = {
        method: 'post',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        payload: JSON.stringify(payload),
        muteHttpExceptions: true
      };
      
      const response = UrlFetchApp.fetch(url, options);
      const statusCode = response.getResponseCode();
      
      if (statusCode === 200) {
        return JSON.parse(response.getContentText());
      } else if (statusCode === 429 || statusCode === 408) {
        // Rate limited or timeout - retry with backoff
        if (attempt < maxRetries) {
          Logger.log(`⏳ Rate limited on attempt ${attempt}. Waiting ${delay}ms before retry...`);
          Utilities.sleep(delay);
          delay *= 2; // Exponential backoff
          continue;
        }
      } else {
        Logger.log(`❌ Glean search failed with status ${statusCode}: ${response.getContentText()}`);
        throw new Error(`HTTP ${statusCode}: ${response.getContentText()}`);
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
      Logger.log(`⚠️ Search attempt ${attempt} failed: ${error.toString()}`);
      Utilities.sleep(delay);
      delay *= 2;
    }
  }
  
  throw new Error(`Failed after ${maxRetries} attempts`);
}

/**
 * Synthesize content from Glean search results
 * @param {Array} allResults - Categorized search results
 * @param {Object} config - Request configuration
 * @return {Object} Synthesized content for slides
 */
function synthesizeContentFromResults(allResults, config) {
  const industry = extractIndustry(config);
  
  const synthesized = {
    // Basic info
    client_name: config.brand || "Client",
    industry: industry,
    region: config.geo_targeting || "Global",
    
    // Enhanced content arrays
    client_goals: [],
    must_haves: [],
    decision_criteria: [],
    
    // Solution components
    proposed_solution: {
      overview: "",
      modules: []
    },
    
    security: {
      standards: ["SOC 2 Type II", "GDPR Compliant", "IAB Gold Standard"],
      notes: "MiQ maintains enterprise-grade security and compliance standards"
    },
    
    timeline: [],
    case_studies: [],
    sources: [],
    assumptions: []
  };
  
  // Process each category of results
  allResults.forEach(categoryResult => {
    const category = categoryResult.category;
    const results = categoryResult.results || [];
    
    results.forEach(result => {
      if (!result.document) return;
      
      const doc = result.document;
      
      // Collect source for citations
      synthesized.sources.push({
        title: doc.title || "Untitled",
        url: doc.url || "",
        type: doc.docType || "document",
        source: doc.datasource || "internal"
      });
      
      // Extract insights based on category
      switch (category) {
        case "case_studies":
          extractCaseStudyInsights(result, synthesized);
          break;
          
        case "industry_insights":
          extractIndustryInsights(result, synthesized, industry);
          break;
          
        case "tactical_expertise":
          extractTacticalInsights(result, synthesized, config);
          break;
          
        case "compliance":
          extractComplianceInsights(result, synthesized);
          break;
      }
    });
  });
  
  // Fill in defaults if no insights found
  if (synthesized.client_goals.length === 0) {
    synthesized.client_goals = [
      `Increase brand awareness in ${industry} sector`,
      `Drive qualified traffic through multi-channel approach`,
      `Optimize media spend for maximum ROI and performance`
    ];
    synthesized.assumptions.push("Client goals inferred from industry best practices");
  }
  
  if (synthesized.must_haves.length === 0) {
    synthesized.must_haves = [
      "Real-time reporting and analytics dashboard",
      "Brand safety and fraud prevention measures", 
      "Cross-device targeting and attribution"
    ];
  }
  
  // Build proposed solution
  if (!synthesized.proposed_solution.overview) {
    synthesized.proposed_solution.overview = 
      `Leverage MiQ's advanced ${config.campaign_tactics || "programmatic"} capabilities ` +
      `to reach ${config.brand || "your"} target audience with precision. Our data-driven ` +
      `approach ensures optimal performance across all channels with real-time optimization.`;
  }
  
  // Add modules based on tactics
  const tactics = (config.campaign_tactics || "").split(", ");
  tactics.forEach(tactic => {
    if (tactic.trim()) {
      synthesized.proposed_solution.modules.push({
        name: tactic.trim(),
        value_prop: `Industry-leading ${tactic.trim()} with advanced targeting and optimization`
      });
    }
  });
  
  // Generate timeline based on budget
  synthesized.timeline = generateTimelineFromBudget(config.budget_1);
  
  // Add decision criteria
  synthesized.decision_criteria = [
    "Platform capabilities and audience reach",
    "Data quality and targeting precision",
    `Proven track record in ${industry} sector`,
    "Transparency and real-time optimization"
  ];
  
  // Deduplicate sources
  synthesized.sources = deduplicateSources(synthesized.sources);
  
  Logger.log(`📋 Synthesized content: ${synthesized.client_goals.length} goals, ${synthesized.case_studies.length} case studies, ${synthesized.sources.length} sources`);
  
  return synthesized;
}

// ============================================================================
// CONTENT EXTRACTION HELPERS
// ============================================================================

/**
 * Extract insights from case study results
 */
function extractCaseStudyInsights(result, synthesized) {
  const doc = result.document;
  const title = doc.title || "";
  
  // Look for case studies in title
  if (title.toLowerCase().includes("case study")) {
    const snippets = result.snippets || [];
    let bestSnippet = "";
    
    // Find snippet with metrics
    for (const snippet of snippets) {
      const text = snippet.text || "";
      if (text.match(/\d+%|\d+x|\$\d+|increase|decrease|improvement|ROI|ROAS/i)) {
        bestSnippet = text.substring(0, 150);
        break;
      }
    }
    
    synthesized.case_studies.push({
      title: title,
      metric: bestSnippet || "See case study for detailed results",
      link: doc.url || ""
    });
  }
  
  // Extract goals from snippets
  const snippets = result.snippets || [];
  snippets.forEach(snippet => {
    const text = snippet.text || "";
    if (text.includes("goal") || text.includes("objective") || text.includes("KPI")) {
      const goalText = text.substring(0, 120);
      if (goalText.length > 20) {
        synthesized.client_goals.push(goalText);
      }
    }
  });
}

/**
 * Extract industry-specific insights
 */
function extractIndustryInsights(result, synthesized, industry) {
  const snippets = result.snippets || [];
  
  snippets.forEach(snippet => {
    const text = snippet.text || "";
    
    // Look for benchmarks and KPIs
    if (text.match(/benchmark|KPI|metric|performance/i)) {
      const insight = text.substring(0, 100);
      if (insight.length > 20) {
        synthesized.client_goals.push(insight);
      }
    }
    
    // Look for best practices
    if (text.match(/best practice|recommendation|strategy/i)) {
      const practice = text.substring(0, 100);
      if (practice.length > 20) {
        synthesized.must_haves.push(practice);
      }
    }
  });
}

/**
 * Extract tactical insights for capabilities
 */
function extractTacticalInsights(result, synthesized, config) {
  const snippets = result.snippets || [];
  
  snippets.forEach(snippet => {
    const text = snippet.text || "";
    
    // Look for optimization strategies
    if (text.match(/optimization|targeting|strategy|approach/i)) {
      const insight = text.substring(0, 120);
      if (insight.length > 30) {
        // Enhance the proposed solution overview
        if (!synthesized.proposed_solution.overview.includes("optimization")) {
          synthesized.proposed_solution.overview += ` ${insight}`;
        }
      }
    }
  });
}

/**
 * Extract compliance and security insights
 */
function extractComplianceInsights(result, synthesized) {
  const snippets = result.snippets || [];
  
  snippets.forEach(snippet => {
    const text = snippet.text || "";
    
    // Look for security standards
    if (text.match(/SOC|GDPR|ISO|compliance|security|privacy/i)) {
      const standard = text.substring(0, 80);
      if (standard.length > 10) {
        synthesized.security.notes += ` ${standard}`;
      }
    }
  });
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Extract industry from config data
 */
function extractIndustry(config) {
  // Try to extract from campaign name or use brand context
  const brand = (config.brand || "").toLowerCase();
  const campaign = (config.campaign_name || "").toLowerCase();
  
  // Simple industry mapping
  if (brand.includes("nike") || brand.includes("adidas") || campaign.includes("retail")) {
    return "Retail";
  } else if (brand.includes("ford") || brand.includes("toyota") || campaign.includes("auto")) {
    return "Automotive";
  } else if (brand.includes("bank") || brand.includes("finance") || campaign.includes("financial")) {
    return "Financial Services";
  } else if (campaign.includes("healthcare") || campaign.includes("pharma")) {
    return "Healthcare";
  } else {
    return "Consumer Goods"; // Default
  }
}

/**
 * Generate timeline based on budget
 */
function generateTimelineFromBudget(budgetStr) {
  const budget = budgetStr || "";
  
  if (budget.includes("500") || budget.includes("1,000") || budget.includes("1000")) {
    // Large budget - longer timeline
    return [
      {phase: "Discovery & Strategy", weeks: 2},
      {phase: "Campaign Setup & Testing", weeks: 3},
      {phase: "Launch & Initial Optimization", weeks: 4},
      {phase: "Scale & Advanced Optimization", weeks: 8}
    ];
  } else {
    // Standard timeline
    return [
      {phase: "Discovery & Setup", weeks: 1},
      {phase: "Launch & Optimization", weeks: 3},
      {phase: "Scale & Refinement", weeks: 6}
    ];
  }
}

/**
 * Deduplicate sources by URL
 */
function deduplicateSources(sources) {
  const seen = new Set();
  const unique = [];
  
  sources.forEach(source => {
    if (source.url && !seen.has(source.url)) {
      seen.add(source.url);
      unique.push(source);
    }
  });
  
  return unique;
}

/**
 * Create fallback content when Glean is unavailable
 */
function createFallbackContent(config) {
  const industry = extractIndustry(config);
  
  return {
    client_name: config.brand || "Client",
    industry: industry,
    region: config.geo_targeting || "Global",
    
    client_goals: [
      `Increase brand awareness in ${industry} sector`,
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
      overview: `Leverage MiQ's programmatic capabilities to reach your target audience with precision and drive measurable results.`,
      modules: [
        {name: "Programmatic Display", value_prop: "Advanced audience targeting and optimization"},
        {name: "Video Advertising", value_prop: "Engaging video content across premium inventory"},
        {name: "Performance Analytics", value_prop: "Real-time insights and optimization"}
      ]
    },
    
    security: {
      standards: ["SOC 2 Type II", "GDPR Compliant", "IAB Gold Standard"],
      notes: "Enterprise-grade security and compliance"
    },
    
    timeline: generateTimelineFromBudget(config.budget_1),
    case_studies: [],
    sources: [],
    assumptions: ["Content generated from standard templates due to limited data availability"]
  };
}

// ============================================================================
// ENHANCED PRESENTATION CREATION
// ============================================================================

/**
 * Enhanced version of the original createPresentationInBackground function
 * Now includes Glean intelligence gathering
 */
function createPresentationInBackground(specificRequestId) {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    
    // Retrieve the request configuration from properties
    var requestKey = "request_" + specificRequestId;
    var requestConfigJson = scriptProperties.getProperty(requestKey);
    
    if (!requestConfigJson) {
      throw new Error(`Configuration not found for request ID: ${specificRequestId}`);
    }
    
    // Parse the request configuration
    var config = JSON.parse(requestConfigJson);
    var requestId = config.requestId;
    var brand = config.brand;
    
    // Check if the request has timed out
    var now = new Date().getTime();
    var timestamp = config.timestamp || 0;
    if (now - timestamp > 1800000) { // 30 minutes
      var errorMessage = `Request timed out (${Math.round((now - timestamp) / 60000)} minutes old)`;
      Logger.log(`⚠️ ${errorMessage}`);
      sendStatusToReplit(requestId, brand, "Error", "0%", null, errorMessage);
      scriptProperties.deleteProperty(requestKey);
      return;
    }
    
    // Force the correct presentation ID
    var masterPresentationId = CONFIG.SLIDES.MASTER_PRESENTATION_ID;
    
    // Initial progress update
    sendStatusToReplit(requestId, brand, "Processing", "20%", null, "Starting presentation creation");
    Logger.log(`🔄 Processing request: ${requestId} for ${brand}`);
    
    // Get slide indices
    var selectedSlideIndices = config.slideIndices || CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
    Logger.log(`🔍 Using slide indices: ${JSON.stringify(selectedSlideIndices)}`);
    
    // NEW: Glean Intelligence Gathering Phase
    sendStatusToReplit(requestId, brand, "Gathering Intelligence", "30%", null, "Searching knowledge base for insights");
    Logger.log(`🧠 Gathering Glean intelligence for ${brand}`);
    
    var gleanInsights = gatherGleanIntelligence(config);
    
    sendStatusToReplit(requestId, brand, "Processing Intelligence", "40%", null, 
      `Found ${gleanInsights.sources.length} relevant sources`);
    
    // Fetch brand images
    sendStatusToReplit(requestId, brand, "Fetching Images", "45%", null, "Retrieving brand assets");
    var brandLogo = fetchImageFromGoogle(brand + " logo transparent");
    var lifestyleImage = fetchImageFromGoogle(brand + " lifestyle imagery high-quality");
    
    // Create new presentation
    sendStatusToReplit(requestId, brand, "Creating Slides", "50%", null, "Building presentation structure");
    
    var masterPresentation = SlidesApp.openById(masterPresentationId);
    var masterSlides = masterPresentation.getSlides();
    Logger.log(`✅ Opened master presentation with ${masterSlides.length} slides`);
    
    var newPresentation = SlidesApp.create(config.fileName);
    var newPresentationId = newPresentation.getId();
    Logger.log(`✅ Created new presentation: ${newPresentationId}`);
    
    // Move to target folder
    var newFile = DriveApp.getFileById(newPresentationId);
    var targetFolder = DriveApp.getFolderById(config.targetFolderId);
    targetFolder.addFile(newFile);
    DriveApp.getRootFolder().removeFile(newFile);
    
    // Copy selected slides
    sendStatusToReplit(requestId, brand, "Copying Slides", "60%", null, "Copying template slides");
    
    var validatedIndices = selectedSlideIndices.filter(index => index >= 0 && index < masterSlides.length);
    if (validatedIndices.length === 0) {
      validatedIndices = CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
    }
    
    var copyCount = 0;
    validatedIndices.forEach(index => {
      try {
        if (index < masterSlides.length) {
          newPresentation.appendSlide(masterSlides[index]);
          copyCount++;
        }
      } catch (slideError) {
        Logger.log(`❌ Error copying slide ${index}: ${slideError.toString()}`);
      }
    });
    
    // Remove default first slide
    if (newPresentation.getSlides().length > 0) {
      newPresentation.getSlides()[0].remove();
    }
    
    var newSlides = newPresentation.getSlides();
    Logger.log(`✅ Copied ${copyCount} slides to new presentation`);
    
    // Enhanced content replacement using Glean insights
    sendStatusToReplit(requestId, brand, "Enriching Content", "70%", null, "Adding intelligent insights");
    
    var enrichedReplacements = createEnrichedReplacements(config, gleanInsights);
    
    // Replace content in slides
    replaceTextInSlides(newSlides, enrichedReplacements);
    
    // Handle image replacements
    sendStatusToReplit(requestId, brand, "Adding Images", "80%", null, "Inserting brand images");
    handleImageReplacements(newSlides, brandLogo, lifestyleImage);
    
    // Add Sources and Assumptions slides
    sendStatusToReplit(requestId, brand, "Adding Sources", "85%", null, "Creating citation slides");
    addSourcesSlide(newPresentation, gleanInsights);
    addAssumptionsSlide(newPresentation, gleanInsights);
    
    // Final updates
    sendStatusToReplit(requestId, brand, "Finalizing", "90%", null, "Completing presentation");
    
    var newPresentationUrl = newFile.getUrl();
    
    // Send webhook to Zapier
    if (config.response_url) {
      try {
        var payload = {
          message: `✅ Enhanced Presentation Created for *${brand}*: ${newPresentationUrl}`,
          presentation_url: newPresentationUrl,
          requestId: requestId,
          status: "Success",
          slideIndices: config.slideIndices,
          glean_insights: {
            sources_found: gleanInsights.sources.length,
            case_studies: gleanInsights.case_studies.length,
            intelligence_level: gleanInsights.sources.length > 0 ? "High" : "Standard"
          }
        };
        
        UrlFetchApp.fetch(config.response_url, {
          method: "post",
          contentType: "application/json",
          payload: JSON.stringify(payload),
          muteHttpExceptions: true
        });
        
        Logger.log(`✅ Webhook sent to Zapier`);
      } catch (webhookError) {
        Logger.log(`⚠️ Webhook error: ${webhookError.toString()}`);
      }
    }
    
    // Final completion status
    sendStatusToReplit(requestId, brand, "Completed", "100%", newPresentationUrl, 
      `Presentation created with ${gleanInsights.sources.length} knowledge sources`);
    
    Logger.log(`🎉 Enhanced presentation completed: ${newPresentationUrl}`);
    
    // Clean up
    scriptProperties.deleteProperty(requestKey);
    
  } catch (error) {
    // Error handling - same as original
    var scriptProperties = PropertiesService.getScriptProperties();
    var requestKey = "request_" + specificRequestId;
    var requestConfigJson = scriptProperties.getProperty(requestKey);
    
    var requestId = specificRequestId;
    var brand = "Unknown Brand";
    
    if (requestConfigJson) {
      try {
        var config = JSON.parse(requestConfigJson);
        brand = config.brand;
      } catch (parseError) {
        Logger.log(`❌ Config parsing error: ${parseError.toString()}`);
      }
    }
    
    sendStatusToReplit(requestId, brand, "Error", "0%", null, error.toString());
    Logger.log(`❌ Enhanced presentation error: ${error.toString()}`);
    
    scriptProperties.deleteProperty(requestKey);
  }
}

/**
 * Create enriched content replacements using Glean insights
 */
function createEnrichedReplacements(config, gleanInsights) {
  // Start with basic replacements
  var replacements = {
    "{{brand}}": config.brand || "",
    "{{campaign_name}}": config.campaign_name || "",
    "{{flight_dates}}": config.flight_dates || "",
    "{{flight_start}}": config.flight_start || "",
    "{{flight_end}}": config.flight_end || "",
    "{{budget_1}}": config.budget_1 || "",
    "{{geo_targeting}}": config.geo_targeting || "",
    "{{added_value_amount}}": config.added_value_amount || "",
    
    // Enhanced with Glean insights
    "{{CLIENT_NAME}}": gleanInsights.client_name,
    "{{INDUSTRY}}": gleanInsights.industry,
    "{{REGION}}": gleanInsights.region,
    
    "{{CLIENT_GOALS}}": formatBulletList(gleanInsights.client_goals),
    "{{MUST_HAVES}}": formatBulletList(gleanInsights.must_haves),
    "{{DECISION_CRITERIA}}": formatBulletList(gleanInsights.decision_criteria),
    
    "{{PROPOSED_SOLUTION_OVERVIEW}}": gleanInsights.proposed_solution.overview,
    "{{MODULES}}": formatModulesList(gleanInsights.proposed_solution.modules),
    
    "{{SECURITY_STANDARDS}}": formatBulletList(gleanInsights.security.standards),
    "{{SECURITY_NOTES}}": gleanInsights.security.notes,
    
    "{{TIMELINE}}": formatTimelineList(gleanInsights.timeline),
    
    // Enhanced campaign tactics with insights
    "{{campaign_tactics}}": enrichCampaignTactics(config.campaign_tactics, gleanInsights),
    "{{media_kpis}}": enrichMediaKPIs(config.media_kpis, gleanInsights)
  };
  
  return replacements;
}

/**
 * Format array as bullet list
 */
function formatBulletList(items) {
  if (!items || items.length === 0) return "";
  return items.map(item => `• ${item}`).join('\n');
}

/**
 * Format modules with value propositions
 */
function formatModulesList(modules) {
  if (!modules || modules.length === 0) return "";
  return modules.map(module => `• ${module.name} — ${module.value_prop}`).join('\n');
}

/**
 * Format timeline with phases and duration
 */
function formatTimelineList(timeline) {
  if (!timeline || timeline.length === 0) return "";
  return timeline.map(phase => `• ${phase.phase} — ${phase.weeks} weeks`).join('\n');
}

/**
 * Enrich campaign tactics with Glean insights
 */
function enrichCampaignTactics(originalTactics, insights) {
  var enriched = originalTactics || "";
  
  if (insights.case_studies.length > 0) {
    enriched += ` (proven success in similar campaigns - see case studies)`;
  }
  
  return enriched;
}

/**
 * Enrich media KPIs with benchmarks from insights
 */
function enrichMediaKPIs(originalKPIs, insights) {
  var enriched = originalKPIs || "";
  
  // Add industry benchmarks if found
  if (insights.industry) {
    enriched += ` with ${insights.industry} industry benchmarks`;
  }
  
  return enriched;
}

/**
 * Add Sources slide with Glean citations
 */
function addSourcesSlide(presentation, gleanInsights) {
  try {
    var sourcesSlide = presentation.insertSlide(presentation.getSlides().length);
    
    // Add title
    var titleShape = sourcesSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 50, 600, 80);
    var titleTextRange = titleShape.getText();
    titleTextRange.setText("Sources & References");
    titleTextRange.getTextStyle().setFontSize(36).setBold(true);
    
    // Add sources list
    if (gleanInsights.sources.length > 0) {
      var sourcesText = gleanInsights.sources.slice(0, 10).map((source, index) => 
        `${index + 1}. ${source.title}\n   ${source.url}\n`
      ).join('\n');
      
      var sourcesShape = sourcesSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 150, 600, 400);
      var sourcesTextRange = sourcesShape.getText();
      sourcesTextRange.setText(sourcesText);
      sourcesTextRange.getTextStyle().setFontSize(12);
    } else {
      var noSourcesShape = sourcesSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 150, 600, 100);
      var noSourcesTextRange = noSourcesShape.getText();
      noSourcesTextRange.setText("This proposal was created using standard templates and industry best practices.");
      noSourcesTextRange.getTextStyle().setFontSize(14);
    }
    
    Logger.log(`✅ Added Sources slide with ${gleanInsights.sources.length} citations`);
  } catch (error) {
    Logger.log(`⚠️ Error adding Sources slide: ${error.toString()}`);
  }
}

/**
 * Add Assumptions & Gaps slide
 */
function addAssumptionsSlide(presentation, gleanInsights) {
  try {
    var assumptionsSlide = presentation.insertSlide(presentation.getSlides().length);
    
    // Add title
    var titleShape = assumptionsSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 50, 600, 80);
    var titleTextRange = titleShape.getText();
    titleTextRange.setText("Assumptions & Next Steps");
    titleTextRange.getTextStyle().setFontSize(36).setBold(true);
    
    // Add assumptions
    var assumptionsText = "";
    
    if (gleanInsights.assumptions.length > 0) {
      assumptionsText += "Assumptions:\n";
      assumptionsText += gleanInsights.assumptions.map(assumption => `• ${assumption}`).join('\n');
      assumptionsText += "\n\n";
    }
    
    assumptionsText += "Next Steps:\n";
    assumptionsText += "• Discovery call to validate assumptions and requirements\n";
    assumptionsText += "• Technical setup and implementation planning\n";
    assumptionsText += "• Campaign strategy refinement based on specific goals\n";
    assumptionsText += "• Establish success metrics and reporting framework";
    
    var assumptionsShape = assumptionsSlide.insertShape(SlidesApp.ShapeType.TEXT_BOX, 50, 150, 600, 350);
    var assumptionsTextRange = assumptionsShape.getText();
    assumptionsTextRange.setText(assumptionsText);
    assumptionsTextRange.getTextStyle().setFontSize(14);
    
    Logger.log(`✅ Added Assumptions & Next Steps slide`);
  } catch (error) {
    Logger.log(`⚠️ Error adding Assumptions slide: ${error.toString()}`);
  }
}

// ============================================================================
// EXISTING FUNCTIONS (keeping the working parts of your original script)
// ============================================================================

// Keep all your existing functions:
// - doPost()
// - processNextPresentationRequest()
// - sendStatusToReplit()
// - replaceTextInSlides()
// - handleImageReplacements()
// - fetchImageFromGoogle()
// - All queue management functions
// - All utility functions

// [Previous functions would be included here - this is a conceptual outline]

/**
 * Test the Glean integration
 */
function testGleanIntegration() {
  var testConfig = {
    brand: "Nike",
    industry: "Retail", 
    campaign_tactics: "Programmatic Display, Video, CTV",
    budget_1: "$500,000",
    geo_targeting: "United States"
  };
  
  Logger.log("Testing Glean integration...");
  var insights = gatherGleanIntelligence(testConfig);
  
  Logger.log("Test Results:");
  Logger.log(`- Sources found: ${insights.sources.length}`);
  Logger.log(`- Case studies: ${insights.case_studies.length}`);
  Logger.log(`- Client goals: ${insights.client_goals.length}`);
  
  return insights;
}

/**
 * Test slide count function (from your original script)
 */
function testSlideCount() {
  var masterPresentationId = CONFIG.SLIDES.MASTER_PRESENTATION_ID;
  var masterPresentation = SlidesApp.openById(masterPresentationId);
  var masterSlides = masterPresentation.getSlides();
  Logger.log(`Master presentation has ${masterSlides.length} slides (indices 0-${masterSlides.length-1})`);
  
  // Test accessing the specific slides you need
  var testIndices = [196, 197];
  testIndices.forEach(function(index) {
    try {
      if (index < masterSlides.length) {
        var slide = masterSlides[index];
        Logger.log(`✅ Slide ${index} exists and is accessible`);
      } else {
        Logger.log(`❌ Slide ${index} is out of bounds (max: ${masterSlides.length-1})`);
      }
    } catch (error) {
      Logger.log(`❌ Error accessing slide ${index}: ${error.toString()}`);
    }
  });
}

// Include all your existing queue management and utility functions here...
// [The rest of your original script functions would be included]