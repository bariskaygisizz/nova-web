// Public, non-secret configuration for the NOVA web funnel. Fill these in after deployment.
// FUNNEL_URL: RevenueCat Funnel (or Web Purchase Link) URL with Stripe as checkout provider,
//             copied from the RevenueCat dashboard. See docs/STRIPE_FUNNEL_SETUP.md.
window.NOVA_CONFIG = {
  FUNNEL_URL: "",
  APP_STORE_URL: "",
  GALAXY_STORE_URL: "",
  // NOVA backend contact endpoint, e.g. "https://nova-backend.onrender.com/v1/contact".
  // The owner's email/phone are NOT here — they live only in the backend's environment variables.
  CONTACT_ENDPOINT: "",
};
