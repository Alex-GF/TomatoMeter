#!/bin/bash

API_URL="http://localhost/api/v1/contracts"
API_KEY="fe5cf1d79449898fcc2868f6ce0aa1a833b0a82841628cef3821dc3451254d53"
TOTAL_REQUESTS=5250
OUTPUT_CSV="./generated_users.csv"

# If the CSV exists, we overwrite it
echo "userId" > "$OUTPUT_CSV"

# Function to generate random userIds (UUID v4-like)
generate_user_id() {
  openssl rand -base64 12 | tr -dc 'a-zA-Z0-9' | head -c16
}

# Static example values for plan and addOn testing
PLAN="basic"
ADD_ON="extraTimers"

# Function to display progress bar
show_progress() {
  local current=$1
  local total=$2
  local width=50
  local percentage=$((current * 100 / total))
  local completed=$((current * width / total))
  local remaining=$((width - completed))
  
  printf "\rProgress: ["
  printf "%${completed}s" | tr ' ' '='
  printf "%${remaining}s" | tr ' ' '-'
  printf "] %d%% (%d/%d)" "$percentage" "$current" "$total"
}

for ((i = 1; i <= TOTAL_REQUESTS; i++)); do
  userId=$(generate_user_id)

  # Create the JSON payload using variables
  payload=$(jq -n \
    --arg userId "$userId" \
    --arg plan "$PLAN" \
    --arg addOn "$ADD_ON" \
    '{
      userContact: {
        userId: $userId,
        username: $userId
      },
      billingPeriod: {
        autoRenew: true,
        renewalDays: 365
      },
      contractedServices: {
        tomatometer: "1.0.0"
      },
      subscriptionPlans: {
        tomatometer: $plan
      },
      subscriptionAddOns: {
        tomatometer: {
          ($addOn): 1
        }
      }
    }')

  # Send the request and wait for the response
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -H "x-api-key: $API_KEY" \
    -d "$payload")

  # Optionally, you can log the response if needed
  # echo "Response: $response"

  # Save the userId to the CSV
  echo "$userId" >> "$OUTPUT_CSV"

  # Show progress bar for every iteration
  show_progress "$i" "$TOTAL_REQUESTS"
done

echo -e "\nProcess completed. Users saved in $OUTPUT_CSV"
