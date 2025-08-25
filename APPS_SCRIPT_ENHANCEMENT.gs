/**
 * ENHANCED APPS SCRIPT INTEGRATION FOR ZAPIER AI DATA
 * 
 * This enhancement enables your Apps Script to leverage the AI-enriched data
 * from the enhanced Zapier Step 18, connecting your sophisticated Glean
 * integration with Zapier's 39-category AI analysis.
 */

// Enhanced doPost function to handle AI-enriched Zapier data
function doPost(e) {
  try {
    var params = e.parameters;
    
    // Extract enhanced context from Zapier Step 18
    var slideIndices = (params.slide_indices && params.slide_indices[0]) ? 
                       params.slide_indices[0] : CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
    
    // NEW: Extract AI-enhanced intelligence context
    var industryContext = null;
    var gleanSearchTerms = null;
    var campaignComplexity = "Standard";
    var aiEnhanced = false;
    
    try {
      industryContext = params.industry_context ? JSON.parse(params.industry_context[0]) : null;
      gleanSearchTerms = params.glean_search_terms ? JSON.parse(params.glean_search_terms[0]) : null;
      campaignComplexity = (params.campaign_complexity && params.campaign_complexity[0]) || "Standard";
      aiEnhanced = (params.ai_enhanced && params.ai_enhanced[0] === 'true') || false;
    } catch (parseError) {
      Logger.log("Error parsing AI context: " + parseError.toString());
    }
    
    Logger.log("🧠 AI-Enhanced Request Received");
    Logger.log("AI Enhanced: " + aiEnhanced);
    Logger.log("Slide Count: " + slideIndices.split(',').length);
    Logger.log("Campaign Complexity: " + campaignComplexity);
    Logger.log("Industry: " + (industryContext ? industryContext.industry : "Unknown"));
    
    // Build enhanced request configuration
    var requestConfig = {
      // ... your existing fields ...
      slideIndices: slideIndices.split(',').map(Number),
      
      // NEW: AI-enhanced context
      industryContext: industryContext,
      gleanSearchTerms: gleanSearchTerms,
      campaignComplexity: campaignComplexity,
      aiEnhanced: aiEnhanced,
      requiresPremiumContent: (params.requires_premium_content && params.requires_premium_content[0] === 'true') || false
    };
    
    // Enhanced Glean intelligence gathering
    var gleanInsights = gatherEnhancedGleanIntelligence(requestConfig);
    
    // Your existing slide generation logic with enhanced data
    var finalDeckUrl = processEnhancedSlideRequest(requestConfig, gleanInsights);
    
    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      deckUrl: finalDeckUrl,
      aiEnhanced: aiEnhanced,
      slideCount: requestConfig.slideIndices.length,
      industry: industryContext ? industryContext.industry : "Unknown",
      complexity: campaignComplexity
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    Logger.log("Enhanced doPost Error: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString(),
      aiEnhanced: false
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Enhanced Glean intelligence gathering with AI context
 */
function gatherEnhancedGleanIntelligence(config) {
  Logger.log("🔍 Enhanced Glean Intelligence Gathering");
  
  // Use AI-enhanced context if available
  if (config.aiEnhanced && config.industryContext && config.gleanSearchTerms) {
    Logger.log("Using AI-enhanced Glean context");
    Logger.log("Industry: " + config.industryContext.industry);
    Logger.log("Client Tier: " + config.industryContext.client_tier);
    Logger.log("Search Terms: " + config.gleanSearchTerms.length);
    
    // Build enhanced queries using Zapier's AI intelligence
    var enhancedQueries = config.gleanSearchTerms.map(function(term) {
      return {
        category: "ai_enhanced",
        query: term + " " + config.industryContext.industry + " results metrics KPI",
        industry: config.industryContext.industry,
        complexity: config.campaignComplexity,
        clientTier: config.industryContext.client_tier,
        filters: buildIndustryFilters(config.industryContext)
      };
    });
    
    // Add complexity-based queries
    if (config.campaignComplexity === "High") {
      enhancedQueries.push({
        category: "complex_campaign",
        query: config.industryContext.industry + " omnichannel campaign attribution measurement",
        industry: config.industryContext.industry,
        complexity: "High",
        filters: ["case-study", "multi-channel", "attribution"]
      });
    }
    
    // Execute enhanced Glean searches
    return executeEnhancedGleanQueries(enhancedQueries);
    
  } else {
    // Fallback to your existing Glean logic
    Logger.log("Falling back to standard Glean queries");
    return gatherGleanIntelligence(config);
  }
}