import NoCopy from "@/components/NoCopy";

export default function PrivacyPage() {
  return (
  <NoCopy>
  <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: {new Date().toLocaleDateString()}</p>
      </header>

      <section className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-primary dark:prose-invert bg-card/50 p-6 rounded-lg border">
        <p>
          At <strong>Tech Oblivion</strong> (accessible at
          {" "}
          <a className="underline" href="https://techoblivion.in" target="_blank" rel="noopener noreferrer">https://techoblivion.in</a>), we value your privacy and are committed to protecting the personal information you share with us. This Privacy Policy explains what information we collect, how we use it, and your rights regarding your data.
        </p>

        <h2>Information We Collect</h2>
        <ul>
          <li>
            <strong>Personal Information:</strong> When you log in to our website, we may collect your name, email address, and phone number.
          </li>
          <li>
            <strong>Analytics Data:</strong> We use Google Analytics and similar tools to collect information about how visitors interact with our site, such as pages viewed, time spent, and referral sources.
          </li>
          <li>
            <strong>Future Features:</strong> If we introduce newsletters or other sign-up features in the future, additional information may be collected with your consent.
          </li>
        </ul>

        <h2>Cookies and Tracking</h2>
        <p>
          We currently do not use cookies or any cookie-based tracking on our website.
        </p>

        <h2>Use of Information</h2>
        <ul>
          <li>Provide you with access to our site features and login services.</li>
          <li>Improve the content, performance, and security of our website.</li>
          <li>Analyze traffic and user behavior through analytics tools.</li>
          <li>Display embedded third-party content (e.g., YouTube videos) and provide relevant ads or affiliate links.</li>
        </ul>

        <h2>Third-Party Services</h2>
        <p>Our website may include third-party integrations such as:</p>
        <ul>
          <li>Google Analytics (for site traffic analysis)</li>
          <li>YouTube embeds (for video content)</li>
          <li>Advertising and affiliate links (for monetization and recommendations)</li>
        </ul>
        <p>
          These services may collect and use data according to their own privacy policies. We encourage you to review their policies when interacting with their content.
        </p>

        <h2>Children’s Privacy</h2>
        <p>
          Our website is not directed at children under the age of 13. We do not knowingly collect personal information from children under 13. If you believe a child has provided us with personal information, please contact us and we will take steps to remove such information.
        </p>

        <h2>Data Security</h2>
        <p>
          We take reasonable measures to protect your personal data from unauthorized access, misuse, or disclosure. However, please note that no system is completely secure, and we cannot guarantee absolute security of your data.
        </p>

        <h2>Your Rights</h2>
        <ul>
          <li>Request access to the information we hold about you.</li>
          <li>Request correction or deletion of your data.</li>
          <li>Opt out of future communications (if any newsletters or similar services are introduced).</li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy or how we handle your data, please contact us at:
        </p>
        <p>
          <span role="img" aria-label="email">📧</span> <a className="underline" href="mailto:info@techoblivion.in">info@techoblivion.in</a>
        </p>

        <p className="mt-8 text-sm text-muted-foreground">
          By using our website, you consent to this Privacy Policy.
        </p>
      </section>
    </div>
  </NoCopy>
  )
}
