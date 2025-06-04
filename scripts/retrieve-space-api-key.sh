# Step 1: Access the MongoDB container and execute commands
API_KEY=$(docker exec space-mongodb mongosh -u root -p 4dm1n --quiet --eval 'db = db.getSiblingDB("space_db"); db.users.findOne({}, { apiKey: 1, _id: 0 }).apiKey' | tail -n 1 | tr -d '\r')

# Step 2: Check if the API_KEY was retrieved successfully
if [ -n "$API_KEY" ]; then
  echo "VITE_SPACE_URL=http://localhost:5403" > .env
  echo "VITE_SPACE_API_KEY=$API_KEY" >> .env
  echo "API key and URL successfully added to .env file."
else
  echo "Failed to retrieve API key."
fi