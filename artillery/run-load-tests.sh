source ../.env
cd data/
./generator.sh
cd ..
echo "Running renew token test in Tomatometer..."
pnpx artillery run ./tests/tomatometer-renew-only.yml --name "tomatometer-renew-only" --record --key $ARTILLERY_KEY
echo "Waiting 5-second cooldown before running the next test..."
sleep 5
echo "Running renew token test directly in SPACE..."
pnpx artillery run ./tests/space-renew-only.yml --name "space-renew-only" --record --key $ARTILLERY_KEY
echo "Waiting 5-second cooldown before running the next test..."
sleep 5
echo "Running validate token test in Tomatometer..."
pnpx artillery run ./tests/tomatometer-validate-only.yml --name "tomatometer-validate-only" --record --key $ARTILLERY_KEY
echo "Waiting 5-second cooldown before running the next test..."
sleep 5
echo "Running validate token test directly in SPACE..."
pnpx artillery run ./tests/space-validate-only.yml --name "space-validate-only" --record --key $ARTILLERY_KEY
echo "All tests completed successfully."
echo "You can find the results in your 'artillery.io' account."