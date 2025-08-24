/**
 * INTELLIGENT SLIDE SELECTION FOR ZAPIER STEP 18
 * 
 * This code replaces the "Hello World" in Step 18 with intelligent slide selection
 * based on campaign tactics detected from Salesforce Notes__c field.
 * 
 * Input: Campaign data including Notes__c field
 * Output: Intelligent slide indices string for Step 19
 */

// Main function for intelligent slide selection
function main(inputData) {
  // Extract data from Zapier input
  const notes = inputData.notes || "";
  const budget = inputData.budget_1 || inputData.budget || "";
  const campaignName = inputData.campaign_name || "";
  const brand = inputData.brand || "";
  
  console.log("🧠 INTELLIGENT SLIDE SELECTION");
  console.log("==============================");
  console.log(`📝 Notes: ${notes.substring(0, 100)}...`);
  console.log(`💰 Budget: ${budget}`);
  console.log(`📊 Campaign: ${campaignName}`);
  console.log(`🏢 Brand: ${brand}`);
  
  // Analyze notes for campaign tactics
  const tacticsDetected = analyzeNotesForTactics(notes);
  const slideIndices = generateIntelligentSlideIndices(tacticsDetected, budget);
  
  console.log(`🎯 Tactics detected: ${Object.keys(tacticsDetected).filter(t => tacticsDetected[t]).join(', ')}`);
  console.log(`📊 Slide count: ${slideIndices.length} slides`);
  console.log(`📈 Confidence: ${calculateConfidence(tacticsDetected)}%`);
  
  return {
    slide_indices: slideIndices.join(','),
    tactics_detected: Object.keys(tacticsDetected).filter(t => tacticsDetected[t]).length,
    confidence: calculateConfidence(tacticsDetected),
    reasoning: generateReasoning(tacticsDetected, budget),
    total_slides: slideIndices.length
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

/**
 * Generate intelligent slide indices based on detected tactics
 */
function generateIntelligentSlideIndices(tactics, budget) {
  // Start with core slides
  const slideSet = new Set([0, 1, 2, 3, 4, 5, 10, 11, 12]);
  
  // Tactic-to-slide mapping (from your intelligent system)
  const slideMap = {
    // DOOH: Comprehensive DOOH strategy slides
    dooh: [28, 29, 158, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168],
    
    // Audio: Digital audio advertising slides  
    audio: [140, 141, 142],
    
    // Location: Geo-targeting and location intelligence
    location: [16, 17, 189],
    
    // TV/ACR: Connected TV and retargeting strategies
    tv: [131, 132, 133, 134, 135, 136, 137, 138, 139],
    
    // Social: Social media platform strategies
    social: [123, 124, 125, 126, 127, 128, 129, 130],
    
    // Programmatic: Automated buying strategies
    programmatic: [13, 14, 15],
    
    // Commerce: E-commerce and retail media
    commerce: [57, 58, 59, 60, 61, 62, 63, 64, 65, 121, 122, 145],
    
    // Experian: Data-driven targeting
    experian: [16, 17],
    
    // YouTube: Video advertising strategies
    youtube: [48, 49, 50, 51, 52, 53, 54, 55, 56, 169, 170, 171, 172, 173, 174, 175],
    
    // B2B: Business and community targeting
    b2b: [18, 19]
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

/**
 * Calculate confidence score
 */
function calculateConfidence(tactics) {
  let confidence = 70; // Base confidence
  
  // Add 5% for each detected tactic
  const tacticsCount = Object.keys(tactics).filter(t => tactics[t]).length;
  confidence += tacticsCount * 5;
  
  // Cap at 95%
  return Math.min(confidence, 95);
}

/**
 * Generate human-readable reasoning
 */
function generateReasoning(tactics, budget) {
  const reasoning = ["Core presentation structure (slides 0-5, 10-12)"];
  
  Object.keys(tactics).forEach(tactic => {
    if (tactics[tactic]) {
      reasoning.push(`${tactic.toUpperCase()} tactics detected`);
    }
  });
  
  if (budget) {
    reasoning.push(`Budget tier optimization (${budget})`);
  }
  
  return reasoning.join(', ');
}

// Export for Zapier
module.exports = { main };