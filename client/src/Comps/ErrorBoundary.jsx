import { Component } from "react";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-100 p-6" dir="rtl">
          <div className="max-w-md w-full bg-white rounded-md border border-slate-200 shadow-sm p-8 text-center space-y-4">
            <p className="text-4xl" aria-hidden>⚠️</p>
            <h1 className="text-lg font-bold text-slate-900">משהו השתבש</h1>
            <p className="text-sm text-slate-600 leading-relaxed">
              אירעה שגיאה בלתי צפויה. אפשר לרענן את הדף או לחזור לדף הבית.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="px-4 py-2.5 rounded-sm bg-zinc-900 text-white text-sm font-semibold
                  hover:bg-zinc-800 transition"
              >
                רענן דף
              </button>
              <button
                type="button"
                onClick={() => {
                  this.setState({ hasError: false });
                  window.location.assign("/");
                }}
                className="px-4 py-2.5 rounded-sm border border-slate-200 text-slate-700 text-sm font-medium
                  hover:bg-slate-50 transition"
              >
                לדף הבית
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
