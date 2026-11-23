import {
  Shield,
  Truck,
  CreditCard,
  Users,
  Clock,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';

export default function TermsAndConditions() {
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
            Terms & Conditions
          </h1>
          <p className="text-lg text-navy/70 max-w-2xl mx-auto">
            Welcome to SwadKerala, your trusted source for authentic Kerala spices sourced
            directly from God's Own Country. Please read these terms carefully before using
            our services.
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
                  <h2 className="text-2xl font-bold">Acceptance of Terms</h2>
                </div>
                <p className="text-base leading-relaxed ml-11">
                  By accessing and using SwadKerala's razorpay-payment platform for authentic Kerala spices,
                  you accept and agree to be bound by the terms and
                  provision of this agreement. If you do not agree to abide by
                  the above, please do not use this service.
                </p>
              </section>

              {/* Section 2 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">2</span>
                  </div>
                  <h2 className="text-2xl font-bold">Product Information</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <p className="text-base leading-relaxed">
                    We specialize in authentic Kerala spices sourced directly from God's Own Country, including:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base ml-4">
                    <li>Premium whole spices (cardamom, pepper, cinnamon, cloves, nutmeg)</li>
                    <li>Ground spices and spice blends</li>
                    <li>Traditional Kerala spice mixes and masalas</li>
                    <li>Organic and premium quality variants</li>
                  </ul>
                  <p className="text-base leading-relaxed">
                    All spices are handpicked from Kerala's finest farms, ensuring purity and authentic flavor.
                    Product images are for reference only and actual products may vary slightly in appearance
                    while maintaining the same premium quality.
                  </p>
                </div>
              </section>

              {/* Section 3 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">3</span>
                  </div>
                  <h2 className="text-2xl font-bold">Orders & Payment</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="flex items-start gap-3">
                    <CreditCard className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Payment Methods</h3>
                      <p className="text-base leading-relaxed">
                        We accept all major credit/debit cards, UPI payments,
                        net banking, and digital wallets. All transactions are
                        secured with SSL encryption.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">
                        Order Processing
                      </h3>
                      <p className="text-base leading-relaxed">
                        Your Kerala spice orders are processed within 24-48 hours during business days.
                        Custom spice blends or bulk orders may require additional processing time.
                        You will receive order confirmation via email/SMS along with tracking details
                        once your order is dispatched.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 4 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">4</span>
                  </div>
                  <h2 className="text-2xl font-bold">Delivery & Shipping</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="flex items-start gap-3">
                    <Truck className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-lg">Delivery Areas</h3>
                      <p className="text-base leading-relaxed">
                        We deliver authentic Kerala spices across major cities and towns in India.
                        Delivery charges vary by location and order value. Enjoy free delivery
                        on orders above ₹500. Typical delivery time is 3-7 business days depending
                        on your location.
                      </p>
                    </div>
                  </div>
                  <div className="bg-cream/50 p-4 rounded-lg border border-gold/20">
                    <p className="text-sm font-medium text-navy">
                      <strong>Note:</strong> All spices are packed in
                      airtight, food-grade containers to maintain freshness and aroma during transit.
                      We recommend storing in a cool, dry place to preserve quality and flavor.
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
                  <h2 className="text-2xl font-bold">Returns & Refunds</h2>
                </div>
                <div className="ml-11 space-y-3">
                  <p className="text-base leading-relaxed">
                    We stand behind the quality of our spices. Our return policy ensures your satisfaction:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-base ml-4">
                    <li>Returns accepted within 7 days of delivery</li>
                    <li>Products must be in original packaging and unopened</li>
                    <li>Quality issues will be addressed immediately with full refund or replacement</li>
                    <li>Refunds processed within 5-7 business days to the original payment method</li>
                  </ul>
                </div>
              </section>

              {/* Section 6 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">6</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Customer Responsibilities
                  </h2>
                </div>
                <div className="ml-11 space-y-3">
                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-spice mt-1 flex-shrink-0" />
                    <div>
                      <p className="text-base leading-relaxed">
                        Customers are responsible for providing accurate
                        delivery information, being available for delivery, and
                        ensuring proper storage of products upon receipt.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 7 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">7</span>
                  </div>
                  <h2 className="text-2xl font-bold">
                    Limitation of Liability
                  </h2>
                </div>
                <div className="ml-11">
                  <p className="text-base leading-relaxed">
                    Our liability is limited to the value of the products
                    purchased. We are not responsible for any indirect,
                    incidental, or consequential damages arising from the use of
                    our products or services.
                  </p>
                </div>
              </section>

              {/* Section 8 */}
              <section>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-gradient-to-r from-navy to-spice rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">8</span>
                  </div>
                  <h2 className="text-2xl font-bold">Modifications</h2>
                </div>
                <div className="ml-11">
                  <p className="text-base leading-relaxed">
                    We reserve the right to modify these terms at any time.
                    Changes will be posted on this page with an updated revision
                    date. Continued use of our services constitutes acceptance
                    of the modified terms.
                  </p>
                </div>
              </section>

              {/* Contact Section */}
              <section className="bg-gradient-to-r from-cream to-cream/50 p-6 rounded-xl border border-gold/20">
                <h3 className="text-xl font-bold text-navy mb-3">
                  Contact Information
                </h3>
                <p className="text-base leading-relaxed text-navy/80">
                  For any questions regarding these terms and conditions, please
                  contact us at:
                </p>
                <div className="mt-3 space-y-2 text-sm">
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
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-spice mt-1 flex-shrink-0" />
                    <span>
                      <strong>Address:</strong> Galaxy traders, Karimannoor PO- 685581,<br />
                      Mannarathara - Kotta Road, Idukki Dist, Kerala
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
