'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';

const PricingPage = () => {
  const { data: session } = useSession();
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');

  // Calculate discounts
  const proYearlyDiscount = 15; // 15.46% rounded to 15%
  const eliteYearlyDiscount = 16; // 15.97% rounded to 16%

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 via-blue-500 to-blue-600">
          Choose Your Bakugan Plan
        </h1>
        <p className="text-gray-300 max-w-2xl mx-auto">
          Select the perfect plan to enhance your Bakugan collection experience
        </p>
        
        {/* Billing period toggle */}
        <div className="mt-8 inline-flex items-center bg-gray-800 p-1 rounded-lg">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-300 hover:text-white'
            }`}
          >
            Yearly <span className="text-xs text-blue-300 ml-1">Save up to 16%</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {/* Free Plan */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-gray-700 transition-transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🔓 Free Plan</h3>
              <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm">Beginner</span>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-1">Free</div>
              <p className="text-gray-400 text-sm">Start using immediately</p>
            </div>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Perfect for:</p>
              <p className="text-gray-400 text-sm">Newcomers to Bakugan or those who want to quickly check prices</p>
            </div>
            <div className="border-t border-gray-700 my-6"></div>
            <div className="space-y-3">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">View latest Bakugan prices</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-green-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Filter by Bakugan series (Vol.1 Battle Brawlers)</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link 
              href={session ? "/" : "/auth/signin"}
              className="block w-full py-3 px-4 rounded-xl bg-gray-700 text-white text-center font-medium hover:bg-gray-600 transition-colors"
            >
              {session ? "Current Plan" : "Get Started"}
            </Link>
          </div>
        </div>

        {/* Pro Plan */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-blue-600 transition-transform hover:scale-105 relative">
          <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 text-xs font-bold uppercase">
            Popular
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">💎 Pro Plan</h3>
              <span className="px-3 py-1 bg-blue-900/50 text-blue-300 rounded-full text-sm">Serious Collector</span>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-1">
                {billingPeriod === 'monthly' ? '69 THB' : '700 THB'}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="text-blue-300 text-sm font-medium">
                  Save {proYearlyDiscount}%
                </div>
              )}
            </div>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Perfect for:</p>
              <p className="text-gray-400 text-sm">Collectors who want to search and manage their Bakugan collection</p>
            </div>
            <div className="border-t border-gray-700 my-6"></div>
            <div className="space-y-3">
              <div className="flex items-start text-gray-400 text-sm">
                <span className="font-medium text-gray-300 mr-2">All Free features +</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Advanced filters by element, price range, and more</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Search by nicknames, alternative names, and phonetics</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-blue-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Favorites: Save Bakugan you're interested in for later</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link 
              href="/auth/signin"
              className="block w-full py-3 px-4 rounded-xl bg-blue-600 text-white text-center font-medium hover:bg-blue-500 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>

        {/* Elite Plan */}
        <div className="bg-gray-800 rounded-2xl overflow-hidden shadow-lg border border-purple-600 transition-transform hover:scale-105">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-white">🚀 Elite Plan</h3>
              <span className="px-3 py-1 bg-purple-900/50 text-purple-300 rounded-full text-sm">Investment Strategist</span>
            </div>
            <div className="mb-6">
              <div className="text-3xl font-bold text-white mb-1">
                {billingPeriod === 'monthly' ? '119 THB' : '1,200 THB'}
                <span className="text-sm font-normal text-gray-400 ml-1">
                  /{billingPeriod === 'monthly' ? 'month' : 'year'}
                </span>
              </div>
              {billingPeriod === 'yearly' && (
                <div className="text-purple-300 text-sm font-medium">
                  Save {eliteYearlyDiscount}%
                </div>
              )}
            </div>
            <div className="mb-6">
              <p className="text-gray-300 mb-2">Perfect for:</p>
              <p className="text-gray-400 text-sm">Experienced collectors who want to plan investments and manage their Bakugan portfolio long-term</p>
            </div>
            <div className="border-t border-gray-700 my-6"></div>
            <div className="space-y-3">
              <div className="flex items-start text-gray-400 text-sm">
                <span className="font-medium text-gray-300 mr-2">All Pro features +</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Portfolio Management: Organize your Bakugan collection with price history graphs</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">AI Suggestions: Get recommendations for Bakugan to buy based on trends and popularity</span>
              </div>
              <div className="flex items-start">
                <svg className="h-5 w-5 text-purple-400 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-gray-300">Profile Customization: Personalize your profile with banners, badges, and display styles</span>
              </div>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link 
              href="/auth/signin"
              className="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 text-white text-center font-medium hover:from-purple-500 hover:to-blue-500 transition-colors"
            >
              Upgrade Now
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-16 max-w-3xl mx-auto text-center">
        <h2 className="text-2xl font-bold text-white mb-6">Frequently Asked Questions</h2>
        <div className="space-y-6 text-left">
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Can I change my plan later?</h3>
            <p className="text-gray-300">Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately and charges will be prorated accordingly.</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Are there discounts for annual payments?</h3>
            <p className="text-gray-300">Yes! You'll receive a discount when choosing annual billing. Pro Plan saves you {proYearlyDiscount}% and Elite Plan saves you {eliteYearlyDiscount}%.</p>
          </div>
          <div className="bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-medium text-white mb-2">Will I receive updates and new features?</h3>
            <p className="text-gray-300">Definitely! We regularly update our platform with new features and improvements. Users on all plans will automatically receive these updates.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingPage;
