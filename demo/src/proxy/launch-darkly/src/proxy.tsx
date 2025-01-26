/* 
This is a sample of how launch darkly would be integrated within the system.
However, this implementation will not be done since devcycle is already integrated.
*/

import { render } from 'react-dom';
import { withLDProvider } from 'launchdarkly-react-client-sdk';

const App = (): JSX.Element => {
    return (<div>test</div>)
};

const LDProvider = withLDProvider({
  clientSideID: 'client-side-id-123abc',
  context: {
    "kind": "user",
    "key": "user-key-123abc",
    "name": "Sandy Smith",
    "email": "sandy@example.com"
  },
  options: { /* ... */ }
})(App);

const rootElement = document.getElementById("root");

render(<LDProvider />, rootElement);
