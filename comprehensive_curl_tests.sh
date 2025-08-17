#!/bin/bash

# Comprehensive Glean API Curl Tests
# Tests all the search patterns used by your Google Apps Script

# Configuration
export GLEAN_INSTANCE="miq"
export GLEAN_TOKEN="swddCi5PwZoN+0u6HPoLmE+mVajJ8+EnmILladW9hqpg="
BASE_URL="https://${GLEAN_INSTANCE}-be.glean.com"
SEARCH_ENDPOINT="/rest/api/v1/search"

echo "🔍 COMPREHENSIVE GLEAN API CURL TESTS"
echo "======================================"
echo "Base URL: $BASE_URL"
echo "Token: ${GLEAN_TOKEN:0:10}...${GLEAN_TOKEN: -10}"
echo "Time: $(date)"
echo ""

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to test API endpoint
test_api_call() {
    local test_name="$1"
    local payload="$2"
    local description="$3"
    
    echo -e "${BLUE}📡 $test_name${NC}"
    echo "----------------------------------------"
    echo "Description: $description"
    echo "Payload: $payload"
    echo ""
    
    local response=$(curl -sS --fail-with-body \
        -X POST "${BASE_URL}${SEARCH_ENDPOINT}" \
        -H "Authorization: Bearer ${GLEAN_TOKEN}" \
        -H "Content-Type: application/json" \
        -d "$payload" 2>&1)
    
    local exit_code=$?
    
    if [ $exit_code -eq 0 ]; then
        # Parse results count
        local results_count=$(echo "$response" | jq -r '.results | length' 2>/dev/null || echo "0")
        local backend_time=$(echo "$response" | jq -r '.backendTimeMillis' 2>/dev/null || echo "N/A")
        
        echo -e "${GREEN}✅ SUCCESS${NC}"
        echo "Results found: $results_count"
        echo "Backend time: ${backend_time}ms"
        
        # Show sample results
        if [ "$results_count" != "0" ] && [ "$results_count" != "null" ]; then
            echo ""
            echo "📄 Sample Results:"
            echo "$response" | jq -r '.results[0:2][] | "  • " + (.document.title // .title // "Untitled") + " (" + (.document.docType // "unknown") + ")"' 2>/dev/null || echo "  (Could not parse results)"
        fi
        
        # Show tracking info
        local tracking_token=$(echo "$response" | jq -r '.trackingToken' 2>/dev/null)
        if [ "$tracking_token" != "null" ] && [ "$tracking_token" != "" ]; then
            echo "🔄 Tracking: $tracking_token"
        fi
        
    else
        echo -e "${RED}❌ FAILED${NC}"
        echo "Error: $response"
    fi
    
    echo ""
    echo "----------------------------------------"
    echo ""
}

# Test 1: Basic Search (matching your quickSetupTest)
test_api_call "Test 1: Basic Search" \
    '{"query":"test","pageSize":5}' \
    "Basic connectivity test - matches your working curl command"

# Test 2: Case Studies Search (from buildIntelligentQueries)
test_api_call "Test 2: Case Studies Search" \
    '{"query":"case study retail campaign success metrics ROI","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"type","values":[{"relationType":"EQUALS","value":"presentation"},{"relationType":"EQUALS","value":"document"},{"relationType":"EQUALS","value":"pdf"}]}]}}' \
    "Searches for case studies with document type filters - first category from your script"

# Test 3: Industry Insights Search
test_api_call "Test 3: Industry Insights Search" \
    '{"query":"retail advertising trends KPIs benchmarks best practices","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"app","values":[{"relationType":"EQUALS","value":"gdrive"},{"relationType":"EQUALS","value":"confluence"},{"relationType":"EQUALS","value":"slack"}]}]}}' \
    "Industry insights with app filters - second category from your script"

# Test 4: Tactical Expertise Search
test_api_call "Test 4: Tactical Expertise Search" \
    '{"query":"programmatic display video CTV optimization targeting strategies","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"type","values":[{"relationType":"EQUALS","value":"document"},{"relationType":"EQUALS","value":"presentation"}]}]}}' \
    "Tactical expertise search - third category from your script"

# Test 5: Client-Specific Search
test_api_call "Test 5: Client-Specific Search" \
    '{"query":"Nike proposal RFP campaign previous work","pageSize":5}' \
    "Client-specific search without filters - fourth category from your script"

# Test 6: Nike Brand Search (real client example)
test_api_call "Test 6: Nike Brand Research" \
    '{"query":"Nike brand campaign athletics sports marketing","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"type","values":[{"relationType":"EQUALS","value":"presentation"},{"relationType":"EQUALS","value":"document"}]}]}}' \
    "Real Nike brand research as your script would do"

# Test 7: United Airlines Search (based on curl results)
test_api_call "Test 7: United Airlines Research" \
    '{"query":"United Airlines campaign strategy performance media","pageSize":5}' \
    "United Airlines research - we know this client exists in your system"

# Test 8: Automotive Industry Search
test_api_call "Test 8: Automotive Industry Search" \
    '{"query":"automotive advertising KPIs car dealership campaigns","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"app","values":[{"relationType":"EQUALS","value":"gdrive"},{"relationType":"EQUALS","value":"slack"}]}]}}' \
    "Automotive industry search for car brand campaigns"

# Test 9: Financial Services Search
test_api_call "Test 9: Financial Services Search" \
    '{"query":"financial services banking advertising compliance","pageSize":5}' \
    "Financial services industry search"

# Test 10: Video Campaign Search
test_api_call "Test 10: Video Campaign Research" \
    '{"query":"video campaign CTV connected TV advertising performance","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"type","values":[{"relationType":"EQUALS","value":"presentation"}]}]}}' \
    "Video/CTV campaign research - common tactic"

# Test 11: Programmatic Search
test_api_call "Test 11: Programmatic Advertising" \
    '{"query":"programmatic advertising DSP audience targeting optimization","pageSize":5}' \
    "Programmatic advertising research"

# Test 12: Performance Metrics Search
test_api_call "Test 12: Performance Metrics" \
    '{"query":"campaign performance metrics KPIs CTR CPA ROAS benchmarks","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"app","values":[{"relationType":"EQUALS","value":"gdrive"}]}]}}' \
    "Performance metrics and benchmarks research"

# Test 13: RFP Process Search
test_api_call "Test 13: RFP Process Research" \
    '{"query":"RFP proposal process presentation template","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"type","values":[{"relationType":"EQUALS","value":"presentation"},{"relationType":"EQUALS","value":"document"}]}]}}' \
    "RFP and proposal process research"

# Test 14: Large Page Size Test
test_api_call "Test 14: Large Results Set" \
    '{"query":"campaign","pageSize":10}' \
    "Test with larger page size to get more results"

# Test 15: Recent Content Filter
test_api_call "Test 15: Recent Content" \
    '{"query":"2025 campaign strategy planning","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"createTime","values":[{"relationType":"GREATER_THAN","value":"2024-01-01"}]}]}}' \
    "Search for recent content from 2024/2025"

# Test 16: Slack Conversations Only
test_api_call "Test 16: Slack Conversations" \
    '{"query":"campaign performance discussion team meeting","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"app","values":[{"relationType":"EQUALS","value":"slack"}]}]}}' \
    "Search only Slack conversations"

# Test 17: Google Drive Documents Only
test_api_call "Test 17: Google Drive Only" \
    '{"query":"proposal presentation strategy","pageSize":5,"requestOptions":{"facetFilters":[{"fieldName":"app","values":[{"relationType":"EQUALS","value":"gdrive"}]}]}}' \
    "Search only Google Drive documents"

# Test 18: Testing Framework Search (based on your results)
test_api_call "Test 18: Testing Framework" \
    '{"query":"testing framework campaign test methodology","pageSize":5}' \
    "Search for testing frameworks and methodologies"

# Summary Statistics
echo ""
echo "🏁 TEST SUITE COMPLETE"
echo "======================================"
echo "Timestamp: $(date)"
echo ""
echo "📊 NEXT STEPS:"
echo "1. Review which searches return the most relevant results"
echo "2. Note response times and adjust timeouts if needed" 
echo "3. Use successful query patterns in your Google Apps Script"
echo "4. Consider caching frequently accessed content"
echo ""
echo "💡 TIPS FOR OPTIMIZATION:"
echo "• Use specific industry terms for better targeting"
echo "• Combine document type filters with content queries"
echo "• Test different page sizes based on your needs"
echo "• Monitor backend response times for performance"
echo ""