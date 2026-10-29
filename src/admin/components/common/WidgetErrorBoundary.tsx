/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Widget Error Boundary
 * Ensures individual dashboard widget failures do not crash the Executive Control Center
 */

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  widgetTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class WidgetErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`[WidgetErrorBoundary] Error in ${this.props.widgetTitle || 'Widget'}:`, error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-[#121823] border border-red-500/40 rounded-xl p-5 shadow-lg space-y-3 font-mono">
          <div className="flex items-center gap-2 text-red-400">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <h3 className="text-xs font-bold uppercase tracking-wider">
              {this.props.widgetTitle || 'Widget'} Failed to Render
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            This panel encountered a runtime error and isolated its state safely without disrupting the rest of the executive dashboard.
          </p>
          <div className="bg-[#0D1118] p-2.5 rounded border border-red-950 text-[10px] text-red-300 font-mono overflow-x-auto">
            {this.state.error?.message || 'Unknown runtime error'}
          </div>
          <button
            onClick={this.handleReset}
            className="px-3 py-1.5 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs text-slate-200 rounded flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#22D3EE]" />
            <span>Retry Loading Widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
