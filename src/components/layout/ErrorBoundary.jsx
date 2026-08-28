import { Component } from 'react';

import { Button } from '@/components/ui';

/**
 * Catches render errors so one broken screen shows a recoverable message
 * instead of unmounting the whole app to a blank page.
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  handleReset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;
    const { children } = this.props;

    if (!error) return children;

    return (
      <main
        role="alert"
        className="flex min-h-dvh flex-col items-center justify-center gap-5 px-6 text-center"
      >
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-ink dark:text-ink-dark">
            This screen ran into a problem
          </h1>
          <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted dark:text-muted-soft">
            Reloading usually clears it. If it keeps happening, let your
            administrator know what you were doing at the time.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2">
          <Button onClick={() => window.location.reload()}>Reload the page</Button>
          <Button variant="secondary" onClick={this.handleReset}>
            Try again
          </Button>
        </div>
      </main>
    );
  }
}
