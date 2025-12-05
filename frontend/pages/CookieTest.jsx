import React, { useState, useEffect } from "react";
import API from "../utils/axiosClient";

export default function CookieTest() {
  const [testResult, setTestResult] = useState(null);
  const [debugInfo, setDebugInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const testCookie = async () => {
    setLoading(true);
    try {
      const result = await API.auth.testCookie();
      setTestResult(result);
    } catch (err) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const checkCookieDebug = async () => {
    setLoading(true);
    try {
      const result = await API.auth.cookieDebug();
      setDebugInfo(result);
    } catch (err) {
      setDebugInfo({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    
    checkCookieDebug();
  }, []);

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h2>Cookie Diagnostic Tool</h2>
            </div>
            <div className="card-body">
              <div className="mb-4">
                <h4>Browser Cookie Status</h4>
                <pre className="bg-light p-3 rounded">
                  {JSON.stringify({
                    documentCookies: document.cookie || "No cookies",
                    cookieCount: document.cookie ? document.cookie.split(';').filter(c => c.trim()).length : 0,
                    hasSessionCookie: document.cookie.includes("maitri.sid"),
                    hasTestCookie: document.cookie.includes("maitri-test-cookie")
                  }, null, 2)}
                </pre>
              </div>

              <div className="mb-4">
                <button 
                  className="btn btn-primary me-2" 
                  onClick={testCookie}
                  disabled={loading}
                >
                  {loading ? "Testing..." : "Test Cookie Setting"}
                </button>
                <button 
                  className="btn btn-secondary" 
                  onClick={checkCookieDebug}
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Check Cookie Debug"}
                </button>
              </div>

              {testResult && (
                <div className="mb-4">
                  <h4>Cookie Test Result</h4>
                  <pre className="bg-light p-3 rounded">
                    {JSON.stringify(testResult, null, 2)}
                  </pre>
                </div>
              )}

              {debugInfo && (
                <div className="mb-4">
                  <h4>Cookie Debug Info</h4>
                  <pre className="bg-light p-3 rounded" style={{ maxHeight: "500px", overflow: "auto" }}>
                    {JSON.stringify(debugInfo, null, 2)}
                  </pre>
                </div>
              )}

              <div className="alert alert-info">
                <h5>Instructions:</h5>
                <ol>
                  <li>Click "Test Cookie Setting" to set a test cookie</li>
                  <li>Check browser DevTools → Application → Cookies to see if cookie was set</li>
                  <li>Click "Check Cookie Debug" to see if the cookie is being sent in requests</li>
                  <li>Check the console for detailed logs</li>
                </ol>
              </div>

              <div className="alert alert-danger">
                <h5>⚠️ Why Browsers Block Cookies:</h5>
                <p><strong>Your frontend and backend are on different domains:</strong></p>
                <ul>
                  <li>Frontend: <code>maitri-online-therapy-1.onrender.com</code></li>
                  <li>Backend: <code>maitri-online-therapy.onrender.com</code></li>
                </ul>
                <p className="mb-2">Browsers treat this as <strong>"third-party cookies"</strong> and block them for privacy.</p>
                
                <h6 className="mt-3">Safari (Most Strict):</h6>
                <ul>
                  <li><strong>ITP (Intelligent Tracking Prevention)</strong> blocks ALL third-party cookies by default</li>
                  <li>Cookies expire after 7 days of no user interaction</li>
                  <li><strong>Fix:</strong> Settings → Safari → Privacy → <strong>Uncheck "Prevent Cross-Site Tracking"</strong></li>
                  <li><strong>Note:</strong> Safari blocks cookies even with correct SameSite=None + Secure settings</li>
                </ul>

                <h6 className="mt-3">Firefox:</h6>
                <ol>
                  <li>Click menu (☰) → <strong>Settings</strong> → <strong>Privacy & Security</strong></li>
                  <li>Under <strong>Enhanced Tracking Protection</strong>, select <strong>Standard</strong> or <strong>Custom</strong> (allow all cookies)</li>
                  <li>Scroll to <strong>Cookies and Site Data</strong> → Click <strong>Manage Exceptions...</strong></li>
                  <li>Add these domains and click <strong>Allow</strong>:
                    <ul>
                      <li><code>https://maitri-online-therapy-1.onrender.com</code></li>
                      <li><code>https://maitri-online-therapy.onrender.com</code></li>
                    </ul>
                  </li>
                  <li>Click <strong>Save Changes</strong> and refresh the page</li>
                </ol>
                <p className="mb-0"><strong>Alternative:</strong> Type <code>about:config</code> in address bar, search for <code>network.cookie.cookieBehavior</code>, set to <code>0</code> (Accept all cookies).</p>

                <h6 className="mt-3">Chrome/Edge:</h6>
                <ol>
                  <li>Settings → Privacy and security → Third-party cookies → <strong>Allow</strong></li>
                  <li><strong>Note:</strong> Chrome is phasing out third-party cookies in 2024</li>
                </ol>

                <div className="alert alert-info mt-3 mb-0">
                  <strong>💡 Best Solution:</strong> Use the same domain for frontend and backend (e.g., <code>app.maitri.com</code> and <code>api.maitri.com</code>) to use same-site cookies instead of third-party cookies.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

