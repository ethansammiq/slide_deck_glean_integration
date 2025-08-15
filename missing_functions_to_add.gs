/**
 * MISSING FUNCTIONS TO ADD TO THE ENHANCED SCRIPT
 * These are the essential functions from your original script that need to be included
 */

// ============================================================================
// WEBHOOK HANDLER (from your original doPost function)
// ============================================================================

/**
 * Handles POST requests from Zapier webhook
 * @param {Object} e - The event object from the webhook
 * @return {TextOutput} JSON response
 */
function doPost(e) {
  try {
    var params = e.parameters;
    
    var requestId = (params.requestId && params.requestId[0]) ? params.requestId[0] : "REQ-" + new Date().getTime();
    var fileName = (params.file_name && params.file_name[0]) ? params.file_name[0] : "New Presentation";
    
    Logger.log(`🔍 Using requestId: ${requestId}`);
    
    // Get the slide indices as a string and parse them into an array
    var slideIndices = (params.slide_indices && params.slide_indices[0]) ? params.slide_indices[0] : "0,4,5,6,57,58,59";
    
    // Parse the string of comma-separated indices into an array of integers
    var slideIndicesArray = [];
    try {
      slideIndicesArray = slideIndices.split(',').map(function(index) {
        return parseInt(index.trim(), 10);
      }).filter(function(index) {
        return !isNaN(index) && index >= 0;
      });
      
      if (slideIndicesArray.length === 0) {
        slideIndicesArray = CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
        Logger.log(`⚠️ No valid slide indices provided. Using default indices: ${slideIndicesArray}`);
      }
    } catch (parseError) {
      slideIndicesArray = CONFIG.SLIDES.DEFAULT_SLIDE_INDICES;
      Logger.log(`❌ Error parsing slide indices: ${parseError.toString()}. Using default indices: ${slideIndicesArray}`);
    }
    
    // Store configuration
    var scriptProperties = PropertiesService.getScriptProperties();
    var requestKey = "request_" + requestId;
    
    var requestConfig = {
      requestId: requestId,
      masterPresentationId: CONFIG.SLIDES.MASTER_PRESENTATION_ID,
      targetFolderId: CONFIG.SLIDES.TARGET_FOLDER_ID,
      fileName: fileName,
      slideIndices: slideIndicesArray,
      response_url: CONFIG.WEBHOOKS.ZAPIER_RESPONSE_URL,
      brand: (params.brand && params.brand[0]) || "Default Brand",
      campaign_name: (params.campaign_name && params.campaign_name[0]) || "Default Campaign",
      flight_dates: (params.flight_dates && params.flight_dates[0]) || "Default Dates",
      flight_start: (params.flight_start && params.flight_start[0]) || "N/A",
      flight_end: (params.flight_end && params.flight_end[0]) || "N/A",
      budget_1: (params.budget_1 && params.budget_1[0]) || "N/A",
      geo_targeting: (params.geo_targeting && params.geo_targeting[0]) || "N/A",
      campaign_tactics: (params.campaign_tactics && params.campaign_tactics[0]) || "N/A",
      added_value_amount: (params.added_value_amount && params.added_value_amount[0]) || "N/A",
      media_kpis: (params.media_kpis && params.media_kpis[0]) || "N/A",
      timestamp: new Date().getTime()
    };
    
    scriptProperties.setProperty(requestKey, JSON.stringify(requestConfig));
    
    // Remove old triggers
    removeOldTriggers();
    
    // Add to queue
    var queue = scriptProperties.getProperty("requestQueue") || "[]";
    var queueArray = JSON.parse(queue);
    queueArray.push(requestId);
    scriptProperties.setProperty("requestQueue", JSON.stringify(queueArray));
    
    Logger.log(`✅ Added request ${requestId} to queue. Queue size: ${queueArray.length}`);
    
    // Send initial status
    var brand = (params.brand && params.brand[0]) || "Default Brand";
    sendStatusToReplit(requestId, brand, "Queued", "0%", null, "Request received and queued for processing.");
    
    // Create trigger if needed
    var triggers = ScriptApp.getProjectTriggers();
    var hasProcessingTrigger = triggers.some(trigger => 
      trigger.getHandlerFunction() === "processNextPresentationRequest"
    );
    
    if (!hasProcessingTrigger) {
      removeProcessingTriggers();
      
      var trigger = ScriptApp.newTrigger("processNextPresentationRequest")
        .timeBased()
        .after(1000)
        .create();
      
      Logger.log(`✅ Created queue processing trigger: ${trigger.getUniqueId()}`);
    }
    
    // Return response
    var response = {
      message: "✅ Request Received! Processing with Glean Intelligence...",
      status: "Processing",
      requestId: requestId,
      fileName: fileName,
      slideIndices: slideIndicesArray,
      queuePosition: queueArray.length,
      estimatedWaitTime: queueArray.length * 15 + " seconds"
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    Logger.log(`❌ Error in doPost: ${error.toString()}`);
    
    var requestId = "";
    var brand = "Unknown";
    
    try {
      if (e && e.parameters) {
        requestId = (e.parameters.requestId && e.parameters.requestId[0]) || "";
        brand = (e.parameters.brand && e.parameters.brand[0]) || "Unknown Brand";
      }
      
      sendStatusToReplit(requestId, brand, "Error", "0%", null, error.toString());
    } catch (webhookError) {
      Logger.log(`❌ Error sending webhook: ${webhookError.toString()}`);
    }
    
    return ContentService
      .createTextOutput(JSON.stringify({ 
        error: error.toString(),
        requestId: requestId
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ============================================================================
// QUEUE PROCESSING (from your original script)
// ============================================================================

/**
 * Process the next presentation request from the queue
 */
function processNextPresentationRequest() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var queue = scriptProperties.getProperty("requestQueue") || "[]";
  var queueArray = JSON.parse(queue);
  
  if (queueArray.length > 0) {
    // Clean stale requests
    var now = new Date().getTime();
    var cleanedQueue = [];
    var staleRequests = [];
    
    for (var i = 0; i < queueArray.length; i++) {
      var requestId = queueArray[i];
      var requestKey = "request_" + requestId;
      var requestConfigJson = scriptProperties.getProperty(requestKey);
      
      if (requestConfigJson) {
        try {
          var config = JSON.parse(requestConfigJson);
          var timestamp = config.timestamp || 0;
          
          if (now - timestamp > 1800000) { // 30 minutes
            staleRequests.push({
              requestId: requestId,
              age: Math.round((now - timestamp) / 60000) + " minutes"
            });
            
            sendStatusToReplit(requestId, config.brand || "Unknown", "Error", "0%", null, 
                             "Request timed out after 30 minutes in queue.");
            
            scriptProperties.deleteProperty(requestKey);
            Logger.log(`⚠️ Removed stale request ${requestId}`);
          } else {
            cleanedQueue.push(requestId);
          }
        } catch (e) {
          cleanedQueue.push(requestId);
          Logger.log(`⚠️ Error parsing request ${requestId}: ${e.toString()}`);
        }
      } else {
        Logger.log(`⚠️ Request configuration not found for ${requestId}`);
      }
    }
    
    // Update queue after cleaning
    if (staleRequests.length > 0) {
      queueArray = cleanedQueue;
      scriptProperties.setProperty("requestQueue", JSON.stringify(queueArray));
      Logger.log(`🧹 Cleaned ${staleRequests.length} stale requests from queue`);
    }
    
    // Process next request
    if (queueArray.length > 0) {
      var requestId = queueArray.shift();
      scriptProperties.setProperty("requestQueue", JSON.stringify(queueArray));
      
      Logger.log(`✅ Processing request ${requestId}. Remaining in queue: ${queueArray.length}`);
      
      // Process this request
      createPresentationInBackground(requestId);
      
      // Create next trigger if more items in queue
      if (queueArray.length > 0) {
        removeProcessingTriggers();
        
        var trigger = ScriptApp.newTrigger("processNextPresentationRequest")
          .timeBased()
          .after(5000)
          .create();
        
        Logger.log(`✅ Created new queue processing trigger: ${trigger.getUniqueId()}`);
      } else {
        removeProcessingTriggers();
        Logger.log("📋 Queue is now empty. Cleaning up triggers.");
      }
    } else {
      removeProcessingTriggers();
      Logger.log("📋 Queue is empty after removing stale requests.");
    }
  } else {
    removeProcessingTriggers();
    Logger.log("📋 Queue was empty. Nothing to process.");
  }
}

// ============================================================================
// STATUS REPORTING (from your original script)
// ============================================================================

/**
 * Send status update to Replit webhook
 */
function sendStatusToReplit(requestId, brand, status, completion, presentationUrl, message) {
  try {
    var payload = {
      requestId: requestId,
      brand: brand,
      status: status,
      completion: completion,
      timestamp: new Date().toISOString()
    };
    
    if (presentationUrl) payload.presentationUrl = presentationUrl;
    if (message) payload.message = message;
    
    var options = {
      method: "post",
      contentType: "application/json",
      headers: {
        "Authorization": "Bearer " + CONFIG.WEBHOOKS.SECRET
      },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    };
    
    var response = UrlFetchApp.fetch(CONFIG.WEBHOOKS.REPLIT_STATUS_URL, options);
    Logger.log(`📤 Status update sent: ${status} (${completion})`);
    
    return response;
  } catch (error) {
    Logger.log(`❌ Error sending status: ${error.toString()}`);
  }
}

// ============================================================================
// TEXT REPLACEMENT (from your original script)
// ============================================================================

/**
 * Replace multiple placeholders in text with error handling
 */
function replaceMultiplePlaceholders(textRange, replacements) {
  if (!textRange) {
    Logger.log("⚠️ No text range provided for replacement");
    return;
  }
  
  try {
    var text = textRange.asString();
    if (!text || text.trim() === "") {
      return;
    }
    
    var modifiedText = text;
    var replacementsMade = false;
    
    for (var key in replacements) {
      if (!key) continue;
      
      var value = replacements[key] || "";
      
      if (modifiedText.indexOf(key) >= 0) {
        try {
          while (modifiedText.indexOf(key) >= 0) {
            modifiedText = modifiedText.replace(key, value);
            replacementsMade = true;
          }
          Logger.log(`✅ Replaced all instances of "${key}"`);
        } catch (replaceError) {
          Logger.log(`⚠️ Error replacing "${key}": ${replaceError.toString()}`);
        }
      }
    }
    
    if (replacementsMade && text !== modifiedText) {
      textRange.setText(modifiedText);
      Logger.log(`✅ Updated text with replacements`);
    }
  } catch (error) {
    Logger.log(`❌ Error in replaceMultiplePlaceholders: ${error.toString()}`);
    
    // Fallback method
    try {
      Logger.log("⚠️ Trying fallback replacement method...");
      var text = textRange.asString();
      var modifiedText = text;
      
      for (var key in replacements) {
        var value = replacements[key] || "";
        while (modifiedText.indexOf(key) >= 0) {
          modifiedText = modifiedText.substring(0, modifiedText.indexOf(key)) + 
                         value + 
                         modifiedText.substring(modifiedText.indexOf(key) + key.length);
        }
      }
      
      if (text !== modifiedText) {
        textRange.setText(modifiedText);
        Logger.log(`✅ Fallback replacement succeeded`);
      }
    } catch (fallbackError) {
      Logger.log(`❌ Fallback replacement failed: ${fallbackError.toString()}`);
    }
  }
}

/**
 * Enhanced text replacement for slides
 */
function replaceTextInSlides(slides, replacements) {
  if (!slides || slides.length === 0) {
    Logger.log("⚠️ No slides provided for text replacement");
    return;
  }
  
  Logger.log(`🔍 Replacing text in ${slides.length} slides`);
  
  var totalReplacements = 0;
  
  slides.forEach((slide, slideIndex) => {
    try {
      // Process placeholders
      try {
        var placeholders = slide.getPlaceholders();
        for (var p = 0; p < placeholders.length; p++) {
          try {
            var placeholder = placeholders[p];
            if (placeholder && typeof placeholder.getPlaceholderType === 'function') {
              var placeholderType = placeholder.getPlaceholderType();
              if (placeholderType === SlidesApp.PlaceholderType.BODY ||
                  placeholderType === SlidesApp.PlaceholderType.TITLE ||
                  placeholderType === SlidesApp.PlaceholderType.SUBTITLE ||
                  placeholderType === SlidesApp.PlaceholderType.FOOTER ||
                  placeholderType === SlidesApp.PlaceholderType.HEADER) {
                if (typeof placeholder.asShape === 'function') {
                  var shape = placeholder.asShape();
                  if (shape && typeof shape.getText === 'function') {
                    var textRange = shape.getText();
                    replaceMultiplePlaceholders(textRange, replacements);
                    totalReplacements++;
                  }
                }
              }
            } else {
              if (placeholder && typeof placeholder.asShape === 'function') {
                var shape = placeholder.asShape();
                if (shape && typeof shape.getText === 'function') {
                  var textRange = shape.getText();
                  replaceMultiplePlaceholders(textRange, replacements);
                  totalReplacements++;
                }
              }
            }
          } catch (placeholderError) {
            Logger.log(`⚠️ Error processing placeholder ${p} on slide ${slideIndex + 1}: ${placeholderError.toString()}`);
          }
        }
      } catch (placeholdersError) {
        Logger.log(`⚠️ Error processing placeholders on slide ${slideIndex + 1}: ${placeholdersError.toString()}`);
      }
      
      // Get all shapes in the slide
      var shapes = slide.getShapes();
      for (var i = 0; i < shapes.length; i++) {
        try {
          var textRange = shapes[i].getText();
          replaceMultiplePlaceholders(textRange, replacements);
          totalReplacements++;
        } catch (shapeError) {
          Logger.log(`⚠️ Error processing shape ${i} on slide ${slideIndex + 1}: ${shapeError.toString()}`);
        }
      }
      
      // Process text in tables
      var tables = slide.getTables();
      for (var t = 0; t < tables.length; t++) {
        try {
          var table = tables[t];
          var numRows = table.getNumRows();
          var numCols = table.getNumColumns();
          
          for (var row = 0; row < numRows; row++) {
            for (var col = 0; col < numCols; col++) {
              try {
                var cell = table.getCell(row, col);
                var textRange = cell.getText();
                replaceMultiplePlaceholders(textRange, replacements);
                totalReplacements++;
              } catch (cellError) {
                Logger.log(`⚠️ Error processing table cell [${row},${col}] on slide ${slideIndex + 1}: ${cellError.toString()}`);
              }
            }
          }
        } catch (tableError) {
          Logger.log(`⚠️ Error processing table ${t} on slide ${slideIndex + 1}: ${tableError.toString()}`);
        }
      }
      
      // Process all page elements
      var elements = slide.getPageElements();
      for (var e = 0; e < elements.length; e++) {
        try {
          var element = elements[e];
          
          switch (element.getPageElementType()) {
            case SlidesApp.PageElementType.TEXT_BOX:
              try {
                var textRange = element.asShape().getText();
                replaceMultiplePlaceholders(textRange, replacements);
                totalReplacements++;
              } catch (textBoxError) {
                Logger.log(`⚠️ Error processing text box ${e} on slide ${slideIndex + 1}: ${textBoxError.toString()}`);
              }
              break;
              
            case SlidesApp.PageElementType.GROUP:
              try {
                var group = element.asGroup();
                var groupElements = group.getChildren();
                
                groupElements.forEach(function(groupElement) {
                  if (groupElement.getPageElementType() === SlidesApp.PageElementType.SHAPE) {
                    try {
                      var textRange = groupElement.asShape().getText();
                      replaceMultiplePlaceholders(textRange, replacements);
                      totalReplacements++;
                    } catch (groupShapeError) {
                      Logger.log(`⚠️ Error processing shape in group on slide ${slideIndex + 1}: ${groupShapeError.toString()}`);
                    }
                  }
                });
              } catch (groupError) {
                Logger.log(`⚠️ Error processing group ${e} on slide ${slideIndex + 1}: ${groupError.toString()}`);
              }
              break;
              
            case SlidesApp.PageElementType.WORD_ART:
              try {
                var textRange = element.asShape().getText();
                replaceMultiplePlaceholders(textRange, replacements);
                totalReplacements++;
              } catch (wordArtError) {
                Logger.log(`⚠️ Error processing word art ${e} on slide ${slideIndex + 1}: ${wordArtError.toString()}`);
              }
              break;
          }
        } catch (elementError) {
          Logger.log(`⚠️ Error processing element ${e} on slide ${slideIndex + 1}: ${elementError.toString()}`);
        }
      }
    } catch (slideError) {
      Logger.log(`❌ Error processing slide ${slideIndex + 1}: ${slideError.toString()}`);
    }
  });
  
  Logger.log(`✅ Completed text replacements in ${slides.length} slides with ${totalReplacements} elements processed`);
}

// ============================================================================
// IMAGE HANDLING (from your original script)
// ============================================================================

/**
 * Handle image replacements across all slides
 */
function handleImageReplacements(slides, brandLogo, lifestyleImage) {
  if (!slides || slides.length === 0) {
    Logger.log("⚠️ No slides provided for image replacement");
    return;
  }
  
  Logger.log(`🔍 Replacing images in ${slides.length} slides`);
  
  slides.forEach((slide, slideIndex) => {
    try {
      var pageElements = slide.getPageElements();
      pageElements.forEach(element => {
        try {
          if (element.getPageElementType() == SlidesApp.PageElementType.SHAPE) {
            var shape = element.asShape();
            var title = shape.getTitle() || "";
            
            if (title.toLowerCase() === "brand_logo" && brandLogo) {
              try {
                var shapeLeft = element.getLeft();
                var shapeTop = element.getTop();
                var shapeWidth = element.getWidth();
                var shapeHeight = element.getHeight();
                
                var newImage = slide.insertImage(brandLogo, shapeLeft, shapeTop, shapeWidth, shapeHeight);
                newImage.setTitle("brand_logo");
                shape.remove();
                Logger.log(`✅ Successfully replaced brand_logo shape on slide ${slideIndex + 1}`);
              } catch (logoError) {
                Logger.log(`❌ Error replacing brand_logo on slide ${slideIndex + 1}: ${logoError.toString()}`);
              }
            } else if (title.toLowerCase() === "lifestyle_image" && lifestyleImage) {
              try {
                var shapeLeft = element.getLeft();
                var shapeTop = element.getTop();
                var shapeWidth = element.getWidth();
                var shapeHeight = element.getHeight();
                
                var newImage = slide.insertImage(lifestyleImage, shapeLeft, shapeTop, shapeWidth, shapeHeight);
                newImage.setTitle("lifestyle_image");
                shape.remove();
                Logger.log(`✅ Successfully replaced lifestyle_image shape on slide ${slideIndex + 1}`);
              } catch (lifestyleError) {
                Logger.log(`❌ Error replacing lifestyle_image on slide ${slideIndex + 1}: ${lifestyleError.toString()}`);
              }
            }
          }
        } catch (elementError) {
          Logger.log(`❌ Error processing element on slide ${slideIndex + 1}: ${elementError.toString()}`);
        }
      });
    } catch (slideError) {
      Logger.log(`❌ Error processing slide ${slideIndex + 1} for image replacement: ${slideError.toString()}`);
    }
  });
  
  Logger.log(`✅ Completed image replacements in ${slides.length} slides`);
}

/**
 * Fetch an image from Google Search API
 */
function fetchImageFromGoogle(query) {
  try {
    var searchUrl = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&cx=${CONFIG.GOOGLE_SEARCH.SEARCH_ENGINE_ID}&searchType=image&fileType=png&key=${CONFIG.GOOGLE_SEARCH.API_KEY}`;
    var response = UrlFetchApp.fetch(searchUrl);
    var json = JSON.parse(response.getContentText());

    if (json.items && json.items.length > 0) {
      for (var i = 0; i < json.items.length; i++) {
        var imageUrl = json.items[i].link;
        if (imageUrl.toLowerCase().endsWith('.png')) {
          Logger.log(`✅ Found PNG image for "${query}": ${imageUrl}`);
          return imageUrl;
        }
      }
      
      var firstImageUrl = json.items[0].link;
      Logger.log(`⚠️ No PNG images found for "${query}", using first result: ${firstImageUrl}`);
      return firstImageUrl;
    }
  } catch (error) {
    Logger.log(`⚠️ Error fetching image from Google: ${error.toString()}`);
  }
  return null;
}

// ============================================================================
// TRIGGER MANAGEMENT (from your original script)
// ============================================================================

/**
 * Remove old triggers
 */
function removeOldTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = 0;
  
  triggers.forEach(trigger => {
    if (trigger.getHandlerFunction() === "createPresentationInBackground" || 
        trigger.getHandlerFunction() === "TriggerExecutor") {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  
  if (count > 0) {
    Logger.log(`✅ Removed ${count} old trigger(s).`);
  }
}

/**
 * Remove processing triggers
 */
function removeProcessingTriggers() {
  var triggers = ScriptApp.getProjectTriggers();
  var count = 0;
  
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "processNextPresentationRequest") {
      ScriptApp.deleteTrigger(trigger);
      count++;
    }
  });
  
  if (count > 0) {
    Logger.log(`✅ Removed ${count} processing trigger(s).`);
  }
}

// ============================================================================
// UTILITY FUNCTIONS (from your original script)
// ============================================================================

/**
 * Show queue status for debugging
 */
function showQueueStatus() {
  var scriptProperties = PropertiesService.getScriptProperties();
  var queue = scriptProperties.getProperty("requestQueue") || "[]";
  var queueArray = JSON.parse(queue);
  
  var triggers = ScriptApp.getProjectTriggers();
  var processingTriggers = [];
  
  triggers.forEach(function(trigger) {
    if (trigger.getHandlerFunction() === "processNextPresentationRequest") {
      processingTriggers.push({
        id: trigger.getUniqueId(),
        type: trigger.getEventType()
      });
    }
  });
  
  var allProps = scriptProperties.getProperties();
  var requestProps = [];
  
  for (var propName in allProps) {
    if (propName.startsWith("request_")) {
      try {
        var requestData = JSON.parse(allProps[propName]);
        requestProps.push({
          requestId: requestData.requestId,
          brand: requestData.brand,
          timestamp: requestData.timestamp || "Unknown",
          age: requestData.timestamp ? Math.round((new Date().getTime() - requestData.timestamp) / 60000) + " minutes" : "Unknown"
        });
      } catch (e) {
        requestProps.push({
          requestId: propName,
          error: "Could not parse property data"
        });
      }
    }
  }
  
  var status = {
    queueSize: queueArray.length,
    queuedItems: queueArray,
    activeTriggers: processingTriggers,
    activeRequests: requestProps
  };
  
  Logger.log("Queue Status: " + JSON.stringify(status, null, 2));
  return status;
}

/**
 * Clear the queue manually
 */
function clearQueue() {
  try {
    var scriptProperties = PropertiesService.getScriptProperties();
    
    scriptProperties.setProperty("requestQueue", "[]");
    
    var allProps = scriptProperties.getProperties();
    var requestCount = 0;
    
    for (var propName in allProps) {
      if (propName.startsWith("request_")) {
        scriptProperties.deleteProperty(propName);
        requestCount++;
      }
    }
    
    removeProcessingTriggers();
    
    Logger.log(`✅ Successfully cleared the queue. Removed ${requestCount} pending requests.`);
    return `Queue cleared. Removed ${requestCount} pending requests.`;
  } catch (error) {
    Logger.log(`❌ Error clearing queue: ${error.toString()}`);
    return `Error clearing queue: ${error.toString()}`;
  }
}