/**
 * GLEAN-POWERED INTELLIGENT SLIDE INDEX SELECTION
 * 
 * This module replaces Zapier's 5 AI analysis steps (10-14) with intelligent 
 * Glean-powered slide selection based on Salesforce Notes__c content.
 * 
 * Features:
 * - Analyzes Salesforce Notes__c using MiQ's institutional knowledge
 * - Maps campaign requirements to optimal slide indices
 * - Provides reasoning for each slide recommendation
 * - Uses proven successful campaign patterns from Glean
 */

// ============================================================================
// INTELLIGENT SLIDE INDEX SELECTION
// ============================================================================

/**
 * Main function: Get intelligent slide indices based on Salesforce notes
 * This replaces Zapier steps 10-14 with a single intelligent Glean-powered step
 */
function getIntelligentSlideIndices(salesforceData) {
  Logger.log("🧠 STARTING INTELLIGENT SLIDE SELECTION");
  Logger.log("=======================================");
  
  try {
    var notesContent = salesforceData.notes || "";
    var budget = salesforceData.budget || "";
    var industry = extractIndustryFromData(salesforceData) || "General";
    var campaign_name = salesforceData.campaign_name || "";
    
    Logger.log(`📝 Analyzing: ${campaign_name}`);
    Logger.log(`💰 Budget: ${budget}`);
    Logger.log(`🏭 Industry: ${industry}`);
    Logger.log(`📄 Notes length: ${notesContent.length} characters`);
    
    // Step 1: Search Glean for similar successful campaigns
    var similarCampaigns = findSimilarCampaigns(notesContent, budget, industry);
    
    // Step 2: Get tactical recommendations from Glean
    var tacticalGuidance = getTacticalRecommendations(notesContent);
    
    // Step 3: Apply institutional knowledge for slide mapping
    var recommendedIndices = synthesizeSlideRecommendations(
      notesContent, 
      similarCampaigns, 
      tacticalGuidance, 
      budget
    );
    
    Logger.log(`🎯 Final recommendation: ${recommendedIndices.indices.length} slides`);
    Logger.log(`📊 Confidence: ${recommendedIndices.confidence}%`);
    
    return recommendedIndices;
    
  } catch (error) {
    Logger.log(`❌ Error in intelligent slide selection: ${error.toString()}`);
    return getFallbackSlideIndices(salesforceData);
  }
}

/**
 * Search Glean for similar successful campaigns
 */
function findSimilarCampaigns(notesContent, budget, industry) {
  Logger.log("🔍 Searching for similar campaigns in Glean...");
  
  try {
    var token = getValidGleanToken();
    if (!token) {
      Logger.log("⚠️ No Glean token, skipping similar campaign search");
      return [];
    }
    
    // Build intelligent query from notes content
    var query = buildSimilarCampaignQuery(notesContent, budget, industry);
    Logger.log(`🎯 Query: "${query}"`);
    
    var results = searchGleanWithRetry(query, [
      {
        fieldName: "docType",
        values: [
          {relationType: "EQUALS", value: "presentation"},
          {relationType: "EQUALS", value: "document"}
        ]
      }
    ], token);
    
    if (results && results.results) {
      Logger.log(`✅ Found ${results.results.length} similar campaigns`);
      return results.results;
    }
    
    return [];
    
  } catch (error) {
    Logger.log(`❌ Error searching similar campaigns: ${error.toString()}`);
    return [];
  }
}

/**
 * Get tactical recommendations from Glean's knowledge base
 */
function getTacticalRecommendations(notesContent) {
  Logger.log("🎯 Getting tactical recommendations from Glean...");
  
  try {
    var token = getValidGleanToken();
    if (!token) {
      Logger.log("⚠️ No Glean token, skipping tactical recommendations");
      return [];
    }
    
    // Extract key tactics from notes
    var tactics = extractTacticsFromNotes(notesContent);
    Logger.log(`📋 Extracted tactics: ${tactics.join(', ')}`);
    
    var query = `slide template recommendations ${tactics.join(' ')} best practices`;
    Logger.log(`🎯 Tactical query: "${query}"`);
    
    var results = searchGleanWithRetry(query, [
      {
        fieldName: "datasource",
        values: [
          {relationType: "EQUALS", value: "gdrive"},
          {relationType: "EQUALS", value: "confluence"}
        ]
      }
    ], token);
    
    if (results && results.results) {
      Logger.log(`✅ Found ${results.results.length} tactical recommendations`);
      return results.results;
    }
    
    return [];
    
  } catch (error) {
    Logger.log(`❌ Error getting tactical recommendations: ${error.toString()}`);
    return [];
  }
}

/**
 * Synthesize slide recommendations from Glean results and notes analysis
 */
function synthesizeSlideRecommendations(notesContent, similarCampaigns, tacticalGuidance, budget) {
  Logger.log("🔄 Synthesizing slide recommendations...");
  
  var slideSet = new Set();
  var reasoning = [];
  var confidence = 70; // Base confidence
  
  // Always include core slides
  var coreSlides = [0, 1, 2, 3, 4, 5, 10, 11, 12];
  coreSlides.forEach(slide => slideSet.add(slide));
  reasoning.push("Core presentation structure (slides 0-5, 10-12)");
  
  // Analyze notes content for specific tactics
  var tacticsFound = analyzeNotesForTactics(notesContent);
  
  // Add slides based on detected tactics
  Object.keys(tacticsFound).forEach(tactic => {
    if (tacticsFound[tactic]) {
      var slides = getSlideIndicesForTactic(tactic);
      slides.forEach(slide => slideSet.add(slide));
      reasoning.push(`${tactic}: slides ${slides.join(', ')}`);
      confidence += 5; // Increase confidence for each detected tactic
    }
  });
  
  // Enhance with Glean intelligence
  if (similarCampaigns.length > 0) {
    var gleanSlides = extractSlideRecommendationsFromGlean(similarCampaigns, notesContent);
    gleanSlides.forEach(slide => slideSet.add(slide));
    reasoning.push(`Similar campaigns recommend: slides ${gleanSlides.join(', ')}`);
    confidence += 15; // High confidence boost from Glean
  }
  
  if (tacticalGuidance.length > 0) {
    var guidanceSlides = extractSlideRecommendationsFromGuidance(tacticalGuidance);
    guidanceSlides.forEach(slide => slideSet.add(slide));
    reasoning.push(`Best practices suggest: slides ${guidanceSlides.join(', ')}`);
    confidence += 10;
  }
  
  // Add budget-based recommendations
  var budgetSlides = getBudgetBasedSlides(budget);
  budgetSlides.forEach(slide => slideSet.add(slide));
  reasoning.push(`Budget tier (${budget}): slides ${budgetSlides.join(', ')}`);
  
  var finalIndices = Array.from(slideSet).sort((a, b) => a - b);
  
  Logger.log(`✅ Generated ${finalIndices.length} slide recommendations`);
  reasoning.forEach((reason, i) => {
    Logger.log(`   ${i + 1}. ${reason}`);
  });
  
  return {
    indices: finalIndices,
    reasoning: reasoning,
    confidence: Math.min(confidence, 95), // Cap at 95%
    gleanSources: similarCampaigns.length + tacticalGuidance.length
  };
}

/**
 * Analyze notes content for specific tactics and requirements
 */
function analyzeNotesForTactics(notes) {
  var tactics = {};
  var notesLower = notes.toLowerCase();
  
  // DOOH Detection
  tactics.dooh = notesLower.includes('dooh') || 
                 notesLower.includes('digital out-of-home') || 
                 notesLower.includes('out-of-home');
  
  // Audio Detection
  tactics.audio = notesLower.includes('audio') || 
                  notesLower.includes('podcast') || 
                  notesLower.includes('companion banner');
  
  // Location/Geo Targeting
  tactics.location = notesLower.includes('location-based') || 
                     notesLower.includes('zip code') || 
                     notesLower.includes('dma') || 
                     notesLower.includes('geo');
  
  // TV/ACR
  tactics.tv = notesLower.includes('acr') || 
               notesLower.includes('retargeting') || 
               notesLower.includes('competitive conquesting');
  
  // Social Platforms
  tactics.social = notesLower.includes('social') || 
                   notesLower.includes('facebook') || 
                   notesLower.includes('meta') || 
                   notesLower.includes('tiktok');
  
  // Programmatic
  tactics.programmatic = notesLower.includes('programmatic') || 
                         notesLower.includes('contextual') || 
                         notesLower.includes('behavioral');
  
  // Commerce/Retail
  tactics.commerce = notesLower.includes('commerce') || 
                     notesLower.includes('retail') || 
                     notesLower.includes('amazon') || 
                     notesLower.includes('walmart');
  
  // Experian/Data
  tactics.experian = notesLower.includes('experian') || 
                     notesLower.includes('zip-code targeting');
  
  // YouTube/Video
  tactics.youtube = notesLower.includes('youtube') || 
                    notesLower.includes('video') || 
                    notesLower.includes('ctv') || 
                    notesLower.includes('ott');
  
  // B2B/HOA
  tactics.b2b = notesLower.includes('hoa') || 
                notesLower.includes('homeowners') || 
                notesLower.includes('communities');
  
  Logger.log("🎯 Detected tactics:");
  Object.keys(tactics).forEach(key => {
    if (tactics[key]) {
      Logger.log(`   ✅ ${key.toUpperCase()}`);
    }
  });
  
  return tactics;
}

/**
 * Get slide indices for specific tactics
 */
function getSlideIndicesForTactic(tactic) {
  var slideMap = {
    'dooh': [28, 29, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168],
    'audio': [140, 141, 142],
    'location': [16, 17, 189],
    'tv': [131, 132, 133, 134, 135, 136, 137, 138, 139],
    'social': [123, 124, 125, 126, 127, 128, 129, 130],
    'programmatic': [13, 14, 15],
    'commerce': [57, 58, 59, 60, 61, 62, 63, 64, 65, 121, 122, 145],
    'experian': [16, 17],
    'youtube': [48, 49, 50, 51, 52, 53, 54, 55, 56, 169, 170, 171, 172, 173, 174, 175],
    'b2b': [18, 19]
  };
  
  return slideMap[tactic] || [];
}

/**
 * Extract slide recommendations from Glean search results
 */
function extractSlideRecommendationsFromGlean(results, notesContent) {
  var recommendedSlides = [];
  
  results.forEach(result => {
    try {
      var title = result.document.title || "";
      var snippets = result.snippets || [];
      
      // Look for slide references in titles and snippets
      var slideMatches = [];
      
      // Check title for slide patterns
      var titleMatches = title.match(/slide[s]?\s*(\d+)/gi);
      if (titleMatches) {
        titleMatches.forEach(match => {
          var num = parseInt(match.replace(/slide[s]?\s*/gi, ''));
          if (num >= 0 && num <= 207) {
            slideMatches.push(num);
          }
        });
      }
      
      // Check snippets for slide references
      snippets.forEach(snippet => {
        var text = snippet.text || "";
        var snippetMatches = text.match(/slide[s]?\s*(\d+)/gi);
        if (snippetMatches) {
          snippetMatches.forEach(match => {
            var num = parseInt(match.replace(/slide[s]?\s*/gi, ''));
            if (num >= 0 && num <= 207) {
              slideMatches.push(num);
            }
          });
        }
      });
      
      recommendedSlides = recommendedSlides.concat(slideMatches);
      
    } catch (error) {
      Logger.log(`⚠️ Error processing Glean result: ${error.toString()}`);
    }
  });
  
  // Remove duplicates and return
  return [...new Set(recommendedSlides)];
}

/**
 * Extract slide recommendations from tactical guidance
 */
function extractSlideRecommendationsFromGuidance(guidance) {
  // Similar to extractSlideRecommendationsFromGlean but focused on best practices
  return extractSlideRecommendationsFromGlean(guidance, "");
}

/**
 * Get budget-based slide recommendations
 */
function getBudgetBasedSlides(budget) {
  var budgetNum = 0;
  
  // Extract numeric value from budget string
  var budgetMatch = budget.match(/[\d,]+/);
  if (budgetMatch) {
    budgetNum = parseInt(budgetMatch[0].replace(/,/g, ''));
  }
  
  var slides = [];
  
  if (budgetNum >= 1000000) { // $1M+
    slides = slides.concat([200, 201, 202, 203]); // Premium added value slides
  } else if (budgetNum >= 500000) { // $500K+
    slides = slides.concat([200, 201, 202]); // Standard added value
  } else {
    slides = slides.concat([200, 201]); // Basic added value
  }
  
  return slides;
}

/**
 * Build intelligent query for similar campaign search
 */
function buildSimilarCampaignQuery(notes, budget, industry) {
  var queryParts = [];
  
  // Add industry context
  queryParts.push(industry);
  
  // Extract key terms from notes
  var keyTerms = extractKeyTerms(notes);
  queryParts = queryParts.concat(keyTerms.slice(0, 5)); // Top 5 terms
  
  // Add context terms
  queryParts.push("campaign", "slide", "template", "successful");
  
  return queryParts.join(" ");
}

/**
 * Extract key terms from notes content
 */
function extractKeyTerms(notes) {
  // Common campaign-related terms
  var importantTerms = [
    'dooh', 'audio', 'location-based', 'targeting', 'acr', 'retargeting',
    'social', 'programmatic', 'contextual', 'behavioral', 'youtube', 'video',
    'commerce', 'retail', 'amazon', 'experian', 'zip code', 'dma', 'hoa',
    'homeowners', 'communities', 'affluent', 'households'
  ];
  
  var notesLower = notes.toLowerCase();
  var foundTerms = [];
  
  importantTerms.forEach(term => {
    if (notesLower.includes(term)) {
      foundTerms.push(term);
    }
  });
  
  return foundTerms;
}

/**
 * Get fallback slide indices when Glean is unavailable
 */
function getFallbackSlideIndices(salesforceData) {
  Logger.log("⚠️ Using fallback slide selection (Glean unavailable)");
  
  return {
    indices: CONFIG.SLIDES.DEFAULT_SLIDE_INDICES,
    reasoning: ["Fallback selection - Glean API unavailable"],
    confidence: 50,
    gleanSources: 0
  };
}

// ============================================================================
// TEST FUNCTIONS
// ============================================================================

/**
 * Test the intelligent slide selection with real Salesforce data
 */
function testIntelligentSlideSelection() {
  Logger.log("🧪 TESTING INTELLIGENT SLIDE SELECTION");
  Logger.log("=====================================");
  
  // Use the real Salesforce notes from your example
  var testData = {
    notes: `Can you please use the media template attached for MIQ - it includes some DOOH and audio max avails pulls. They want it to be broken out by market please in the attached plan.

Flight Dates: 7/20/25 - 10/18/25; 7/20-EOY

Budget(s): max avails - broken out by DMA & Flights month

Targeting: Contextual, Behavioral, Keyword, ACR Data Retargeting + Competitive Conquesting, 1P Retargeting, Location-Based Targeting, Experian Zip-Code Targeting, Consumer Link

Geo:
Midlothian: Primary & Secondary Zip Codes
Richmond: Primary Zip Codes
Fredericksburg: Primary & Secondary Zip Codes
...

Audience:
PRIMARY Audience: Adults 25+, HHI $100K+, Homeowners, residing in specified zip codes (by market), who have demonstrated interest in lawn care services through past purchases.

Digital Audio
Budget: Use the CTV/OTT Budgets by market for the recommendation
Assets: Please recommend if we should use Audio spots or companion banners

Digital OOH
Please provide a heat map that shows the units you would recommend...`,
    
    budget: "500000",
    campaign_name: "DOOH & Audio Fall",
    brand: "Virginia Green Lawn Care"
  };
  
  Logger.log("📝 Testing with Virginia Green Lawn Care campaign");
  
  var result = getIntelligentSlideIndices(testData);
  
  Logger.log("\n🎯 INTELLIGENT RECOMMENDATION:");
  Logger.log("===============================");
  Logger.log(`📊 Recommended slides: ${result.indices.join(', ')}`);
  Logger.log(`🎯 Total slides: ${result.indices.length}`);
  Logger.log(`📈 Confidence: ${result.confidence}%`);
  Logger.log(`📚 Glean sources used: ${result.gleanSources}`);
  
  Logger.log("\n💡 REASONING:");
  result.reasoning.forEach((reason, i) => {
    Logger.log(`   ${i + 1}. ${reason}`);
  });
  
  return result;
}

/**
 * Compare intelligent selection vs. current Zapier approach
 */
function compareSelectionMethods() {
  Logger.log("📊 COMPARING SLIDE SELECTION METHODS");
  Logger.log("==================================");
  
  // Current Zapier result (from your workflow)
  var zapierSlides = "0,1,2,3,4,5,10,11,12";
  
  // Intelligent Glean result
  var intelligentResult = testIntelligentSlideSelection();
  
  Logger.log("\n🔄 COMPARISON:");
  Logger.log(`   Zapier (current): ${zapierSlides}`);
  Logger.log(`   Intelligent: ${intelligentResult.indices.join(',')}`);
  
  var zapierArray = zapierSlides.split(',').map(Number);
  var difference = intelligentResult.indices.filter(x => !zapierArray.includes(x));
  
  Logger.log(`\n➕ Additional slides recommended: ${difference.join(', ')}`);
  Logger.log(`📈 Improvement: ${difference.length} more targeted slides`);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Extract industry from Salesforce data
 */
function extractIndustryFromData(salesforceData) {
  // Check various fields for industry information
  if (salesforceData.industry) {
    return salesforceData.industry;
  }
  
  if (salesforceData.brand) {
    // Try to infer industry from brand name
    var brand = salesforceData.brand.toLowerCase();
    
    if (brand.includes('lawn') || brand.includes('green') || brand.includes('garden')) {
      return 'Lawn Care';
    } else if (brand.includes('auto') || brand.includes('car') || brand.includes('motor')) {
      return 'Automotive';
    } else if (brand.includes('retail') || brand.includes('store') || brand.includes('shop')) {
      return 'Retail';
    } else if (brand.includes('finance') || brand.includes('bank') || brand.includes('insurance')) {
      return 'Financial Services';
    } else if (brand.includes('health') || brand.includes('medical') || brand.includes('pharma')) {
      return 'Healthcare';
    }
  }
  
  // Check notes for industry clues
  if (salesforceData.notes) {
    var notes = salesforceData.notes.toLowerCase();
    
    if (notes.includes('lawn care') || notes.includes('landscaping')) {
      return 'Lawn Care';
    } else if (notes.includes('automotive') || notes.includes('dealership')) {
      return 'Automotive';
    } else if (notes.includes('retail') || notes.includes('e-commerce')) {
      return 'Retail';
    }
  }
  
  return 'General';
}

/**
 * Extract tactics from configuration object
 */
function extractTactics(config) {
  var tactics = [];
  
  if (config.campaign_tactics) {
    tactics = config.campaign_tactics.split(',').map(t => t.trim());
  }
  
  // Also check notes for tactics
  if (config.notes) {
    var notesLower = config.notes.toLowerCase();
    if (notesLower.includes('dooh')) tactics.push('DOOH');
    if (notesLower.includes('audio')) tactics.push('Audio');
    if (notesLower.includes('programmatic')) tactics.push('Programmatic');
    if (notesLower.includes('social')) tactics.push('Social');
  }
  
  return [...new Set(tactics)].join(' ');
}