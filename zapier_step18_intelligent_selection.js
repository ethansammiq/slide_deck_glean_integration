/**
 * ENHANCED INTELLIGENT SLIDE SELECTION FOR ZAPIER STEP 18
 * 
 * This enhanced version connects Zapier's AI analysis to your Apps Script's
 * sophisticated intelligence capabilities, fixing the 70% automation loss.
 * 
 * INTEGRATION FEATURES:
 * - Combines 39-category AI analysis from Step 10 with notes analysis
 * - Generates industry context for your Apps Script's Glean integration
 * - Creates targeted search terms for enhanced content relevance
 * - Outputs 20-60 intelligent slides instead of 7 default slides
 * - Calculates campaign complexity scores for your Apps Script
 */

function main(inputData) {
  // Extract standard fields from Zapier
  const notes = inputData.notes || "";
  const budget = inputData.budget_1 || inputData.budget || "";
  const campaignName = inputData.campaign_name || "";
  const brand = inputData.brand || "";
  
  // Extract AI analysis from Steps 10-11 (39 categories)
  const aiAnalysis = {
    // Core Media Channels
    dooh: inputData.DOOH === 'true',
    audio: inputData.audio === 'true',
    paid_social: inputData.paid_social === 'true',
    youtube: inputData.youtube === 'true',
    tv: inputData.tv === 'true',
    
    // Commerce & Retail Media Networks
    commerce: inputData.commerce === 'true',
    amazon: inputData.amazon === 'true',
    albertsons: inputData.albertsons === 'true',
    kroger: inputData.kroger === 'true',
    roundel: inputData.roundel === 'true',
    instacart: inputData.instacart === 'true',
    walmart: inputData.walmart === 'true',
    cvs: inputData.CVS === 'true',
    dollar_general: inputData.dollar_general === 'true',
    home_depot: inputData.home_depot === 'true',
    kinective: inputData.kinective === 'true',
    macys: inputData.macys === 'true',
    meijer: inputData.meijer === 'true',
    shipt: inputData.shipt === 'true',
    walgreens: inputData.walgreens === 'true',
    
    // Targeting & Data
    experian: inputData.experian === 'true',
    b2b: inputData.B2B === 'true',
    footfall: inputData.footfall === 'true',
    competitor_density: inputData.competitor_density === 'true',
    
    // Industries
    healthcare: inputData.healthcare === 'true',
    gaming: inputData.gaming === 'true',
    entertainment: inputData.entertainment === 'true',
    
    // Creative & Optimization
    dco: inputData.DCO === 'true',
    dooh_creative: inputData.dooh_creative === 'true',
    youtube_creative: inputData.youtube_creative === 'true',
    
    // Measurement & Analytics
    dynata: inputData.dynata === 'true',
    basket_analysis: inputData.basket_analysis === 'true',
    offline_sales_lift: inputData.offline_sales_lift === 'true',
    quality_site_visits: inputData.quality_site_visits === 'true',
    lucid_brand_study: inputData.lucid_brand_study === 'true',
    
    // Geo Targeting
    geo_targeting: inputData.geo_targeting === 'true',
    
    // Social Platforms (from Step 14)
    hasMeta: inputData.hasMeta === 'true',
    hasLinkedin: inputData.hasLinkedin === 'true',
    hasPinterest: inputData.hasPinterest === 'true',
    hasReddit: inputData.hasReddit === 'true',
    hasSnapchat: inputData.hasSnapchat === 'true',
    hasTiktok: inputData.hasTiktok === 'true',
    hasX: inputData.hasX === 'true'
  };
  
  console.log("🧠 ENHANCED INTELLIGENT SLIDE SELECTION");
  console.log("=======================================");
  console.log(`📝 Notes: ${notes.substring(0, 100)}...`);
  console.log(`💰 Budget: ${budget}`);
  console.log(`🤖 AI Categories Detected: ${Object.keys(aiAnalysis).filter(k => aiAnalysis[k]).length}/39`);
  
  // Analyze notes for tactics (existing logic)
  const notesAnalysis = analyzeNotesForTactics(notes);
  
  // Combine AI analysis with notes (AI takes precedence)
  const combinedTactics = mergeTacticsWithAI(notesAnalysis, aiAnalysis);
  
  // Generate intelligent slide indices
  const slideIndices = generateEnhancedSlideIndices(combinedTactics, budget);
  
  // Build industry context for your Apps Script's Glean integration
  const industryContext = buildIndustryContext(inputData, combinedTactics);
  
  // Generate targeted search terms for your Apps Script
  const gleanSearchTerms = generateGleanSearchTerms(combinedTactics, industryContext);
  
  const detectedTactics = Object.keys(combinedTactics).filter(t => combinedTactics[t]);
  const aiFieldsUsed = Object.keys(aiAnalysis).filter(k => aiAnalysis[k]);
  
  console.log(`🎯 Tactics: ${detectedTactics.join(', ')}`);
  console.log(`📊 Slides: ${slideIndices.length} (vs 7 default)`);
  console.log(`📈 Improvement: ${Math.round((slideIndices.length / 7) * 10) / 10}x more targeted`);
  console.log(`🔍 Glean Terms: ${gleanSearchTerms.length} industry-specific searches`);
  
  return {
    // Critical for Step 19 → Apps Script
    slide_indices: slideIndices.join(','),
    
    // Enhanced context for your Apps Script's Glean integration
    industry_context: JSON.stringify(industryContext),
    glean_search_terms: JSON.stringify(gleanSearchTerms),
    campaign_complexity: calculateComplexity(combinedTactics),
    
    // Analytics & reporting
    tactics_detected: detectedTactics.length,
    ai_fields_used: aiFieldsUsed.length,
    confidence: calculateEnhancedConfidence(combinedTactics, aiAnalysis),
    reasoning: generateEnhancedReasoning(combinedTactics, budget, aiFieldsUsed),
    total_slides: slideIndices.length,
    
    // Flags for your Apps Script
    ai_enhanced: aiFieldsUsed.length > 0,
    glean_ready: true,
    requires_premium_content: slideIndices.length > 30
  };
}

/**
 * Analyze campaign notes to detect tactics
 */
function analyzeNotesForTactics(notes) {
  const notesLower = notes.toLowerCase();
  
  return {
    // DOOH (Digital Out-of-Home)
    dooh: notesLower.includes('dooh') || 
          notesLower.includes('digital out-of-home') || 
          notesLower.includes('out-of-home') ||
          notesLower.includes('heat map'),
    
    // Digital Audio
    audio: notesLower.includes('audio') || 
           notesLower.includes('podcast') || 
           notesLower.includes('companion banner'),
    
    // Location-Based Targeting
    location: notesLower.includes('location-based') || 
              notesLower.includes('zip code') || 
              notesLower.includes('dma') || 
              notesLower.includes('geo') ||
              notesLower.includes('zip-code'),
    
    // TV/ACR Retargeting
    tv: notesLower.includes('acr') || 
        notesLower.includes('retargeting') || 
        notesLower.includes('competitive conquesting') ||
        notesLower.includes('ctv') ||
        notesLower.includes('ott'),
    
    // Social Platforms
    social: notesLower.includes('social') || 
            notesLower.includes('facebook') || 
            notesLower.includes('meta') || 
            notesLower.includes('tiktok'),
    
    // Programmatic Buying
    programmatic: notesLower.includes('programmatic') || 
                  notesLower.includes('contextual') || 
                  notesLower.includes('behavioral'),
    
    // Commerce/Retail
    commerce: notesLower.includes('commerce') || 
              notesLower.includes('retail') || 
              notesLower.includes('amazon') || 
              notesLower.includes('walmart'),
    
    // Data Targeting (Experian)
    experian: notesLower.includes('experian') || 
              notesLower.includes('zip-code targeting') ||
              notesLower.includes('consumer link'),
    
    // Video/YouTube
    youtube: notesLower.includes('youtube') || 
             notesLower.includes('video') || 
             notesLower.includes('ctv') || 
             notesLower.includes('ott'),
    
    // B2B/HOA Targeting
    b2b: notesLower.includes('hoa') || 
         notesLower.includes('homeowners') || 
         notesLower.includes('communities') ||
         notesLower.includes('adults 25+')
  };
}

// NEW: Merge AI analysis with notes analysis (AI takes precedence)
function mergeTacticsWithAI(notesAnalysis, aiAnalysis) {
  return {
    // Core tactics (AI overrides notes if detected)
    dooh: aiAnalysis.dooh || notesAnalysis.dooh,
    audio: aiAnalysis.audio || notesAnalysis.audio,
    tv: aiAnalysis.tv || notesAnalysis.tv,
    social: aiAnalysis.paid_social || aiAnalysis.hasMeta || aiAnalysis.hasTiktok || 
            aiAnalysis.hasX || notesAnalysis.social,
    commerce: aiAnalysis.commerce || notesAnalysis.commerce,
    youtube: aiAnalysis.youtube || notesAnalysis.youtube,
    
    // AI-enhanced categories
    healthcare: aiAnalysis.healthcare,
    gaming: aiAnalysis.gaming,
    entertainment: aiAnalysis.entertainment,
    dco: aiAnalysis.dco,
    competitor: aiAnalysis.competitor_density,
    
    // Retail Media Networks (AI-powered detection)
    retail_media: aiAnalysis.amazon || aiAnalysis.albertsons || aiAnalysis.kroger || 
                  aiAnalysis.walmart || aiAnalysis.instacart || aiAnalysis.cvs ||
                  aiAnalysis.dollar_general || aiAnalysis.home_depot,
    
    // Enhanced targeting
    location: notesAnalysis.location || aiAnalysis.footfall || aiAnalysis.geo_targeting,
    experian: aiAnalysis.experian || notesAnalysis.experian,
    b2b: aiAnalysis.b2b || notesAnalysis.b2b,
    programmatic: notesAnalysis.programmatic,
    
    // Performance measurement
    measurement: aiAnalysis.basket_analysis || aiAnalysis.offline_sales_lift || 
                 aiAnalysis.quality_site_visits || aiAnalysis.lucid_brand_study,
    
    // Creative optimization
    creative_optimization: aiAnalysis.dco || aiAnalysis.dooh_creative || 
                          aiAnalysis.youtube_creative,
    
    // Advanced analytics
    advanced_analytics: aiAnalysis.dynata || aiAnalysis.basket_analysis
  };
}

/**
 * Generate enhanced slide indices with AI-driven selections
 */
function generateEnhancedSlideIndices(tactics, budget) {
  // Start with core slides
  const slideSet = new Set([0, 1, 2, 3, 4, 5, 10, 11, 12]);
  
  // Enhanced slide mapping with AI categories
  const slideMap = {
    // Core channel slides
    dooh: [28, 29, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168],
    audio: [140, 141, 142, 143, 144],
    location: [16, 17, 189],
    tv: [131, 132, 133, 134, 135, 136, 137, 138, 139],
    social: [123, 124, 125, 126, 127, 128, 129, 130],
    programmatic: [13, 14, 15],
    commerce: [57, 58, 59, 60, 61, 62, 63, 64, 65, 121, 122, 145],
    experian: [16, 17, 195, 196],
    youtube: [48, 49, 50, 51, 52, 53, 54, 55, 56, 169, 170, 171, 172, 173, 174, 175],
    b2b: [18, 19, 197, 198],
    
    // AI-enhanced industry slides
    healthcare: [176, 177, 178, 179, 180],
    gaming: [181, 182, 183, 184],
    entertainment: [185, 186, 187, 188],
    
    // Advanced capabilities
    dco: [190, 191, 192],
    competitor: [20, 21, 22],
    retail_media: [146, 147, 148, 149, 150, 151, 152, 153, 154, 155, 156, 157],
    measurement: [23, 24, 25, 26, 27],
    creative_optimization: [199, 200, 201],
    advanced_analytics: [202, 203, 204, 205]
  };
  
  // Add slides for detected tactics
  Object.keys(tactics).forEach(tactic => {
    if (tactics[tactic] && slideMap[tactic]) {
      slideMap[tactic].forEach(slide => slideSet.add(slide));
    }
  });
  
  // Add budget-based slides
  const budgetSlides = getBudgetBasedSlides(budget);
  budgetSlides.forEach(slide => slideSet.add(slide));
  
  // Convert to sorted array
  return Array.from(slideSet).sort((a, b) => a - b);
}

/**
 * Get budget-appropriate slides
 */
function getBudgetBasedSlides(budget) {
  const budgetNum = parseInt(budget.replace(/[\D]/g, '')) || 0;
  
  if (budgetNum >= 1000000) {
    // $1M+ Premium tier: Full added value package
    return [200, 201, 202, 203];
  } else if (budgetNum >= 500000) {
    // $500K+ Standard tier: Core added value
    return [200, 201, 202];
  } else if (budgetNum >= 100000) {
    // $100K+ Basic tier: Essential added value
    return [200, 201];
  } else {
    // <$100K Starter tier: Core presentation only
    return [];
  }
}

// Build industry context for your Apps Script's Glean integration
function buildIndustryContext(inputData, tactics) {
  const brand = (inputData.brand || "").toLowerCase();
  const notes = (inputData.notes || "").toLowerCase();
  
  // Industry classification logic
  let industry = "Consumer Goods";
  let subIndustry = "General";
  
  if (tactics.healthcare) {
    industry = "Healthcare";
    subIndustry = "Pharmaceutical";
  } else if (tactics.gaming) {
    industry = "Gaming";
    subIndustry = "Digital Entertainment";
  } else if (tactics.entertainment) {
    industry = "Entertainment";
    subIndustry = "Media & Entertainment";
  } else if (brand.includes("bank") || brand.includes("finance") || notes.includes("financial")) {
    industry = "Financial Services";
    subIndustry = "Banking";
  } else if (brand.includes("auto") || brand.includes("car") || notes.includes("automotive")) {
    industry = "Automotive";
    subIndustry = "Vehicle Manufacturers";
  } else if (tactics.retail_media || tactics.commerce) {
    industry = "Retail";
    subIndustry = "E-commerce";
  } else if (notes.includes("spirits") || notes.includes("alcohol") || notes.includes("beverage")) {
    industry = "Consumer Goods";
    subIndustry = "Spirits & Beverages";
  }
  
  return {
    industry: industry,
    sub_industry: subIndustry,
    brand_type: brand.includes("enterprise") || tactics.b2b ? "Enterprise" : "Consumer",
    campaign_type: tactics.b2b ? "B2B" : "B2C",
    complexity_tier: Object.keys(tactics).filter(t => tactics[t]).length > 6 ? "Complex" : "Standard",
    client_tier: determineTier(inputData.budget_1 || inputData.budget || "")
  };
}

// Generate targeted search terms for your Apps Script's Glean integration
function generateGleanSearchTerms(tactics, context) {
  const searchTerms = [];
  
  // Industry-specific base terms
  searchTerms.push(`${context.industry} ${context.sub_industry} campaign case study results KPI`);
  searchTerms.push(`${context.industry} marketing best practices benchmarks`);
  
  // Tactic-specific search terms
  const priorityTactics = ['dooh', 'retail_media', 'tv', 'social', 'commerce'];
  priorityTactics.forEach(tactic => {
    if (tactics[tactic]) {
      searchTerms.push(`${tactic} ${context.industry} campaign performance metrics ROI`);
    }
  });
  
  // Complexity-based terms
  if (context.complexity_tier === "Complex") {
    searchTerms.push(`${context.industry} omnichannel campaign attribution measurement`);
    searchTerms.push("multi-channel campaign optimization strategies");
  }
  
  // Client tier specific
  if (context.client_tier === "Enterprise") {
    searchTerms.push(`${context.industry} enterprise client success stories premium campaigns`);
  }
  
  return searchTerms.slice(0, 6); // Limit to 6 most relevant for your Apps Script
}

// Enhanced confidence calculation
function calculateEnhancedConfidence(tactics, aiAnalysis) {
  let confidence = 70; // Base confidence
  
  const tacticsCount = Object.keys(tactics).filter(t => tactics[t]).length;
  confidence += tacticsCount * 4;
  
  const aiFieldCount = Object.keys(aiAnalysis).filter(k => aiAnalysis[k]).length;
  if (aiFieldCount > 0) {
    confidence += 15; // AI enhancement bonus
  }
  
  if (tacticsCount >= 6) {
    confidence += 5; // Complex campaign bonus
  }
  
  return Math.min(confidence, 97);
}

// Campaign complexity calculation for your Apps Script
function calculateComplexity(tactics) {
  const count = Object.keys(tactics).filter(t => tactics[t]).length;
  if (count >= 8) return "High";
  if (count >= 5) return "Medium";
  return "Low";
}

// Generate reasoning for transparency
function generateEnhancedReasoning(tactics, budget, aiFieldsUsed) {
  const reasoning = ["AI-enhanced slide selection"];
  
  Object.keys(tactics).forEach(tactic => {
    if (tactics[tactic]) {
      reasoning.push(`${tactic.toUpperCase()} detected`);
    }
  });
  
  if (aiFieldsUsed.length > 0) {
    reasoning.push(`${aiFieldsUsed.length} AI insights integrated`);
  }
  
  if (budget) {
    const budgetNum = parseInt(budget.replace(/[^\d]/g, '')) || 0;
    if (budgetNum >= 1000000) reasoning.push("Premium tier optimization");
    else if (budgetNum >= 500000) reasoning.push("Standard tier optimization");
    else if (budgetNum >= 100000) reasoning.push("Growth tier optimization");
  }
  
  return reasoning.join(', ');
}

// Determine client tier for your Apps Script
function determineTier(budget) {
  const budgetNum = parseInt(budget.replace(/[^\d]/g, '')) || 0;
  if (budgetNum >= 1000000) return "Enterprise";
  if (budgetNum >= 500000) return "Standard";
  if (budgetNum >= 100000) return "Growth";
  return "Starter";
}

// Execute the main function with Zapier's inputData
// Zapier automatically provides 'inputData' object with the mapped fields
output = main(inputData);