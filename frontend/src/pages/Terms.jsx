// src/pages/Terms.jsx

import React from "react";
import { Typography, Container } from "@material-tailwind/react";
import { Footer } from "@/widgets/layout"; // Reuse the footer from home page

export function Terms() {
  return (
    <div className="w-full overflow-x-hidden">
      <div className="relative flex h-96 content-center items-center justify-center pt-16 pb-32">
        {/* Background image similar to your home page hero section */}
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="container relative mx-auto px-4 max-w-7xl">
          <Typography variant="h1" style={{ color: "#b5c9e3ff" }} className="mb-6 font-black text-center">
            Terms and Conditions
          </Typography>
        </div>
      </div>

      <section className="-mt-32 bg-white px-4 pb-20 pt-4 w-full">
        <div className="container mx-auto max-w-7xl py-10">
          <Typography variant="paragraph" className="mb-8" style={{ color: "#00357a" }}>
            **Date of Last Revision: November 3, 2025**
          </Typography>

          {/* SECTION 1: GENERAL USE */}
          <Typography variant="h3" className="mb-4" style={{ color: "#9b0e16" }}>
            1. Acceptance of Terms
          </Typography>
          <Typography variant="paragraph" className="mb-8" style={{ color: "#00357a" }}>
            By accessing or using the Gymflow service, you agree to be bound by these Terms and Conditions and all policies incorporated herein. If you do not agree to these terms, do not use the service.
          </Typography>

          {/* SECTION 2: USER CONDUCT */}
          <Typography variant="h3" className="mb-4" style={{ color: "#9b0e16" }}>
            2. User Conduct
          </Typography>
          <Typography variant="paragraph" className="mb-8" style={{ color: "#00357a" }}>
            You agree not to use the service for any illegal or unauthorized purpose. You are solely responsible for your conduct and any data, text, files, information, usernames, images, graphics, photos, profiles, audio and video clips, sounds, musical works, works of authorship, applications, links and other content or materials that you submit, post, or display on or via the service.
          </Typography>

          {/* SECTION 3: LIMITATION OF LIABILITY */}
          <Typography variant="h3" className="mb-4" style={{ color: "#9b0e16" }}>
            3. Limitation of Liability
          </Typography>
          <Typography variant="paragraph" className="mb-8" style={{ color: "#00357a" }}>
            Gymflow is not responsible for any damage to your computer system, loss of data, or other damage that results from the use of the service. You acknowledge that your use of the service is at your sole risk.
          </Typography>
          
          {/* Add more sections (Privacy, Payment, etc.) here */}
          
        </div>
      </section>

      <div className="bg-white w-full">
        <Footer />
      </div>
    </div>
  );
}

export default Terms;