import React, { useState } from "react"; // Conserver useState
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
  Spinner, // Ajouter Spinner
  Alert, // Ajouter Alert
} from "@material-tailwind/react";
import { 
  FingerPrintIcon, 
  UsersIcon,
  ExclamationTriangleIcon // Ajouter l'icône d'erreur
} from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";
import { useSubdomain } from "../hooks/useSubdomain"; // Ajouter le hook Multi-Tenant

export function Home() {
  // === LOGIQUE MULTI-TENANT (Version distante) ===
  const { subdomain, gymCenter, loading, error, isMultiTenant } = useSubdomain();
  
  // === LOGIQUE CALCULATEUR D'IMC (Version HEAD) ===
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");

  // Fonction de calcul d'IMC (Version HEAD)
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

  // Afficher un loader pendant le chargement (Version distante)
  if (loading && isMultiTenant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  // Afficher une erreur si le centre n'est pas trouvé (Version distante)
  if (error && isMultiTenant) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert
          color="red"
          icon={<ExclamationTriangleIcon className="h-6 w-6" />}
        >
          <Typography variant="h6" className="mb-2">
            Centre non trouvé
          </Typography>
          <Typography variant="small">
            Le sous-domaine "{subdomain}" n'existe pas ou n'est pas actif.
          </Typography>
        </Alert>
      </div>
    );
  }

  // Déterminer le titre et la description dynamiques
  const pageTitle = gymCenter 
    ? `Bienvenue chez ${gymCenter.name}`
    : "Your fitness starts with Gymflow.";
  
  const pageDescription = gymCenter
    ? gymCenter.description || `${gymCenter.name} - Votre partenaire fitness`
    : "Gymflow is the ultimate solution for your fitness routine. We offer personalized programs, track your progress, and help you reach your goals.";

  return (
    <>
      {/* === HERO SECTION === */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              {/* Afficher le logo du centre si disponible (Version distante) */}
              {gymCenter?.logo && (
                <img 
                  src={gymCenter.logo} 
                  alt={gymCenter.name}
                  className="mx-auto mb-6 h-24 w-24 rounded-full object-cover"
                />
              )}
              
              <Typography
                variant="h1"
                color="white" // Couleur corrigée de HEAD
                className="mb-6 font-black"
              >
                {pageTitle}
              </Typography>
              
              <Typography variant="lead" color="white" className="opacity-80">
                {pageDescription}
              </Typography>

              {/* Afficher le sous-domaine si en mode multi-tenant (Version distante) */}
              {isMultiTenant && gymCenter && (
                <Typography 
                  variant="small" 
                  color="white" 
                  className="mt-4 opacity-70"
                >
                  🌐 {gymCenter.full_url}
                </Typography>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* === FEATURES === */}
      <section className="-mt-32 bg-white px-4 pb-20 pt-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ color, title, icon, description }) => (
              <FeatureCard
                key={title}
                color={color}
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
                className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-gray-900 p-2 text-center shadow-lg" // Couleur corrigée de HEAD
              >
                <FingerPrintIcon className="h-8 w-8 text-white " />
              </div>
              <Typography
                variant="h3"
                className="mb-3 font-bold"
                color="blue-gray" // Couleur corrigée de HEAD
              >
                {/* Texte dynamique de la version distante */}
                {gymCenter 
                  ? `Pourquoi choisir ${gymCenter.name} ?`
                  : "Working with us is a pleasure"
                }
              </Typography>
              <Typography 
                className="mb-8 font-normal text-blue-gray-500" // Couleur corrigée de HEAD
              >
                {/* Description dynamique de la version distante */}
                {gymCenter?.description || (
                  <>
                    Don't let your uses guess by attaching tooltips and popoves to
                    any element. Just make sure you enable them first via
                    JavaScript.
                    <br />
                    <br />
                    The kit comes with three pre-built pages to help you get started
                    faster. You can change the text and images and you're good to
                    go. Just make sure you enable them first via JavaScript.
                  </>
                )}
              </Typography>
              <Button variant="filled">read more</Button>
            </div>
            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardHeader floated={false} className="relative h-56">
                  <img alt="Card Image" src="/img/teamwork.jpg" className="h-full w-full" />
                </CardHeader>
                <CardBody>
                  <Typography variant="small" color="blue-gray" className="font-normal">
                    {/* Nom du centre (Version distante) */}
                    {gymCenter?.name || "Enterprise"}
                  </Typography>
                  <Typography
                    variant="h5"
                    color="blue-gray"
                    className="mb-3 mt-2 font-bold"
                  >
                    Top Notch Services
                  </Typography>
                  <Typography className="font-normal text-blue-gray-500">
                    The Arctic Ocean freezes every winter and much of the
                    sea-ice then thaws every summer, and that process will
                    continue whatever happens.
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* === CALCULATEUR D'IMC (Réintégré de HEAD) === */}
      <section className="py-16 px-4" style={{ backgroundColor: "#00357a10" }}>
        <div className="container mx-auto">
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

      {/* === FAQ (Réintégré de HEAD) === */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
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

      {/* === CO-WORKING & CONTACT (Styles HEAD réintégrés) === */}
      <section className="relative bg-white py-24 px-4">
        <div className="container mx-auto">
          <PageTitle section="Co-Working" heading="Build something">
            Put the potentially record low maximum sea ice extent...
          </PageTitle>
          <div className="mx-auto mt-20 mb-48 grid max-w-5xl grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {contactData.map(({ title, icon, description }) => (
              <Card key={title} color="transparent" shadow={false} className="text-center">
                <div
                  className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full shadow-lg shadow-gray-500/20"
                  style={{ backgroundColor: "#00357a" }} // Style HEAD réintégré
                >
                  {React.createElement(icon, { className: "w-5 h-5 text-white" })}
                </div>
                <Typography variant="h5" style={{ color: "#00357a" }} className="mb-2">{title}</Typography>
                <Typography className="font-normal" style={{ color: "#9b0e16" }}>{description}</Typography>
              </Card>
            ))}
          </div>

          <PageTitle section="Contact Us" heading={
            gymCenter 
              ? `Contactez ${gymCenter.name}`
              : "Want to work with us?"
          }>
            Complete this form and we will get back to you in 24 hours.
          </PageTitle>
          
          <form className="mx-auto w-full mt-12 lg:w-5/12">
            <div className="mb-8 flex gap-8">
              <Input variant="outlined" size="lg" label="Full Name" />
              <Input variant="outlined" size="lg" label="Email Address" />
            </div>
            <Textarea variant="outlined" size="lg" label="Message" rows={8} />
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  I agree the
                  <a
                    href="#"
                    className="font-medium transition-colors hover:text-gray-900"
                  >
                    &nbsp;Terms and Conditions
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button variant="gradient" size="lg" className="mt-8" fullWidth>
              Send Message
            </Button>
          </form>
        </div>
      </section>

      <div className="bg-white">
        <Footer />
      </div>
    </>
  );
}

export default Home;