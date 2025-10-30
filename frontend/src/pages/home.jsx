import React, { useState } from "react";
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
} from "@material-tailwind/react";
import { FingerPrintIcon, UsersIcon } from "@heroicons/react/24/solid";
import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";

export function Home() {
  // État pour le calculateur d'IMC
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");

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
    <>
      {/* === HERO SECTION === */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
        <div className="absolute top-0 h-full w-full bg-[url('/img/background-3.jpg')] bg-cover bg-center" />
        <div className="absolute top-0 h-full w-full bg-black/60 bg-cover bg-center" />
        <div className="max-w-8xl container relative mx-auto">
          <div className="flex flex-wrap items-center">
            <div className="ml-auto mr-auto w-full px-4 text-center lg:w-8/12">
              <Typography variant="h1" color="white" className="mb-6 font-black">
                Your fitness starts with Gymflow.
              </Typography>
              <Typography variant="lead" color="white" className="opacity-80">
                Gymflow is the ultimate solution for your fitness routine. We offer personalized programs, track your progress, and help you reach your goals.
              </Typography>
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
              <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-blue-gray-900 p-2 text-center shadow-lg">
                <FingerPrintIcon className="h-8 w-8 text-white " />
              </div>
              <Typography variant="h3" className="mb-3 font-bold" color="blue-gray">
                Working with us is a pleasure
              </Typography>
              <Typography className="mb-8 font-normal text-blue-gray-500">
                Don't let your uses guess by attaching tooltips and popoves to any element...
              </Typography>
              <Button variant="filled">read more</Button>
            </div>
            <div className="mx-auto mt-24 flex w-full justify-center px-4 md:w-4/12 lg:mt-0">
              <Card className="shadow-lg border shadow-gray-500/10 rounded-lg">
                <CardHeader floated={false} className="relative h-56">
                  <img alt="Card Image" src="/img/teamwork.jpg" className="h-full w-full" />
                </CardHeader>
                <CardBody>
                  <Typography variant="small" color="blue-gray" className="font-normal">Enterprise</Typography>
                  <Typography variant="h5" color="blue-gray" className="mb-3 mt-2 font-bold">
                    Top Notch Services
                  </Typography>
                  <Typography className="font-normal text-blue-gray-500">
                    The Arctic Ocean freezes every winter...
                  </Typography>
                </CardBody>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* === CALCULATEUR D'IMC (NOUVEAU) === */}
      <section className="bg-blue-gray-50 py-16 px-4">
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
                    color="blue"
                    size="lg"
                    className="flex items-center gap-2"
                    onClick={calculateBMI}
                  >
                    Calculer mon IMC
                  </Button>
                </div>

                {/* Résultat */}
                {bmi && (
                  <div className="text-center p-6 bg-white rounded-lg shadow-md">
                    <Typography variant="h4" color="blue-gray" className="mb-2">
                      Votre IMC : <span className="font-bold text-blue-600">{bmi}</span>
                    </Typography>
                    <Typography variant="h5" color="blue-gray">
                      Classification : <span className={`font-bold ${classification.includes("Normal") ? "text-green-600" : classification.includes("Obésité") ? "text-red-600" : "text-orange-600"}`}>
                        {classification}
                      </span>
                    </Typography>
                  </div>
                )}

                {/* Tableau de classification */}
                <div className="mt-10">
                  <Typography variant="h6" color="blue-gray" className="mb-4 text-center">
                    Tableau de Classification de l'IMC
                  </Typography>
                  <div className="overflow-x-auto">
                    <table className="w-full table-auto text-left">
                      <thead>
                        <tr className="bg-blue-gray-50">
                          <th className="px-4 py-3 text-xs font-bold uppercase text-blue-gray-600">IMC</th>
                          <th className="px-4 py-3 text-xs font-bold uppercase text-blue-gray-600">Classification</th>
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
                          <td className="px-4 py-3 text-sm text-red-600 font-medium">Obésité de grade I</td>
                        </tr>
                        <tr className="border-b">
                          <td className="px-4 py-3 text-sm">35 - 39.9</td>
                          <td className="px-4 py-3 text-sm text-red-700 font-medium">Obésité de grade II</td>
                        </tr>
                        <tr>
                          <td className="px-4 py-3 text-sm">&gt; 40</td>
                          <td className="px-4 py-3 text-sm text-red-800 font-medium">Obésité de grade III</td>
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
      <section className="px-4 pt-20 pb-48">
        <div className="container mx-auto">
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
                      <IconButton key={name} color={color} variant="text">
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
      <section className="py-20 bg-white">
  <div className="container mx-auto px-4">
    <Typography variant="h2" color="blue-gray" className="text-center mb-12">
      Questions Fréquentes
    </Typography>

    <div className="max-w-3xl mx-auto space-y-4">
      {[
        { q: "Faut-il un abonnement pour commencer ?", a: "Non ! Profitez de 7 jours d'essai gratuit sans engagement." },
        { q: "Quels sont les horaires d'ouverture ?", a: "Du lundi au vendredi : 6h–22h | Samedi & Dimanche : 8h–20h" },
        { q: "Y a-t-il des coaches personnels ?", a: "Oui, des coachs certifiés disponibles sur rendez-vous." },
        { q: "Puis-je geler mon abonnement ?", a: "Oui, jusqu'à 2 mois par an sans frais." },
      ].map((faq, i) => (
        <details key={i} className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors">
          <summary className="font-semibold text-blue-gray-800 flex justify-between items-center">
            {faq.q}
            <i className="fas fa-chevron-down text-sm transition-transform" />
          </summary>
          <p className="mt-3 text-blue-gray-600">{faq.a}</p>
        </details>
      ))}
    </div>
  </div>
</section>

      {/* === CO-WORKING & CONTACT === */}
      <section className="relative bg-white py-24 px-4">
        <div className="container mx-auto">
          <PageTitle section="Co-Working" heading="Build something">
            Put the potentially record low maximum sea ice extent...
          </PageTitle>
          <div className="mx-auto mt-20 mb-48 grid max-w-5xl grid-cols-1 gap-16 md:grid-cols-2 lg:grid-cols-3">
            {contactData.map(({ title, icon, description }) => (
              <Card key={title} color="transparent" shadow={false} className="text-center text-blue-gray-900">
                <div className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-full bg-blue-gray-900 shadow-lg shadow-gray-500/20">
                  {React.createElement(icon, { className: "w-5 h-5 text-white" })}
                </div>
                <Typography variant="h5" color="blue-gray" className="mb-2">{title}</Typography>
                <Typography className="font-normal text-blue-gray-500">{description}</Typography>
              </Card>
            ))}
          </div>

          <PageTitle section="Contact Us" heading="Want to work with us?">
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
                <Typography variant="small" color="gray" className="flex items-center font-normal">
                  I agree the
                  <a href="#" className="font-medium transition-colors hover:text-gray-900">
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