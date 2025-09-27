import crypto from 'crypto';

export type AuditEvent = {
  actorId: string;
  actorEmail: string;
  action: string;
  resource: string;
  method: string;
  status: number;
  ip?: string | null;
  metadata?: Record<string, unknown>;
};

function getClientIpFromHeaders(headers: Headers) {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() ?? null;
  }
  return null;
}

export async function recordAdminAudit(event: AuditEvent, headers?: Headers) {
  const timestamp = new Date().toISOString();
  const entry = {
    id: crypto.randomUUID(),
    timestamp,
    environment: process.env.NODE_ENV ?? 'development',
    ...event,
    ip: event.ip ?? (headers ? getClientIpFromHeaders(headers) : null)
  };

  try {
    const webhook = process.env.AUDIT_WEBHOOK_URL;
    if (webhook) {
      await fetch(webhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(entry)
      });
      return;
    }
  } catch (error) {
    console.error('Audit webhook error', error);
  }

  console.info('[audit]', JSON.stringify(entry));
}
