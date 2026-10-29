/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — VIP Gmail Communication Hub
 * Full-featured Gmail client integrated into VIP Control Center.
 * Handles authentication, inbox browsing, email preview, reply, compose, and trashing with mandatory user confirmation dialogs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { gmailService, ParsedEmail, GmailProfile } from '../../services/gmailService';
import { AdminBadge } from '../components/common/AdminBadge';
import { 
  Mail, 
  Inbox, 
  Send, 
  Star, 
  Trash2, 
  AlertCircle, 
  RefreshCw, 
  Search, 
  Plus, 
  X, 
  CornerUpLeft, 
  Archive, 
  CheckCircle2, 
  Loader2, 
  ShieldAlert, 
  User as UserIcon,
  Clock,
  ChevronRight
} from 'lucide-react';

export const VIPGmailHub: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [profile, setProfile] = useState<GmailProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Email State
  const [activeFolder, setActiveFolder] = useState<string>('INBOX');
  const [messages, setMessages] = useState<ParsedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<ParsedEmail | null>(null);
  const [loadingEmailDetail, setLoadingEmailDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & User Confirmation Dialogs
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Reply State
  const [isReplyOpen, setIsReplyOpen] = useState(false);
  const [replyBody, setReplyBody] = useState('');

  // Mandatory Confirmation Dialog States for Destructive/Mutating Operations
  const [sendConfirmationModal, setSendConfirmationModal] = useState<{
    isOpen: boolean;
    to: string;
    subject: string;
    body: string;
    threadId?: string;
  }>({ isOpen: false, to: '', subject: '', body: '' });

  const [trashConfirmationModal, setTrashConfirmationModal] = useState<{
    isOpen: boolean;
    email: ParsedEmail | null;
  }>({ isOpen: false, email: null });

  const [isSending, setIsSending] = useState(false);
  const [isTrashing, setIsTrashing] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const token = gmailService.getCachedToken();
    if (token) {
      setIsAuthenticated(true);
      fetchProfileAndEmails();
    }
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setLoading(true);
    try {
      await gmailService.authenticateWithGmail();
      setIsAuthenticated(true);
      await fetchProfileAndEmails();
    } catch (err: any) {
      setAuthError(err.message || 'Failed to authenticate with Gmail API.');
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileAndEmails = useCallback(async () => {
    setLoading(true);
    setAuthError(null);
    try {
      const prof = await gmailService.getProfile();
      setProfile(prof);

      // Fetch emails
      let query = searchQuery.trim();
      let labelIds: string[] = [];

      if (activeFolder === 'INBOX') labelIds = ['INBOX'];
      else if (activeFolder === 'SENT') labelIds = ['SENT'];
      else if (activeFolder === 'STARRED') labelIds = ['STARRED'];
      else if (activeFolder === 'TRASH') labelIds = ['TRASH'];
      else if (activeFolder === 'UNREAD') labelIds = ['UNREAD'];

      const listRes = await gmailService.listMessages({
        q: query || undefined,
        labelIds: labelIds.length > 0 ? labelIds : undefined,
        maxResults: 15,
      });

      if (listRes.messages.length > 0) {
        const fetchedEmails = await Promise.all(
          listRes.messages.map(m => gmailService.getMessage(m.id).catch(() => null))
        );
        const validEmails = fetchedEmails.filter((e): e is ParsedEmail => e !== null);
        setMessages(validEmails);
        if (validEmails.length > 0 && !selectedEmail) {
          setSelectedEmail(validEmails[0]);
        }
      } else {
        setMessages([]);
        setSelectedEmail(null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error fetching emails.');
      if (err.message?.includes('expired') || err.message?.includes('unauthenticated')) {
        setIsAuthenticated(false);
      }
    } finally {
      setLoading(false);
    }
  }, [activeFolder, searchQuery, selectedEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfileAndEmails();
    }
  }, [activeFolder, isAuthenticated]);

  const handleSelectEmail = async (msg: ParsedEmail) => {
    setSelectedEmail(msg);
    if (msg.isUnread) {
      try {
        await gmailService.modifyMessage(msg.id, [], ['UNREAD']);
        setMessages(prev =>
          prev.map(m => (m.id === msg.id ? { ...m, isUnread: false } : m))
        );
      } catch (e) {
        console.warn('Failed to mark read:', e);
      }
    }
  };

  // Open Confirmation Modal before sending
  const handleInitiateSend = (to: string, subject: string, body: string, threadId?: string) => {
    if (!to.trim()) {
      alert('Recipient email address is required.');
      return;
    }
    if (!subject.trim()) {
      alert('Email subject is required.');
      return;
    }
    if (!body.trim()) {
      alert('Email body content is required.');
      return;
    }

    setSendConfirmationModal({
      isOpen: true,
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
      threadId,
    });
  };

  // Execute Send after User Confirmation
  const handleConfirmSend = async () => {
    const { to, subject, body, threadId } = sendConfirmationModal;
    setIsSending(true);
    try {
      await gmailService.sendEmail({
        to,
        subject,
        bodyText: body,
        threadId,
      });

      setSendConfirmationModal({ isOpen: false, to: '', subject: '', body: '' });
      setIsComposeOpen(false);
      setIsReplyOpen(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setReplyBody('');

      await fetchProfileAndEmails();
    } catch (err: any) {
      alert(err.message || 'Failed to send email.');
    } finally {
      setIsSending(false);
    }
  };

  // Open Confirmation Modal before trashing
  const handleInitiateTrash = (email: ParsedEmail) => {
    setTrashConfirmationModal({ isOpen: true, email });
  };

  // Execute Trash after User Confirmation
  const handleConfirmTrash = async () => {
    if (!trashConfirmationModal.email) return;
    setIsTrashing(true);
    try {
      await gmailService.trashMessage(trashConfirmationModal.email.id);
      setTrashConfirmationModal({ isOpen: false, email: null });
      setSelectedEmail(null);
      await fetchProfileAndEmails();
    } catch (err: any) {
      alert(err.message || 'Failed to move email to trash.');
    } finally {
      setIsTrashing(false);
    }
  };

  return (
    <div className="space-y-6 font-mono selection:bg-[#22D3EE]/30 selection:text-[#22D3EE]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#273244] pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AdminBadge variant="vip">COMMUNICATIONS</AdminBadge>
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-[#18212D] border border-[#273244]">
              OFFICIAL GMAIL API INTEGRATION
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-100 tracking-tight">Gmail Control Hub</h1>
          <p className="text-xs text-slate-400">Manage corporate inquiries, supplier communications, and RFQ emails directly with permission.</p>
        </div>

        {isAuthenticated && profile && (
          <div className="flex items-center gap-3 bg-[#121823] border border-[#273244] p-2.5 rounded-xl text-xs">
            <div className="w-8 h-8 rounded-full bg-[#18212D] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] font-bold">
              <UserIcon className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-100 text-[11px] truncate max-w-[200px]">{profile.emailAddress}</p>
              <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Connected
              </span>
            </div>
            <button
              onClick={() => setIsComposeOpen(true)}
              className="px-3 py-1.5 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 ml-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Compose</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Container */}
      {!isAuthenticated ? (
        /* Sign In Banner with Official Google Button Styling */
        <div className="bg-[#121823] border border-[#273244] rounded-2xl p-8 max-w-xl mx-auto text-center space-y-6 shadow-2xl my-8">
          <div className="w-14 h-14 rounded-2xl bg-[#18212D] border border-[#22D3EE]/40 flex items-center justify-center text-[#22D3EE] mx-auto shadow-lg shadow-[#22D3EE]/10">
            <Mail className="w-7 h-7" />
          </div>

          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-100">Authenticate Gmail Access</h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Connect your Google Workspace email to view corporate messages, send customer quotes, and manage industrial RFQ communications directly.
            </p>
          </div>

          {authError && (
            <div className="p-3 rounded-lg bg-red-950/50 border border-red-500/40 text-xs text-red-300 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Official Material Design "Sign in with Google" Button */}
          <div className="flex justify-center pt-2">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="gsi-material-button focus:outline-none transition-transform hover:scale-[1.02] active:scale-[0.98]"
              style={{
                backgroundColor: '#18212D',
                border: '1px solid #273244',
                borderRadius: '8px',
                padding: '10px 18px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '12px',
                color: '#F1F5F9',
                fontFamily: 'monospace',
                fontSize: '13px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              <div className="gsi-material-button-icon">
                <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" style={{ width: '20px', height: '20px', display: 'block' }}>
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  <path fill="none" d="M0 0h48v48H0z"></path>
                </svg>
              </div>
              <span>{loading ? 'Authenticating with Google...' : 'Sign in with Google for Gmail'}</span>
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Gmail Interface Layout */
        <div className="bg-[#121823] border border-[#273244] rounded-2xl shadow-xl overflow-hidden min-h-[600px] flex flex-col md:flex-row font-mono">
          {/* Internal Folder Sidebar */}
          <div className="w-full md:w-56 bg-[#0D1118] border-r border-[#273244] p-3 space-y-4 shrink-0">
            <button
              onClick={() => setIsComposeOpen(true)}
              className="w-full py-2.5 px-4 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Compose Mail</span>
            </button>

            <nav className="space-y-1 text-xs">
              {[
                { id: 'INBOX', label: 'Inbox', icon: Inbox },
                { id: 'UNREAD', label: 'Unread', icon: Mail },
                { id: 'STARRED', label: 'Starred', icon: Star },
                { id: 'SENT', label: 'Sent', icon: Send },
                { id: 'TRASH', label: 'Trash', icon: Trash2 },
              ].map(folder => {
                const IconComponent = folder.icon;
                const isActive = activeFolder === folder.id;
                return (
                  <button
                    key={folder.id}
                    onClick={() => { setActiveFolder(folder.id); setSelectedEmail(null); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-[#18212D] text-[#22D3EE] font-bold border border-[#273244]'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-[#18212D]/50'
                    }`}
                  >
                    <IconComponent className={`w-4 h-4 ${isActive ? 'text-[#22D3EE]' : 'text-slate-500'}`} />
                    <span className="flex-1 text-left">{folder.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Email List Column */}
          <div className="w-full md:w-80 border-r border-[#273244] flex flex-col shrink-0">
            {/* Search & Refresh Toolbar */}
            <div className="p-3 border-b border-[#273244] flex items-center gap-2 bg-[#0D1118]">
              <div className="flex-1 flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#121823] border border-[#273244] text-xs">
                <Search className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <input
                  type="text"
                  placeholder="Search emails..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && fetchProfileAndEmails()}
                  className="bg-transparent border-none outline-none text-slate-100 placeholder-slate-500 w-full text-xs"
                />
              </div>
              <button
                onClick={fetchProfileAndEmails}
                disabled={loading}
                className="p-1.5 rounded bg-[#18212D] border border-[#273244] text-slate-300 hover:text-[#22D3EE]"
                title="Refresh Inbox"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#22D3EE]' : ''}`} />
              </button>
            </div>

            {/* Email List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#273244]/50 custom-scrollbar max-h-[550px]">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-3 animate-pulse space-y-2">
                    <div className="h-3 bg-[#18212D] rounded w-3/4"></div>
                    <div className="h-3 bg-[#18212D] rounded w-1/2"></div>
                  </div>
                ))
              ) : messages.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-xs space-y-2">
                  <Mail className="w-6 h-6 mx-auto text-slate-600" />
                  <p>No messages found in {activeFolder.toLowerCase()}.</p>
                </div>
              ) : (
                messages.map(msg => {
                  const isSelected = selectedEmail?.id === msg.id;
                  return (
                    <div
                      key={msg.id}
                      onClick={() => handleSelectEmail(msg)}
                      className={`p-3 cursor-pointer transition-colors space-y-1 ${
                        isSelected
                          ? 'bg-[#18212D] border-l-2 border-[#22D3EE]'
                          : msg.isUnread
                          ? 'bg-[#0D1118] hover:bg-[#18212D]/60'
                          : 'hover:bg-[#18212D]/40'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 text-[11px]">
                        <span className={`truncate max-w-[160px] ${msg.isUnread ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                          {msg.from}
                        </span>
                        <span className="text-[9px] text-slate-500 shrink-0">{msg.date.split(',')[0]}</span>
                      </div>
                      <p className={`text-xs truncate ${msg.isUnread ? 'font-bold text-slate-100' : 'text-slate-300'}`}>
                        {msg.subject}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">{msg.snippet}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Email Preview Pane */}
          <div className="flex-1 flex flex-col min-w-0 bg-[#121823]">
            {selectedEmail ? (
              <div className="flex-1 flex flex-col p-6 space-y-6 overflow-y-auto custom-scrollbar">
                {/* Email Header Info */}
                <div className="border-b border-[#273244] pb-4 space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-bold text-slate-100 leading-snug">{selectedEmail.subject}</h2>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          setComposeTo(selectedEmail.from);
                          setComposeSubject(`Re: ${selectedEmail.subject}`);
                          setIsReplyOpen(true);
                        }}
                        className="px-2.5 py-1 bg-[#18212D] border border-[#273244] hover:border-[#22D3EE] text-xs text-slate-200 rounded flex items-center gap-1"
                      >
                        <CornerUpLeft className="w-3.5 h-3.5 text-[#22D3EE]" />
                        <span>Reply</span>
                      </button>
                      <button
                        onClick={() => handleInitiateTrash(selectedEmail)}
                        className="p-1.5 bg-[#18212D] border border-[#273244] hover:border-red-500/50 text-slate-400 hover:text-red-400 rounded"
                        title="Trash Message"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs text-slate-300 bg-[#0D1118] p-3 rounded-lg border border-[#273244]">
                    <div className="flex justify-between">
                      <span className="text-slate-500">From:</span>
                      <span className="text-slate-200 font-bold">{selectedEmail.from}</span>
                    </div>
                    {selectedEmail.to && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">To:</span>
                        <span className="text-slate-300">{selectedEmail.to}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date:</span>
                      <span className="text-slate-400 text-[11px]">{selectedEmail.date}</span>
                    </div>
                  </div>
                </div>

                {/* Email Content */}
                <div className="flex-1 text-xs text-slate-200 leading-relaxed space-y-4">
                  {selectedEmail.bodyHtml ? (
                    <div
                      className="prose prose-invert max-w-none text-xs"
                      dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                    />
                  ) : (
                    <pre className="whitespace-pre-wrap font-mono text-xs text-slate-200 bg-[#0D1118] p-4 rounded-xl border border-[#273244]">
                      {selectedEmail.bodyText}
                    </pre>
                  )}
                </div>

                {/* Quick Reply Form */}
                {isReplyOpen && (
                  <div className="p-4 bg-[#0D1118] border border-[#22D3EE]/40 rounded-xl space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#22D3EE] uppercase tracking-wider flex items-center gap-1.5">
                        <CornerUpLeft className="w-3.5 h-3.5" /> Quick Reply
                      </span>
                      <button onClick={() => setIsReplyOpen(false)} className="text-slate-500 hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <textarea
                      rows={4}
                      placeholder="Type your response..."
                      value={replyBody}
                      onChange={e => setReplyBody(e.target.value)}
                      className="w-full p-3 bg-[#121823] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
                    />

                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => setIsReplyOpen(false)}
                        className="px-3 py-1.5 bg-[#18212D] text-xs text-slate-300 rounded"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleInitiateSend(selectedEmail.from, `Re: ${selectedEmail.subject}`, replyBody, selectedEmail.threadId)}
                        className="px-4 py-1.5 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs rounded flex items-center gap-1.5"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 space-y-2">
                <Inbox className="w-10 h-10 text-slate-600" />
                <p className="text-xs">Select an email message from the list to preview content.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Compose Email Modal */}
      {isComposeOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#273244] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 font-mono text-slate-100">
            <div className="flex items-center justify-between border-b border-[#273244] pb-3">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-[#22D3EE]" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-100">Compose New Email</h3>
              </div>
              <button onClick={() => setIsComposeOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">To <span className="text-red-400">*</span></label>
                <input
                  type="email"
                  required
                  placeholder="recipient@example.com"
                  value={composeTo}
                  onChange={e => setComposeTo(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Subject <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  required
                  placeholder="Quotation / Inquiry Reference..."
                  value={composeSubject}
                  onChange={e => setComposeSubject(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold uppercase text-slate-400">Message Content <span className="text-red-400">*</span></label>
                <textarea
                  rows={6}
                  required
                  placeholder="Write your email message..."
                  value={composeBody}
                  onChange={e => setComposeBody(e.target.value)}
                  className="w-full p-3 bg-[#0D1118] border border-[#273244] rounded-lg text-xs text-slate-100 focus:outline-none focus:border-[#22D3EE]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#273244]">
              <button
                type="button"
                onClick={() => setIsComposeOpen(false)}
                className="px-4 py-2 bg-[#18212D] text-xs text-slate-300 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleInitiateSend(composeTo, composeSubject, composeBody)}
                className="px-5 py-2 bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" />
                <span>Send Email</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL BEFORE SENDING EMAIL */}
      {sendConfirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-[#22D3EE]/50 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-[#22D3EE]">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Email Dispatch</h3>
            </div>

            <div className="p-3 bg-[#0D1118] rounded-lg border border-[#273244] text-xs space-y-2">
              <p className="text-slate-300">Are you sure you want to send this email on behalf of your Google Workspace account?</p>
              <div className="pt-2 border-t border-[#273244]/60 space-y-1">
                <div><span className="text-slate-500">To:</span> <strong className="text-slate-100">{sendConfirmationModal.to}</strong></div>
                <div><span className="text-slate-500">Subject:</span> <strong className="text-slate-100">{sendConfirmationModal.subject}</strong></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSendConfirmationModal(prev => ({ ...prev, isOpen: false }))}
                className="px-3.5 py-1.5 rounded bg-[#18212D] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSend}
                disabled={isSending}
                className="px-4 py-1.5 rounded bg-[#22D3EE] hover:bg-[#38BDF8] text-slate-950 font-bold text-xs uppercase flex items-center gap-1.5"
              >
                {isSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                <span>Confirm & Send</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANDATORY USER CONFIRMATION MODAL BEFORE TRASHING EMAIL */}
      {trashConfirmationModal.isOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121823] border border-red-500/40 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 font-mono">
            <div className="flex items-center gap-2 text-red-400">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Confirm Trash Operation</h3>
            </div>

            <p className="text-xs text-slate-300">
              Are you sure you want to move email <strong className="text-slate-100">"{trashConfirmationModal.email?.subject}"</strong> to Trash?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setTrashConfirmationModal({ isOpen: false, email: null })}
                className="px-3.5 py-1.5 rounded bg-[#18212D] text-xs text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmTrash}
                disabled={isTrashing}
                className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase flex items-center gap-1.5"
              >
                {isTrashing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>Confirm Move to Trash</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
