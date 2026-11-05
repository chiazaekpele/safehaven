# Safe Haven Foundation --- Product Requirements Document

**Product:** Safe Haven Foundation --- 3rd Edition Food Drive\
**Version:** 1.1\
**Status:** MVP specification

## 1. Product summary

A simple, mobile-first donation website for Safe Haven Foundation's
third student food drive. Visitors can understand the initiative, donate
any amount through Paystack, see cumulative impact and arrange physical
provision donations.

The product should make giving easy and communicate the reason for the
initiative with warmth and sincerity. It is not a charity-management
platform.

## 2. Mission and story

Students carry so much. We cannot fix every problem they face, but we
can offer a meal to those who need it when they need it most.

Since January, Safe Haven has provided food to more than 300 students
during examination seasons. This is the third edition.

The initiative is led by the Holy Spirit through Anokwu Chiaza Daniella,
a 500-level Computer Engineering student.

Keep the About section faithful to this philosophy. Avoid
corporate-sounding charity language.

## 3. Goals

1.  Explain the purpose and story of Safe Haven.
2.  Let anyone donate any permitted amount through Paystack.
3.  Show historical impact and live third-edition fundraising impact.
4.  Convert verified donation totals into meal equivalents at ₦1,200 per
    meal.
5.  Make it easy to arrange physical provision donations.
6.  Make the campaign easy to share through WhatsApp.

## 4. Audience

-   People who want to support students during examinations.
-   Friends, family and members of the wider community.
-   People who prefer to donate food provisions rather than money.
-   People sharing the campaign with potential donors.

## 5. MVP scope and page structure

Build one responsive landing page with these sections:

### 5.1 Hero

-   Safe Haven Foundation name.
-   Third Edition Food Drive.
-   A clear headline and short supporting copy.
-   Primary Donate button.
-   Use the approved flyer as the visual reference.

### 5.2 About

Explain the student pressures that motivate the initiative, the
philosophy of offering a meal when it is needed most, the 300+
historical student reach and the leadership described above.

### 5.3 Impact

Display distinct figures: - Historical fundraising: **₦400,000+** (a
milestone, not an exact amount). - Historical student reach: **300+**. -
Third-edition verified donations. - Meal equivalents funded by
third-edition donations.

Do not imply that newly funded meal equivalents have already been
distributed. Keep historical students reached separate from meal
equivalents funded.

### 5.4 Donate

-   Suggested amounts: ₦1,200, ₦2,400, ₦5,000 and ₦10,000.
-   Custom amount input: donors may enter another amount.
-   Explain that ₦1,200 represents one meal.
-   Collect an email address for Paystack checkout.
-   Monetary donations are processed through Paystack only.
-   Anonymous public giving: do not display donor names or a public
    donor leaderboard.
-   Validate amounts on the server. The minimum donation amount should
    be configurable and confirmed before launch.

### 5.5 Physical provisions

Section heading: **Give More Than a Meal**.

Invite people to donate: - Custard - Cornflakes - Milk - Sugar - Milo -
Bread

Direct visitors to contact Daniella to arrange the donation. Do not
build inventory management or a collection scheduling system.

### 5.6 Thank-you experience

After payment is independently confirmed, show:

> Thank you for helping us get someone food this exam season. We can't
> fix all the problems in the world but we can give one person a meal.
> God bless you.

Also show the donor's meal equivalent and a WhatsApp share action.

If a donor returns from Paystack before the webhook has arrived, show a
pending/verifying state and check payment status. Do not show a
successful donation message until verification succeeds.

### 5.7 Contact and sharing

-   Contact: Daniella.
-   Phone/WhatsApp: +234 705 389 8056.
-   WhatsApp share button with a pre-written campaign message and the
    deployed site URL.

## 6. Impact calculation rules

-   Meal cost: ₦1,200.
-   Calculate using integer kobo, never floating-point currency
    arithmetic.
-   Third-edition meal equivalents = floor(third-edition verified
    donation total / 120000 kobo).
-   Optionally show the remainder as progress towards the next meal.
-   Historical impact remains labelled ₦400,000+ and 300+ students until
    a verified exact historical baseline is supplied.
-   If an exact historical total is later provided, cumulative
    fundraising may be calculated as exact historical total plus
    verified third-edition donations.
-   Do not automatically increase the historical student count based on
    donations.

## 7. Functional requirements

  ID      Requirement                                         Priority
  ------- --------------------------------------------------- ----------
  FR-01   Display campaign story and About section            Must
  FR-02   Display historical impact milestones                Must
  FR-03   Accept suggested and custom donation amounts        Must
  FR-04   Explain ₦1,200 per meal and calculate equivalents   Must
  FR-05   Initialize Paystack payments securely               Must
  FR-06   Verify payments server-side and via webhook         Must
  FR-07   Store each successful payment once                  Must
  FR-08   Update live third-edition impact figures            Must
  FR-09   Display provision list and contact details          Must
  FR-10   Display verified-payment thank-you experience       Must
  FR-11   Share campaign through WhatsApp                     Should
  FR-12   Work on mobile, tablet and desktop                  Must

## 8. Non-functional requirements

-   Mobile-first and responsive.
-   Fast on ordinary mobile connections.
-   HTTPS in production.
-   No secret keys in client-side code.
-   No public access to private donor/payment records.
-   Accessible text contrast, keyboard navigation and clear form labels.
-   Useful loading, pending, success and failure states.
-   Search-engine-friendly title, description and social sharing
    metadata.
-   Minimise personal information collection.

## 9. Visual direction

Use the approved food-drive flyer as the design reference: -
Cream/off-white base. - Dark brown typography and wood tones. -
Orange/yellow headline accents. - Burgundy highlights. - Realistic
prepared-food and provision photography. - Warm, direct and
community-centred presentation.

Do not add unrelated AI-generated decorative elements or redesign the
campaign identity.

## 10. Explicitly out of scope

-   User accounts or donor login.
-   Public donor leaderboard.
-   Admin dashboard in the MVP.
-   AI features.
-   Inventory or logistics management.
-   Multiple campaign pages.
-   Direct bank transfer collection on the website.
-   Custom payment processing.
-   Complex CMS.

## 11. Acceptance criteria

The MVP is ready when: 1. Visitors can understand the initiative and its
purpose. 2. Visitors can choose a suggested amount or enter a custom
amount. 3. Paystack checkout can be initialized. 4. Successful payments
are verified independently of the browser redirect. 5. Failed, abandoned
and unverified payments do not increase totals. 6. Duplicate webhook
deliveries do not create duplicate donations. 7. The public counter
shows verified third-edition donations and meal equivalents. 8.
Historical milestones remain clearly separate from current-edition
impact. 9. Visitors can arrange provision donations using the supplied
contact. 10. Thank-you and WhatsApp sharing actions work. 11. The site
is responsive and deployed on Vercel.
