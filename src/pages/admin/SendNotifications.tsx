import { useState, useEffect } from "react";
import {
  Bell,
  Mail,
  MessageSquare,
  Users,
  User,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Search,
  Send,
  Save,
  Smartphone,
  Monitor,
  Image,
  Upload,
  Link2,
  FileText,
  Paperclip,
  RefreshCw,
  Copy,
  Eye,
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  X,
  Filter,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { adminService } from "@/services";

// ============ TYPES ============

type NotificationType = "push" | "email" | "sms";
type RecipientType = "all" | "clients" | "freelancers" | "specific";
type DeviceType = "iphone" | "android";

interface NotificationHistory {
  id: string;
  type: NotificationType;
  title: string;
  sentDate: string;
  recipients: number;
  deliveryRate: number;
  openRate?: number;
  status: "sent" | "scheduled" | "draft";
}

interface Template {
  id: string;
  name: string;
  type: NotificationType;
  content: string;
}

// ============ MOCK DATA ============

const notificationHistory: NotificationHistory[] = [
  {
    id: "1",
    type: "push",
    title: "New features launched! 🚀",
    sentDate: "2 hours ago",
    recipients: 2840,
    deliveryRate: 94,
    status: "sent",
  },
  {
    id: "2",
    type: "email",
    title: "February Newsletter",
    sentDate: "Yesterday",
    recipients: 1680,
    deliveryRate: 98,
    openRate: 32,
    status: "sent",
  },
  {
    id: "3",
    type: "sms",
    title: "Verification reminder",
    sentDate: "2 days ago",
    recipients: 450,
    deliveryRate: 99,
    status: "sent",
  },
  {
    id: "4",
    type: "push",
    title: "Weekend offer",
    sentDate: "Tomorrow, 10:00 AM",
    recipients: 1150,
    deliveryRate: 0,
    status: "scheduled",
  },
  {
    id: "5",
    type: "email",
    title: "Welcome Series - Part 2",
    sentDate: "Draft",
    recipients: 0,
    deliveryRate: 0,
    status: "draft",
  },
];

const savedTemplates: Template[] = [
  {
    id: "1",
    name: "Welcome Push",
    type: "push",
    content: "Welcome to ConnectMe!",
  },
  {
    id: "2",
    name: "Newsletter Header",
    type: "email",
    content: "Monthly updates...",
  },
  {
    id: "3",
    name: "OTP Template",
    type: "sms",
    content: "Your OTP is {{otp}}",
  },
];

// ============ COMPONENTS ============

const TypeIcon = ({ type }: { type: NotificationType }) => {
  const icons: Record<NotificationType, LucideIcon> = {
    push: Bell,
    email: Mail,
    sms: MessageSquare,
  };
  const Icon = icons[type];
  return <Icon size={16} />;
};

const StatusBadge = ({ status }: { status: NotificationHistory["status"] }) => {
  const config = {
    sent: { label: "Sent", className: "emerald" },
    scheduled: { label: "Scheduled", className: "cyan" },
    draft: { label: "Draft", className: "gray" },
  };
  const { label, className } = config[status];
  return <span className={`sn-status-badge ${className}`}>{label}</span>;
};

const CharCounter = ({
  current,
  max,
  info,
}: {
  current: number;
  max: number;
  info?: string;
}) => {
  const percentage = (current / max) * 100;
  const isWarning = percentage >= 80;
  const isError = percentage >= 100;

  return (
    <div
      className={`sn-char-counter ${isError ? "error" : isWarning ? "warning" : ""}`}
    >
      <span>
        {current}/{max}
      </span>
      {info && <span className="sn-char-info">{info}</span>}
    </div>
  );
};

const DeviceMockup = ({
  type,
  deviceType,
  content,
}: {
  type: NotificationType;
  deviceType: DeviceType;
  content: {
    title: string;
    message: string;
    subject?: string;
  };
}) => {
  return (
    <div className={`sn-device-mockup ${deviceType}`}>
      <div className="sn-device-frame">
        <div className="sn-device-notch"></div>
        <div className="sn-device-screen">
          {type === "push" && (
            <div className="sn-push-preview">
              <div className="sn-push-header">
                <div className="sn-app-icon">CM</div>
                <span>ConnectMe • now</span>
              </div>
              <div className="sn-push-content">
                <strong>{content.title || "Notification Title"}</strong>
                <p>
                  {content.message ||
                    "Your notification message will appear here..."}
                </p>
              </div>
            </div>
          )}
          {type === "email" && (
            <div className="sn-email-preview">
              <div className="sn-email-header">
                <div className="sn-email-from">
                  <div className="sn-email-avatar">CM</div>
                  <div>
                    <strong>ConnectMe</strong>
                    <span>noreply@connectme.in</span>
                  </div>
                </div>
              </div>
              <div className="sn-email-subject">
                <strong>{content.subject || "Email Subject Line"}</strong>
              </div>
              <div className="sn-email-body">
                <p>
                  {content.message ||
                    "Your email content preview will appear here..."}
                </p>
              </div>
            </div>
          )}
          {type === "sms" && (
            <div className="sn-sms-preview">
              <div className="sn-sms-header">CNTCTM</div>
              <div className="sn-sms-bubble">
                <p>
                  {content.message || "Your SMS message will appear here..."}
                </p>
                <span className="sn-sms-time">Just now</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  recipientCount,
  type,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  recipientCount: number;
  type: NotificationType;
}) => {
  if (!isOpen) return null;

  const smsCost = type === "sms" ? Math.round(recipientCount * 0.2) : 0;

  return (
    <div className="sn-modal-overlay open" onClick={onClose}>
      <div className="sn-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sn-modal-header">
          <Send size={24} />
          <h3>Confirm Send</h3>
        </div>

        <div className="sn-modal-body">
          <div className="sn-confirm-message">
            <AlertCircle size={20} />
            <span>
              You are about to send a {type} notification to{" "}
              <strong>{recipientCount.toLocaleString()} users</strong>
            </span>
          </div>

          {type === "sms" && smsCost > 0 && (
            <div className="sn-cost-estimate">
              <span>Approximate cost:</span>
              <strong>₹{smsCost}</strong>
            </div>
          )}
        </div>

        <div className="sn-modal-footer">
          <button className="sn-btn outline" onClick={onClose}>
            Cancel
          </button>
          <button className="sn-btn primary" onClick={onConfirm}>
            <Send size={16} />
            Confirm Send
          </button>
        </div>
      </div>
    </div>
  );
};

// ============ MAIN COMPONENT ============

const SendNotifications = () => {
  const [notificationType, setNotificationType] =
    useState<NotificationType>("push");
  const [recipientType, setRecipientType] = useState<RecipientType>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [deviceType, setDeviceType] = useState<DeviceType>("iphone");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [scheduleType, setScheduleType] = useState<"immediately" | "scheduled">(
    "immediately",
  );

  // Form states
  const [pushTitle, setPushTitle] = useState("");
  const [pushMessage, setPushMessage] = useState("");
  const [pushActionUrl, setPushActionUrl] = useState("");

  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [emailTemplate, setEmailTemplate] = useState("custom");

  const [smsMessage, setSmsMessage] = useState("");

  // Filters
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [subscriptionFilter, setSubscriptionFilter] = useState<string[]>([]);

  const [sendSuccess, setSendSuccess] = useState(false);
  const [recipientCounts, setRecipientCounts] = useState({ all: 0, clients: 0, freelancers: 0 });

  // Fetch user counts
  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const stats = await adminService.getDashboardStats();
        setRecipientCounts({
          all: stats.totalUsers || 0,
          clients: stats.totalClients || 0,
          freelancers: stats.totalFreelancers || 0,
        });
      } catch (error) {
        console.error("Error fetching counts:", error);
      }
    };
    fetchCounts();
  }, []);

  // Calculate recipient count
  const getRecipientCount = () => {
    const counts: Record<RecipientType, number> = {
      all: recipientCounts.all,
      clients: recipientCounts.clients,
      freelancers: recipientCounts.freelancers,
      specific: 0,
    };
    let count = counts[recipientType];

    if (locationFilter.length > 0) {
      count = Math.floor(count * 0.6);
    }
    if (subscriptionFilter.length > 0) {
      count = Math.floor(count * 0.5);
    }

    return count;
  };

  const recipientCount = getRecipientCount();

  // SMS character calculation
  const smsCount = Math.ceil(smsMessage.length / 160) || 1;

  const handleSendTest = () => {
    // Simulate sending test
    console.log("Sending test notification...");
  };

  const handleSaveDraft = () => {
    console.log("Saving draft...");
  };

  const handleSend = () => {
    setShowConfirmModal(true);
  };

  const confirmSend = async () => {
    try {
      const title = notificationType === "push" ? pushTitle : notificationType === "email" ? emailSubject : "SMS Notification";
      const message = notificationType === "push" ? pushMessage : notificationType === "email" ? emailBody : smsMessage;

      await adminService.sendNotification({
        title: title || "Admin Notification",
        message: message || "No message",
        type: notificationType === "push" ? "system" : notificationType,
        recipientType,
      });

      setShowConfirmModal(false);
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);

      // Reset form
      setPushTitle("");
      setPushMessage("");
      setPushActionUrl("");
      setEmailSubject("");
      setEmailBody("");
      setSmsMessage("");
    } catch (error) {
      console.error("Error sending notification:", error);
      setShowConfirmModal(false);
    }
  };

  return (
    <>
      {/* Page Header */}
      <div className="sn-page-header">
        <div className="sn-header-left">
          <h2>Send Notifications</h2>
          <p>Reach your users via Push, Email, or SMS</p>
        </div>
      </div>

      {sendSuccess && (
        <div style={{
          padding: '12px 20px', borderRadius: '8px', background: 'rgba(16,185,129,0.15)',
          border: '1px solid rgba(16,185,129,0.3)', color: '#10B981', marginBottom: '16px',
          display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 500
        }}>
          <CheckCircle size={18} />
          Notification sent successfully!
        </div>
      )}

      {/* Notification Type Tabs */}
      <div className="sn-type-tabs">
        <button
          className={notificationType === "push" ? "active" : ""}
          onClick={() => setNotificationType("push")}
        >
          <Bell size={18} />
          Push Notification
        </button>
        <button
          className={notificationType === "email" ? "active" : ""}
          onClick={() => setNotificationType("email")}
        >
          <Mail size={18} />
          Email
        </button>
        <button
          className={notificationType === "sms" ? "active" : ""}
          onClick={() => setNotificationType("sms")}
        >
          <MessageSquare size={18} />
          SMS
        </button>
      </div>

      {/* Two Column Layout */}
      <div className="sn-layout">
        {/* Left Column - Composer */}
        <div className="sn-composer">
          {/* Recipients Section */}
          <div className="sn-section">
            <h3>Recipients</h3>

            <div className="sn-recipients">
              <label className={recipientType === "all" ? "selected" : ""}>
                <input
                  type="radio"
                  name="recipient"
                  checked={recipientType === "all"}
                  onChange={() => setRecipientType("all")}
                />
                <Users size={18} />
                <span>All Users</span>
                <span className="sn-count">2,840</span>
              </label>
              <label className={recipientType === "clients" ? "selected" : ""}>
                <input
                  type="radio"
                  name="recipient"
                  checked={recipientType === "clients"}
                  onChange={() => setRecipientType("clients")}
                />
                <User size={18} />
                <span>Clients Only</span>
                <span className="sn-count">1,680</span>
              </label>
              <label
                className={recipientType === "freelancers" ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="recipient"
                  checked={recipientType === "freelancers"}
                  onChange={() => setRecipientType("freelancers")}
                />
                <Briefcase size={18} />
                <span>Freelancers Only</span>
                <span className="sn-count">1,150</span>
              </label>
              <label className={recipientType === "specific" ? "selected" : ""}>
                <input
                  type="radio"
                  name="recipient"
                  checked={recipientType === "specific"}
                  onChange={() => setRecipientType("specific")}
                />
                <Search size={18} />
                <span>Specific Users</span>
              </label>
            </div>

            {recipientType === "specific" && (
              <div className="sn-user-search">
                <Search size={16} />
                <input
                  type="text"
                  placeholder="Search users by name or email..."
                />
              </div>
            )}

            {/* Advanced Filters */}
            <button
              className="sn-filter-toggle"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            >
              <Filter size={16} />
              Advanced Filters
              {showAdvancedFilters ? (
                <ChevronUp size={16} />
              ) : (
                <ChevronDown size={16} />
              )}
            </button>

            {showAdvancedFilters && (
              <div className="sn-advanced-filters">
                <div className="sn-filter-group">
                  <label>Location</label>
                  <div className="sn-filter-options">
                    {[
                      "Telangana",
                      "Andhra Pradesh",
                      "Karnataka",
                      "Tamil Nadu",
                    ].map((loc) => (
                      <label
                        key={loc}
                        className={
                          locationFilter.includes(loc) ? "checked" : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={locationFilter.includes(loc)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setLocationFilter([...locationFilter, loc]);
                            } else {
                              setLocationFilter(
                                locationFilter.filter((l) => l !== loc),
                              );
                            }
                          }}
                        />
                        {loc}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="sn-filter-group">
                  <label>Subscription</label>
                  <div className="sn-filter-options">
                    {["Free", "Pro"].map((sub) => (
                      <label
                        key={sub}
                        className={
                          subscriptionFilter.includes(sub) ? "checked" : ""
                        }
                      >
                        <input
                          type="checkbox"
                          checked={subscriptionFilter.includes(sub)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSubscriptionFilter([
                                ...subscriptionFilter,
                                sub,
                              ]);
                            } else {
                              setSubscriptionFilter(
                                subscriptionFilter.filter((s) => s !== sub),
                              );
                            }
                          }}
                        />
                        {sub}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="sn-recipient-count">
              <Zap size={16} />
              <span>
                <strong>{recipientCount.toLocaleString()}</strong> users will
                receive this
              </span>
            </div>
          </div>

          {/* Notification Content */}
          <div className="sn-section">
            <h3>Notification Content</h3>

            {/* Push Notification Form */}
            {notificationType === "push" && (
              <div className="sn-form">
                <div className="sn-field">
                  <label>Title</label>
                  <input
                    type="text"
                    value={pushTitle}
                    onChange={(e) => setPushTitle(e.target.value.slice(0, 50))}
                    placeholder="Notification title..."
                  />
                  <CharCounter current={pushTitle.length} max={50} />
                </div>

                <div className="sn-field">
                  <label>Message</label>
                  <textarea
                    value={pushMessage}
                    onChange={(e) =>
                      setPushMessage(e.target.value.slice(0, 200))
                    }
                    placeholder="Notification message..."
                    rows={4}
                  />
                  <CharCounter current={pushMessage.length} max={200} />
                </div>

                <div className="sn-field">
                  <label>Icon</label>
                  <div className="sn-icon-options">
                    <label className="selected">
                      <input type="radio" name="icon" defaultChecked />
                      <div className="sn-icon-preview">CM</div>
                      <span>Default</span>
                    </label>
                    <label>
                      <input type="radio" name="icon" />
                      <div className="sn-icon-upload">
                        <Upload size={16} />
                      </div>
                      <span>Custom</span>
                    </label>
                  </div>
                </div>

                <div className="sn-field">
                  <label>Action URL (optional)</label>
                  <div className="sn-input-icon">
                    <Link2 size={16} />
                    <input
                      type="text"
                      value={pushActionUrl}
                      onChange={(e) => setPushActionUrl(e.target.value)}
                      placeholder="https://connectme.in/..."
                    />
                  </div>
                  <span className="sn-field-hint">
                    UTM parameters will be auto-added for tracking
                  </span>
                </div>
              </div>
            )}

            {/* Email Form */}
            {notificationType === "email" && (
              <div className="sn-form">
                <div className="sn-field">
                  <label>Template</label>
                  <select
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                  >
                    <option value="custom">Custom</option>
                    <option value="newsletter">Newsletter</option>
                    <option value="announcement">Announcement</option>
                    <option value="alert">Alert</option>
                  </select>
                </div>

                <div className="sn-field">
                  <label>Subject Line</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Email subject..."
                  />
                </div>

                <div className="sn-field">
                  <label>Email Body</label>
                  <div className="sn-editor-toolbar">
                    <button>
                      <strong>B</strong>
                    </button>
                    <button>
                      <em>I</em>
                    </button>
                    <button>
                      <u>U</u>
                    </button>
                    <span className="divider"></span>
                    <button>
                      <Link2 size={14} />
                    </button>
                    <button>
                      <Image size={14} />
                    </button>
                  </div>
                  <textarea
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    placeholder="Write your email content here..."
                    rows={8}
                  />
                </div>

                <div className="sn-personalization">
                  <span>Insert:</span>
                  <button onClick={() => setEmailBody(emailBody + "{{name}}")}>
                    {"{{name}}"}
                  </button>
                  <button
                    onClick={() => setEmailBody(emailBody + "{{location}}")}
                  >
                    {"{{location}}"}
                  </button>
                  <button
                    onClick={() => setEmailBody(emailBody + "{{subscription}}")}
                  >
                    {"{{subscription}}"}
                  </button>
                </div>

                <div className="sn-field">
                  <label>Attachment (optional)</label>
                  <div className="sn-upload-area">
                    <Paperclip size={20} />
                    <span>Drop files here or click to upload</span>
                  </div>
                </div>
              </div>
            )}

            {/* SMS Form */}
            {notificationType === "sms" && (
              <div className="sn-form">
                <div className="sn-field">
                  <label>Sender ID</label>
                  <select defaultValue="CNTCTM">
                    <option value="CNTCTM">CNTCTM (default)</option>
                    <option value="CNCTME">CNCTME</option>
                  </select>
                </div>

                <div className="sn-field">
                  <label>Message</label>
                  <textarea
                    value={smsMessage}
                    onChange={(e) => setSmsMessage(e.target.value)}
                    placeholder="Type your SMS message..."
                    rows={4}
                  />
                  <CharCounter
                    current={smsMessage.length}
                    max={160}
                    info={`${smsCount} SMS`}
                  />
                </div>

                <div className="sn-personalization">
                  <span>Insert:</span>
                  <button
                    onClick={() => setSmsMessage(smsMessage + "{{name}}")}
                  >
                    {"{{name}}"}
                  </button>
                  <button onClick={() => setSmsMessage(smsMessage + "{{otp}}")}>
                    {"{{otp}}"}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Scheduling */}
          <div className="sn-section">
            <h3>Scheduling</h3>

            <div className="sn-schedule-options">
              <label
                className={scheduleType === "immediately" ? "selected" : ""}
              >
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === "immediately"}
                  onChange={() => setScheduleType("immediately")}
                />
                <Zap size={18} />
                <span>Send Immediately</span>
              </label>
              <label className={scheduleType === "scheduled" ? "selected" : ""}>
                <input
                  type="radio"
                  name="schedule"
                  checked={scheduleType === "scheduled"}
                  onChange={() => setScheduleType("scheduled")}
                />
                <Calendar size={18} />
                <span>Schedule for Later</span>
              </label>
            </div>

            {scheduleType === "scheduled" && (
              <div className="sn-schedule-picker">
                <div className="sn-field-row">
                  <div className="sn-field">
                    <label>Date</label>
                    <input type="date" />
                  </div>
                  <div className="sn-field">
                    <label>Time</label>
                    <input type="time" />
                  </div>
                </div>
                <span className="sn-timezone">
                  Timezone: IST (Asia/Kolkata)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="sn-actions">
            <button className="sn-btn outline" onClick={handleSendTest}>
              <Send size={16} />
              Send Test
            </button>
            <button className="sn-btn outline" onClick={handleSaveDraft}>
              <Save size={16} />
              Save as Draft
            </button>
            <button className="sn-btn primary large" onClick={handleSend}>
              <Send size={18} />
              Send Notification
            </button>
          </div>
        </div>

        {/* Right Column - Preview & History */}
        <div className="sn-sidebar">
          {/* Live Preview */}
          <div className="sn-preview-card">
            <div className="sn-preview-header">
              <h4>Live Preview</h4>
              <div className="sn-device-toggle">
                <button
                  className={deviceType === "iphone" ? "active" : ""}
                  onClick={() => setDeviceType("iphone")}
                >
                  <Smartphone size={16} />
                </button>
                <button
                  className={deviceType === "android" ? "active" : ""}
                  onClick={() => setDeviceType("android")}
                >
                  <Monitor size={16} />
                </button>
              </div>
            </div>

            <DeviceMockup
              type={notificationType}
              deviceType={deviceType}
              content={{
                title: pushTitle,
                message:
                  notificationType === "push"
                    ? pushMessage
                    : notificationType === "sms"
                      ? smsMessage
                      : emailBody,
                subject: emailSubject,
              }}
            />
          </div>

          {/* Notification History */}
          <div className="sn-history-card">
            <div className="sn-history-header">
              <h4>Recent Notifications</h4>
            </div>

            <div className="sn-history-list">
              {notificationHistory.map((notification) => (
                <div key={notification.id} className="sn-history-item">
                  <div className="sn-history-icon">
                    <TypeIcon type={notification.type} />
                  </div>
                  <div className="sn-history-info">
                    <span className="sn-history-title">
                      {notification.title}
                    </span>
                    <span className="sn-history-meta">
                      {notification.sentDate} •{" "}
                      {notification.recipients.toLocaleString()} recipients
                    </span>
                    {notification.status === "sent" && (
                      <span className="sn-history-stats">
                        {notification.deliveryRate}% delivered
                        {notification.openRate &&
                          ` • ${notification.openRate}% opened`}
                      </span>
                    )}
                  </div>
                  <div className="sn-history-actions">
                    <StatusBadge status={notification.status} />
                    <div className="sn-history-buttons">
                      <button title="Resend">
                        <RefreshCw size={14} />
                      </button>
                      <button title="Duplicate">
                        <Copy size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Templates */}
          <div className="sn-templates-card">
            <div className="sn-templates-header">
              <h4>Saved Templates</h4>
              <button className="sn-btn-small">
                <Save size={14} />
                Save Current
              </button>
            </div>

            <div className="sn-templates-list">
              {savedTemplates
                .filter((t) => t.type === notificationType)
                .map((template) => (
                  <button key={template.id} className="sn-template-item">
                    <FileText size={16} />
                    <span>{template.name}</span>
                  </button>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="sn-analytics">
        <h3>Channel Analytics</h3>
        <div className="sn-analytics-grid">
          <div className="sn-analytics-card">
            <div className="sn-analytics-icon indigo">
              <Send size={20} />
            </div>
            <div className="sn-analytics-info">
              <span className="sn-analytics-value">94.2%</span>
              <span className="sn-analytics-label">Delivery Rate</span>
            </div>
            <div className="sn-analytics-trend up">
              <TrendingUp size={14} />
              +2.1%
            </div>
          </div>
          <div className="sn-analytics-card">
            <div className="sn-analytics-icon cyan">
              <Eye size={20} />
            </div>
            <div className="sn-analytics-info">
              <span className="sn-analytics-value">32.5%</span>
              <span className="sn-analytics-label">Open Rate</span>
            </div>
            <div className="sn-analytics-trend up">
              <TrendingUp size={14} />
              +5.3%
            </div>
          </div>
          <div className="sn-analytics-card">
            <div className="sn-analytics-icon emerald">
              <CheckCircle size={20} />
            </div>
            <div className="sn-analytics-info">
              <span className="sn-analytics-value">12.8%</span>
              <span className="sn-analytics-label">Click Rate</span>
            </div>
            <div className="sn-analytics-trend up">
              <TrendingUp size={14} />
              +1.2%
            </div>
          </div>
          <div className="sn-analytics-card">
            <div className="sn-analytics-icon rose">
              <X size={20} />
            </div>
            <div className="sn-analytics-info">
              <span className="sn-analytics-value">0.8%</span>
              <span className="sn-analytics-label">Unsubscribe Rate</span>
            </div>
            <div className="sn-analytics-trend down">
              <TrendingUp size={14} style={{ transform: "rotate(180deg)" }} />
              -0.3%
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmSend}
        recipientCount={recipientCount}
        type={notificationType}
      />
    </>
  );
};

export default SendNotifications;
