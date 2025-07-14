import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { createBrowserHistory } from 'history';

const browserHistory = createBrowserHistory();
const reactPlugin = new ReactPlugin();

const appInsights = new ApplicationInsights({
  config: {
    connectionString: import.meta.env.VITE_APP_INSIGHTS_CONNECTION_STRING || 'InstrumentationKey=bac121a4-3143-43b0-b60f-4f10f08c6227;IngestionEndpoint=https://eastus-8.in.applicationinsights.azure.com/;LiveEndpoint=https://eastus.livediagnostics.monitor.azure.com/;ApplicationId=6d31d669-5849-4303-9d00-22bd95710888',
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: { history: browserHistory }
    },
    enableAutoRouteTracking: true,
    disableFetchTracking: false,
    enableCorsCorrelation: true,
    enableRequestHeaderTracking: true,
    enableResponseHeaderTracking: true,
    disableAjaxTracking: false,
    autoTrackPageVisitTime: true,
    enableUnhandledPromiseRejectionTracking: true,
    name: 'CBX Rentals',
    maxBatchInterval: 5000,
    disableExceptionTracking: false,
    samplingPercentage: 100
  }
});

// Load and initialize Application Insights
appInsights.loadAppInsights();

// Track page views automatically
appInsights.trackPageView();

// Global error handler
window.addEventListener('error', (event) => {
  trackException(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
    type: 'unhandled_error'
  });
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', (event) => {
  trackException(new Error(event.reason), {
    type: 'unhandled_promise_rejection',
    promise: event.promise
  });
});

// Set authenticated user context (if available)
export const setAuthenticatedUserContext = (userId: string, accountId?: string) => {
  appInsights.setAuthenticatedUserContext(userId, accountId);
  // Also add to telemetry initializer to ensure all events have user context
  appInsights.addTelemetryInitializer((envelope) => {
    if (envelope.tags) {
      envelope.tags['ai.user.authUserId'] = userId;
      envelope.tags['ai.user.accountId'] = accountId || userId;
    }
    if (envelope.data) {
      envelope.data.user = userId;
    }
    return true;
  });
};

// Track custom events
export const trackEvent = (name: string, properties?: { [key: string]: any }) => {
  appInsights.trackEvent({ name }, properties);
};

// Track exceptions
export const trackException = (error: Error, properties?: { [key: string]: any }) => {
  console.error('Tracking exception:', error, properties);
  appInsights.trackException({ 
    exception: error,
    severityLevel: 3 // Error level
  }, {
    ...properties,
    errorMessage: error.message,
    errorStack: error.stack,
    timestamp: new Date().toISOString(),
    url: window.location.href,
    userAgent: navigator.userAgent
  });
};

// Track page views
export const trackPageView = (name?: string, url?: string, properties?: { [key: string]: any }) => {
  appInsights.trackPageView({ name, uri: url }, properties);
};

// Track custom metrics
export const trackMetric = (name: string, value: number, properties?: { [key: string]: any }) => {
  appInsights.trackMetric({ name, average: value }, properties);
};

// Track dependencies (API calls)
export const trackDependency = (
  name: string,
  url: string,
  duration: number,
  success: boolean,
  resultCode: number
) => {
  appInsights.trackDependencyData({
    id: `${Date.now()}`,
    name,
    duration,
    success,
    responseCode: resultCode,
    target: url,
    type: 'HTTP'
  });
};

export { appInsights, reactPlugin };