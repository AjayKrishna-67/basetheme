import React from 'react';
import {
  CheckCircle,
  Truck,
  Heart,
  Star,
  Award,
  Leaf,
  Globe,
  Clock,
  Users,
  Package,
  Shield,
} from 'lucide-react';

export default function AboutUs() {
  return (
    <div className="min-h-screen mt-20 bg-gradient-to-br from-cream via-white to-cream">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-navy via-navy-light to-spice py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('/pattern.png')] bg-center"></div>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Our Spice Journey
          </h1>
          <p className="text-xl text-white/90 max-w-3xl mx-auto mb-8">
            Bringing Pure Spices and True Flavours from God's Own Country
          </p>
        </div>
      </div>

      {/* Mission & Vision */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-cream/50 p-8 rounded-2xl shadow-lg border border-gold/20">
              <div className="w-16 h-16 bg-spice/10 rounded-full flex items-center justify-center mb-6">
                <Award className="w-8 h-8 text-spice" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">
                Our Mission
              </h3>
              <p className="text-navy/70 leading-relaxed">
                To bring authentic, pure spices from Kerala to kitchens worldwide.
                We're committed to preserving the rich flavors and aromas of traditional
                Kerala spices, ensuring every dish is enhanced with the finest quality
                ingredients sourced directly from God's Own Country.
              </p>
            </div>
            <div className="bg-cream/50 p-8 rounded-2xl shadow-lg border border-gold/20">
              <div className="w-16 h-16 bg-spice/10 rounded-full flex items-center justify-center mb-6">
                <Globe className="w-8 h-8 text-spice" />
              </div>
              <h3 className="text-2xl font-bold text-navy mb-4">
                Our Vision
              </h3>
              <p className="text-navy/70 leading-relaxed">
                To be recognized as the premier destination for authentic Kerala spices,
                known for our commitment to purity, traditional sourcing methods, and
                bringing the true flavors of Kerala to every kitchen around the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 bg-cream/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="inline-block px-4 py-1 bg-spice/10 text-spice rounded-full text-sm font-medium mb-4">
              OUR STORY
            </span>
            <h2 className="text-3xl md:text-4xl font-bold text-navy mb-6">
              Our Spice Story
            </h2>
              <p className="text-navy/70 mb-8 leading-relaxed text-lg">
              SwadKerala was born from a passion to share the authentic flavors
              of Kerala's rich spice heritage with the world. As part of the Kaaikani
              family, we leverage our expertise in quality sourcing to bring you
              pure, handpicked spices directly from Kerala's finest farms. With our
              commitment to traditional methods and uncompromising quality, we ensure
              every spice preserves its natural aroma and flavor, bringing true
              Kerala taste to your kitchen.
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="https://play.google.com/store/apps/details?id=com.kaaikani.kaaikani&pcampaignid=web_share"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 text-spice border border-spice rounded-full hover:bg-cream transition-colors flex items-center gap-2"
              >
                <img src="/play-store.png" alt="Google Play" className="h-6" />
                Get Kaaikani App
              </a>
              <a
                href="https://kaaikanistore.com"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2 text-white rounded-full bg-gradient-to-r from-navy to-spice hover:from-navy-dark hover:to-spice-dark transition-all"
              >
                Visit Kaaikani Store
              </a>
            </div>
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gold/20 text-center w-36">
                <div className="text-3xl font-bold text-spice mb-2">
                  2023
                </div>
                <div className="text-sm text-navy/70">Founded</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gold/20 text-center w-36">
                <div className="text-3xl font-bold text-spice mb-2">
                  200+
                </div>
                <div className="text-sm text-navy/70">Products</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gold/20 text-center w-36">
                <div className="text-3xl font-bold text-spice mb-2">
                  20K+
                </div>
                <div className="text-sm text-navy/70">Happy Customers</div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-lg border border-gold/20 text-center w-36">
                <div className="text-3xl font-bold text-spice mb-2">
                  24/7
                </div>
                <div className="text-sm text-navy/70">Support</div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {[
              {
                icon: (
                  <CheckCircle className="w-12 h-12 text-spice mb-4 mx-auto" />
                ),
                title: 'Premium Quality',
                description:
                  'We source only the finest, pure spices from Kerala\'s best farms, ensuring every spice maintains its authentic aroma and flavor.',
              },
              {
                icon: (
                  <Truck className="w-12 h-12 text-spice mb-4 mx-auto" />
                ),
                title: 'Fast Delivery',
                description:
                  'Get your premium spices delivered fresh to your doorstep with our reliable shipping and careful packaging.',
              },
              {
                icon: (
                  <Heart className="w-12 h-12 text-spice mb-4 mx-auto" />
                ),
                title: 'Made with Love',
                description:
                  'Every spice is handpicked and packed with care and attention to detail, preserving the authentic taste of Kerala.',
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-xl shadow-lg border border-gold/20 text-center hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {feature.icon}
                <h3 className="text-xl font-semibold mb-3 text-navy">
                  {feature.title}
                </h3>
                <p className="text-navy/70">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-12">
            <span className="inline-block px-4 py-1 bg-spice/10 text-spice rounded-full text-sm font-medium mb-4">
              OUR VALUES
            </span>
            <h2 className="text-3xl font-bold text-navy mb-12">
              What We Stand For
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: (
                    <Leaf className="w-8 h-8 text-spice mb-4 mx-auto" />
                  ),
                  title: 'Sustainability',
                  description:
                    "We're committed to eco-friendly practices and sustainable sourcing from Kerala's organic farms.",
                },
                {
                  icon: (
                    <Heart className="w-8 h-8 text-spice mb-4 mx-auto" />
                  ),
                  title: 'Passion',
                  description:
                    'We pour our hearts into bringing authentic Kerala spices that unite families and cultures through food.',
                },
                {
                  icon: (
                    <Shield className="w-8 h-8 text-spice mb-4 mx-auto" />
                  ),
                  title: 'Integrity',
                  description:
                    "We believe in transparency, purity, and doing what's right, ensuring you get 100% authentic Kerala spices.",
                },
              ].map((value, index) => (
                <div
                  key={index}
                  className="bg-cream/30 p-8 rounded-xl shadow-lg border border-gold/20 hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="w-16 h-16 bg-spice/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-navy">
                    {value.title}
                  </h3>
                  <p className="text-navy/70">{value.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
