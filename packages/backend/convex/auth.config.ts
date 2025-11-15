export default {
  providers: [
    {
      // Replace with your own Clerk Issuer URL from your "convex"
      // or with process.env.CLERK_JWT_ISSUER_DOMAIN
      // and configure CLERK_JWT_ISSUER_DOMAIN on the Convex dashboard.
      // See https://docs.convex.dev/auth/clerk#configuring-domain
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN,
      applicationID: "convex",
    },
  ],
};
