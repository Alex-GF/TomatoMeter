import { Default, Feature, On } from 'space-react-client';
import DailySummaryList from '../../components/daily-summary-list';
import { UpgradeRequired } from '../../components/upgrade';

const DailySummaryPage = () => {
  // F5 · Restrict the Daily summary to the ADVANCED and PREMIUM plans
  return (
    <Feature id="tomatometer-dailySummary">
      <On>
        <DailySummaryList />
      </On>
      <Default>
        <UpgradeRequired plan="ADVANCED">unlock your daily pomodoro summary!</UpgradeRequired>
      </Default>
    </Feature>
  );
};

export default DailySummaryPage;
