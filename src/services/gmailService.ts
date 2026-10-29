/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * Delta Industrial Solutions — Gmail API Service
 * Manages client-side Gmail authentication with Firebase Auth, in-memory access token caching,
 * email listing, reading, composing, sending, and label management.
 */

import { auth } from '../lib/firebase';
import { GoogleAuthProvider, signInWithPopup, onAuthStateChanged, User } from 'firebase/auth';

// Requested Gmail OAuth Scopes
export const GMAIL_SCOPES = [
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.compose',
  'https://www.googleapis.com/auth/gmail.labels',
];

// In-memory token cache (never stored in localStorage/sessionStorage)
let cachedAccessToken: string | null = null;
let isSigningIn = false;

// Clear cached token on sign-out
if (auth) {
  onAuthStateChanged(auth, (user) => {
    if (!user) {
      cachedAccessToken = null;
    }
  });
}

export interface GmailHeader {
  name: string;
  value: string;
}

export interface GmailMessagePart {
  partId: string;
  mimeType: string;
  filename?: string;
  headers: GmailHeader[];
  body: {
    size: number;
    data?: string;
  };
  parts?: GmailMessagePart[];
}

export interface GmailMessage {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  historyId: string;
  internalDate: string;
  payload?: {
    partId: string;
    mimeType: string;
    filename: string;
    headers: GmailHeader[];
    body: {
      size: number;
      data?: string;
    };
    parts?: GmailMessagePart[];
  };
  sizeEstimate?: number;
}

export interface ParsedEmail {
  id: string;
  threadId: string;
  labelIds: string[];
  snippet: string;
  subject: string;
  from: string;
  to: string;
  date: string;
  bodyText: string;
  bodyHtml: string;
  isUnread: boolean;
  isStarred: boolean;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

class GmailService {
  /**
   * Get cached access token or return null if unauthenticated
   */
  public getCachedToken(): string | null {
    return cachedAccessToken;
  }

  /**
   * Set cached access token manually
   */
  public setAccessToken(token: string) {
    cachedAccessToken = token;
  }

  /**
   * Initiate Google OAuth sign in requesting Gmail scopes
   */
  public async authenticateWithGmail(): Promise<{ user: User; accessToken: string }> {
    if (!auth) {
      throw new Error('Firebase Auth is unavailable.');
    }
    if (isSigningIn) {
      throw new Error('Authentication is already in progress.');
    }

    isSigningIn = true;
    try {
      const provider = new GoogleAuthProvider();
      GMAIL_SCOPES.forEach((scope) => provider.addScope(scope));
      provider.setCustomParameters({ prompt: 'select_account' });

      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);

      if (!credential?.accessToken) {
        throw new Error('Failed to retrieve access token from Google sign in.');
      }

      cachedAccessToken = credential.accessToken;
      return { user: result.user, accessToken: cachedAccessToken };
    } finally {
      isSigningIn = false;
    }
  }

  /**
   * Get User Profile (email address, total messages)
   */
  public async getProfile(accessToken?: string): Promise<GmailProfile> {
    const token = accessToken || cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing. Please sign in with Google.');

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        cachedAccessToken = null;
        throw new Error('Gmail access token expired or invalid. Please re-authenticate.');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gmail API Error (${res.status})`);
    }

    return res.json();
  }

  /**
   * List messages matching query or label
   */
  public async listMessages(options: {
    q?: string;
    labelIds?: string[];
    maxResults?: number;
    pageToken?: string;
  } = {}): Promise<{ messages: { id: string; threadId: string }[]; nextPageToken?: string; resultSizeEstimate?: number }> {
    const token = cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing. Please sign in with Google.');

    const params = new URLSearchParams();
    if (options.q) params.set('q', options.q);
    if (options.labelIds && options.labelIds.length > 0) {
      options.labelIds.forEach((label) => params.append('labelIds', label));
    }
    params.set('maxResults', String(options.maxResults || 20));
    if (options.pageToken) params.set('pageToken', options.pageToken);

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?${params.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      if (res.status === 401) {
        cachedAccessToken = null;
        throw new Error('Gmail token expired. Please re-authenticate.');
      }
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to list messages (${res.status})`);
    }

    const data = await res.json();
    return {
      messages: data.messages || [],
      nextPageToken: data.nextPageToken,
      resultSizeEstimate: data.resultSizeEstimate,
    };
  }

  /**
   * Get single message details
   */
  public async getMessage(id: string): Promise<ParsedEmail> {
    const token = cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing.');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}?format=full`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to fetch message ${id}`);
    }

    const msg: GmailMessage = await res.json();
    return this.parseEmailMessage(msg);
  }

  /**
   * Send Email message
   * Creates RFC 822 format base64url message
   */
  public async sendEmail(params: {
    to: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    threadId?: string;
  }): Promise<{ id: string; threadId: string }> {
    const token = cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing. Please sign in with Google.');

    const fromEmail = auth?.currentUser?.email || 'me';

    // Construct raw MIME message
    const boundary = '----=_Part_' + Date.now();
    let messageParts = [
      `From: ${fromEmail}`,
      `To: ${params.to}`,
      `Subject: ${params.subject}`,
      'MIME-Version: 1.0',
    ];

    if (params.threadId) {
      messageParts.push(`In-Reply-To: ${params.threadId}`);
      messageParts.push(`References: ${params.threadId}`);
    }

    if (params.bodyHtml) {
      messageParts.push(`Content-Type: multipart/alternative; boundary="${boundary}"`, '', `--${boundary}`);
      messageParts.push('Content-Type: text/plain; charset=UTF-8', '', params.bodyText, '');
      messageParts.push(`--${boundary}`);
      messageParts.push('Content-Type: text/html; charset=UTF-8', '', params.bodyHtml, '');
      messageParts.push(`--${boundary}--`);
    } else {
      messageParts.push('Content-Type: text/plain; charset=UTF-8', '', params.bodyText);
    }

    const rawMessage = messageParts.join('\r\n');

    // Base64url encode raw email
    const base64Encoded = btoa(unescape(encodeURIComponent(rawMessage)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const body: Record<string, any> = { raw: base64Encoded };
    if (params.threadId) body.threadId = params.threadId;

    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to send email (${res.status})`);
    }

    return res.json();
  }

  /**
   * Modify message labels (archive, mark read/unread, star/unstar, trash)
   */
  public async modifyMessage(
    id: string,
    addLabelIds: string[] = [],
    removeLabelIds: string[] = []
  ): Promise<boolean> {
    const token = cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing.');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/modify`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        addLabelIds,
        removeLabelIds,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to modify message ${id}`);
    }

    return true;
  }

  /**
   * Move message to trash (Requires user confirmation before calling)
   */
  public async trashMessage(id: string): Promise<boolean> {
    const token = cachedAccessToken;
    if (!token) throw new Error('Gmail access token is missing.');

    const res = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}/trash`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Failed to trash message ${id}`);
    }

    return true;
  }

  /**
   * Helper: Parse raw Gmail message payload into standard format
   */
  private parseEmailMessage(msg: GmailMessage): ParsedEmail {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) =>
      headers.find((h) => h.name.toLowerCase() === name.toLowerCase())?.value || '';

    const subject = getHeader('Subject') || '(No Subject)';
    const from = getHeader('From') || '(Unknown Sender)';
    const to = getHeader('To') || '';
    const date = getHeader('Date') || new Date(Number(msg.internalDate)).toLocaleString();

    let bodyText = '';
    let bodyHtml = '';

    const extractBody = (part: GmailMessagePart) => {
      if (part.mimeType === 'text/plain' && part.body.data) {
        bodyText += this.decodeBase64Url(part.body.data);
      } else if (part.mimeType === 'text/html' && part.body.data) {
        bodyHtml += this.decodeBase64Url(part.body.data);
      }
      if (part.parts) {
        part.parts.forEach(extractBody);
      }
    };

    if (msg.payload) {
      extractBody(msg.payload as any);
    }

    if (!bodyText && !bodyHtml) {
      bodyText = msg.snippet || '';
    }

    const labelIds = msg.labelIds || [];

    return {
      id: msg.id,
      threadId: msg.threadId,
      labelIds,
      snippet: msg.snippet || '',
      subject,
      from,
      to,
      date,
      bodyText,
      bodyHtml,
      isUnread: labelIds.includes('UNREAD'),
      isStarred: labelIds.includes('STARRED'),
    };
  }

  private decodeBase64Url(base64Url: string): string {
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    try {
      return decodeURIComponent(
        escape(window.atob(base64))
      );
    } catch (e) {
      return window.atob(base64);
    }
  }
}

export const gmailService = new GmailService();
