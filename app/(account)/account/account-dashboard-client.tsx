'use client';

import type React from 'react';
import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { HighlightedButton } from '@/components/HighlightedButton';
import { User, Edit, Mail, Check, Phone, Gift } from 'lucide-react';

enum FormIntent {
  UpdateEmail = 'updateEmail',
  UpdateDetails = 'updateDetails',
  UpdatePhone = 'updatePhone',
}

interface AccountDashboardClientProps {
  customer: any;
  needsPhoneNumber: boolean;
  showPhoneModal: boolean;
  showReferralModal: boolean;
}

function replaceEmptyString(value: string | null | undefined): string {
  return value?.trim() ? value : '-';
}

export default function AccountDashboardClient({
  customer,
  needsPhoneNumber,
  showPhoneModal,
  showReferralModal,
}: AccountDashboardClientProps) {
  const { firstName, lastName, emailAddress, phoneNumber, title } = customer;

  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<{ message: string; intent?: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const phoneFormRef = useRef<HTMLFormElement>(null);

  // Phone modal state
  const [showPhoneNumberModal, setShowPhoneNumberModal] = useState(showPhoneModal || needsPhoneNumber);

  // Referral state
  const [showReferralDialog, setShowReferralDialog] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const [referralSuccess, setReferralSuccess] = useState(false);
  const [referralError, setReferralError] = useState('');
  const [referralSubmitting, setReferralSubmitting] = useState(false);

  const groupName = customer?.groups?.[0]?.name || null;
  const fullName = `${title ? title + ' ' : ''}${firstName} ${lastName}${groupName ? ` (${groupName})` : ''}`;

  // Auto-popup referral dialog on first visit within 24h
  // Only shows after phone modal is resolved (sequential)
  useEffect(() => {
    if (!showReferralModal || !customer?.id) return;
    if (showPhoneNumberModal) return; // Wait for phone modal to close first
    const key = `referralPopupShown_${customer.id}`;
    if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
      setShowReferralDialog(true);
    }
  }, [showReferralModal, customer?.id, showPhoneNumberModal]);

  // Handle details form submit
  async function handleDetailsSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const data = {
      intent: FormIntent.UpdateDetails,
      title: formData.get('title') as string,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
    };

    // Client-side validation
    if (!data.firstName?.trim()) {
      setFormError({ message: 'First name is required', intent: FormIntent.UpdateDetails });
      setIsSubmitting(false);
      return;
    }
    if (!data.lastName?.trim()) {
      setFormError({ message: 'Last name is required', intent: FormIntent.UpdateDetails });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (res.ok && result.customerUpdated) {
        setIsEditing(false);
        setFormError(null);
        window.location.href = '/account';
      } else {
        setFormError({
          message: result.message || 'Failed to update customer details',
          intent: FormIntent.UpdateDetails,
        });
      }
    } catch (error: any) {
      setFormError({
        message: error.message || 'Failed to update customer details',
        intent: FormIntent.UpdateDetails,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle phone number submit
  async function handlePhoneSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    const formData = new FormData(e.currentTarget);
    const phoneValue = (formData.get('phoneNumber') as string)?.replace(/\D/g, '').slice(0, 10);

    // Client-side validation
    if (!phoneValue || phoneValue.length !== 10) {
      setFormError({ message: 'Phone number must be exactly 10 digits', intent: FormIntent.UpdatePhone });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: FormIntent.UpdatePhone,
          phoneNumber: phoneValue,
        }),
      });

      const result = await res.json();

      if (res.ok && result.customerUpdated) {
        setShowPhoneNumberModal(false);
        setFormError(null);
        window.location.href = '/account';
      } else {
        setFormError({
          message: result.message || 'Failed to update phone number',
          intent: FormIntent.UpdatePhone,
        });
      }
    } catch (error: any) {
      setFormError({
        message: error.message || 'Failed to update phone number',
        intent: FormIntent.UpdatePhone,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle referral submit
  async function handleReferralSubmit() {
    if (!referralCode.trim()) return;
    setReferralSubmitting(true);
    setReferralError('');

    try {
      const res = await fetch('/api/referral', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType: 'register-referral',
          referrerId: referralCode.trim(),
        }),
      });

      const result = await res.json();

      if (result.success) {
        setReferralSuccess(true);
        setReferralError('');
        if (customer?.id) {
          localStorage.setItem(`referralPopupShown_${customer.id}`, 'true');
        }
        setTimeout(() => setShowReferralDialog(false), 2000);
      } else {
        setReferralError(result.error || 'Failed to apply referral code');
      }
    } catch (error: any) {
      setReferralError(error.message || 'Failed to apply referral code');
    } finally {
      setReferralSubmitting(false);
    }
  }

  return (
    <div className="space-y-8 pt-10">
      {/* Contact Information Card */}
      <Card className="bg-surface rounded-xl shadow-md border border-border-theme overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/30 dark:to-slate-950/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                <User className="h-5 w-5 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text-primary">
                  Contact Information
                </CardTitle>
                <CardDescription className="text-sm text-text-tertiary">
                  Your basic contact details
                </CardDescription>
              </div>
            </div>
            {!isEditing && (
              <Button
                variant="default"
                onClick={() => setIsEditing(true)}
                className="h-10 px-4 bg-spice hover:bg-spice-600 text-white rounded-md transition-all duration-200"
              >
                <Edit className="h-4 w-4 mr-2" /> Edit Details
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {isEditing ? (
            <form
              ref={formRef}
              onSubmit={handleDetailsSubmit}
              id="details"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label
                    htmlFor="title"
                    className="text-sm font-semibold text-text-secondary"
                  >
                    Title <span className="text-spice">*</span>
                  </Label>
                  <Select name="title" defaultValue={title || 'None'}>
                    <SelectTrigger className="h-11 border-border-theme focus:ring-gold focus:border-navy">
                      <SelectValue placeholder="Select title" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Mr.">Mr.</SelectItem>
                      <SelectItem value="Mrs.">Mrs.</SelectItem>
                      <SelectItem value="Miss.">Miss.</SelectItem>
                      <SelectItem value="Ms.">Ms.</SelectItem>
                      <SelectItem value="Dr.">Dr.</SelectItem>
                      <SelectItem value="Prof.">Prof.</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="firstName"
                    className="text-sm font-semibold text-text-secondary"
                  >
                    First Name <span className="text-spice">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    required
                    className="h-11 border-border-theme focus:ring-gold focus:border-navy"
                    defaultValue={firstName || ''}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="lastName"
                    className="text-sm font-semibold text-text-secondary"
                  >
                    Last Name <span className="text-spice">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    required
                    className="h-11 border-border-theme focus:ring-gold focus:border-navy"
                    defaultValue={lastName || ''}
                  />
                </div>
              </div>
              {formError && formError.intent === FormIntent.UpdateDetails && (
                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {formError.message}
                  </p>
                </div>
              )}
              <div className="flex gap-3 mt-6">
                <HighlightedButton
                  type="submit"
                  isSubmitting={isSubmitting}
                  className="h-11 px-6 bg-spice hover:bg-spice-600 text-white"
                >
                  <Check className="h-4 w-4 mr-2" /> Save Changes
                </HighlightedButton>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                  className="h-11 px-6 border-border-theme hover:bg-surface-hover"
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="text-xs font-semibold uppercase text-text-tertiary">
                    Full Name
                  </Label>
                  <p className="text-base font-medium text-text-primary">
                    {replaceEmptyString(fullName)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Phone Number Card */}
      <Card className="bg-surface rounded-xl shadow-md border border-border-theme overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900/50 rounded-full">
                <Phone className="h-5 w-5 text-purple-700" />
              </div>
              <div>
                <CardTitle className="text-xl font-semibold text-text-primary">
                  Phone Number
                </CardTitle>
                <CardDescription className="text-sm text-text-tertiary">
                  {phoneNumber ? 'Your contact number' : 'Add your phone number to complete your profile'}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="default"
              onClick={() => setShowPhoneNumberModal(true)}
              className="h-10 px-4 bg-spice hover:bg-spice-600 text-white rounded-md transition-all duration-200"
            >
              <Edit className="h-4 w-4 mr-2" /> {phoneNumber ? 'Update' : 'Add'} Phone
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-xs font-semibold uppercase text-text-tertiary flex items-center gap-2 mb-2">
                <Phone className="h-4 w-4" />
                Phone Number
              </Label>
              <p className="text-base font-medium text-text-primary">
                {phoneNumber ? (
                  phoneNumber
                ) : (
                  <span className="text-text-muted italic">Not Provided</span>
                )}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Phone Number Update Modal */}
      <Dialog open={showPhoneNumberModal} onOpenChange={(open) => {
        if (!open && !needsPhoneNumber) {
          setShowPhoneNumberModal(false);
        }
      }}>
        <DialogContent className="sm:max-w-[500px] !bg-surface">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-text-primary">
              {phoneNumber ? 'Update Phone Number' : 'Add Phone Number'}
            </DialogTitle>
            {needsPhoneNumber && (
              <p className="text-sm text-text-tertiary mt-2">
                Please add your phone number to complete your profile.
              </p>
            )}
          </DialogHeader>
          <form
            ref={phoneFormRef}
            onSubmit={handlePhoneSubmit}
            id="phone-number"
          >
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label
                  htmlFor="phoneNumber"
                  className="text-sm font-semibold text-text-secondary"
                >
                  Phone Number <span className="text-spice">*</span>
                </Label>
                <Input
                  id="phoneNumber"
                  name="phoneNumber"
                  required
                  type="tel"
                  maxLength={10}
                  className="h-11 border-border-theme focus:ring-gold focus:border-navy text-text-primary !bg-surface"
                  placeholder="Enter 10 digit phone number"
                  defaultValue={phoneNumber || ''}
                  onInput={(e) => {
                    // Only allow digits
                    const target = e.target as HTMLInputElement;
                    target.value = target.value.replace(/\D/g, '').slice(0, 10);
                  }}
                />
                <p className="text-xs !text-text-muted">
                  Enter exactly 10 digits (e.g., 9876543210)
                </p>
              </div>
              {formError && formError.intent === FormIntent.UpdatePhone && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 font-medium">
                    {formError.message}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <div className="flex gap-3 w-full">
                {!needsPhoneNumber && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowPhoneNumberModal(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                )}
                <HighlightedButton
                  type="submit"
                  isSubmitting={isSubmitting}
                  className={`flex-1 bg-spice hover:bg-spice-600 text-white ${needsPhoneNumber ? 'w-full' : ''}`}
                >
                  {phoneNumber ? 'Update' : 'Add'} Phone Number
                </HighlightedButton>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Email Address Card */}
      <Card className="bg-surface rounded-xl shadow-md border border-border-theme overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
              <Mail className="h-5 w-5 text-emerald-700" />
            </div>
            <CardTitle className="text-xl font-semibold text-text-primary">
              Email Address
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <p className="text-base font-medium text-text-primary break-all">
                {emailAddress}
              </p>
              <Badge className="bg-green-50 text-green-700 border-green-200 rounded-full px-3 py-1">
                <Check className="h-3 w-3 mr-1" />
                Verified
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code Entry Card - visible within 24h if not referred */}
      {showReferralModal && !referralSuccess && (
        <Card className="bg-surface rounded-xl shadow-md border border-border-theme overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <Gift className="h-5 w-5 text-amber-700" />
                </div>
                <div>
                  <CardTitle className="text-xl font-semibold text-text-primary">
                    Referral Code
                  </CardTitle>
                  <CardDescription className="text-sm text-text-tertiary">
                    Have a referral code? Enter it to earn rewards!
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="default"
                onClick={() => setShowReferralDialog(true)}
                className="h-10 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-md transition-all duration-200"
              >
                <Gift className="h-4 w-4 mr-2" /> Enter Referral Code
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Referral Code Dialog */}
      <Dialog open={showReferralDialog} onOpenChange={(open) => {
        setShowReferralDialog(open);
        if (!open && customer?.id) {
          localStorage.setItem(`referralPopupShown_${customer.id}`, 'true');
        }
      }}>
        <DialogContent className="sm:max-w-[500px] !bg-surface">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold text-text-primary">
              Enter Referral Code
            </DialogTitle>
            <p className="text-sm text-text-tertiary mt-2">
              Enter your friend&apos;s referral code to earn rewards when you make your first purchase.
            </p>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="referralCode"
                className="text-sm font-semibold text-text-secondary"
              >
                Referral Code <span className="text-spice">*</span>
              </Label>
              <Input
                id="referralCode"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="h-11 border-border-theme focus:ring-gold focus:border-navy text-text-primary !bg-surface"
                placeholder="Enter referral code"
              />
            </div>
            {referralError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 font-medium">
                  {referralError}
                </p>
              </div>
            )}
            {referralSuccess && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Referral code applied successfully!
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <div className="flex gap-3 w-full">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowReferralDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={!referralCode.trim() || referralSubmitting}
                onClick={handleReferralSubmit}
                className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
              >
                {referralSubmitting ? 'Submitting...' : 'Apply Code'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
