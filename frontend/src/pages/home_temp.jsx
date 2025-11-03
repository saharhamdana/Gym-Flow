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
  Spinner,
  Alert,
} from "@material-tailwind/react";

import { 
  FingerPrintIcon, 
  UsersIcon, 
  CalendarDaysIcon, 
  ChartBarIcon, 
  CreditCardIcon,
  ExclamationTriangleIcon
} from "@heroicons/react/24/solid";

import { PageTitle, Footer } from "@/widgets/layout";
import { FeatureCard, TeamCard } from "@/widgets/cards";
import { featuresData, teamData, contactData } from "@/data";
import { useSubdomain } from "../hooks/useSubdomain";

export function Home() {
  const { subdomain, gymCenter, loading, error, isMultiTenant } = useSubdomain();
  
  // === IMC Calculator State ===
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
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!formData.agreedToTerms) {
      setSubmitMessage("Please agree to the Terms and Conditions.");
      return;
    }

    if (!formData.fullName || !formData.email || !formData.message) {
      setSubmitMessage("Please fill out all required fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post("http://localhost:8000/api/contact/", {
        fullName: formData.fullName,
        email: formData.email,
        message: formData.message,
      });
      setSubmitMessage("Message sent successfully!");
      setFormData({ fullName: "", email: "", message: "", agreedToTerms: false });
    } catch (error) {
      setSubmitMessage("Failed to send message. Please try again.");
      console.error("Contact Form Error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // === BMI Calculator ===
  const calculateBMI = () => {
    if (!height || !weight || height <= 0 || weight <= 0) {
      setSubmitMessage("Please enter valid height and weight values.");
      return;
    }

    const heightInMeters = height / 100;
    const bmiValue = (weight / (heightInMeters * heightInMeters)).toFixed(1);
    setBmi(bmiValue);

    let category;
    if (bmiValue < 18.5) category = "Underweight";
    else if (bmiValue <= 24.9) category = "Normal Weight";
    else if (bmiValue <= 29.9) category = "Overweight";
    else if (bmiValue <= 34.9) category = "Obesity Class I";
    else if (bmiValue <= 39.9) category = "Obesity Class II";
    else category = "Obesity Class III";

    setClassification(category);
  };

  if (loading && isMultiTenant) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (error && isMultiTenant) {
    return (
      <div className="container mx-auto px-4 py-12">
        <Alert color="red" icon={<ExclamationTriangleIcon className="h-6 w-6" />}>
          <Typography variant="h6" className="mb-2">Center Not Found</Typography>
          <Typography variant="small">
            The subdomain "{subdomain}" does not exist or is not active.
          </Typography>
        </Alert>
      </div>
    );
  }

  const pageTitle = gymCenter 
    ? `Welcome to ${gymCenter.name}`
    : "Your fitness starts with Gymflow.";
  
  const pageDescription = gymCenter
    ? gymCenter.description || `${gymCenter.name} - Your fitness partner`
    : "Gymflow is your ultimate fitness solution. Track your progress, join programs, and reach your goals.";

  return (
    <div className="w-full overflow-x-hidden">
      {/* Hero Section */}
      <div className="relative flex h-screen content-center items-center justify-center pt-16 pb-32">
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
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-16 px-4" style={{ backgroundColor: "#00357a10" }}>
        <div className="container mx-auto max-w-7xl">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuresData.map(({ title, icon, description }) => (
              <FeatureCard
                key={title}
                title={title}
                icon={React.createElement(icon, {
                  className: "w-5 h-5 text-white"
                })}
                description={description}
              />
            ))}
          </div>
        </div>
      </section>

      {/* BMI Calculator Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <Card className="mx-auto max-w-3xl">
            <CardHeader variant="gradient" style={{ backgroundColor: "#00357a" }}>
              <Typography variant="h6" color="white">
                BMI Calculator
              </Typography>
            </CardHeader>
            <CardBody>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  type="number"
                  label="Height (cm)"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                />
                <Input
                  type="number"
                  label="Weight (kg)"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </div>
              <Button
                className="mt-4"
                onClick={calculateBMI}
                style={{ backgroundColor: "#00357a" }}
              >
                Calculate BMI
              </Button>
              {bmi && (
                <div className="mt-4">
                  <Typography variant="h6">Your BMI: {bmi}</Typography>
                  <Typography>Classification: {classification}</Typography>
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="relative bg-white py-24 px-4">
        <div className="container mx-auto px-4">
          <Typography variant="h2" color="blue" className="mb-8 text-center">
            Contact Us
          </Typography>
          <form onSubmit={handleContactSubmit} className="mx-auto w-full mt-12 lg:w-5/12">
            <div className="mb-6">
              <Input
                variant="outlined"
                size="lg"
                label="Full Name"
                name="fullName"
                value={formData.fullName}
                onChange={handleContactChange}
              />
            </div>
            <div className="mb-6">
              <Input
                variant="outlined"
                size="lg"
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleContactChange}
              />
            </div>
            <div className="mb-6">
              <Textarea
                variant="outlined"
                size="lg"
                label="Message"
                name="message"
                value={formData.message}
                onChange={handleContactChange}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Checkbox
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleContactChange}
              />
              <Typography variant="small" className="font-normal">
                I agree to the{" "}
                <button
                  type="button"
                  className="text-blue-500 hover:text-blue-700 underline"
                  onClick={handleOpenTerms}
                >
                  terms and conditions
                </button>
              </Typography>
            </div>

            {submitMessage && (
              <Typography
                variant="small"
                color={submitMessage.includes("success") ? "green" : "red"}
                className="mt-4"
              >
                {submitMessage}
              </Typography>
            )}

            <Button
              type="submit"
              style={{ backgroundColor: "#00357a" }}
              disabled={isSubmitting}
              className="mt-8 w-full"
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <div className="bg-white">
        <Footer />
      </div>

      {/* Terms Modal */}
      <Dialog open={showTermsModal} handler={handleCloseTerms} size="lg">
        <DialogHeader className="text-[#00357a]">Terms and Conditions</DialogHeader>
        <DialogBody divider className="h-[400px] overflow-y-scroll">
          <Typography color="blue-gray" className="font-normal">
            1. These terms and conditions outline the rules and regulations for the use of Gymflow's services.
          </Typography>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="gradient"
            color="red"
            onClick={handleCloseTerms}
            className="mr-1"
          >
            Close
          </Button>
        </DialogFooter>
      </Dialog>
    </div>
  );
}

export default Home;