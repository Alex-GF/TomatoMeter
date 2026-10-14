import DailySummaryList from '../../components/daily-summary-list';
import { UpgradeRequired } from '../../components/upgrade';

const DailySummaryPage = () => {
  // ---------------------------------------------------------------------------
  // TODO F5 · Restrict the Daily summary to the ADVANCED and PREMIUM plans
  //
  // Wrap the summary in <Feature id="tomatometer-dailySummary"> (from 'space-react-client'):
  //   - <On>: the <DailySummaryList /> below.
  //   - <Default>: the ready-made upgrade screen:
  //       <UpgradeRequired plan="ADVANCED">unlock your daily pomodoro summary!</UpgradeRequired>
  // ---------------------------------------------------------------------------
  return <DailySummaryList />;
};

export default DailySummaryPage;
