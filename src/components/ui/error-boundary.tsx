import React from 'react';
import { AlertCircle } from 'lucide-react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
  title?: string;
  description?: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public state: ErrorBoundaryState = {
    hasError: false,
  };

  public static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  public componentDidCatch(error: Error) {
    console.error(error);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="rounded-[28px] border border-rose-400/20 bg-rose-500/10 px-6 py-10 text-center text-rose-100">
          <div className="mx-auto flex max-w-xl flex-col items-center gap-3">
            <AlertCircle className="h-6 w-6" />
            <p className="text-lg font-semibold">{this.props.title ?? 'Reader error'}</p>
            <p className="text-sm/6 text-rose-100/85">
              {this.props.description ?? 'Something went wrong while rendering this view. Try closing and reopening the book.'}
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
