import { render } from '@testing-library/react';

// Basic smoke test to ensure the testing environment is configured
test('renders without crashing', () => {
  render(<div />);
});
