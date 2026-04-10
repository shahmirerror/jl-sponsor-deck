const Privacy = () => {
  return (
    <section className="legal-page section-padding">
      <div className="container legal-container">
        <p className="label">Legal</p>
        <h1 className="legal-title">Privacy Policy</h1>
        <p className="legal-updated">Last updated: March 16, 2026</p>

        <div className="legal-block">
          <h3>1. Data We Receive</h3>
          <p>
            We receive information you submit through contact and partnership forms, including names,
            company details, email, phone number, and sponsorship preferences.
          </p>
        </div>

        <div className="legal-block">
          <h3>2. How We Use Data</h3>
          <p>
            Submitted information is used to evaluate sponsorship inquiries, coordinate communications,
            and manage event partnership workflows.
          </p>
        </div>

        <div className="legal-block">
          <h3>3. Sharing</h3>
          <p>
            We do not sell personal information. Data may be shared only with internal organizing members
            or authorized stakeholders directly involved in partnership operations.
          </p>
        </div>

        <div className="legal-block">
          <h3>4. Security</h3>
          <p>
            We apply reasonable organizational and technical safeguards to protect submitted information,
            but no internet transmission can be guaranteed as absolutely secure.
          </p>
        </div>

        <div className="legal-block">
          <h3>5. Contact</h3>
          <p>
            For privacy requests or concerns, email <a href="mailto:acm@jinnah.edu">acm@jinnah.edu</a>.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Privacy;
