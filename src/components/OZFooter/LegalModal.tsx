"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const LEGAL_CONTENT: Record<string, { title: string; body: React.ReactNode }> = {
  disclosures: {
    title: "Legal Disclosures",
    body: (
      <div>
        <p className="mb-2">
          <span className="font-semibold">Effective Date:</span> July 16, 2025
        </p>
        <p>
          This page provides key legal disclaimers and compliance statements
          related to OZ Listings™, operated by{" "}
          <span className="font-semibold">OZ Listings, LLC</span>, a Delaware
          limited liability company.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Fair Housing Compliance
        </h3>
        <p>
          OZ Listings complies with the{" "}
          <span className="font-semibold">
            Fair Housing Act (Title VIII of the Civil Rights Act of 1968)
          </span>{" "}
          and is committed to equal housing opportunity. We do not discriminate
          based on race, color, religion, sex, disability, familial status, or
          national origin. Any property-related content or marketing is provided
          in alignment with these principles.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Brokerage and Licensing
        </h3>
        <p>
          OZ Listings, LLC is{" "}
          <span className="font-semibold">
            not a licensed real estate broker
          </span>{" "}
          and does not perform brokerage activities. If a listed project or
          offering involves licensed brokerage services, those services are
          handled by independent third-party providers. Licensing and
          jurisdictional details are available directly from those providers
          upon request.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Investment Disclaimers
        </h3>
        <p>
          All information on this site is provided for{" "}
          <span className="font-semibold">
            general informational purposes only
          </span>{" "}
          and does not constitute an offer to sell or a solicitation to buy any
          securities. Nothing on this site should be construed as legal, tax,
          financial, or investment advice.
        </p>
        <p>
          You are solely responsible for your own investment decisions and
          should consult with licensed professionals. All real estate
          investments carry risk, including the potential loss of capital. Past
          performance is not indicative of future results.
        </p>
        <p className="font-semibold">
          OZ Listings does not verify or underwrite sponsor offerings and is not
          responsible for third-party websites, representations, or the accuracy
          of external content linked from this platform.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Opportunity Zone Disclosure
        </h3>
        <p>
          Properties or offerings featured on OZ Listings may be located within
          federally designated{" "}
          <span className="font-semibold">
            Qualified Opportunity Zones (QOZs)
          </span>
          . However, OZ Listings makes{" "}
          <span className="font-semibold">
            no guarantees or representations
          </span>{" "}
          that any particular investment will qualify for Opportunity Zone tax
          treatment.
        </p>
        <p>
          Qualification depends on a variety of factors-including timing,
          structure, investor status, and compliance with IRS regulations. You
          should consult a qualified tax advisor or attorney before relying on
          any Opportunity Zone benefit.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Terms of Use & Privacy
        </h3>
        <p>
          Use of this platform is governed by our Terms of Use and Privacy
          Policy, which outline your rights, responsibilities, and how your
          information may be shared with third parties.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          Contact for Disclosures
        </h3>
        <p>For additional legal or compliance information, contact:</p>
        <p>
          <span className="font-semibold">OZ Listings, LLC</span>
          <br />
          108 W 13th St, Ste 100 <br />
          Wilmington, DE 19801
          <br />
          <a href="mailto:support@ozlistings.com">support@ozlistings.com</a>
        </p>
      </div>
    ),
  },
  terms: {
    title: "Terms & Conditions",
    body: (
      <div>
        <p className="mb-2">
          <span className="font-semibold">Effective Date:</span> July 16, 2025
        </p>
        <p>
          These Terms and Conditions of Use (the "Agreement") govern your access
          to and use of all websites, services, subdomains, content, forms,
          tools, communications, and technologies made available by{" "}
          <span className="font-semibold">OZ Listings, LLC</span>, a Delaware
          limited liability company with its principal office at{" "}
          <span className="font-semibold">
            108 W 13th St, Ste 100, Wilmington, DE 19801
          </span>{" "}
          ("OZ Listings," "we," "our," or "us"). By accessing or using any part
          of our platform, you ("you" or "User") agree to be legally bound by
          this Agreement, without modification. If you do not agree, you must{" "}
          <span className="font-semibold">immediately discontinue all use</span>{" "}
          of the platform.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          1. Authorized Use and Intended Audience
        </h3>
        <p>
          OZ Listings provides a U.S.-based platform for informational,
          marketing, and connection purposes related to real estate investments,
          Qualified Opportunity Zones, and affiliated sectors such as
          development, lending, and capital markets. Use of this platform is
          strictly limited to individuals and entities located within the{" "}
          <span className="font-semibold">United States</span>. You may only use
          the platform for lawful, personal, or internal business purposes. You
          may not scrape, reverse-engineer, automate, or otherwise misuse the
          system, nor use it for any unauthorized or exploitative commercial
          purpose.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          2. No Investment Advice
        </h3>
        <p>
          All content and tools offered through this platform are for general
          informational purposes only and do{" "}
          <span className="font-semibold">not</span> constitute investment,
          legal, tax, or financial advice. OZ Listings is{" "}
          <span className="font-semibold">not</span> a registered broker-dealer,
          investment adviser, or tax professional. Nothing on this platform
          constitutes an offer, solicitation, or recommendation to buy or sell
          any security or pursue any specific investment strategy. You are
          solely responsible for conducting your own independent due diligence
          and consulting qualified professionals before making any investment
          decisions.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          3. Data Submission and Use
        </h3>
        <p>
          By submitting any information through this platform-including personal
          data, investment preferences, form submissions, or uploaded
          content-you warrant that the data is accurate, lawful, and authorized
          for submission. You grant OZ Listings™ an{" "}
          <span className="font-semibold">
            irrevocable, perpetual, non-exclusive, royalty-free, transferable,
            and sublicensable license
          </span>{" "}
          to collect, store, use, analyze, share, distribute, monetize, and
          license that data for any lawful purpose, in accordance with our
          Privacy Policy. This may include-but is not limited to-syndication to
          capital providers, developers, or advisors; internal analytics; and
          licensed access to third parties. You waive all rights to control,
          review, or receive compensation for the use or monetization of your
          data, except where required by law.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          4. Third-Party Affiliations and Communications
        </h3>
        <p>
          You acknowledge and agree that OZ Listings may share your data with
          affiliated entities and strategic partners, including:
        </p>
        <ul>
          <li>
            <span className="font-semibold">ACARA Cap LLC</span>
          </li>
          <li>
            <span className="font-semibold">ACARA Management LLC</span>
          </li>
          <li>
            <span className="font-semibold">Kingsbury Media LLC</span>
          </li>
          <li>
            <span className="font-semibold">
              Other present or future affiliates, strategic collaborators, or
              technology partners
            </span>
          </li>
        </ul>
        <p>
          These parties may independently contact you regarding investment
          opportunities, advisory services, or related offerings. Some of your
          data may also be stored on{" "}
          <span className="font-semibold">
            shared infrastructure or platforms
          </span>{" "}
          co-managed by these partners. OZ Listings is not responsible for the
          conduct of third parties but requires its partners to follow
          reasonable standards for data protection and compliance.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          5. Ownership and Intellectual Property
        </h3>
        <p>
          All intellectual property, including content, software, branding,
          layout, logic, and system architecture, is owned by or licensed to OZ
          Listings. Nothing in this Agreement conveys any license or ownership
          rights to Users. You may not copy, modify, transmit, create derivative
          works from, display, or exploit any part of the platform without prior
          written consent from OZ Listings.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          6. Limitations of Liability
        </h3>
        <p>
          To the maximum extent permitted by law, OZ Listings, its members,
          managers, affiliates, officers, employees, and contractors shall{" "}
          <span className="font-semibold">not be liable</span> for any direct,
          indirect, incidental, consequential, special, exemplary, or punitive
          damages arising from your use-or inability to use-this platform or its
          content. Your{" "}
          <span className="font-semibold">sole and exclusive remedy</span> for
          dissatisfaction is to discontinue use of the platform.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">7. Indemnification</h3>
        <p>
          You agree to indemnify, defend, and hold harmless OZ Listings and its
          affiliates, officers, contractors, and agents from any and all claims,
          liabilities, damages, costs, and expenses (including reasonable
          attorneys' fees) arising from:
        </p>
        <ul>
          <li>Your use of the platform</li>
          <li>Your violation of this Agreement</li>
          <li>Your submission of data</li>
          <li>Your interactions with affiliated or third-party services</li>
        </ul>
        <h3 className="mt-4 mb-2 text-lg font-semibold">8. No Warranties</h3>
        <p>
          The platform and all associated services are provided{" "}
          <span className="font-semibold">"AS IS" and "AS AVAILABLE"</span>{" "}
          without warranty of any kind. We disclaim all warranties, express or
          implied, including those of merchantability, fitness for a particular
          purpose, non-infringement, accuracy, or uptime. We do not guarantee
          the availability, quality, reliability, or results of any investment,
          listing, or affiliated offering.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          9. U.S.-Only Jurisdiction and International Users
        </h3>
        <p>
          This platform is intended solely for use within the{" "}
          <span className="font-semibold">United States</span>. We do not target
          users in the <span className="font-semibold">European Union</span>,{" "}
          <span className="font-semibold">United Kingdom</span>, or other
          jurisdictions subject to the General Data Protection Regulation
          (GDPR), and we do not offer services to users in those regions. Any
          data submitted in violation of this restriction may be deleted.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          10. Governing Law and Venue
        </h3>
        <p>
          This Agreement shall be governed by the laws of the{" "}
          <span className="font-semibold">State of California</span>, without
          regard to conflict-of-law principles. Any disputes shall be resolved
          exclusively in the{" "}
          <span className="font-semibold">
            state or federal courts of Contra Costa County, California
          </span>
          .
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          11. Modifications and Termination
        </h3>
        <p>
          We may modify, suspend, or terminate this Agreement or access to any
          part of the platform at any time, without notice or liability.
          Continued use after updates constitutes acceptance of revised terms.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          12. Entire Agreement and Severability
        </h3>
        <p>
          This Agreement, together with our Privacy Policy, constitutes the
          entire agreement between you and OZ Listings regarding use of the
          platform. If any provision is found unenforceable, the remainder will
          remain in full force.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          13. Contact Information
        </h3>
        <p>Questions about these Terms may be directed to:</p>
        <p>
          <span className="font-semibold">OZ Listings, LLC</span>
          <br />
          108 W 13th St, Ste 100
          <br />
          Wilmington, DE 19801
          <br />
          <a href="mailto:support@ozlistings.com">support@ozlistings.com</a>
        </p>
      </div>
    ),
  },
  privacy: {
    title: "Privacy Policy",
    body: (
      <div>
        <p className="mb-2">
          <span className="font-semibold">Effective Date:</span> July 16, 2025
        </p>
        <p>
          This Privacy Policy (the "Policy") explains how{" "}
          <span className="font-semibold">
            OZ Listings™, operated by OZ Listings, LLC
          </span>
          , a Delaware limited liability company with its principal address at:
          <br />
          <span className="font-semibold">
            108 W 13th St, Ste 100, Wilmington, DE 19801
          </span>
          <br />
          ("OZ Listings," "we," "our," or "us") collects, processes, stores,
          shares, and protects your information when you use this website,
          submit forms, or otherwise interact with our platform and affiliated
          entities.
        </p>
        <p>
          This Policy is designed to be{" "}
          <span className="font-semibold">
            transparent, scalable, and compliant with U.S. standards
          </span>{" "}
          relevant to the alternative investment, capital markets, and real
          estate sectors. If you do not agree to these terms, do not use this
          website or submit any information.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          1. Types of Information We Collect
        </h3>
        <ul className="mb-2 list-disc pl-6">
          <li>
            <span className="font-semibold">Personal Identifiers:</span> Name,
            email, phone number, physical address, professional title, company
            name
          </li>
          <li>
            <span className="font-semibold">Investment Information:</span>{" "}
            Capital interests, deal preferences, Opportunity Zone strategies
          </li>
          <li>
            <span className="font-semibold">
              Behavioral and Technical Data:
            </span>{" "}
            IP address, device/browser type, geolocation, clickstream data,
            session analytics
          </li>
          <li>
            <span className="font-semibold">Submitted Content:</span> Uploaded
            files, form inputs, email communications, calendar bookings, and
            messages
          </li>
          <li>
            <span className="font-semibold">Enriched or Sourced Data:</span>{" "}
            Publicly available records, affiliate-submitted info, third-party
            analytics
          </li>
        </ul>
        <p>
          Collection may occur via direct user input or passive technologies
          such as cookies, tags, scripts, logs, and third-party integrations
          (e.g., Google Analytics, Meta Pixel, HubSpot).
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          2. How We Use Your Information
        </h3>
        <ul className="mb-2 list-disc pl-6">
          <li>Delivering and personalizing your platform experience</li>
          <li>Matching users with appropriate investment opportunities</li>
          <li>
            Internal analytics, product development, and performance reporting
          </li>
          <li>Marketing, remarketing, and strategic outreach</li>
          <li>Compliance, recordkeeping, and legal obligations</li>
        </ul>
        <p>
          Use of your data supports the mission of OZ Listings and its partners
          in capital formation, investment syndication, development, tax
          strategy, and advisory services.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          3. Sharing of Information
        </h3>
        <p className="font-semibold">
          By submitting data, you grant OZ Listings a perpetual, royalty-free,
          transferable, and sublicensable license to use, disclose, and
          commercialize your information as follows:
        </p>
        <h4 className="mt-2 mb-1 font-semibold">A. Shared Entities:</h4>
        <p>We may share data with:</p>
        <ul className="mb-2 list-disc pl-6">
          <li>
            <span className="font-semibold">Affiliated companies</span>,
            including:
            <ul className="list-disc pl-6">
              <li>
                <span className="font-semibold">ACARA Cap LLC</span>
              </li>
              <li>
                <span className="font-semibold">ACARA Management LLC</span>
              </li>
              <li>
                <span className="font-semibold">Kingsbury Media LLC</span>
              </li>
              <li>
                Any current or future companies under common ownership,
                governance, or operational collaboration with OZ Listings
              </li>
            </ul>
          </li>
          <li>
            <span className="font-semibold">Commercial partners</span> in real
            estate, investment, lending, development, marketing, legal, or
            financial advisory sectors
          </li>
          <li>
            <span className="font-semibold">Service providers and vendors</span>
            , including CRM systems, analytics platforms, digital marketing
            tools, and compliance tech
          </li>
          <li>
            <span className="font-semibold">
              Parties to potential transactions
            </span>
            , such as acquirers, investors, or joint ventures
          </li>
          <li>
            <span className="font-semibold">Legal or regulatory entities</span>,
            as required by applicable law
          </li>
        </ul>
        <h4 className="mt-2 mb-1 font-semibold">
          B. Independent Outreach & Shared Infrastructure:
        </h4>
        <p>
          These partners may{" "}
          <span className="font-semibold">independently contact you</span>{" "}
          regarding relevant services, opportunities, or updates. Some data may
          be stored on{" "}
          <span className="font-semibold">shared or integrated systems</span>,
          allowing limited authorized access across partner companies.
          <br />
          <span className="font-semibold">
            We do not authorize our partners to resell or license your personal
            data to unrelated third parties without written approval.
          </span>
        </p>
        <h4 className="mt-2 mb-1 font-semibold">C. Licensing of Data:</h4>
        <p>
          OZ Listings also reserves the right to{" "}
          <span className="font-semibold">
            license anonymized or aggregated user data
          </span>
          -or, in some cases, identifiable data submitted with full consent-for
          commercial use by third parties in real estate, finance, investment,
          or market analytics.
        </p>
        <p>
          Such licenses may be structured as flat-fee, royalty-based, or
          strategic syndications, and may include data delivery via API, CSV,
          dashboard access, or similar formats.
        </p>
        <p>
          All licensing activities are conducted in accordance with applicable
          law and aligned with the strategic interests of OZ Listings, its
          investors, and its partners.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          4. Data Retention and Security
        </h3>
        <p>
          We retain data for as long as necessary to support our business goals,
          satisfy legal requirements, or fulfill ongoing partner services-unless
          a longer period is required by law or contractual obligation.
        </p>
        <p>
          We{" "}
          <span className="font-semibold">
            maintain commercially reasonable technical, physical, and
            administrative safeguards
          </span>
          . However, no system is immune from compromise. You acknowledge and
          accept the inherent risks of digital communication and data
          transmission.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          5. Breach Notification and Indemnification
        </h3>
        <p>
          In the event of a data breach affecting your information, we will
          provide notice to the extent required by applicable law. We require
          our partners and vendors to maintain their own data security practices
          and{" "}
          <span className="font-semibold">
            indemnify OZ Listings against any losses
          </span>{" "}
          resulting from their negligence, misconduct, or failure to protect
          shared data.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          6. Your Rights and Limitations
        </h3>
        <p>
          OZ Listings does{" "}
          <span className="font-semibold">
            not provide mechanisms to access, delete, or restrict processing of
            your information
          </span>
          , except as required by applicable U.S. law.
        </p>
        <p>
          By using the platform, you waive all opt-out and suppression rights
          not mandated under federal or state regulation.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          7. Policy Updates and Your Responsibility
        </h3>
        <p>
          We may update or revise this Policy at any time, without notice.
          Revisions take effect upon posting. Your continued use of the platform
          indicates acceptance of the revised terms.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          8. Legal Jurisdiction
        </h3>
        <p>
          This Policy is governed by the laws of the{" "}
          <span className="font-semibold">State of California</span>. Any
          disputes shall be resolved in the{" "}
          <span className="font-semibold">
            state or federal courts located in Contra Costa County, California
          </span>
          , regardless of where you reside or operate.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          9. California Residents - CCPA Compliance
        </h3>
        <p>
          We operate in a business-to-business and professional services context
          and rely on applicable exemptions under the{" "}
          <span className="font-semibold">
            California Consumer Privacy Act (CCPA)
          </span>
          .
        </p>
        <p>
          If you are a California resident and believe you are entitled to data
          rights beyond those stated here, contact us using the information
          below.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          10. Non-U.S. and International Users
        </h3>
        <p>
          This platform is intended exclusively for users located in the{" "}
          <span className="font-semibold">United States</span>. We do{" "}
          <span className="font-semibold">not</span> target individuals or
          businesses subject to the{" "}
          <span className="font-semibold">
            General Data Protection Regulation (GDPR)
          </span>{" "}
          or similar laws in the EU, UK, or other international jurisdictions.
        </p>
        <p>
          If non-U.S. data is collected inadvertently, it will be deleted upon
          discovery.
        </p>
        <h3 className="mt-4 mb-2 text-lg font-semibold">
          11. Contact Information
        </h3>
        <p>
          For questions or compliance-related inquiries, contact:
          <br />
          <span className="font-semibold">OZ Listings, LLC</span>
          <br />
          108 W 13th St, Ste 100
          <br />
          Wilmington, DE 19801
          <br />
          <a href="mailto:support@ozlistings.com">support@ozlistings.com</a>
        </p>
      </div>
    ),
  },
};

export default function LegalModal({ 
  open, 
  onClose, 
  type 
}: { 
  open: boolean; 
  onClose: () => void; 
  type: 'disclosures' | 'terms' | 'privacy' | null;
}) {
  const { title, body } = LEGAL_CONTENT[type || 'disclosures'] || { title: '', body: null };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="modal-bg"
          className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            key="modal-content"
            className="relative h-[80vh] w-full max-w-3xl overflow-scroll border border-black/80 bg-white p-8 text-black shadow-2xl dark:border-white/80 dark:bg-gray-900 dark:text-white"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              onClick={onClose}
              aria-label="Close"
            >
              <X size={24} />
            </button>
            <div className="mb-2 text-2xl font-bold">{title}</div>
            <div className="prose dark:prose-invert max-w-none">{body}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
