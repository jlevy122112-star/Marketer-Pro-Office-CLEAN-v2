'use client';

// ─────────────────────────────────────────────────────────────────────────────
// RESET PASSWORD PAGE
// Handles the deep link from Supabase reset email.
// Supabase appends #access_token and #type=recovery to the redirect URL.
// This page reads that token, shows a new password form, and updates.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useEffect } from 'react';
import { useNavigate }         from 'react-router-dom';
import { motion }              from 'framer-motion';
import { Eye, EyeOff, CheckCircle, AlertTriangle } from 'lucide-react';

import { Stack, Heading, Text, Input } from '@marketer-pro/ui';
import {
  colors, fonts, fontSizes, fontWeights,
  letterSpacings, radii, space, gradients,
} from '@marketer-pro/ui';

import { supabase }  from '../lib/supabase';
import { useToast }  from '../contexts/ToastContext';
import { SUPPORT }   from '../lib/constants';
import { storeUserName } from './LoginPage';

// Password requirements
const REQUIREMENTS = [
  { label: 'At least 8 characters', test: (p: string) => p.length >= 8 },
  { label: 'Contains a letter',     test: (p: string) => /[a-zA-Z]/.test(p) },
  { label: 'Contains a number',     test: (p: string) => /[0-9]/.test(p) },
];

export default function ResetPasswordPage() {
  const navigate              = useNavigate();
  const { success, error: toastError } = useToast();

  const [tokenValid, setTokenValid]   = useState<boolean | null>(null); // null = checking
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [done, setDone]               = useState(false);
  const [errors, setErrors]           = useState<{ password?: string; confirm?: string }>({});

  // ── Parse Supabase recovery token from URL hash ───────────────────────────
  useEffect(() => {
    const hash   = window.location.hash;
    const params = new URLSearchParams(hash.replace('#', ''));
    const type   = params.get('type');
    const token  = params.get('access_token');

    if (type === 'recovery' && token) {
      // Set the session from the recovery token
      supabase.auth.setSession({
        access_token:  token,
        refresh_token: params.get('refresh_token') ?? '',
      }).then(({ error }) => {
        setTokenValid(!error);
        if (error) console.error('[ResetPassword] Invalid token:', error.message);
      });
    } else {
      setTokenValid(false);
    }
  }, []);

  // ── Strength check ────────────────────────────────────────────────────────
  const strength = REQUIREMENTS.filter((r) => r.test(password)).length;
  const strongEnough = strength === REQUIREMENTS.length;
  const matches      = password === confirm && confirm.length > 0;

  // ── Validate ──────────────────────────────────────────────────────────────
  function validate(): boolean {
    const e: typeof errors = {};
    if (!strongEnough) e.password = 'Password does not meet requirements';
    if (!matches)      e.confirm  = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // ── Submit new password ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setDone(true);
      // After 2.5s redirect to desk (user is now authenticated)
      setTimeout(() => navigate('/desk', { replace: true }), 2500);
    } catch (err) {
      toastError(
        'Password reset failed',
        err instanceof Error ? err.message : 'Please try again',
      );
    } finally {
      setLoading(false);
    }
  }

  // ── LOADING STATE — checking token ────────────────────────────────────────
  if (tokenValid === null) {
    return (
      <div style={{
        position:        'fixed',
        inset:            0,
        background:       colors.void[900],
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
      }}>
        <div style={{
          width:        32,
          height:       32,
          borderRadius: '50%',
          border:       '2px solid transparent',
          borderTopColor: colors.classified.DEFAULT,
          animation:    'spin 0.9s linear infinite',
        }} role="status" aria-label="Verifying reset link" />
      </div>
    );
  }

  // ── INVALID TOKEN STATE ───────────────────────────────────────────────────
  if (tokenValid === false) {
    return (
      <div style={{
        position:        'fixed',
        inset:            0,
        background:       colors.void[900],
        display:         'flex',
        alignItems:      'center',
        justifyContent:  'center',
        padding:          space[5],
      }}>
        <div style={{ textAlign: 'center', maxWidth: 320 }}>
          <div style={{ fontSize: 48, marginBottom: space[4] }} aria-hidden>⚠️</div>
          <Heading level={2} gold style={{ marginBottom: 12 }}>
            Link Expired
          </Heading>
          <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: space[6] }}>
            This password reset link has expired or is invalid. Reset links are
            valid for 60 minutes.
          </Text>
          <button
            onClick={() => navigate('/forgot-password')}
            style={{
              padding:       '14px 28px',
              borderRadius:   radii.lg,
              background:     gradients.gold,
              border:        'none',
              color:         '#060912',
              fontFamily:     fonts.display,
              fontWeight:     fontWeights.bold,
              fontSize:       fontSizes.xs,
              letterSpacing:  letterSpacings.wider,
              textTransform: 'uppercase',
              cursor:        'pointer',
            }}
          >
            Request New Link
          </button>
        </div>
      </div>
    );
  }

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
        <div style={{ height: 3, background: gradients.goldSheen }} />

        <div style={{ padding: space[6] }}>
          {done ? (
            // ── SUCCESS STATE ──
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              style={{ textAlign: 'center', padding: `${space[4]} 0` }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 260, damping: 20, delay: 0.1 }}
                style={{ display: 'flex', justifyContent: 'center', marginBottom: space[5] }}
              >
                <CheckCircle size={56} color={colors.reactor.DEFAULT} />
              </motion.div>
              <Heading level={2} gold style={{ marginBottom: 10 }}>
                Password Updated
              </Heading>
              <Text variant="tertiary" size="base" style={{ lineHeight: 1.7 }}>
                Your password has been changed. Taking you to your Digital Office…
              </Text>
            </motion.div>
          ) : (
            // ── FORM STATE ──
            <>
              <Heading level={2} gold style={{ marginBottom: 10 }}>
                New Password
              </Heading>
              <Text variant="tertiary" size="base" style={{ lineHeight: 1.7, marginBottom: space[6] }}>
                Choose a strong password for your account.
              </Text>

              <form onSubmit={handleSubmit}>
                <Stack gap={16}>
                  {/* New password */}
                  <div>
                    <Input
                      id="reset-password"
                      label="New Password"
                      type={showPass ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((p) => ({ ...p, password: undefined }));
                      }}
                      autoComplete="new-password"
                      required
                      error={errors.password}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          aria-label={showPass ? 'Hide password' : 'Show password'}
                          style={{ color: colors.text.faint, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />

                    {/* Requirements checklist — always visible */}
                    {password.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        {REQUIREMENTS.map((req) => {
                          const met = req.test(password);
                          return (
                            <div
                              key={req.label}
                              style={{
                                display:    'flex',
                                alignItems: 'center',
                                gap:         8,
                                marginBottom: 5,
                              }}
                            >
                              <div style={{
                                width:        14,
                                height:       14,
                                borderRadius: '50%',
                                background:    met ? colors.reactor.DEFAULT : 'rgba(255,255,255,0.08)',
                                border:       `1px solid ${met ? colors.reactor.DEFAULT : colors.border.subtle}`,
                                display:      'flex',
                                alignItems:   'center',
                                justifyContent: 'center',
                                transition:   'all 0.2s',
                                flexShrink:   0,
                              }}>
                                {met && (
                                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                                    <path d="M1.5 4L3.5 6L6.5 2" stroke="#060912" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                )}
                              </div>
                              <Text
                                variant={met ? 'teal' : 'faint'}
                                size="xs"
                                style={{ transition: 'color 0.2s' }}
                              >
                                {req.label}
                              </Text>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Confirm password */}
                  <div>
                    <Input
                      id="reset-confirm"
                      label="Confirm New Password"
                      type={showConfirm ? 'text' : 'password'}
                      value={confirm}
                      onChange={(e) => {
                        setConfirm(e.target.value);
                        if (errors.confirm) setErrors((p) => ({ ...p, confirm: undefined }));
                      }}
                      autoComplete="new-password"
                      required
                      error={errors.confirm}
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowConfirm(!showConfirm)}
                          aria-label={showConfirm ? 'Hide' : 'Show'}
                          style={{ color: colors.text.faint, background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
                        >
                          {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      }
                    />
                    {confirm.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 8 }}>
                        <div style={{
                          width:        14,
                          height:       14,
                          borderRadius: '50%',
                          background:    matches ? colors.reactor.DEFAULT : 'rgba(248,113,113,0.3)',
                          display:      'flex',
                          alignItems:   'center',
                          justifyContent: 'center',
                          flexShrink:   0,
                        }}>
                          {matches && (
                            <svg width="8" height="8" viewBox="0 0 8 8" fill="none" aria-hidden>
                              <path d="M1.5 4L3.5 6L6.5 2" stroke="#060912" strokeWidth="1.5" strokeLinecap="round" />
                            </svg>
                          )}
                        </div>
                        <Text
                          variant={matches ? 'teal' : 'error'}
                          size="xs"
                        >
                          {matches ? 'Passwords match' : 'Passwords do not match'}
                        </Text>
                      </div>
                    )}
                  </div>

                  {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={loading || !strongEnough || !matches}
                    whileHover={!loading && strongEnough && matches ? { scale: 1.01 } : {}}
                    whileTap={!loading && strongEnough && matches   ? { scale: 0.97 } : {}}
                    aria-label="Set new password"
                    aria-busy={loading}
                    style={{
                      width:         '100%',
                      padding:       '15px 0',
                      borderRadius:   radii.lg,
                      border:        'none',
                      cursor:         loading || !strongEnough || !matches ? 'not-allowed' : 'pointer',
                      background:     loading || !strongEnough || !matches
                        ? 'rgba(201,168,76,0.2)'
                        : gradients.gold,
                      color:         '#060912',
                      fontFamily:     fonts.display,
                      fontWeight:     fontWeights.bold,
                      fontSize:       fontSizes.xs,
                      letterSpacing:  letterSpacings.wider,
                      textTransform: 'uppercase',
                      boxShadow:      !loading && strongEnough && matches
                        ? '0 0 28px rgba(201,168,76,0.22)'
                        : 'none',
                    }}
                  >
                    {loading ? 'Updating Password…' : 'Set New Password'}
                  </motion.button>
                </Stack>
              </form>
            </>
          )}
        </div>
      </motion.div>

      {/* Support */}
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
