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
  Tabs,
  TabsHeader,
  TabsBody,
  Tab,
  TabPanel,
  Radio,
  Alert,
  Spinner,
} from "@material-tailwind/react";
import { 
  FingerPrintIcon, 
  HeartIcon, 
  FireIcon, 
  SparklesIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon 
} from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";
import HealthChatbot from "@/components/HealthChatbot";


export function TenantHome({ gymCenter }) {
  // === BMI Calculator State ===
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");
  const [goal, setGoal] = useState("maintien");

  // === IA Gemini State ===
  const [aiPlan, setAiPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState("");
  const [activeTab, setActiveTab] = useState("calculator");

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

  // === Print AI Plan Function ===
  const printAIPlan = () => {
    if (!aiPlan) {
      alert("Aucun plan à imprimer");
      return;
    }

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    
    // Contenu HTML à imprimer
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Plan de Santé Personnalisé - ${gymCenter?.name || 'Gym Flow'}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              margin: 20px;
              color: #333;
            }
            h1, h2 {
              color: #00357a;
              border-bottom: 2px solid #9b0e16;
              padding-bottom: 10px;
            }
            h3 {
              color: #9b0e16;
              margin-top: 20px;
            }
            .header {
              text-align: center;
              margin-bottom: 30px;
              border-bottom: 3px solid #00357a;
              padding-bottom: 20px;
            }
            .plan-content {
              white-space: pre-wrap;
              line-height: 1.8;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              font-size: 12px;
              color: #666;
              border-top: 1px solid #ccc;
              padding-top: 20px;
            }
            @media print {
              body { margin: 15px; }
              .header { page-break-after: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Plan de Santé Personnalisé</h1>
            <p><strong>${gymCenter?.name || 'Gym Flow'}</strong></p>
            <p>Généré le ${new Date().toLocaleDateString('fr-FR')}</p>
          </div>
          
          <div class="plan-content">
            ${aiPlan.replace(/\n/g, '<br>')}
          </div>
          
          <div class="footer">
            <p>Ce plan a été généré automatiquement par l'IA de ${gymCenter?.name || 'Gym Flow'}</p>
            <p>Consultez votre médecin avant de commencer tout nouveau programme d'entraînement</p>
          </div>
        </body>
      </html>
    `;
    
    // Écrire le contenu et lancer l'impression
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé puis imprimer
    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    };
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
    setAiPlan(null);
    setAiError("");
    setActiveTab("results");
  };

  // === IA Gemini Plan Generator ===
  const generateAIPlan = async () => {
    setIsGenerating(true);
    setAiError("");

    try {
      const response = await axios.post("http://localhost:8000/api/generate-health-plan/", {
        bmi: parseFloat(bmi),
        classification,
        height: parseFloat(height),
        weight: parseFloat(weight),
        goals: goal,
      });

      if (response.data.success) {
        setAiPlan(response.data.plan);
        setActiveTab("ai-plan");
      } else {
        setAiError(response.data.error || "Erreur lors de la génération du plan");
      }
    } catch (error) {
      setAiError(error.response?.data?.error || "Impossible de se connecter au serveur");
      console.error("AI Error:", error.response || error);
    } finally {
      setIsGenerating(false);
    }
  };

  // === Format Markdown to HTML ===
  const formatMarkdown = (text) => {
    if (!text) return "";
    
    return text
      .split('\n')
      .map((line, i) => {
        // Titres
        if (line.startsWith('### ')) {
          return <Typography key={i} variant="h6" style={{ color: "#00357a" }} className="mt-4 mb-2 font-bold">{line.replace('### ', '')}</Typography>;
        }
        if (line.startsWith('## ')) {
          return <Typography key={i} variant="h5" style={{ color: "#00357a" }} className="mt-6 mb-3 font-bold">{line.replace('## ', '')}</Typography>;
        }
        if (line.startsWith('# ')) {
          return <Typography key={i} variant="h4" style={{ color: "#00357a" }} className="mt-6 mb-4 font-bold">{line.replace('# ', '')}</Typography>;
        }
        
        // Listes
        if (line.startsWith('- ') || line.startsWith('* ')) {
          return (
            <div key={i} className="flex gap-2 mb-2 ml-4">
              <CheckCircleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <Typography className="text-gray-700">{line.replace(/^[*-] /, '')}</Typography>
            </div>
          );
        }
        
        // Texte gras **texte**
        if (line.includes('**')) {
          const parts = line.split('**');
          return (
            <Typography key={i} className="mb-2 text-gray-700">
              {parts.map((part, j) => 
                j % 2 === 0 ? part : <strong key={j} className="font-bold" style={{ color: "#00357a" }}>{part}</strong>
              )}
            </Typography>
          );
        }
        
        // Ligne vide
        if (line.trim() === '') {
          return <div key={i} className="h-2" />;
        }
        
        // Texte normal
        return <Typography key={i} className="mb-2 text-gray-700">{line}</Typography>;
      });
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

      {/* === BMI CALCULATOR AI === */}
      <section className="py-16 px-4 w-full" style={{ backgroundColor: "#00357a10" }}>
        <div className="container mx-auto max-w-7xl">
          <PageTitle section="Santé" heading="Calculateur IMC Intelligent">
            Calculez votre IMC et obtenez un plan personnalisé généré par IA
          </PageTitle>

          <div className="mt-12 max-w-5xl mx-auto">
            <Card className="shadow-xl">
              <CardBody className="p-8">
                <Tabs value={activeTab}>
                  <TabsHeader
                    className="bg-blue-gray-50"
                    indicatorProps={{
                      className: "bg-blue-500 shadow-none"
                    }}
                  >
                    <Tab 
                      value="calculator" 
                      onClick={() => setActiveTab("calculator")}
                      className={activeTab === "calculator" ? "text-white" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <HeartIcon className="w-5 h-5" />
                        Calculateur
                      </div>
                    </Tab>
                    <Tab 
                      value="results" 
                      disabled={!bmi}
                      onClick={() => setActiveTab("results")}
                      className={activeTab === "results" ? "text-white" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <FireIcon className="w-5 h-5" />
                        Résultats
                      </div>
                    </Tab>
                    <Tab 
                      value="ai-plan" 
                      disabled={!aiPlan}
                      onClick={() => setActiveTab("ai-plan")}
                      className={activeTab === "ai-plan" ? "text-white" : ""}
                    >
                      <div className="flex items-center gap-2">
                        <SparklesIcon className="w-5 h-5" />
                        Plan IA
                      </div>
                    </Tab>
                  </TabsHeader>

                  <TabsBody>
                    {/* TAB 1: CALCULATEUR */}
                    <TabPanel value="calculator">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <Input
                          type="number"
                          label="Taille (cm)"
                          value={height}
                          onChange={(e) => setHeight(e.target.value)}
                          size="lg"
                          icon={<Typography className="text-sm">cm</Typography>}
                          placeholder="Ex: 175"
                        />
                        <Input
                          type="number"
                          label="Poids (kg)"
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                          size="lg"
                          icon={<Typography className="text-sm">kg</Typography>}
                          placeholder="Ex: 70"
                        />
                      </div>

                      <div className="mb-6">
                        <Typography variant="h6" style={{ color: "#00357a" }} className="mb-3">
                          Votre objectif :
                        </Typography>
                        <div className="flex flex-col gap-2">
                          <Radio
                            name="goal"
                            label="Perdre du poids"
                            value="perte"
                            checked={goal === "perte"}
                            onChange={(e) => setGoal(e.target.value)}
                            color="blue"
                          />
                          <Radio
                            name="goal"
                            label="Maintenir mon poids"
                            value="maintien"
                            checked={goal === "maintien"}
                            onChange={(e) => setGoal(e.target.value)}
                            color="blue"
                          />
                          <Radio
                            name="goal"
                            label="Prendre du poids / Muscle"
                            value="prise"
                            checked={goal === "prise"}
                            onChange={(e) => setGoal(e.target.value)}
                            color="blue"
                          />
                        </div>
                      </div>

                      <Button
                        size="lg"
                        fullWidth
                        className="flex items-center justify-center gap-2"
                        style={{ backgroundColor: "#9b0e16" }}
                        onClick={calculateBMI}
                      >
                        <HeartIcon className="w-5 h-5" />
                        Calculer mon IMC
                      </Button>
                    </TabPanel>

                    {/* TAB 2: RÉSULTATS */}
                    <TabPanel value="results">
                      {bmi && (
                        <>
                          <div className="text-center p-8 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg shadow-md mb-6">
                            <Typography variant="h2" style={{ color: "#00357a" }} className="mb-2">
                              {bmi}
                            </Typography>
                            <Typography variant="h5" className={`font-bold ${
                              classification.includes("Normal") ? "text-green-600" :
                              classification.includes("Obésité") ? "text-[#9b0e16]" : "text-orange-600"
                            }`}>
                              {classification}
                            </Typography>
                          </div>

                          <div className="mb-6">
                            <Typography variant="h6" style={{ color: "#00357a" }} className="mb-4 text-center">
                              Tableau de Classification
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

                          <Alert
                            icon={<SparklesIcon className="w-6 h-6" />}
                            className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200"
                          >
                            <Typography className="font-medium text-purple-900">
                              Obtenez un plan personnalisé avec l'IA !
                            </Typography>
                            <Typography className="text-sm text-purple-700 mt-1">
                              Notre intelligence artificielle va analyser vos données et générer un plan alimentaire
                              et d'exercices adapté à votre IMC et vos objectifs.
                            </Typography>
                          </Alert>

                          {aiError && (
                            <Alert color="red" className="mb-4">
                              {aiError}
                            </Alert>
                          )}

                          <Button
                            size="lg"
                            fullWidth
                            className="flex items-center justify-center gap-2"
                            style={{ backgroundColor: "#00357a" }}
                            onClick={generateAIPlan}
                            disabled={isGenerating}
                          >
                            {isGenerating ? (
                              <>
                                <Spinner className="h-5 w-5" />
                                Génération en cours...
                              </>
                            ) : (
                              <>
                                <SparklesIcon className="w-5 h-5" />
                                Générer mon plan personnalisé avec l'IA
                              </>
                            )}
                          </Button>
                        </>
                      )}
                    </TabPanel>

                    {/* TAB 3: PLAN IA */}
                    <TabPanel value="ai-plan">
                      {aiPlan && (
                        <div className="prose max-w-none">
                          <Alert
                            icon={<ExclamationTriangleIcon className="w-6 h-6" />}
                            className="mb-6"
                            color="amber"
                          >
                            <Typography className="font-medium">
                              Ce plan est généré par IA à titre informatif uniquement.
                            </Typography>
                            <Typography className="text-sm mt-1">
                              Consultez un professionnel de santé avant de commencer tout programme.
                            </Typography>
                          </Alert>

                          <div className="bg-white p-6 rounded-lg border border-gray-200">
                            {formatMarkdown(aiPlan)}
                          </div>

                          <div className="mt-6 flex gap-4">
                            <Button
                              variant="outlined"
                              onClick={() => setActiveTab("calculator")}
                              className="flex-1"
                              style={{ borderColor: "#00357a", color: "#00357a" }}
                            >
                              Nouveau calcul
                            </Button>
                            <Button
                              style={{ backgroundColor: "#9b0e16" }}
                              onClick={printAIPlan}
                              className="flex-1"
                            >
                              Imprimer le plan
                            </Button>
                          </div>
                        </div>
                      )}
                    </TabPanel>
                  </TabsBody>
                </Tabs>
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
              { q: "Comment fonctionne l'IA pour les plans personnalisés ?", a: "Notre IA analyse votre IMC et objectifs pour générer des plans alimentaires et d'exercices adaptés." },
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
            {/* === CHATBOT IA SECTION === */}
      <section className="py-16 px-4 w-full" style={{ backgroundColor: "#00357a05" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="text-center mb-12">
            <Typography variant="h2" style={{ color: "#00357a" }} className="mb-4">
              💬 Assistant Santé IA
            </Typography>
            <Typography variant="lead" className="text-gray-600 max-w-2xl mx-auto">
              Posez vos questions sur la nutrition, l'exercice ou le bien-être.
              Notre assistant IA vous répondra instantanément !
            </Typography>
          </div>
          
          <div className="max-w-4xl mx-auto">
            <HealthChatbot />
            
            <div className="mt-8 text-center">
              <div className="inline-flex items-center gap-2 p-4 bg-blue-50 rounded-lg">
                <SparklesIcon className="h-5 w-5 text-[#00357a]" />
                <Typography variant="small" className="text-gray-600">
                  L'assistant utilise l'IA Gemini pour fournir des conseils personnalisés
                </Typography>
              </div>
            </div>
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
            **4. Plan IA:** Les plans générés par IA sont des recommandations générales. Consultez toujours un professionnel de santé.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **5. Confidentialité:** Votre utilisation du service est également régie par notre politique de confidentialité.
          </Typography>
          <Typography color="blue-gray" className="font-normal mb-4">
            **6. Résiliation:** Nous pouvons suspendre ou résilier votre accès immédiatement en cas de violation des conditions.
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