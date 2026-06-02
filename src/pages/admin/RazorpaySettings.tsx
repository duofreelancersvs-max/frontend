import { useState } from "react";
import {
  CheckCircle,
  XCircle,
  Shield,
  AlertTriangle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  ExternalLink,
  Beaker,
  Zap,
  Clock,
  Globe,
  Settings,
  Link2,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Play,
  FileText,
  HelpCircle,
  Phone,
  BookOpen,
} from "lucide-react";

// ============ TYPES ============

interface WebhookEvent {
  id: string;
  event: string;
  status: "delivered" | "failed" | "retrying";
  timestamp: string;
  payload?: string;
}

interface TestTransaction {
  id: string;
  amount: number;
  status: "success" | "failed";
  timestamp: string;
  method: string;
}

// ============ MOCK DATA ============

const webhookEvents: WebhookEvent[] = [
  {
    id: "1",
    event: "payment.captured",
    status: "delivered",
    timestamp: "2 minutes ago",
    payload: '{"entity":"payment","amount":49900,"currency":"INR"}',
  },
  {
    id: "2",
    event: "subscription.charged",
    status: "delivered",
    timestamp: "15 minutes ago",
    payload: '{"entity":"subscription","plan_id":"plan_xyz"}',
  },
  {
    id: "3",
    event: "refund.processed",
    status: "failed",
    timestamp: "1 hour ago",
    payload: '{"entity":"refund","amount":4999}',
  },
  {
    id: "4",
    event: "payment.captured",
    status: "retrying",
    timestamp: "2 hours ago",
    payload: '{"entity":"payment","amount":99900}',
  },
];

const testTransactions: TestTransaction[] = [
  {
    id: "pay_test_001",
    amount: 499,
    status: "success",
    timestamp: "5 min ago",
    method: "Card",
  },
  {
    id: "pay_test_002",
    amount: 999,
    status: "success",
    timestamp: "1 hour ago",
    method: "UPI",
  },
  {
    id: "pay_test_003",
    amount: 499,
    status: "failed",
    timestamp: "2 hours ago",
    method: "Card",
  },
];

// ============ COMPONENTS ============

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button className="rp-copy-btn" onClick={handleCopy}>
      {copied ? <Check size={14} /> : <Copy size={14} />}
      {copied ? "Copied!" : "Copy"}
    </button>
  );
};

const MaskedField = ({
  label,
  value,
  masked,
}: {
  label: string;
  value: string;
  masked: string;
}) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="rp-field">
      <label>{label}</label>
      <div className="rp-field-input">
        <input type="text" value={isVisible ? value : masked} readOnly />
        <button
          className="rp-field-toggle"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
        <CopyButton text={value} />
      </div>
    </div>
  );
};

const StatusBadge = ({
  status,
}: {
  status: "delivered" | "failed" | "retrying";
}) => {
  const config = {
    delivered: { label: "Delivered", className: "emerald" },
    failed: { label: "Failed", className: "rose" },
    retrying: { label: "Retrying", className: "amber" },
  };
  const { label, className } = config[status];
  return <span className={`rp-status-badge ${className}`}>{label}</span>;
};

const WebhookEventRow = ({
  event,
  onRetry,
}: {
  event: WebhookEvent;
  onRetry: (id: string) => void;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr className={expanded ? "expanded" : ""}>
        <td className="rp-event-name">{event.event}</td>
        <td>
          <StatusBadge status={event.status} />
        </td>
        <td className="rp-event-time">{event.timestamp}</td>
        <td>
          <div className="rp-event-actions">
            {event.status === "failed" && (
              <button
                className="rp-action-btn retry"
                onClick={() => onRetry(event.id)}
              >
                <RotateCcw size={14} />
                Retry
              </button>
            )}
            <button
              className="rp-action-btn expand"
              onClick={() => setExpanded(!expanded)}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              Payload
            </button>
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="rp-payload-row">
          <td colSpan={4}>
            <pre className="rp-payload">{event.payload}</pre>
          </td>
        </tr>
      )}
    </>
  );
};

const LiveModeModal = ({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  const [checklist, setChecklist] = useState({
    kyc: false,
    bank: false,
    webhook: false,
    terms: false,
  });

  const allChecked = Object.values(checklist).every(Boolean);

  if (!isOpen) return null;

  return (
    <div className="rp-modal-overlay open" onClick={onClose}>
      <div className="rp-modal" onClick={(e) => e.stopPropagation()}>
        <div className="rp-modal-header warning">
          <AlertTriangle size={24} />
          <h3>Switch to Live Mode</h3>
        </div>

        <div className="rp-modal-body">
          <div className="rp-warning-banner critical">
            <AlertTriangle size={18} />
            <p>
              <strong>Warning:</strong> Switching to live mode will process real
              payments. Ensure you have completed all requirements.
            </p>
          </div>

          <div className="rp-checklist">
            <h4>Requirements Checklist</h4>
            <label className={checklist.kyc ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.kyc}
                onChange={(e) =>
                  setChecklist({ ...checklist, kyc: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              KYC completed with Razorpay
            </label>
            <label className={checklist.bank ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.bank}
                onChange={(e) =>
                  setChecklist({ ...checklist, bank: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Bank account verified
            </label>
            <label className={checklist.webhook ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.webhook}
                onChange={(e) =>
                  setChecklist({ ...checklist, webhook: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Webhook tested and working
            </label>
            <label className={checklist.terms ? "checked" : ""}>
              <input
                type="checkbox"
                checked={checklist.terms}
                onChange={(e) =>
                  setChecklist({ ...checklist, terms: e.target.checked })
                }
              />
              <span className="checkmark"></span>
              Terms of service updated
            </label>
          </div>
        </div>

        <div className="rp-modal-footer">
          <button className="rp-btn outline" onClick={onClose}>
            Cancel
          </button>
          <button
            className="rp-btn danger"
            onClick={onConfirm}
            disabled={!allChecked}
          >
            <Zap size={16} />
            Enable Live Mode
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const RazorpaySettings = () => {
  const [isConnected] = useState(true);
  const [isTestMode, setIsTestMode] = useState(true);
  const [showLiveModeModal, setShowLiveModeModal] = useState(false);
  const [webhookSettings, setWebhookSettings] = useState({
    paymentCaptured: true,
    subscriptionCharged: true,
    subscriptionCancelled: true,
    refundProcessed: true,
    orderPaid: false,
  });
  const [paymentSettings, setPaymentSettings] = useState({
    captureMethod: "automatic",
    retryAttempts: 3,
    timeout: 30,
  });

  const handleTestConnection = () => {
    // Simulate test connection
    console.log("Testing connection...");
  };

  const handleCreateTestPayment = () => {
    // Create test payment
    console.log("Creating test payment...");
  };

  const handleLiveModeToggle = () => {
    if (isTestMode) {
      setShowLiveModeModal(true);
    } else {
      setIsTestMode(true);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="rp-page-header">
        <div className="rp-header-left">
          <h2>Razorpay Integration</h2>
          <span
            className={`rp-connection-badge ${isConnected ? "connected" : "disconnected"}`}
          >
            <span className="rp-status-dot"></span>
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>

      {/* Connection Status Card */}
      <div
        className={`rp-card status-card ${isConnected ? "connected" : "disconnected"}`}
      >
        <div className="rp-status-header">
          <div className="rp-status-icon">
            {isConnected ? <CheckCircle size={32} /> : <XCircle size={32} />}
          </div>
          <div className="rp-status-info">
            <h3>
              {isConnected ? "Payment Gateway Active" : "Connection Failed"}
            </h3>
            <p>Last synced: 2 minutes ago</p>
            <p className="rp-account-id">Account ID: acc_NqR5H7xxxxxxxxx</p>
          </div>
        </div>
        <div className="rp-status-actions">
          <button className="rp-btn outline" onClick={handleTestConnection}>
            <RefreshCw size={16} />
            Test Connection
          </button>
          {isConnected && (
            <button className="rp-btn danger-outline">
              <X size={16} />
              Disconnect
            </button>
          )}
        </div>
      </div>

      <div className="rp-grid">
        {/* API Credentials Section */}
        <div className="rp-card">
          <div className="rp-card-header">
            <Shield size={20} />
            <h3>API Credentials</h3>
          </div>

          <div className="rp-warning-banner">
            <AlertTriangle size={16} />
            <span>These are sensitive credentials. Keep them secure!</span>
          </div>

          <div className="rp-fields">
            <MaskedField
              label="Key ID"
              value="rzp_live_NqR5H7Gk2mXYaB"
              masked="rzp_live_NqR5H7xxxxxxxxx"
            />
            <MaskedField
              label="Key Secret"
              value="P7tXwZyK9mN5sD3fA8hJ2vL4"
              masked="••••••••••••••••••••••••"
            />
          </div>

          <div className="rp-actions">
            <button className="rp-btn primary">
              <RefreshCw size={16} />
              Update Credentials
            </button>
            <button className="rp-btn warning-outline">
              <RotateCcw size={16} />
              Rotate Keys
            </button>
          </div>
        </div>

        {/* Webhook Configuration */}
        <div className="rp-card">
          <div className="rp-card-header">
            <Link2 size={20} />
            <h3>Webhook Settings</h3>
          </div>

          <div className="rp-field">
            <label>Webhook URL</label>
            <div className="rp-field-input readonly">
              <input
                type="text"
                value="https://api.connectmeindia.in/webhooks/razorpay"
                readOnly
              />
              <CopyButton text="https://api.connectmeindia.in/webhooks/razorpay" />
            </div>
          </div>

          <MaskedField
            label="Webhook Secret"
            value="whsec_K8mN5sD3fA8hJ2vL4P7tXwZy"
            masked="whsec_••••••••••••••••••••"
          />

          <div className="rp-checkboxes">
            <h4>Subscribed Events</h4>
            <label>
              <input
                type="checkbox"
                checked={webhookSettings.paymentCaptured}
                onChange={(e) =>
                  setWebhookSettings({
                    ...webhookSettings,
                    paymentCaptured: e.target.checked,
                  })
                }
              />
              <span>payment.captured</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={webhookSettings.subscriptionCharged}
                onChange={(e) =>
                  setWebhookSettings({
                    ...webhookSettings,
                    subscriptionCharged: e.target.checked,
                  })
                }
              />
              <span>subscription.charged</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={webhookSettings.subscriptionCancelled}
                onChange={(e) =>
                  setWebhookSettings({
                    ...webhookSettings,
                    subscriptionCancelled: e.target.checked,
                  })
                }
              />
              <span>subscription.cancelled</span>
            </label>
            <label>
              <input
                type="checkbox"
                checked={webhookSettings.refundProcessed}
                onChange={(e) =>
                  setWebhookSettings({
                    ...webhookSettings,
                    refundProcessed: e.target.checked,
                  })
                }
              />
              <span>refund.processed</span>
            </label>
            <label className="optional">
              <input
                type="checkbox"
                checked={webhookSettings.orderPaid}
                onChange={(e) =>
                  setWebhookSettings({
                    ...webhookSettings,
                    orderPaid: e.target.checked,
                  })
                }
              />
              <span>order.paid (optional)</span>
            </label>
          </div>

          <div className="rp-actions">
            <button className="rp-btn primary">Save Webhook Settings</button>
          </div>
        </div>

        {/* Payment Settings */}
        <div className="rp-card">
          <div className="rp-card-header">
            <Settings size={20} />
            <h3>Payment Settings</h3>
          </div>

          <div className="rp-field">
            <label>Currency</label>
            <div className="rp-field-input readonly locked">
              <Globe size={16} />
              <input type="text" value="INR (₹)" readOnly />
              <span className="rp-locked-badge">Locked</span>
            </div>
          </div>

          <div className="rp-field">
            <label>Capture Method</label>
            <div className="rp-radio-group">
              <label
                className={
                  paymentSettings.captureMethod === "automatic"
                    ? "selected"
                    : ""
                }
              >
                <input
                  type="radio"
                  name="captureMethod"
                  checked={paymentSettings.captureMethod === "automatic"}
                  onChange={() =>
                    setPaymentSettings({
                      ...paymentSettings,
                      captureMethod: "automatic",
                    })
                  }
                />
                <span className="rp-radio-label">
                  <span>Automatic</span>
                  <span className="recommended">Recommended</span>
                </span>
              </label>
              <label
                className={
                  paymentSettings.captureMethod === "manual" ? "selected" : ""
                }
              >
                <input
                  type="radio"
                  name="captureMethod"
                  checked={paymentSettings.captureMethod === "manual"}
                  onChange={() =>
                    setPaymentSettings({
                      ...paymentSettings,
                      captureMethod: "manual",
                    })
                  }
                />
                <span className="rp-radio-label">Manual</span>
              </label>
            </div>
          </div>

          <div className="rp-field-row">
            <div className="rp-field">
              <label>Retry Attempts</label>
              <input
                type="number"
                value={paymentSettings.retryAttempts}
                onChange={(e) =>
                  setPaymentSettings({
                    ...paymentSettings,
                    retryAttempts: parseInt(e.target.value),
                  })
                }
                min={1}
                max={5}
              />
            </div>
            <div className="rp-field">
              <label>Timeout (minutes)</label>
              <input
                type="number"
                value={paymentSettings.timeout}
                onChange={(e) =>
                  setPaymentSettings({
                    ...paymentSettings,
                    timeout: parseInt(e.target.value),
                  })
                }
                min={5}
                max={60}
              />
            </div>
          </div>

          <div className="rp-actions">
            <button className="rp-btn primary">Save Settings</button>
          </div>
        </div>

        {/* Test Environment */}
        <div className="rp-card test-env">
          <div className="rp-card-header">
            <Beaker size={20} />
            <h3>Test Environment</h3>
            <label className="rp-toggle-wrapper">
              <span>Test Mode</span>
              <div className="rp-toggle">
                <input type="checkbox" checked={isTestMode} readOnly />
                <span className="rp-toggle-slider"></span>
              </div>
            </label>
          </div>

          <div className="rp-test-card-details">
            <h4>Test Card Details</h4>
            <div className="rp-test-grid">
              <div className="rp-test-item">
                <span className="label">Card Number</span>
                <span className="value">5267 3181 8797 5449</span>
                <CopyButton text="5267318187975449" />
              </div>
              <div className="rp-test-item">
                <span className="label">Expiry</span>
                <span className="value">Any future date</span>
              </div>
              <div className="rp-test-item">
                <span className="label">CVV</span>
                <span className="value">Random 3 digits</span>
              </div>
              <div className="rp-test-item">
                <span className="label">OTP</span>
                <span className="value">123456</span>
                <CopyButton text="123456" />
              </div>
            </div>
          </div>

          <button className="rp-btn cyan" onClick={handleCreateTestPayment}>
            <Play size={16} />
            Create Test Payment
          </button>

          {/* Recent Test Transactions */}
          <div className="rp-test-transactions">
            <h4>Recent Test Transactions</h4>
            <table className="rp-mini-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Method</th>
                </tr>
              </thead>
              <tbody>
                {testTransactions.map((tx) => (
                  <tr key={tx.id}>
                    <td className="rp-tx-id">{tx.id}</td>
                    <td>₹{tx.amount}</td>
                    <td>
                      <span className={`rp-mini-badge ${tx.status}`}>
                        {tx.status === "success" ? (
                          <Check size={12} />
                        ) : (
                          <X size={12} />
                        )}
                        {tx.status}
                      </span>
                    </td>
                    <td>{tx.method}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Live Mode Section */}
      <div className="rp-card live-mode-section">
        <div className="rp-live-header">
          <div className="rp-live-info">
            <Zap size={24} />
            <div>
              <h3>Live Mode</h3>
              <p>Process real payments from customers</p>
            </div>
          </div>
          <div className="rp-live-toggle">
            <span className={isTestMode ? "" : "active"}>Live</span>
            <label className="rp-toggle large">
              <input
                type="checkbox"
                checked={isTestMode}
                onChange={handleLiveModeToggle}
              />
              <span className="rp-toggle-slider"></span>
            </label>
            <span className={isTestMode ? "active" : ""}>Test</span>
          </div>
        </div>
        {!isTestMode && (
          <div className="rp-live-warning">
            <AlertTriangle size={18} />
            <span>Live mode is active. Real payments are being processed.</span>
          </div>
        )}
      </div>

      {/* Transaction Logs */}
      <div className="rp-card">
        <div className="rp-card-header">
          <Clock size={20} />
          <h3>Webhook Event Logs</h3>
        </div>

        <div className="rp-events-table-wrapper">
          <table className="rp-events-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Status</th>
                <th>Time</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {webhookEvents.map((event) => (
                <WebhookEventRow
                  key={event.id}
                  event={event}
                  onRetry={(id) => console.log("Retrying", id)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Support Links */}
      <div className="rp-support-links">
        <a
          href="https://razorpay.com/docs/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <BookOpen size={16} />
          Razorpay Documentation
          <ExternalLink size={14} />
        </a>
        <a
          href="https://razorpay.com/support/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Phone size={16} />
          Contact Razorpay Support
          <ExternalLink size={14} />
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <FileText size={16} />
          View API Logs
          <ExternalLink size={14} />
        </a>
        <a href="#" onClick={(e) => e.preventDefault()}>
          <HelpCircle size={16} />
          Integration Help
          <ExternalLink size={14} />
        </a>
      </div>

      {/* Live Mode Modal */}
      <LiveModeModal
        isOpen={showLiveModeModal}
        onClose={() => setShowLiveModeModal(false)}
        onConfirm={() => {
          setIsTestMode(false);
          setShowLiveModeModal(false);
        }}
      />
    </>
  );
};

export default RazorpaySettings;
