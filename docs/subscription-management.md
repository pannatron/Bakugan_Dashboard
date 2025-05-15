# Subscription Management

This document provides information about the subscription management features added to the Bakugan Dashboard.

## Overview

The Bakugan Dashboard now supports three subscription tiers:

1. **Free Plan** - Basic access with limited features
2. **Pro Plan** - Enhanced features for serious collectors
3. **Elite Plan** - Premium features for investment-focused users

Subscriptions have expiration dates, after which users automatically revert to the Free plan.

## Admin Features

### Managing User Subscriptions

As an admin, you can manage user subscriptions through the User Management tab in the Admin Dashboard:

1. Navigate to the Admin Dashboard
2. Click on the "User Management" tab
3. For any user, click the "Manage Plan" button
4. In the modal that appears:
   - Select the subscription plan (Free, Pro, or Elite)
   - Set the expiration date
   - Click "Save Changes"

When the expiration date is reached, the user will automatically be reverted to the Free plan.

### Subscription Expiration

A daily cron job has been set up to automatically check for expired subscriptions. This job:

1. Runs once per day at midnight (UTC)
2. Identifies users whose subscription has expired
3. Automatically reverts them to the Free plan

The cron job is configured in `vercel.json` and implemented in the `/api/cron/check-subscriptions` API route.

## Technical Implementation

### User Model

The User model has been extended with two new fields:

- `subscriptionPlan`: Can be 'free', 'pro', or 'elite'
- `subscriptionExpiry`: Date when the subscription expires

### API Routes

- `/api/users` - Updated to handle subscription plan and expiration date updates
- `/api/cron/check-subscriptions` - New endpoint that checks for and processes expired subscriptions

### Security

The cron job endpoint can be secured by setting a `CRON_SECRET` environment variable. When set, requests to the cron endpoint must include this secret in the Authorization header:

```
Authorization: Bearer your-cron-secret-here
```

## Setting Up Environment Variables

Add the following to your `.env.local` file:

```
CRON_SECRET=your-secure-random-string
```

This secret will be used to authenticate requests to the cron job endpoint.
