import React, { useState } from "react";
import axios from "axios"; // 👈 IMPORTANT: Import axios for API calls
import {
  Card,
  CardBody,
  CardHeader,
  Typography,
  Button,
  IconButton,
  Input,
  Textarea,
  Checkbox,
  // 👇 Imports for the Terms & Conditions popup
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
// AJOUT D'ICÔNES COMMUNES POUR ÉVITER LES ERREURS (si utilisées dans featuresData)
import { 
    FingerPrintIcon, 
    UsersIcon, 
    CalendarDaysIcon, 
    ChartBarIcon, 
    CreditCardIcon 
} from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";

export function Home() {
  // === CALCULATEUR D'IMC STATE ===
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");

  // === CONTACT FORM STATE ===
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // 👇 State and Handlers for Terms & Conditions Modal
  const [showTermsModal, setShowTermsModal] = useState(false);
  const handleOpenTerms = () => setShowTermsModal(true);
  const handleCloseTerms = () => setShowTermsModal(false);
  
  // === CONTACT FORM HANDLERS ===

  // Handler for all contact form input changes
  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Handler for form submission (sends data to Django)
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");

    if (!formData.agreedToTerms) {
      setSubmitMessage("Please agree to the Terms and Conditions.");
      return;
    }
    
    if (!formData.fullName || !formData.email || !formData.message) {
      setSubmitMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    // Endpoint for your Django API
    const API_URL = "http://localhost:8000/api/contact/"; 

    try {
      const response = await axios.post(API_URL, {
        fullName: formData.fullName,
        email: formData.email,
        message: formData.message,
      });

      setSubmitMessage(response.data.message || "Message sent successfully!");
      // Clear the form on success
      setFormData({ fullName: "", email: "", message: "", agreedToTerms: false }); 
    } catch (error) {
      // Extract specific error message from Django or provide a generic error
      const errorMessage = error.response?.data?.message || "Failed to send message. Please check the console (F12) for network errors.";
      setSubmitMessage(errorMessage);
      console.error("Frontend Error:", error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };


  // Fonction de calcul d'IMC 
  const calculateBMI = () => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      alert("Veuillez entrer une taille et un poids valides.");
      return;
    }

    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    // Classification
    let category = "";
    if (bmiValue < 18.5) category = "Sous-poids";
    else if (bmiValue <= 24.9) category = "Poids Normal";
    else if (bmiValue <= 29.9) category = "Surpoids";
    else if (bmiValue <= 34.9) category = "Obésité de grade I";
    else if (bmiValue <= 39.9) category = "Obésité de grade II";
    else category = "Obésité de grade III";

    setClassification(category);
  };

  return (
    // 'overflow-x-hidden' est nécessaire ici pour garantir qu'il n'y a pas de défilement horizontal
    <div className="w-full overflow-x-hidden">
      {/* === HERO SECTION === */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32 w-full">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="container relative mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              <Typography variant="h1" style={{ color: "#b5c9e3ff" }} className="mb-6 font-black">
                Your fitness starts with Gymflow.
              </Typography>
              <Typography variant="lead" style={{ color: "#d2ddecff" }} className="opacity-80">
                Gymflow is the ultimate solution for your fitness routine. We offer personalized programs, track your progress, and help you reach your goals.
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* === FEATURES === (AVEC DÉFILEMENT MARQUEE) */}
      <section className="-mt-32 bg-white px-4 pb-20 pt-4 w-full">
        <div className="container mx-auto max-w-7xl">
          {/* Nouveau Conteneur : Utilise la classe CSS 'marquee' pour cacher l'overflow */}
          <div className="marquee"> 
            {/* Contenu défilant : Utilise la classe CSS 'marquee-content' pour l'animation */}
            <div className="marquee-content">
              {/* --- 1ère itération des cartes --- */}
              {featuresData.map(({ color, title, icon, description }, index) => (
                <FeatureCard
                  key={title + index}
                  color={color}
                  title={title}
                  // Cards compactes : largeur fixe de 320px
                  className="min-w-[200px] w-[200px] mx-4 flex-shrink-0" 
                  icon={React.createElement(icon, {
                    className: "w-5 h-5 text-white",
                  })}
                  description={description}
                />
              ))}
              {/* --- 2ème itération des cartes (DUPLICATION pour la boucle infinie) --- */}
              {featuresData.map(({ color, title, icon, description }, index) => (
                <FeatureCard
                  key={title + index + featuresData.length} // Clé unique
                  color={color}
                  title={title}
                  // Cards compactes : largeur fixe de 320px
                  className="min-w-[200px] w-[200px] mx-4 flex-shrink-0" 
                  icon={React.createElement(icon, {
                    className: "w-5 h-5 text-white",
                  })}
                  description={description}
                />
              ))}
            </div>
          </div>

          {/* === WORKING WITH US === */}
          <div className="mt-32 flex flex-wrap items-center">
            <div className="mx-auto -mt-8 w-full px-4 md:w-5/12">
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ backgroundColor: "#9b0e16" }}>
                <FingerPrintIcon className="h-8 w-8 text-white " />
              </div>
              <Typography variant="h3" className="mb-3 font-bold" style={{ color: "#00357a" }}>
                Working with us is a pleasure
              </Typography>
              <Typography className="mb-8 font-normal" style={{ color: "#00357a" }}>
                Don't let your uses guess by attaching tooltips and popoves to any element...
              </Typography>
              <Button style={{ backgroundColor: "#00357a" }}>read more</Button>
            </div>
            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardHeader floated={false} className="relative h-56">
                  <img alt="Card Image" src="/img/teamwork.jpg" className="h-full w-full" />
                </CardHeader>
                <CardBody>
                  <Typography variant="small" style={{ color: "#00357a" }} className="font-normal">Enterprise</Typography>
                  <Typography variant="h5" style={{ color: "#00357a" }} className="mb-3 mt-2 font-bold">
                    Top Notch Services
                  </Typography>
                  <Typography className="font-normal" style={{ color: "#00357a" }}>
                    The Arctic Ocean freezes every winter...
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* === CALCULATEUR D'IMC === */}
      <section className="py-16 px-4 w-full" style={{ backgroundColor: "#00357a10" }}>
        <div className="container mx-auto max-w-7xl">
          <PageTitle section="Santé" heading="Calculez votre IMC">
            L'Indice de Masse Corporelle (IMC) est un indicateur simple de la relation entre votre poids et votre taille.
          </PageTitle>

          <div className="mt-12 max-w-4xl mx-auto">
            <Card className="shadow-xl">
              <CardBody className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <Input
                    type="number"
                    label="Taille (cm)"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="Ex: 175"
                  />
                  <Input
                    type="number"
                    label="Poids (kg)"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    placeholder="Ex: 70"
                  />
                </div>

                <div className="flex justify-center mb-8">
                  <Button
                    size="lg"
                    className="flex items-center gap-2"
                    style={{ backgroundColor: "#9b0e16" }}
                    onClick={calculateBMI}
                  >
                    Calculer mon IMC
                  </Button>
                </div>

                {bmi && (
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <Typography variant="h4" style={{ color: "#00357a" }} className="mb-2">
                      Votre IMC : <span className="font-bold" style={{ color: "#00357a" }}>{bmi}</span>
                    </Typography>
                    <Typography variant="h5" style={{ color: "#00357a" }}>
                      Classification : <span
                          className={`font-bold ${
                            classification.includes("Normal")
                              ? "text-green-600"
                              : classification.includes("Obésité")
                              ? "text-[#9b0e16]"
                              : "text-orange-600"
                          }`}
                      >
                        {classification}
                      </span>
                    </Typography>
                  </div>
                )}

                <div className="mt-10">
                  <Typography variant="h6" style={{ color: "#00357a" }} className="mb-4 text-center">
                    Tableau de Classification de l'IMC
                  </Typography>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left">
                      <thead>
                        <tr style={{ backgroundColor: "#00357a20" }}>
                          <th className="px-4 py-3 text-xs font-bold uppercase" style={{ color: "#00357a" }}>IMC</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase" style={{ color: "#00357a" }}>Classification</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">&lt; 18.5</td>
                          <td className="px-4 py-3 text-sm text-orange-600 font-medium">Sous-poids</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">18.5 - 24.9</td>
                          <td className="px-4 py-3 text-sm text-green-600 font-medium">Poids Normal</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">25 - 29.9</td>
                          <td className="px-4 py-3 text-sm text-orange-600 font-medium">Surpoids</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">30 - 34.9</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>Obésité de grade I</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">35 - 39.9</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>Obésité de grade II</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">&gt; 40</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>Obésité de grade III</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </CardBody>
            </Card>
          </div>
        </div>
      </section>

      {/* === OUR TEAM === */}
      <section className="px-4 pt-20 pb-48 w-full">
        <div className="container mx-auto max-w-7xl">
          <PageTitle section="Our Team" heading="Here are our heroes">
            According to the National Oceanic and Atmospheric Administration...
          </PageTitle>
          <div className="mt-24 grid grid-cols-1 gap-12 gap-x-24 md:grid-cols-2 xl:grid-cols-4">
            {teamData.map(({ img, name, position, socials }) => (
              <TeamCard
                key={name}
                img={img}
                name={name}
                position={position}
                socials={
                  <div className="flex items-center gap-2">
                    {socials.map(({ color, name }) => (
                      <IconButton key={name} style={{ color: "#00357a" }} variant="text">
                        <i className={`fa-brands text-xl fa-${name}`} />
                      </IconButton>
                    ))}
                  </div>
                }
              />
            ))}
          </div>
        </div>
      </section>

      {/* === FAQ SECTION === */}
      <section className="py-20 bg-white w-full">
        <div className="container mx-auto px-4 max-w-7xl">
          <Typography variant="h2" style={{ color: "#00357a" }} className="text-center mb-12">
            Questions Fréquentes
          </Typography>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              { q: "Faut-il un abonnement pour commencer ?", a: "Non ! Profitez de 7 jours d'essai gratuit sans engagement." },
              { q: "Quels sont les horaires d'ouverture ?", a: "Du lundi au vendredi : 6h–22h | Samedi & Dimanche : 8h–20h" },
              { q: "Y a-t-il des coaches personnels ?", a: "Oui, des coachs certifiés disponibles sur rendez-vous." },
              { q: "Puis-je geler mon abonnement ?", a: "Oui, jusqu'à 2 mois par an sans frais." },
            ].map((faq, i) => (
              <details
                key={i}
                className="rounded-lg p-4 cursor-pointer transition-colors"
                style={{ backgroundColor: "#00357a10" }}
              >
                <summary className="font-semibold flex justify-between items-center" style={{ color: "#00357a" }}>
                  {faq.q}
                  <i className="fas fa-chevron-down text-sm transition-transform" />
                </summary>
                <p className="mt-3" style={{ color: "#9b0e16" }}>{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* === CO-WORKING & CONTACT === */}
      <section className="relative bg-white py-24 px-4 w-full">
        <div className="container mx-auto max-w-7xl">
          <PageTitle section="Co-Working" heading="Build something">
            Put the potentially record low maximum sea ice extent...
          </PageTitle>
          <div className="mx-auto mt-20 mb-48 grid max-w-5xl grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {contactData.map(({ title, icon, description }) => (
              <Card key={title} color="transparent" shadow={false} className="text-center">
                <div
                  className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full shadow-lg shadow-gray-500/20"
                  style={{ backgroundColor: "#00357a" }}
                >
                  {React.createElement(icon, { className: "w-5 h-5 text-white" })}
                </div>
                <Typography variant="h5" style={{ color: "#00357a" }} className="mb-2">{title}</Typography>
                <Typography className="font-normal" style={{ color: "#9b0e16" }}>{description}</Typography>
              </Card>
            ))}
          </div>

          <PageTitle section="Contact Us" heading="Want to work with us?">
            Complete this form and we will get back to you in 24 hours.
          </PageTitle>
          {/* ATTACH SUBMIT HANDLER */}
          <form className="mx-auto w-full mt-12 lg:w-5/12" onSubmit={handleContactSubmit}>
            <div className="mb-8 flex gap-8">
              {/* BIND FULL NAME INPUT */}
              <Input 
                variant="outlined" 
                size="lg" 
                label="Full Name" 
                name="fullName"
                value={formData.fullName}
                onChange={handleContactChange}
                required
              />
              {/* BIND EMAIL INPUT */}
              <Input 
                variant="outlined" 
                size="lg" 
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleContactChange}
                required
              />
            </div>
            {/* BIND MESSAGE TEXTAREA */}
            <Textarea 
              variant="outlined" 
              size="lg" 
              label="Message" 
              rows={8} 
              name="message"
              value={formData.message}
              onChange={handleContactChange}
              required
            />
            {/* BIND CHECKBOX - UPDATED CLICK HANDLER */}
            <Checkbox
              checked={formData.agreedToTerms}
              onChange={handleContactChange}
              name="agreedToTerms"
              label={
                <Typography variant="small" style={{ color: "#00357a" }} className="flex items-center font-normal">
                  I agree the
                  <a 
                    href="#" // Use '#' to prevent navigation
                    className="font-medium transition-colors" 
                    style={{ color: "#9b0e16" }}
                    onClick={(e) => { // 👇 NEW: Add onClick handler
                      e.preventDefault(); 
                      handleOpenTerms(); // Open the modal
                    }}
                  >
                    &nbsp;Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            
            {/* DISPLAY SUBMISSION MESSAGE */}
            {submitMessage && (
              <Typography 
                variant="small" 
                color={submitMessage.includes("success") ? "green" : "red"} 
                className="mt-4"
              >
                {submitMessage}
              </Typography>
            )}

            {/* SUBMIT BUTTON WITH LOADING STATE */}
            <Button 
              size="lg" 
              className="mt-8" 
              fullWidth 
              type="submit" 
              style={{ backgroundColor: "#00357a" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>

      <div className="bg-white w-full">
        <Footer />
      </div>

      {/* === TERMS AND CONDITIONS DIALOG/MODAL === */}
      <Dialog open={showTermsModal} handler={handleCloseTerms} size="lg">
        <DialogHeader className="text-[#00357a]">Terms and Conditions</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          <Typography color="blue-gray" className="font-normal mb-4">
            **1. Acceptance of Terms:** By using the Gymflow services, you agree to these Terms and Conditions. If you do not agree, you must not use our services.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **2. Service Use:** Our services are provided for your personal, non-commercial use only. You agree not to reproduce, duplicate, copy, sell, resell or exploit any portion of the Service without express written permission.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **3. BMI Calculator Disclaimer:** The Body Mass Index (BMI) calculator is for informational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of a qualified health provider with any questions you may have regarding a medical condition.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **4. Privacy:** Your use of the service is also governed by our Privacy Policy, which is incorporated into these Terms by reference.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **5. Termination:** We may terminate or suspend your access immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **6. Governing Law:** These Terms shall be governed and construed in accordance with the laws of [Your Jurisdiction], without regard to its conflict of law provisions.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="red"
            onClick={handleCloseTerms}
            className="mr-1"
          >
            <span>Close</span>
          </Button>
        </DialogFooter>
      </Dialog>
      {/* === END OF DIALOG === */}
    </div>
  );
}

export default Home;