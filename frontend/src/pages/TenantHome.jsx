import React, { useState } from "react";
import axios from "axios";
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
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
} from "@material-tailwind/react";
import { FingerPrintIcon } from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";

export function TenantHome({ gymCenter }) {
  // === BMI Calculator State ===
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");

  // === Contact Form State ===
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    message: "",
    agreedToTerms: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");

  // === Terms Modal State ===
  const [showTermsModal, setShowTermsModal] = useState(false);
  const handleOpenTerms = () => setShowTermsModal(true);
  const handleCloseTerms = () => setShowTermsModal(false);

  // === Contact Form Handlers ===
  const handleContactChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage("");

    if (!formData.agreedToTerms) {
      setSubmitMessage("Veuillez accepter les conditions générales.");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.message) {
      setSubmitMessage("Veuillez remplir tous les champs requis.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:8000/api/contact/", {
        fullName: formData.fullName,
        email: formData.email,
        message: formData.message,
      });
      setSubmitMessage(response.data.message || "Message envoyé avec succès !");
      setFormData({ fullName: "", email: "", message: "", agreedToTerms: false });
    } catch (error) {
      setSubmitMessage(
        error.response?.data?.message ||
          "Échec de l'envoi du message. Veuillez réessayer."
      );
      console.error("Frontend Error:", error.response || error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === BMI Calculator ===
  const calculateBMI = () => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      alert("Veuillez entrer une taille et un poids valides.");
      return;
    }

    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let category = "";
    if (bmiValue < 18.5) category = "Sous-poids";
    else if (bmiValue <= 24.9) category = "Poids Normal";
    else if (bmiValue <= 29.9) category = "Surpoids";
    else if (bmiValue <= 34.9) category = "Obésité de grade I";
    else if (bmiValue <= 39.9) category = "Obésité de grade II";
    else category = "Obésité de grade III";

    setClassification(category);
  };

  const pageTitle = `Bienvenue chez ${gymCenter.name}`;
  const pageDescription = gymCenter.description || `${gymCenter.name} - Votre partenaire fitness`;

  return (
    <div className="w-full overflow-x-hidden">
      {/* === HERO SECTION === */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32 w-full">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="container relative mx-auto px-4 max-w-7xl">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              {gymCenter?.logo && (
                <img
                  src={gymCenter.logo}
                  alt={gymCenter.name}
                  className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
                />
              )}

              <Typography variant="h1" color="white" className="mb-6 font-black">
                {pageTitle}
              </Typography>

              <Typography variant="lead" color="white" className="opacity-80">
                {pageDescription}
              </Typography>

              <Typography variant="small" color="white" className="mt-4 opacity-70">
                🌐 {gymCenter.full_url}
              </Typography>
            </div>
          </div>
        </div>
      </div>

      {/* === FEATURES SECTION === */}
      <section className="py-16 px-4" style={{ backgroundColor: "#00357a10" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ title, icon, description }) => (
              <FeatureCard
                key={title}
                title={title}
                icon={React.createElement(icon, {
                  className: "w-5 h-5 text-white",
                })}
                description={description}
              />
            ))}
          </div>

          {/* === WORKING WITH US === */}
          <div className="mt-32 flex flex-wrap items-center">
            <div className="mx-auto -mt-8 w-full px-4 md:w-5/12">
              <div
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full text-center shadow-lg"
                style={{ backgroundColor: "#9b0e16" }}
              >
                <FingerPrintIcon className="h-8 w-8 text-white" />
              </div>
              <Typography variant="h3" className="mb-3 font-bold" color="blue-gray">
                Pourquoi choisir {gymCenter.name} ?
              </Typography>
              <Typography className="mb-8 font-normal text-blue-gray-500">
                {gymCenter.description || 
                  "Nous offrons les meilleures installations et services pour vous aider à atteindre vos objectifs fitness."}
              </Typography>
              <Button variant="filled">En savoir plus</Button>
            </div>
            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardHeader floated={false} className="relative h-56">
                  <img alt="Card Image" src="/img/teamwork.jpg" className="h-full w-full" />
                </CardHeader>
                <CardBody>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {gymCenter.name}
                  </Typography>
                  <Typography variant="h5" color="blue-gray" className="mb-3 mt-2 font-bold">
                    Services Premium
                  </Typography>
                  <Typography className="font-normal text-blue-gray-500">
                    Découvrez nos services de qualité et notre équipe professionnelle 
                    prête à vous accompagner dans votre parcours fitness.
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* === BMI CALCULATOR === */}
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
                      Votre IMC : <span className="font-bold">{bmi}</span>
                    </Typography>
                    <Typography variant="h5" style={{ color: "#00357a" }}>
                      Classification :{" "}
                      <span
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
                          <th className="px-4 py-3 text-xs font-bold uppercase" style={{ color: "#00357a" }}>
                            IMC
                          </th>
                          <th className="px-4 py-3 text-xs font-bold uppercase" style={{ color: "#00357a" }}>
                            Classification
                          </th>
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
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>
                            Obésité de grade I
                          </td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">35 - 39.9</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>
                            Obésité de grade II
                          </td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">&gt; 40</td>
                          <td className="px-4 py-3 text-sm font-medium" style={{ color: "#9b0e16" }}>
                            Obésité de grade III
                          </td>
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
          <PageTitle section="Notre Équipe" heading="Nos professionnels">
            Découvrez l'équipe qui vous accompagnera dans votre parcours fitness
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
                <p className="mt-3" style={{ color: "#9b0e16" }}>
                  {faq.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* === CONTACT SECTION === */}
      <section className="relative bg-white py-24 px-4 w-full">
        <div className="container mx-auto max-w-7xl">
          <PageTitle section="Co-Working" heading="Travaillez avec nous">
            Rejoignez notre communauté et atteignez vos objectifs
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
                <Typography variant="h5" style={{ color: "#00357a" }} className="mb-2">
                  {title}
                </Typography>
                <Typography className="font-normal" style={{ color: "#9b0e16" }}>
                  {description}
                </Typography>
              </Card>
            ))}
          </div>

          <PageTitle section="Contactez-nous" heading={`Contactez ${gymCenter.name}`}>
            Remplissez ce formulaire et nous vous répondrons dans les 24 heures.
          </PageTitle>

          <form className="mx-auto w-full mt-12 lg:w-5/12" onSubmit={handleContactSubmit}>
            <div className="mb-8 flex gap-8">
              <Input
                variant="outlined"
                size="lg"
                label="Nom complet"
                name="fullName"
                value={formData.fullName}
                onChange={handleContactChange}
                required
              />
              <Input
                variant="outlined"
                size="lg"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleContactChange}
                required
              />
            </div>
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
            <Checkbox
              checked={formData.agreedToTerms}
              onChange={handleContactChange}
              name="agreedToTerms"
              label={
                <Typography variant="small" color="gray" className="flex items-center font-normal">
                  J'accepte les
                  <a
                    href="#"
                    className="font-medium transition-colors"
                    style={{ color: "#9b0e16" }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleOpenTerms();
                    }}
                  >
                    &nbsp;Conditions Générales
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            {submitMessage && (
              <Typography
                variant="small"
                color={submitMessage.includes("succès") ? "green" : "red"}
                className="mt-4"
              >
                {submitMessage}
              </Typography>
            )}

            <Button
              size="lg"
              className="mt-8"
              fullWidth
              type="submit"
              style={{ backgroundColor: "#00357a" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Envoi..." : "Envoyer le message"}
            </Button>
          </form>
        </div>
      </section>

      <div className="bg-white w-full">
        <Footer />
      </div>

      {/* === TERMS DIALOG === */}
      <Dialog open={showTermsModal} handler={handleCloseTerms} size="lg">
        <DialogHeader className="text-[#00357a]">Conditions Générales</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          <Typography color="blue-gray" className="font-normal mb-4">
            **1. Acceptance des Conditions:** En utilisant les services de {gymCenter.name}, vous acceptez ces conditions générales.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **2. Utilisation du Service:** Nos services sont fournis pour votre usage personnel et non commercial uniquement.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **3. Calculateur d'IMC:** Le calculateur d'IMC est fourni à titre informatif uniquement et ne remplace pas un avis médical professionnel.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **4. Confidentialité:** Votre utilisation du service est également régie par notre politique de confidentialité.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **5. Résiliation:** Nous pouvons suspendre ou résilier votre accès immédiatement en cas de violation des conditions.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button variant="gradient" color="red" onClick={handleCloseTerms} className="mr-1">
            <span>Fermer</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default TenantHome;