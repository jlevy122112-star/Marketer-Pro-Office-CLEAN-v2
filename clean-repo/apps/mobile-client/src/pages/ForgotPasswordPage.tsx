'use client';

// ─────────────────────────────────────────────────────────────────────────────
// FORGOT PASSWORD PAGE
// Step 3 from LOGIN PAGE UPGRADES plan:
//   - Single email input
//   - Calls Supabase resetPasswordForEmail
//   - Shows "Check your email" confirmation state
//   - 60-second resend timer
//   - "Back to Sign In" always accessible
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react';

import { Stack, Row, Heading, Text, Input, Button } from '@marketer-pro/ui';
import {
  colors, fonts, fontSizes, fontWeights,
  letterSpacings, radii, space, gradients,
} from '@marketer-pro/ui';

import { supabase }  from '../lib/supabase';
import { useToast }  from '../contexts/ToastContext';
import { SUPPORT }   from '../lib/constants';

// ─────────────────────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const navigate              = useNavigate();
  const { error: toastError } = useToast();

  const [email, setEmail]       = useState('');
  const [emailError, setEmailError] = useState('');
  const [sent, setSent]         = useState(false);
  const [loading, setLoading]   = useState(false);
  const [countdown, setCountdown] = useState(0);   // seconds until resend allowed

  // ── Countdown timer after send ─────────────────────────────────────────────
  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  // ── Validate email ─────────────────────────────────────────────────────────
  function validate(): boolean {
    if (!email.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError('Enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  }

  // ── Send reset email ───────────────────────────────────────────────────────
  const handleSend = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        // Do NOT reveal whether the email exists for security
        // Show success regardless to prevent user enumeration
        console.warn('[ForgotPassword] Supabase error (shown as success):', error.message);
      }

      setSent(true);
      setCountdown(60);
    } catch {
      toastError('Something went wrong', 'Please try again or contact support');
    } finally {
      setLoading(false);
    }
  }, [email, toastError]);

  return (
    <div style={{
      position:        'fixed',
      inset:            0,
      background:       colors.void[900],
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         `${space[6]} ${space[5]}`,
    }}>
      {/* Background */}
      <div style={{
        position:        'absolute',
        inset:            0,
        pointerEvents:   'none',
        backgroundImage:  gradients.grid,
        backgroundSize:  '32px 32px',
      }} aria-hidden />

      <div style={{
        position:   'absolute',
        inset:       0,
        pointerEvents: 'none',
        background:  gradients.goldRadial,
      }} aria-hidden />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          position:            'relative',
          zIndex:               1,
          width:               '100%',
          maxWidth:             380,
          background:          'rgba(13,17,32,0.92)',
          border:              `1px solid ${colors.classified.border}`,
          borderRadius:         radii['2xl'],
          overflow:            'hidden',
        }}
      >
        {/* Gold accent bar */}
        <div style={{ height: 3, background: gradients.goldSheen }} />

        <div style={{ padding: space[6] }}>
          {/* Back link */}
          <Link
            to="/login"
            style={{
              display:       'inline-flex',
              alignItems:    'center',
              gap:            6,
              fontFamily:     fonts.display,
              fontSize:       fontSizes.xs,
              fontWeight:     fontWeights.bold,
              letterSpacing:  letterSpacings.wider,
              textTransform: 'uppercase',
              color:          colors.text.faint,
              textDecoration:'none',
              marginBottom:   space[5],
            }}
          >
            <ArrowLeft size={14} aria-hidden />
            Back to Sign In
          </Link>

          <AnimatePresence mode="wait">

            {/* ── NOT YET SENT STATE ── */}
            {!sent && (
              <motion.div
                key="form"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <div style={{ marginBottom: space[6] }}>
                  <Heading level={2} gold style={{ marginBottom: 10 }}>
                    Reset Password
                  </Heading>
                  <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>
                    Enter the email address for your account. We will send you a
                    secure reset link.
                  </Text>
                </div>

                <form onSubmit={handleSend}>
                  <Stack gap={16}>
                    <Input
                      id="forgot-email"
                      label="Email Address"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (emailError) setEmailError('');
                      }}
                      autoComplete="email"
                      autoFocus
                      required
                      error={emailError}
                    />

                    <motion.button
                      type="submit"
                      disabled={loading}
                      whileHover={!loading ? { scale: 1.01 } : {}}
                      whileTap={!loading   ? { scale: 0.97 } : {}}
                      aria-label="Send reset email"
                      aria-busy={loading}
                      style={{
                        width:         '100%',
                        padding:       '15px 0',
                        borderRadius:   radii.lg,
                        border:        'none',
                        cursor:         loading ? 'not-allowed' : 'pointer',
                        background:     loading ? 'rgba(201,168,76,0.25)' : gradients.gold,
                        color:         '#060912',
                        fontFamily:     fonts.display,
                        fontWeight:     fontWeights.bold,
                        fontSize:       fontSizes.xs,
                        letterSpacing:  letterSpacings.wider,
                        textTransform: 'uppercase',
                        display:       'flex',
                        alignItems:    'center',
                        justifyContent:'center',
                        gap:            8,
                        boxShadow:      loading ? 'none' : '0 0 28px rgba(201,168,76,0.22)',
                      }}
                    >
                      {loading ? 'Sending…' : 'Send Reset Link'}
                    </motion.button>
                  </Stack>
                </form>
              </motion.div>
            )}

            {/* ── SENT CONFIRMATION STATE ── */}
            {sent && (
              <motion.div
                key="sent"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -16 }}
                transition={{ duration: 0.25 }}
              >
                <Stack gap={20} style={{ alignItems: 'center', textAlign: 'center' }}>
                  {/* Icon */}
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                  >
                    <div style={{
                      width:          72,
                      height:         72,
                      borderRadius:   '50%',
                      background:     colors.classified.ghost,
                      border:         `2px solid ${colors.classified.border}`,
                      display:        'flex',
                      alignItems:     'center',
                      justifyContent: 'center',
                    }}>
                      <Mail size={28} color={colors.classified.DEFAULT} aria-hidden />
                    </div>
                  </motion.div>

                  <div>
                    <Heading level={2} gold style={{ marginBottom: 10 }}>
                      Check Your Inbox
                    </Heading>
                    <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>
                      We sent a password reset link to{' '}
                      <span style={{ color: colors.classified.DEFAULT, fontWeight: fontWeights.semibold }}>
                        {email}
                      </span>
                      . Check your spam folder if you don't see it.
                    </Text>
                  </div>

                  {/* Resend button with countdown */}
                  <div style={{ width: '100%' }}>
                    {countdown > 0 ? (
                      <div style={{
                        padding:       '14px 0',
                        borderRadius:   radii.lg,
                        border:        `1px solid ${colors.border.subtle}`,
                        textAlign:     'center',
                      }}>
                        <Text variant="faint" size="xs">
                          Resend available in{' '}
                          <span style={{
                            fontFamily: fonts.mono,
                            color:      colors.classified.DEFAULT,
                          }}>
                            {countdown}s
                          </span>
                        </Text>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleSend()}
                        disabled={loading}
                        style={{
                          width:         '100%',
                          padding:       '14px 0',
                          borderRadius:   radii.lg,
                          background:    'transparent',
                          border:        `1px solid ${colors.border.moderate}`,
                          color:          colors.text.secondary,
                          fontFamily:     fonts.display,
                          fontWeight:     fontWeights.bold,
                          fontSize:       fontSizes.xs,
                          letterSpacing:  letterSpacings.wider,
                          textTransform: 'uppercase',
                          cursor:         loading ? 'not-allowed' : 'pointer',
                          transition:    'all 0.2s',
                        }}
                      >
                        {loading ? 'Sending…' : 'Resend Email'}
                      </button>
                    )}
                  </div>

                  {/* Wrong email */}
                  <button
                    type="button"
                    onClick={() => { setSent(false); setEmail(''); setCountdown(0); }}
                    style={{
                      fontFamily:     fonts.body,
                      fontSize:       fontSizes.xs,
                      color:          colors.text.faint,
                      background:    'none',
                      border:        'none',
                      cursor:        'pointer',
                      textDecoration:'underline',
                      textDecorationColor: colors.text.ghost,
                    }}
                  >
                    Wrong email address? Try again
                  </button>
                </Stack>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Support link */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        style={{ marginTop: space[5], textAlign: 'center' }}
      >
        <Text variant="faint" size="xs">
          Still having trouble?{' '}
          <a
            href={`mailto:${SUPPORT.email}`}
            style={{
              color:          colors.classified.dim,
              textDecoration: 'none',
            }}
          >
            Contact support
          </a>
        </Text>
      </motion.div>

      {/* Persistent "Need help?" */}
      <div style={{
        position:      'fixed',
        bottom:        'calc(env(safe-area-inset-bottom, 0px) + 16px)',
        left:           0,
        right:          0,
        display:       'flex',
        justifyContent:'center',
        zIndex:         10,
        pointerEvents: 'none',
      }}>
        <a
          href={`mailto:${SUPPORT.email}`}
          style={{
            pointerEvents:       'auto',
            fontFamily:           fonts.body,
            fontSize:             fontSizes.xs,
            color:                colors.text.faint,
            textDecoration:      'none',
            padding:             '8px 16px',
            borderRadius:         radii.full,
            background:          'rgba(6,9,18,0.85)',
            backdropFilter:      'blur(10px)',
            WebkitBackdropFilter:'blur(10px)',
            border:              `1px solid ${colors.border.subtle}`,
          }}
        >
          Need help?{' '}
          <span style={{ color: colors.classified.dim }}>{SUPPORT.email}</span>
        </a>
      </div>
    </div>
  );
}
