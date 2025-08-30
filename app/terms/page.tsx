import NoCopy from "@/components/NoCopy";

export default function TermsPage() {
  return (
  <NoCopy>
  <div className="container mx-auto px-4 py-12 max-w-3xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Terms of Service (ToS)</h1>
        <p className="text-sm text-muted-foreground mt-2">Last updated: 8/30/2025</p>
      </header>

      <section className="prose max-w-none prose-headings:text-foreground prose-p:text-foreground prose-li:text-foreground prose-a:text-primary dark:prose-invert bg-card/50 p-6 rounded-lg border">
        <p>
          Welcome to <strong>Tech Oblivion</strong> (accessible at <a className="underline" href="https://techoblivion.in" target="_blank" rel="noopener noreferrer">https://techoblivion.in</a>). By accessing or using our website, you agree to these Terms of Service. Please read them carefully, because by visiting or using our services, you are entering into a binding agreement with us.
        </p>

        <h2>1. Use of the Website</h2>
        <ul>
          <li>You may use our website and services only for lawful purposes and in accordance with these Terms.</li>
          <li>You agree not to engage in any activity that could harm, disable, overburden, or impair our site.</li>
          <li>You may not attempt to gain unauthorized access to our systems or interfere with the security features of the website.</li>
        </ul>

        <h2>2. Accounts and Login</h2>
        <ul>
          <li>Some parts of the site may require login or account creation. You agree to provide accurate and up-to-date information.</li>
          <li>You are responsible for maintaining the confidentiality of your login credentials and for all activities that occur under your account.</li>
          <li>We reserve the right to suspend or terminate accounts that violate these Terms or our Privacy Policy.</li>
        </ul>

        <h2>3. Intellectual Property</h2>
        <ul>
          <li>All content on this site—including text, graphics, logos, and other materials—is owned by or licensed to Tech Oblivion, unless stated otherwise.</li>
          <li>You may not copy, distribute, or use our content for commercial purposes without prior written consent.</li>
          <li>Third-party content (such as YouTube embeds) remains the property of their respective owners.</li>
        </ul>

        <h2>4. Third-Party Links and Content</h2>
        <ul>
          <li>Our site may include links, ads, or embedded content from third parties (e.g., YouTube, affiliate partners).</li>
          <li>We are not responsible for the content, privacy policies, or practices of third-party services. Your interactions with them are at your own risk.</li>
        </ul>

        <h2>5. Disclaimers</h2>
        <ul>
          <li>Our website is provided “as is” and “as available” without warranties of any kind, whether express or implied.</li>
          <li>We do not guarantee that the website will always be available, secure, or error-free.</li>
          <li>Any use of information from this site is at your own discretion and risk.</li>
        </ul>

        <h2>6. Limitation of Liability</h2>
        <ul>
          <li>To the maximum extent permitted by law, Tech Oblivion shall not be held liable for any indirect, incidental, or consequential damages resulting from your use of the website.</li>
          <li>This includes but is not limited to loss of data, loss of profits, or business interruptions.</li>
        </ul>

        <h2>7. Termination</h2>
        <ul>
          <li>We may suspend or terminate access to the site if you violate these Terms or engage in activities that may harm the website or its users.</li>
          <li>Termination does not affect provisions such as Intellectual Property, Disclaimers, and Limitation of Liability, which survive termination.</li>
        </ul>

        <h2>8. Changes to the Terms</h2>
        <ul>
          <li>We may update these Terms of Service from time to time. Any changes will be posted on this page with a new “Last Updated” date.</li>
          <li>Continued use of the website after changes means you accept the updated Terms.</li>
        </ul>

        <h2>9. Governing Law</h2>
        <p>These Terms are governed by and construed under the laws of India, without regard to its conflict of law principles.</p>

        <h2>10. Contact Us</h2>
        <p>
          For questions about these Terms, reach out at: <span role="img" aria-label="email">📧</span>{' '}
          <a className="underline" href="mailto:info@techoblivion.in">info@techoblivion.in</a>
        </p>
      </section>
    </div>
  </NoCopy>
  )
}
