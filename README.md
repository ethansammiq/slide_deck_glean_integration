# Enhanced Slide Deck Automation with Glean Integration

This repository contains an enhanced Google Apps Script system that automates slide deck creation with intelligent content powered by Glean's knowledge base.

## 🚀 Features

- **Intelligent Content Generation**: Searches MiQ's Glean knowledge base for relevant insights
- **Automated Slide Creation**: Duplicates master templates and populates with RFP-specific content
- **Real Citations**: Adds Sources slide with links to all referenced documents
- **Industry Intelligence**: Extracts case studies, best practices, and benchmarks
- **Queue Management**: Handles multiple requests with status tracking
- **Webhook Integration**: Works with Zapier for seamless workflow automation

## 📁 Files

### Core Implementation
- **`enhanced_complete_automation.gs`** - **MAIN PRODUCTION SCRIPT** - Complete working script with Glean integration, queue management, and webhook system

### Testing & Development
- **`gas_test_functions.gs`** - Test functions for Google Apps Script (copy these into your script for testing)
- **`comprehensive_curl_tests.sh`** - Comprehensive API testing script with 18 different test scenarios

### Documentation
- **`GOOGLE_APPS_SCRIPT_SETUP.md`** - Step-by-step setup instructions for Google Apps Script
- **`PROJECT_STATUS_FINAL.md`** - Final status report confirming working system

### Key Enhancements from Original
- ✅ **Glean API Integration** - Searches knowledge base for relevant content
- ✅ **Intelligent Query Building** - Creates targeted searches based on RFP data
- ✅ **Content Synthesis** - Transforms search results into structured slide content
- ✅ **Source Citations** - Automatic citation tracking and Sources slide generation
- ✅ **Fallback Handling** - Graceful degradation when Glean is unavailable
- ✅ **Rate Limiting** - Exponential backoff for API reliability

## 🔧 Setup Instructions

### 1. Google Apps Script Setup
1. Go to [script.google.com](https://script.google.com)
2. Create new project: "Enhanced Slide Automation"
3. Copy contents of `enhanced_complete_automation.gs` to replace default code
4. Save the project

### 2. Configure Script Properties
1. Click Settings (⚙️) in left sidebar
2. Scroll to "Script Properties"
3. Add property:
   - **Name**: `GLEAN_TOKEN`
   - **Value**: `swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILadW9hqpg=`
4. Click "Save script properties"

### 3. Test the Setup
1. In Apps Script editor, select function: `quickSetupTest`
2. Click ▶ Run
3. Authorize permissions when prompted
4. Check Execution transcript for results

Expected output:
```
✅ GLEAN_TOKEN found
🔍 Testing Glean API connection...
✅ Glean API: CONNECTED
📊 Test search returned X results
🎉 SETUP COMPLETE!
```

### 4. Full Workflow Test
1. Select function: `testFullWorkflow`
2. Click ▶ Run
3. Verify Glean intelligence gathering works

### 5. Deploy as Web App
1. Click Deploy > New deployment
2. Type: Web app
3. Execute as: Me
4. Access: Anyone
5. Copy web app URL for Zapier webhook

## 🧪 Testing

Run these test functions in order:
1. `checkCurrentSetup()` - Verify all configurations and properties
2. `testGleanConnection()` - Test Glean API connectivity  
3. `runAllTests()` - Complete test suite for all functionality

**Note**: Copy test functions from `gas_test_functions.gs` into your Apps Script project to run these tests.

## 🔌 Integration

### Zapier Webhook
The enhanced script maintains full compatibility with existing Zapier webhooks. POST requests should include:

```json
{
  "brand": "Nike",
  "campaign_tactics": "Programmatic Display, Video, CTV",
  "budget_1": "$500,000",
  "geo_targeting": "United States",
  "campaign_name": "Summer Campaign 2025",
  "slide_indices": "0,4,5,6,57,58,59"
}
```

### Status Updates
Real-time status updates sent to Replit dashboard:
- Queued (0%)
- Gathering Intelligence (30%)
- Creating Slides (50%)
- Enriching Content (70%)
- Adding Sources (85%)
- Completed (100%)

## 📊 Enhanced Content Generation

### What Gets Enhanced
- **Client Goals**: Industry best practices + similar client insights
- **Success Metrics**: Benchmarks from actual MiQ case studies  
- **Proposed Solution**: Solutions proven in similar campaigns
- **Case Studies**: Real MiQ examples with metrics and links
- **Timeline**: Based on actual project timelines from search results

### New Slides Added
- **Sources Slide**: All Glean documents cited with links
- **Assumptions & Gaps Slide**: Areas where data was limited

## 🔍 Glean Search Strategy

The system executes 4 targeted search categories:

1. **Case Studies**: `"case study [industry] campaign success metrics"`
2. **Industry Insights**: `"[industry] advertising trends KPIs benchmarks"`  
3. **Tactical Expertise**: `"programmatic display video optimization"`
4. **Client-Specific**: `"[brand] proposal RFP previous work"`

Each search includes facet filters for:
- Document types: presentations, documents, PDFs
- Apps: Google Drive, Confluence, Slack
- Recency: Past year content

## 🛡️ Error Handling

- **Exponential Backoff**: Handles rate limiting gracefully
- **Fallback Content**: Uses templates when Glean unavailable  
- **Graceful Degradation**: System works with or without Glean
- **Comprehensive Logging**: Detailed execution tracking

## 📈 Performance

- **Processing Time**: ~15 seconds (same as original)
- **Rate Limiting**: 3 retries with exponential backoff
- **Content Quality**: Dramatically improved with real insights
- **Citation Tracking**: All sources automatically collected

## 🔄 Migration from Original

The enhanced system is a drop-in replacement:
1. Replace script code with enhanced version
2. Add `GLEAN_TOKEN` to Script Properties  
3. Same Zapier webhook format
4. Same processing time
5. Enhanced output with intelligence

## 🎯 Results

**Before (Original)**:
- Simple placeholder replacement
- Generic content
- No citations

**After (Enhanced)**:
- ✨ Intelligent insights from MiQ's knowledge base
- 📚 Real case studies with metrics
- 🎯 Industry-specific best practices
- 📖 Source citations for credibility
- ⚡ Same processing speed

---

## 📁 **Clean Project Structure (After Cleanup)**

```
/slide_deck_glean_integration/
├── enhanced_complete_automation.gs    # 🚀 MAIN PRODUCTION SCRIPT
├── gas_test_functions.gs              # 🧪 Testing functions for Apps Script  
├── comprehensive_curl_tests.sh        # 🔧 API testing script
├── README.md                          # 📖 Project overview
├── GOOGLE_APPS_SCRIPT_SETUP.md       # ⚙️ Setup instructions
└── PROJECT_STATUS_FINAL.md           # ✅ Final status report
```

**Result**: Streamlined from 20+ files to 6 essential files - production-ready and organized.

---

**Built with Glean Integration | Enhanced by Claude Code**