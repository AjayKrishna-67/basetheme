'use client';

import { useState, useEffect } from 'react';
import {
  Shield,
  Eye,
  Lock,
  Database,
  Mail,
  Phone,
  MapPin,
  Users,
  Settings,
  Bell,
  XCircle,
  CreditCard,
  Trash2,
  AlertTriangle,
} from 'lucide-react';

export default function PrivacyPolicy() {
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);

  // Check if user is signed in
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/active-order');
        if (res.ok) {
          const data = await res.json();
          // If there's an active order or customer data, user is signed in
          setIsSignedIn(!!data.activeOrder);
        }
      } catch {
        // Not signed in
      }
    }
    checkAuth();
  }, []);

  // When account deletion succeeds, sign out via the logout API
  useEffect(() => {
    if (deleteSuccess) {
      fetch('/api/logout', { method: 'POST' }).then(() => {
        window.location.href = '/';
      });
    }
  }, [deleteSuccess]);

  const handleDeleteAccount = async () => {
    setIsSubmitting(true);
    setDeleteError(null);
    try {
      const formData = new FormData();
      formData.append('reason', deleteReason || 'No reason provided');
      const res = await fetch('/api/account-deletion', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        setDeleteSuccess(true);
      } else {
        setDeleteError(data.message || 'Something went wrong. Please try again.');
      }
    } catch {
      setDeleteError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-cream via-white to-cream">
      {/* Header */}

      <main className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-navy to-spice rounded-full mb-6">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-navy mb-4">
            Privacy Policy
          </h1>
          <p className="text-lg text-navy/70 max-w-2xl mx-auto">
            At SwadKerala, your privacy is our priority. This policy explains how we
            collect, use, and protect your personal information when you shop for
            authentic Kerala spices on our platform.
          </p>
          <p className="text-sm text-navy/60 mt-4">
            <strong>Last Updated:</strong> November 2024
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-gold/20 overflow-hidden">
          <div className="p-8 sm:p-12">
            <div className="space-y-8 text-navy">
              {/* Section 1 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">1</span>
                  </div>
                  <h2 className="text-2xl font-bold">Information We Collect</h2>
                </div>
                <div className="ml-11 space-y-4">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Personal Information
                      </h3>
                      <p className="text-base leading-relaxed">
                        When you create an account or place an order, we
                        collect:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>
                          Name and contact information (email, phone number)
                        </li>
                        <li>Delivery address and billing information</li>
                        <li>
                          Payment details (processed securely through
                          third-party providers)
                        </li>
                        <li>Account preferences and order history</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Database className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Usage Information
                      </h3>
                      <p className="text-base leading-relaxed">
                        We automatically collect information about how you use
                        our platform:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>Device information and browser type</li>
                        <li>IP address and location data</li>
                        <li>Pages visited and time spent on our site</li>
                        <li>Search queries and product preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    How We Use Your Information
                  </h2>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order Processing & Delivery
                      </h3>
                      <p className="text-base leading-relaxed">
                        We use your information to process your authentic Kerala spice orders,
                        arrange delivery to your doorstep, provide order tracking, and offer
                        exceptional customer support for all your spice needs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Bell className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Communication</h3>
                      <p className="text-base leading-relaxed">
                        We may send you order confirmations, delivery updates for your spice orders,
                        exclusive offers on Kerala spices, seasonal promotions, and important service
                        announcements. You can opt-out of promotional emails anytime.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Settings className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Service Improvement
                      </h3>
                      <p className="text-base leading-relaxed">
                        We analyze usage patterns to improve our platform, personalize your
                        shopping experience with relevant spice recommendations, optimize our
                        product offerings, and develop new features to better serve your culinary needs.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold">Information Sharing</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <p className="text-base leading-relaxed">
                    We do not sell, trade, or rent your personal information to
                    third parties. We may share your information only in the
                    following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base ml-4">
                    <li>
                      <strong>Service Providers:</strong> With trusted partners
                      who help us operate our platform (payment processors,
                      delivery services, email providers)
                    </li>
                    <li>
                      <strong>Legal Requirements:</strong> When required by law
                      or to protect our rights and safety
                    </li>
                    <li>
                      <strong>Business Transfers:</strong> In case of merger,
                      acquisition, or sale of business assets
                    </li>
                    <li>
                      <strong>Consent:</strong> When you explicitly give us
                      permission to share your information
                    </li>
                  </ul>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold">Data Security</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="flex items-start gap-3">
                    <Lock className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Protection Measures
                      </h3>
                      <p className="text-base leading-relaxed">
                        We implement industry-standard security measures to
                        protect your personal information:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>SSL encryption for all data transmission</li>
                        <li>Secure servers with regular security updates</li>
                        <li>Limited access to personal information</li>
                        <li>Regular security audits and monitoring</li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-cream/50 p-4 rounded-lg border border-gold/20">
                    <p className="text-sm font-medium text-navy">
                      <strong>Note:</strong> At SwadKerala, we take your data security seriously
                      and implement industry-leading practices. While we strive to protect your
                      information with the highest standards, no method of transmission over the
                      internet is 100% secure. We continuously update our security measures to
                      ensure your information remains protected.
                    </p>
                  </div>
                </div>
              </section>

              {/* Section 5 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">5</span>
                  </div>
                  <h2 className="text-2xl font-bold">Cookies & Tracking</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <p className="text-base leading-relaxed">
                    We use cookies and similar technologies to enhance your
                    experience:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base ml-4">
                    <li>
                      <strong>Essential Cookies:</strong> Required for basic
                      platform functionality
                    </li>
                    <li>
                      <strong>Analytics Cookies:</strong> Help us understand how
                      you use our platform
                    </li>
                    <li>
                      <strong>Preference Cookies:</strong> Remember your
                      settings and preferences
                    </li>
                    <li>
                      <strong>Marketing Cookies:</strong> Used to show relevant
                      advertisements
                    </li>
                  </ul>
                  <p className="text-base leading-relaxed">
                    You can control cookie settings through your browser
                    preferences. However, disabling certain cookies may affect
                    platform functionality.
                  </p>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <h2 className="text-2xl font-bold">Your Rights</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <p className="text-base leading-relaxed">
                    You have the following rights regarding your personal
                    information:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base ml-4">
                    <li>
                      <strong>Access:</strong> Request a copy of your personal
                      information
                    </li>
                    <li>
                      <strong>Correction:</strong> Update or correct inaccurate
                      information
                    </li>
                    <li>
                      <strong>Deletion:</strong> Request deletion of your
                      personal information
                    </li>
                    <li>
                      <strong>Portability:</strong> Receive your data in a
                      structured format
                    </li>
                    <li>
                      <strong>Objection:</strong> Opt-out of certain data
                      processing activities
                    </li>
                    <li>
                      <strong>Restriction:</strong> Limit how we process your
                      information
                    </li>
                  </ul>
                  <p className="text-base leading-relaxed">
                    To exercise these rights, please contact us using the
                    information provided below.
                  </p>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">7</span>
                  </div>
                  <h2 className="text-2xl font-bold">Data Retention</h2>
                </div>
                <div className="ml-11">
                  <p className="text-base leading-relaxed">
                    We retain your personal information for as long as necessary
                    to provide our Kerala spice delivery services and fulfill the purposes
                    outlined in this policy. Account information is typically retained for
                    the duration of your active account plus a reasonable period for
                    legal, tax, and business purposes (typically 3-5 years). You may request
                    deletion of your account and associated data at any time by contacting
                    our support team.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">8</span>
                  </div>
                  <h2 className="text-2xl font-bold">Children's Privacy</h2>
                </div>
                <div className="ml-11">
                  <p className="text-base leading-relaxed">
                    Our platform is not intended for children under 13 years of
                    age. We do not knowingly collect personal information from
                    children under 13. If we become aware that we have collected
                    personal information from a child under 13, we will take
                    steps to delete such information promptly.
                  </p>
                </div>
              </section>

              {/* Section 9 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">9</span>
                  </div>
                  <h2 className="text-2xl font-bold">Policy Updates</h2>
                </div>
                <div className="ml-11">
                  <p className="text-base leading-relaxed">
                    We may update this privacy policy from time to time to
                    reflect changes in our practices or legal requirements. We
                    will notify you of any material changes by posting the
                    updated policy on this page and updating the "Last updated"
                    date. We encourage you to review this policy periodically.
                  </p>
                </div>
              </section>

              {/* Section 10 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">10</span>
                  </div>
                  <h2 className="text-2xl font-bold">Cancellation Policy</h2>
                </div>
                <div className="ml-11 space-y-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Cancellation Before Shipping
                      </h3>
                      <p className="text-base leading-relaxed">
                        You have the right to cancel your order at any time before it has been shipped.
                        We understand that circumstances may change, and we want to make the cancellation
                        process as smooth as possible for you.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>
                          <strong>Time Window:</strong> Orders can be cancelled anytime before the
                          shipping confirmation email is sent to you
                        </li>
                        <li>
                          <strong>Processing Time:</strong> Cancellation requests are typically
                          processed within 24 hours of receipt
                        </li>
                        <li>
                          <strong>Automatic Cancellation:</strong> If your order has not yet entered
                          the processing stage, you may be able to cancel it directly from your account dashboard
                        </li>
                        <li>
                          <strong>Manual Cancellation:</strong> For orders that have entered processing,
                          please contact our customer service team immediately
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Refund Process</h3>
                      <p className="text-base leading-relaxed">
                        When you cancel an order before shipping, you are entitled to a refund of
                        the amount paid:
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>
                          <strong>Refund Method:</strong> Refunds will be processed to the original
                          payment method used for the order
                        </li>
                        <li>
                          <strong>Processing Time:</strong> Refunds typically appear in your account
                          within 5-10 business days, depending on your bank or payment provider
                        </li>
                        <li>
                          <strong>Shipping Charges:</strong> If applicable, shipping charges will also
                          be refunded in full when cancelling before shipment
                        </li>
                        <li>
                          <strong>Confirmation:</strong> You will receive an email confirmation once your
                          cancellation has been processed and refund initiated
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 11 - Account Deletion */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">11</span>
                  </div>
                  <h2 className="text-2xl font-bold">Account Deletion</h2>
                </div>
                <div className="ml-11 space-y-4">
                  <div className="flex items-start gap-3">
                    <Trash2 className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Deletion Process
                      </h3>
                      <p className="text-base leading-relaxed">
                        You may request the deletion of your SwadKerala account at any time.
                        Once a deletion request is submitted, your account will be scheduled
                        for permanent removal.
                      </p>
                      <ul className="list-disc list-inside space-y-1 text-base ml-4 mt-2">
                        <li>
                          <strong>Grace Period:</strong> You have a 3-day window after
                          submitting your request to cancel the deletion by logging back
                          into your account
                        </li>
                        <li>
                          <strong>Login Cancellation:</strong> If you log in during the
                          3-day grace period, your deletion request will be automatically
                          cancelled
                        </li>
                        <li>
                          <strong>Permanent Deletion:</strong> After the 3-day grace period,
                          your account and all associated personal data will be permanently
                          deleted
                        </li>
                        <li>
                          <strong>Data Removed:</strong> Personal information, order history,
                          saved addresses, and account preferences will be erased
                        </li>
                      </ul>
                    </div>
                  </div>

                  <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200/40">
                    <p className="text-sm font-medium text-navy">
                      <strong>Important:</strong> Account deletion is irreversible after the
                      3-day grace period. Please ensure you have saved any important order
                      information before requesting deletion. Some data may be retained for
                      legal and tax compliance purposes as outlined in our Data Retention policy.
                    </p>
                  </div>
                </div>
              </section>

              {/* Request Account Deletion - Only for logged-in users */}
              {isSignedIn && (
                <section className="bg-red-50/50 p-6 rounded-xl border border-red-200/30">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle className="w-6 h-6 text-red-500" />
                    <h3 className="text-xl font-bold text-red-700">
                      Request Account Deletion
                    </h3>
                  </div>

                  {!showDeleteConfirm ? (
                    <div>
                      <p className="text-base leading-relaxed text-navy/80 mb-4">
                        If you wish to delete your account, click the button below.
                        You will have 3 days to cancel the request by logging back in.
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors"
                      >
                        Delete My Account
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-base leading-relaxed text-red-700 font-medium">
                        Are you sure you want to delete your account? This action
                        will log you out immediately. You can cancel within 3 days
                        by logging back in.
                      </p>

                      <div>
                        <label
                          htmlFor="delete-reason"
                          className="block text-sm font-medium text-navy/80 mb-1.5"
                        >
                          Reason for leaving (optional)
                        </label>
                        <select
                          id="delete-reason"
                          value={deleteReason}
                          onChange={(e) => setDeleteReason(e.target.value)}
                          className="w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-300 focus:border-red-400 outline-none"
                        >
                          <option value="">Select a reason...</option>
                          <option value="No longer needed">No longer needed</option>
                          <option value="Privacy concerns">Privacy concerns</option>
                          <option value="Found a better alternative">Found a better alternative</option>
                          <option value="Too many emails">Too many emails</option>
                          <option value="Difficult to use">Difficult to use</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {deleteError && (
                        <p className="text-sm text-red-600 font-medium">
                          {deleteError}
                        </p>
                      )}

                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={isSubmitting}
                          className="px-6 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {isSubmitting ? 'Processing...' : 'Confirm Deletion'}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowDeleteConfirm(false);
                            setDeleteReason('');
                            setDeleteError(null);
                          }}
                          className="px-6 py-2.5 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </section>
              )}

              {/* Contact Section */}
              <section className="bg-gradient-to-r from-cream to-cream/50 p-6 rounded-xl border border-gold/20">
                <h3 className="text-xl font-bold text-navy mb-3">
                  Contact Us
                </h3>
                <p className="text-base leading-relaxed text-navy/80 mb-4">
                  If you have any questions about this privacy policy or our
                  data practices, please contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-spice flex-shrink-0" />
                    <span>
                      <strong>Email:</strong> support@swadkerala.com
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-spice flex-shrink-0" />
                    <span>
                      <strong>Phone:</strong> 7907816972
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-spice flex-shrink-0" />
                    <span>
                      <strong>Address:</strong> Galaxy traders, Karimannoor PO- 685581, Mannarathara - Kotta Road, Idukki Dist, Kerala
                    </span>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
