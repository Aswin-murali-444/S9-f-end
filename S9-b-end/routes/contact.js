const express = require('express');
const router = express.Router();
const { supabase } = require('../lib/supabase');
const { createNotification } = require('../services/notificationService');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^[0-9+\-\s()]{7,20}$/;
const ALLOWED_SUPPORT_PRIORITIES = new Set(['low', 'normal', 'high']);

function extractProviderSupportDetails(body = {}) {
  const source = String(body.source || '').trim();
  if (source !== 'provider_dashboard_settings') {
    return null;
  }

  const subject = String(body.subject || '').trim();
  const priority = String(body.priority || 'normal').trim().toLowerCase();
  return { subject, priority };
}

function validatePayload(body = {}) {
  const errors = {};
  const fullName = String(body.fullName || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phoneNumber = String(body.phoneNumber || '').trim();
  const serviceType = String(body.serviceType || '').trim();
  const message = String(body.message || '').trim();
  const providerSupport = extractProviderSupportDetails(body);

  if (!fullName || fullName.length < 2) errors.fullName = 'Full name is required';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'Valid email is required';
  if (!phoneNumber || !PHONE_RE.test(phoneNumber)) errors.phoneNumber = 'Valid phone number is required';
  if (!serviceType) errors.serviceType = 'Service type is required';
  if (!message || message.length < 10) {
    errors.message = 'Message must be at least 10 characters';
  } else if (message.length > 5000) {
    errors.message = 'Message cannot exceed 5000 characters';
  }

  if (providerSupport) {
    if (!providerSupport.subject || providerSupport.subject.length < 5) {
      errors.subject = 'Subject must be at least 5 characters';
    } else if (providerSupport.subject.length > 120) {
      errors.subject = 'Subject cannot exceed 120 characters';
    }

    if (!ALLOWED_SUPPORT_PRIORITIES.has(providerSupport.priority)) {
      errors.priority = 'Priority must be low, normal, or high';
    }

    if (message.length < 20) {
      errors.message = 'Provider support message must be at least 20 characters';
    }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    sanitized: { fullName, email, phoneNumber, serviceType, message, providerSupport }
  };
}

// Public endpoint: allows logged-in and non-logged-in users.
router.post('/message', async (req, res) => {
  try {
    const { ok, errors, sanitized } = validatePayload(req.body);
    if (!ok) {
      return res.status(400).json({
        error: 'Validation failed',
        details: errors
      });
    }

    const {
      fullName,
      email,
      phoneNumber,
      serviceType,
      message,
      providerSupport
    } = sanitized;

    const meta = {
      source: req.body?.source || 'website_contact_form',
      page: req.body?.page || '/contact',
      userAgent: req.get('user-agent') || null,
      ip: req.ip || null
    };

    // If caller provides auth user id, resolve to local users.id safely.
    let linkedUserId = null;
    const authUserId = req.body?.authUserId ? String(req.body.authUserId) : null;
    if (authUserId) {
      const { data: userRow } = await supabase
        .from('users')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();
      linkedUserId = userRow?.id || null;
    }

    const { data: inserted, error: insertError } = await supabase
      .from('contact_messages')
      .insert({
        user_id: linkedUserId,
        full_name: fullName,
        email,
        phone_number: phoneNumber,
        service_type: serviceType,
        message,
        source: meta.source,
        page: meta.page,
        status: 'new',
        metadata: meta
      })
      .select('*')
      .single();

    if (insertError) {
      console.error('Create contact message error:', insertError);
      return res.status(500).json({ error: 'Failed to submit message' });
    }

    if (providerSupport) {
      if (!linkedUserId) {
        return res.status(400).json({ error: 'Provider support messages require a logged-in provider user' });
      }

      const { error: supportInsertError } = await supabase
        .from('provider_admin_support_messages')
        .insert({
          contact_message_id: inserted.id,
          provider_user_id: linkedUserId,
          subject: providerSupport.subject,
          priority: providerSupport.priority,
          status: 'open'
        });

      if (supportInsertError) {
        console.error('Create provider_admin_support_messages error:', supportInsertError);
        return res.status(500).json({ error: 'Failed to submit provider support message' });
      }
    }

    // Notify all admins in notifications bell.
    const { data: admins, error: adminErr } = await supabase
      .from('users')
      .select('id')
      .eq('role', 'admin');

    if (adminErr) {
      console.warn('Unable to list admins for contact notifications:', adminErr.message);
    } else if (Array.isArray(admins) && admins.length > 0) {
      await Promise.all(
        admins.map((admin) =>
          createNotification({
            type: 'contact_message',
            title: 'New contact message received',
            message: `${fullName} submitted a ${serviceType} request.`,
            recipient_id: admin.id,
            priority: 'medium',
            status: 'unread',
            metadata: {
              contact_message_id: inserted.id,
              sender_name: fullName,
              sender_email: email,
              sender_phone: phoneNumber,
              service_type: serviceType
            }
          })
        )
      );
    }

    return res.json({
      success: true,
      data: inserted,
      message: 'Message submitted successfully'
    });
  } catch (error) {
    console.error('Contact message submit error:', error);
    return res.status(500).json({ error: 'Failed to submit message' });
  }
});

// Admin endpoint: fetch contact messages for feedback section
router.get('/admin/messages', async (req, res) => {
  try {
    const adminAuthUserId = req.query.adminAuthUserId ? String(req.query.adminAuthUserId) : '';
    if (!adminAuthUserId) {
      return res.status(401).json({ error: 'adminAuthUserId is required' });
    }

    const { data: adminUser, error: adminLookupError } = await supabase
      .from('users')
      .select('id, role')
      .eq('auth_user_id', adminAuthUserId)
      .maybeSingle();

    if (adminLookupError) {
      console.error('Admin lookup failed for contact messages:', adminLookupError);
      return res.status(500).json({ error: 'Failed to authorize admin user' });
    }

    if (!adminUser || String(adminUser.role || '').toLowerCase() !== 'admin') {
      return res.status(403).json({ error: 'Only admin users can access feedback messages' });
    }

    const limit = Math.min(parseInt(req.query.limit || '100', 10), 500);
    const status = req.query.status ? String(req.query.status) : null;

    let query = supabase
      .from('contact_messages')
      .select(`
        *,
        provider_admin_support_messages (
          id,
          provider_user_id,
          subject,
          priority,
          status,
          admin_user_id,
          admin_reply,
          replied_at,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) {
      console.error('Get admin contact messages error:', error);
      return res.status(500).json({ error: 'Failed to fetch contact messages' });
    }

    return res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Admin contact messages error:', error);
    return res.status(500).json({ error: 'Failed to fetch contact messages' });
  }
});

module.exports = router;
