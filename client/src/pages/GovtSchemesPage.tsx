import React, { useState, useMemo } from "react";
import { useAgri } from "../context/AgriContext";
import {
  Building2,
  ExternalLink,
  CheckCircle2,
  FileText,
  Search,
  PhoneCall,
  Download,
  AlertCircle,
  HelpCircle,
  Calculator,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Printer,
  Copy,
  Check,
  Sun,
  Tractor,
  Droplets,
  DollarSign,
  Shield,
  Sprout,
  Users,
} from "lucide-react";

interface Scheme {
  id: string;
  name: {
    en: string;
    hi: string;
    mr: string;
  };
  ministry: {
    en: string;
    hi: string;
    mr: string;
  };
  benefit: {
    en: string;
    hi: string;
    mr: string;
  };
  benefitAmountNum: number; // For calculator
  category: "cash" | "solar" | "machinery" | "insurance" | "irrigation" | "all";
  eligibility: {
    en: string;
    hi: string;
    mr: string;
  };
  maxLandAcres?: number; // e.g. for small & marginal
  womenPriority?: boolean;
  documents: {
    en: string[];
    hi: string[];
    mr: string[];
  };
  portalUrl: string;
  portalDomain: string;
  formName: {
    en: string;
    hi: string;
    mr: string;
  };
  guidelineUrl?: string;
  helpline: string;
  badge: {
    en: string;
    hi: string;
    mr: string;
  };
}

const SCHEMES_DATA: Scheme[] = [
  {
    id: "pm-kisan",
    name: {
      en: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
      hi: "पीएम-किसान (प्रधानमंत्री किसान सम्मान निधि)",
      mr: "पीएम-किसान (प्रधानमंत्री किसान सन्मान निधी)",
    },
    ministry: {
      en: "Ministry of Agriculture & Farmers Welfare, Govt of India",
      hi: "कृषि एवं किसान कल्याण मंत्रालय, भारत सरकार",
      mr: "कृषी व शेतकरी कल्याण मंत्रालय, भारत सरकार",
    },
    benefit: {
      en: "₹6,000 / year via Direct Benefit Transfer (DBT) in 3 equal installments of ₹2,000",
      hi: "₹6,000 / वर्ष सीधा बैंक खाते में DBT द्वारा (प्रत्येक 4 माह में ₹2,000 की 3 किस्तें)",
      mr: "₹6,000 / वर्ष थेट बँक खात्यात DBT द्वारे (प्रत्येक 4 महिन्यांनी ₹2,000 चे 3 हप्ते)",
    },
    benefitAmountNum: 6000,
    category: "cash",
    eligibility: {
      en: "All landholding farmer families having cultivable land in their names. No minimum or maximum land limit.",
      hi: "सभी भूमिधारक किसान परिवार जिनके नाम पर खेती योग्य जमीन दर्ज है।",
      mr: "सर्व खातेदार शेतकरी कुटुंबे ज्यांच्या नावावर शेतीजमीन नोंदणीकृत आहे.",
    },
    documents: {
      en: [
        "Aadhaar Card (Mandatory & linked to active Mobile)",
        "Land Record 7/12 (Khasra-Khatauni / Jamabandi)",
        "Bank Passbook with active IFSC & NPCI Aadhaar seeding",
        "Valid Mobile Number for OTP Verification",
      ],
      hi: [
        "आधार कार्ड (सक्रिय मोबाइल नंबर से लिंक)",
        "खसरा-खतौनी / 7/12 जमीन नकल",
        "सक्रिय बैंक खाता पासबुक (NPCI आधार सीडेड)",
        "ओटीपी सत्यापन हेतु चालू मोबाइल नंबर",
      ],
      mr: [
        "आधार कार्ड (मोबाईल नंबरशी जोडलेले)",
        "जमीन मालकी ७/१२ व ८-अ उतारा",
        "सक्रिय बँक पासबुक (NPCI आधार संलग्न)",
        "OTP पडताळणीसाठी चालू मोबाईल नंबर",
      ],
    },
    portalUrl: "https://pmkisan.gov.in/RegistrationFormNew.aspx",
    portalDomain: "pmkisan.gov.in",
    formName: {
      en: "New Farmer Online Registration & eKYC Portal",
      hi: "नवीन किसान ऑनलाइन पंजीकरण व eKYC पोर्टल",
      mr: "नवीन शेतकरी नोंदणी व ई-केवायसी पोर्टल",
    },
    guidelineUrl: "https://pmkisan.gov.in/",
    helpline: "155261 / 1800-115-526",
    badge: {
      en: "100% Cash DBT",
      hi: "100% नकद DBT",
      mr: "100% थेट रोख",
    },
  },
  {
    id: "pm-kusum",
    name: {
      en: "PM-KUSUM Scheme (Solar Agriculture Pump Subsidy)",
      hi: "पीएम-कुसुम योजना (सौर कृषि पंप 60% अनुदान)",
      mr: "पीएम-कुसुम योजना (सौर कृषी पंप 60% सबसिडी)",
    },
    ministry: {
      en: "Ministry of New and Renewable Energy (MNRE)",
      hi: "नवीन एवं नवीकरणीय ऊर्जा मंत्रालय, भारत सरकार",
      mr: "नवीन व नवीकरणीय ऊर्जा मंत्रालय, भारत सरकार",
    },
    benefit: {
      en: "60% Total Subsidy (30% Central + 30% State Govt) on 3HP, 5HP & 7.5HP Solar Pumps. Farmer pays only 10% to 40%.",
      hi: "3HP, 5HP और 7.5HP सोलर पंप पर 60% कुल सब्सिडी (30% केंद्र + 30% राज्य)। किसान को मात्र 10% से 40% देना होगा।",
      mr: "3HP, 5HP आणि 7.5HP सौर पंपांवर 60% सबसिडी (30% केंद्र + 30% राज्य). शेतकऱ्याला फक्त 10% ते 40% भरावे लागतील.",
    },
    benefitAmountNum: 135000,
    category: "solar",
    eligibility: {
      en: "Farmers with borewell, open well, or farm pond. Priority for areas with no electric grid connectivity.",
      hi: "जिन किसानों के पास कुआं, बोरवेल या खेत तलाई है और ग्रिड बिजली कनेक्शन नहीं है।",
      mr: "ज्या शेतकऱ्यांकडे विहीर, बोअरवेल किंवा शेततळे आहे आणि वीज जोडणी नाही.",
    },
    documents: {
      en: [
        "7/12 & 8A Land Extract showing water source",
        "Aadhaar Card & Passport size photograph",
        "Water Source Proof (Borewell depth certificate / Well photos)",
        "No Electricity Connection NOC from Power DISCOM",
        "Bank Passbook copy with IFSC",
      ],
      hi: [
        "7/12 व 8A जमीन नकल (जल स्रोत दर्ज)",
        "आधार कार्ड व पासपोर्ट आकार फोटो",
        "जल स्रोत प्रमाण पत्र / बोरवेल गहराई प्रमाण",
        "बिजली विभाग से कनेक्शन न होने का अनापत्ति प्रमाण पत्र (NOC)",
        "बैंक पासबुक प्रति",
      ],
      mr: [
        "पाण्याच्या नोंदीसह ७/१२ आणि ८-अ उतारा",
        "आधार कार्ड व पासपोर्ट आकाराचा फोटो",
        "विहीर/बोअरवेल असल्याचा दाखला",
        "महावितरण वीज जोडणी नसल्याचे प्रमाणपत्र (NOC)",
        "बँक पासबुक झेरॉक्स",
      ],
    },
    portalUrl: "https://pmkusum.mnre.gov.in/",
    portalDomain: "pmkusum.mnre.gov.in",
    formName: {
      en: "Component-B Standalone Solar Pump Registration",
      hi: "कंपोनेंट-बी सोलर पंप ऑनलाइन आवेदन फॉर्म",
      mr: "घटक-ब स्वतंत्र सौर कृषी पंप अर्ज",
    },
    guidelineUrl: "https://mnre.gov.in/solar/schemes/",
    helpline: "1800-180-3333",
    badge: {
      en: "60% Solar Subsidy",
      hi: "60% सोलर सब्सिडी",
      mr: "60% सौर अनुदान",
    },
  },
  {
    id: "smam-machinery",
    name: {
      en: "SMAM Machinery Subsidy (Tractors, Rotavators & Drones)",
      hi: "कृषि यंत्रीकरण उप-मिशन (SMAM - ट्रैक्टर, रोटावेटर व ड्रोन अनुदान)",
      mr: "कृषी यांत्रिकीकरण उप-अभियान (SMAM - ट्रॅक्टर व अवजारे सबसिडी)",
    },
    ministry: {
      en: "Department of Agriculture & Farmers Welfare",
      hi: "कृषि एवं किसान कल्याण विभाग",
      mr: "कृषी व शेतकरी कल्याण विभाग",
    },
    benefit: {
      en: "40% to 50% Subsidy (Up to ₹1,25,000 on Tractors, 50% on Rotavators, Power Tillers & Laser Levelers)",
      hi: "40% से 50% सब्सिडी (ट्रैक्टर पर ₹1,25,000 तक, रोटावेटर व लेजर लेवलर पर 50%)",
      mr: "40% ते 50% सबसिडी (ट्रॅक्टरवर ₹1,25,000 पर्यंत, रोटाव्हेटर व अवजारांवर 50%)",
    },
    benefitAmountNum: 85000,
    category: "machinery",
    womenPriority: true,
    eligibility: {
      en: "Individual farmers. Small/marginal farmers, women, and SC/ST farmers get highest 50% priority subsidy.",
      hi: "व्यक्तिगत किसान। छोटे-सीमांत, महिला व SC/ST किसानों को अधिकतम 50% सब्सिडी में प्राथमिकता।",
      mr: "वैयक्तिक शेतकरी. अल्पभूधारक, महिला आणि SC/ST शेतकऱ्यांना 50% प्राधान्य सबसिडी.",
    },
    documents: {
      en: [
        "Aadhaar Card",
        "7/12 Land Record / Khatauni",
        "Dealer Proforma Quotation for Machinery",
        "Caste Certificate (for SC/ST 50% enhanced subsidy)",
        "Bank Passbook or Cancelled Cheque",
      ],
      hi: [
        "आधार कार्ड",
        "खतौनी / 7/12 जमीन नकल",
        "अधिकृत डीलर का यंत्र कोटेशन",
        "जाति प्रमाण पत्र (SC/ST 50% विशेष छूट हेतु)",
        "बैंक पासबुक या कैंसल चेक",
      ],
      mr: [
        "आधार कार्ड",
        "जमीन ७/१२ उतारा",
        "अधिकृत विक्रेत्याचे यंत्र कोटेशन (Quotation)",
        "जातीचा दाखला (SC/ST 50% सवलतीसाठी)",
        "बँक पासबुक किंवा रद्द धनादेश",
      ],
    },
    portalUrl: "https://agrimachinery.nic.in/",
    portalDomain: "agrimachinery.nic.in",
    formName: {
      en: "Direct DBT Farm Machinery Subsidy Portal",
      hi: "कृषि यंत्र सब्सिडी प्रत्यक्ष DBT ऑनलाइन फॉर्म",
      mr: "कृषी यंत्र सबसिडी थेट DBT नोंदणी",
    },
    guidelineUrl: "https://agrimachinery.nic.in/Index/MechanizationSchemes",
    helpline: "011-23382012 / 1800-180-1551",
    badge: {
      en: "Up to 50% Off",
      hi: "50% तक छूट",
      mr: "50% पर्यंत सूट",
    },
  },
  {
    id: "pmfby-insurance",
    name: {
      en: "PMFBY (Pradhan Mantri Fasal Bima Yojana - Crop Insurance)",
      hi: "प्रधानमंत्री फसल बीमा योजना (PMFBY - प्राकृतिक आपदा सुरक्षा)",
      mr: "प्रधानमंत्री पीक विमा योजना (PMFBY - ₹1 मध्ये पीक विमा)",
    },
    ministry: {
      en: "Ministry of Agriculture & Farmers Welfare",
      hi: "कृषि एवं किसान कल्याण मंत्रालय",
      mr: "कृषी व शेतकरी कल्याण मंत्रालय",
    },
    benefit: {
      en: "100% Crop Loss Claim Coverage against drought, hailstorms & floods. Farmers pay only 2% (Kharif), 1.5% (Rabi) or ₹1 token fee.",
      hi: "सूखा, ओलावृष्टि व भारी बारिश से फसल नुकसान पर 100% क्लेम। किसान प्रीमियम: खरीफ 2%, रबी 1.5% (महाराष्ट्र में मात्र ₹1)।",
      mr: "दुष्काळ, गारपीट व अवकाळी पावसाने नुकसान झाल्यास 100% भरपाई. शेतकरी हप्ता: खरीप 2%, रब्बी 1.5% (महाराष्ट्रात फक्त ₹1).",
    },
    benefitAmountNum: 45000,
    category: "insurance",
    eligibility: {
      en: "All farmers growing notified crops in notified areas, including sharecroppers and tenant farmers.",
      hi: "अधिसूचित क्षेत्र में अधिसूचित फसल बोने वाले सभी ऋणी व गैर-ऋणी किसान एवं बटाईदार।",
      mr: "अधिसूचित क्षेत्रातील अधिसूचित पिके घेणारे सर्व शेतकरी, कुळ व बटाईदार.",
    },
    documents: {
      en: [
        "7/12 Land Record / Land Possession Certificate (LPC)",
        "Sowing Certificate (Pik Pahani / Patwari verification)",
        "Aadhaar Card",
        "Bank Passbook copy with valid IFSC",
      ],
      hi: [
        "7/12 जमीन नकल / खतौनी",
        "फसल बुवाई प्रमाण पत्र (ई-गिरदावरी / पटवारी सत्यापन)",
        "आधार कार्ड",
        "बैंक पासबुक प्रति (IFSC सहित)",
      ],
      mr: [
        "७/१२ आणि ८-अ उतारा",
        "ई-पीक पाहणी नोंद / पेरणी स्वयंघोषणापत्र",
        "आधार कार्ड",
        "बँक पासबुक झेरॉक्स",
      ],
    },
    portalUrl: "https://pmfby.gov.in/farmerRegistrationForm",
    portalDomain: "pmfby.gov.in",
    formName: {
      en: "Farmer Crop Insurance Sowing Enrollment Form",
      hi: "किसान फसल बीमा स्वयं नामांकन ऑनलाइन फॉर्म",
      mr: "शेतकरी पीक विमा नोंदणी अर्ज",
    },
    guidelineUrl: "https://pmfby.gov.in/",
    helpline: "14447 / 1800-200-5142",
    badge: {
      en: "100% Claim Coverage",
      hi: "100% क्लेम सुरक्षा",
      mr: "100% भरपाई संरक्षण",
    },
  },
  {
    id: "pmksy-irrigation",
    name: {
      en: "PMKSY Per Drop More Crop (Drip & Sprinkler Subsidy)",
      hi: "प्रधानमंत्री कृषि सिंचाई योजना (ड्रिप व स्प्रिंकलर 55% सब्सिडी)",
      mr: "प्रधानमंत्री कृषी सिंचन योजना (ठिबक व तुषार सिंचन 55% सबसिडी)",
    },
    ministry: {
      en: "Department of Agriculture, Cooperation & Farmers Welfare",
      hi: "कृषि, सहकारिता एवं किसान कल्याण विभाग",
      mr: "कृषी, सहकार व शेतकरी कल्याण विभाग",
    },
    benefit: {
      en: "55% Subsidy for Small & Marginal farmers, 45% for other farmers for Micro-Irrigation (Drip & Sprinklers)",
      hi: "ड्रिप और स्प्रिंकलर सिंचाई संच लगाने पर लघु/सीमांत किसानों को 55%, अन्य किसानों को 45% सरकारी अनुदान",
      mr: "ठिबक व तुषार सिंचन बसवण्यासाठी अल्पभूधारकांना 55%, इतर शेतकऱ्यांना 45% शासकीय सबसिडी",
    },
    benefitAmountNum: 55000,
    category: "irrigation",
    maxLandAcres: 12.5,
    eligibility: {
      en: "Farmers possessing cultivable land with an assured perennial irrigation water source (well, borewell, or canal).",
      hi: "खेती योग्य जमीन और पानी के सुनिश्चित स्रोत (कुआं, ट्यूबवेल, नहर) वाले सभी किसान।",
      mr: "लागवडीयोग्य जमीन आणि पाण्याचा शाश्वत स्त्रोत (विहीर, बोअरवेल, कालवा) असलेले सर्व शेतकरी.",
    },
    documents: {
      en: [
        "7/12 & 8A Land Title with Water Source Entry",
        "Authorized Drip Company Quotation and Field Layout",
        "Aadhaar Card",
        "Soil & Water Testing Report",
        "Bank Passbook copy",
      ],
      hi: [
        "जल स्रोत दर्ज 7/12 व 8A जमीन नकल",
        "अधिकृत ड्रिप कंपनी का कोटेशन व लेआउट",
        "आधार कार्ड",
        "मिट्टी व पानी परीक्षण रिपोर्ट",
        "बैंक पासबुक प्रति",
      ],
      mr: [
        "पाण्याच्या नोंदीसह ७/१२ व ८-अ उतारा",
        "अधिकृत ठिबक कंपनीचे कोटेशन व लेआउट नकाशा",
        "आधार कार्ड",
        "माती व पाणी परीक्षण दाखला",
        "बँक पासबुक",
      ],
    },
    portalUrl: "https://pmksy.gov.in/",
    portalDomain: "pmksy.gov.in",
    formName: {
      en: "Micro-Irrigation National DBT Portal Form",
      hi: "सूक्ष्म सिंचाई राष्ट्रीय DBT पोर्टल आवेदन",
      mr: "सूक्ष्म सिंचन राष्ट्रीय सबसिडी नोंदणी",
    },
    guidelineUrl: "https://pmksy.gov.in/",
    helpline: "1800-180-1551 (Kisan Call Centre)",
    badge: {
      en: "55% Drip Subsidy",
      hi: "55% ड्रिप अनुदान",
      mr: "55% ठिबक सबसिडी",
    },
  },
  {
    id: "kisan-credit-card",
    name: {
      en: "Kisan Credit Card (KCC) - 4% Low-Interest Crop Credit",
      hi: "किसान क्रेडिट कार्ड (KCC) - 4% रियायती ब्याज फसल ऋण",
      mr: "किसान क्रेडिट कार्ड (KCC) - 4% सवलतीचे पीक कर्ज",
    },
    ministry: {
      en: "Reserve Bank of India & Ministry of Finance",
      hi: "भारतीय रिज़र्व बैंक एवं वित्त मंत्रालय",
      mr: "रिझर्व्ह बँक ऑफ इंडिया व वित्त मंत्रालय",
    },
    benefit: {
      en: "Up to ₹3,00,000 short-term crop credit at 4% effective interest (7% minus 3% prompt repayment subvention). Collateral-free up to ₹1,60,000.",
      hi: "समय पर चुकाने पर मात्र 4% ब्याज पर ₹3 लाख तक फसल ऋण। ₹1,60,000 तक बिना किसी गिरवी (Collateral-Free)।",
      mr: "वेळेवर परतफेड केल्यास फक्त 4% व्याजाने ₹3 लाखांपर्यंत पीक कर्ज. ₹1,60,000 पर्यंत विनातारण कर्ज.",
    },
    benefitAmountNum: 160000,
    category: "cash",
    eligibility: {
      en: "All individual farmers, joint borrowers, tenant farmers, oral lessees, sharecroppers, and dairy/poultry farmers.",
      hi: "सभी किसान, पट्टेदार, बटाईदार और डेयरी/पशुपालन करने वाले किसान।",
      mr: "सर्व शेतकरी, कुळ, बटाईदार आणि दुग्धव्यवसाय व कुक्कुटपालन करणारे शेतकरी.",
    },
    documents: {
      en: [
        "1-Page Simplified KCC Application Form",
        "7/12 Land Record showing crop sown",
        "Aadhaar Card & PAN Card / Voter ID",
        "Declaration of No Dues from other nationalized banks",
      ],
      hi: [
        "1-पेज का सरल KCC आवेदन फॉर्म",
        "फसल दर्ज 7/12 जमीन नकल",
        "आधार कार्ड व पैन कार्ड",
        "अन्य बैंकों से बकाया न होने का घोषणा पत्र",
      ],
      mr: [
        "१-पानाचा सुलभ KCC कर्ज अर्ज",
        "पीक पेरा नोंद असलेला ७/१२ उतारा",
        "आधार कार्ड व पॅन कार्ड",
        "इतर बँकेचे थकीत कर्ज नसल्याचे घोषणापत्र",
      ],
    },
    portalUrl: "https://pmkisan.gov.in/Documents/KCC_Form.pdf",
    portalDomain: "pmkisan.gov.in / National Banks",
    formName: {
      en: "Simplified 1-Page KCC Bank Form (Direct PDF Download)",
      hi: "सरल 1-पेज KCC बैंक फॉर्म (पीडीएफ डाउनलोड)",
      mr: "१-पानाचा KCC सुलभ बँक अर्ज (थेट PDF डाउनलोड)",
    },
    guidelineUrl: "https://myscheme.gov.in/schemes/kcc",
    helpline: "1800-11-2211 / 1800-425-3800",
    badge: {
      en: "4% Low Interest",
      hi: "4% कम ब्याज",
      mr: "4% सवलतीचे व्याज",
    },
  },
  {
    id: "pkvy-organic",
    name: {
      en: "PKVY (Paramparagat Krishi Vikas Yojana - Organic Farming)",
      hi: "परम्परागत कृषि विकास योजना (PKVY - जैविक खेती अनुदान)",
      mr: "परंपरागत कृषी विकास योजना (PKVY - सेंद्रिय शेती सबसिडी)",
    },
    ministry: {
      en: "Ministry of Agriculture & Farmers Welfare",
      hi: "कृषि एवं किसान कल्याण मंत्रालय",
      mr: "कृषी व शेतकरी कल्याण मंत्रालय",
    },
    benefit: {
      en: "₹50,000 / hectare assistance over 3 years. ₹31,000 (62%) direct transfer to farmers for organic inputs and bio-fertilizers.",
      hi: "3 वर्षों में ₹50,000 प्रति हेक्टेयर अनुदान। ₹31,000 सीधा DBT जैविक खाद, बीज व इनपुट हेतु किसान खाते में।",
      mr: "3 वर्षांत ₹50,000 प्रति हेक्टर मदत. सेंद्रिय खते व निविष्ठांसाठी ₹31,000 थेट बँक खात्यात DBT द्वारे जमा.",
    },
    benefitAmountNum: 31000,
    category: "irrigation",
    eligibility: {
      en: "Farmers forming clusters of 50 or more acres, adopting chemical-free natural farming certified under PGS-India.",
      hi: "रसायन मुक्त प्राकृतिक खेती अपनाने वाले 50 एकड़ समूह के किसान।",
      mr: "नैसर्गिक व सेंद्रिय शेतीचा अवलंब करणारे 50 एकर क्लस्टरमधील शेतकरी.",
    },
    documents: {
      en: [
        "Farmer Cluster Member Roster & Land 7/12 Records",
        "Aadhaar Card of all farmers in cluster",
        "Bank Passbook with active IFSC",
        "Non-chemical Farming Self-Affidavit",
      ],
      hi: [
        "किसान क्लस्टर सूची व जमीन 7/12 रिकॉर्ड",
        "समूह के सभी किसानों के आधार कार्ड",
        "सक्रिय बैंक पासबुक प्रति",
        "रासायनिक मुक्त खेती शपथ पत्र",
      ],
      mr: [
        "शेतकरी गट यादी व ७/१२ उतारे",
        "गटातील सर्व शेतकऱ्यांचे आधार कार्ड",
        "सक्रिय बँक पासबुक",
        "सेंद्रिय शेती हमीपत्र",
      ],
    },
    portalUrl: "https://pgsindia-ncof.gov.in/",
    portalDomain: "pgsindia-ncof.gov.in",
    formName: {
      en: "PGS-India Organic Farmer & Cluster Registration",
      hi: "PGS-India जैविक किसान क्लस्टर पंजीकरण",
      mr: "PGS-India सेंद्रिय शेतकरी नोंदणी फॉर्म",
    },
    guidelineUrl: "https://pgsindia-ncof.gov.in/",
    helpline: "0120-2764906",
    badge: {
      en: "₹50,000/ha Organic",
      hi: "₹50,000/हेक्टर जैविक",
      mr: "₹50,000/हेक्टर सेंद्रिय",
    },
  },
  {
    id: "gokul-dairy",
    name: {
      en: "Rashtriya Gokul Mission & Cattle Livestock Subsidy",
      hi: "राष्ट्रीय गोकुल मिशन एवं दुग्ध पशुधन अनुदान योजना",
      mr: "राष्ट्रीय गोकुळ मिशन व दुग्ध व्यवसाय सबसिडी",
    },
    ministry: {
      en: "Department of Animal Husbandry & Dairying, Govt of India",
      hi: "पशुपालन एवं डेयरी विभाग, भारत सरकार",
      mr: "पशुसंवर्धन व दुग्धव्यवसाय विभाग, भारत सरकार",
    },
    benefit: {
      en: "25% to 50% Capital Subsidy on indigenous milch cow/buffalo purchase, modern cattle sheds, and automated milking equipment.",
      hi: "देसी गाय/भैंस खरीद, आधुनिक पशु शेड निर्माण व मिल्किंग मशीनों पर 25% से 50% तक पूंजीगत अनुदान।",
      mr: "देशी गाय/म्हैस खरेदी, आधुनिक गोठा बांधकाम व मिल्किंग मशीनवर 25% ते 50% पर्यंत शासकीय सबसिडी.",
    },
    benefitAmountNum: 75000,
    category: "cash",
    eligibility: {
      en: "Individual dairy farmers, Self-Help Groups (SHGs), Gaushalas, and Milk Producer Cooperatives.",
      hi: "व्यक्तिगत पशुपालक किसान, स्वयं सहायता समूह (SHG), गौशालाएं व दुग्ध सहकारी समितियां।",
      mr: "वैयक्तिक शेतकरी, महिला बचत गट (SHG), गोशाळा आणि दुग्ध उत्पादक सहकारी संस्था.",
    },
    documents: {
      en: [
        "Aadhaar Card",
        "Land Record for Cattle Shed Construction",
        "Animal Husbandry Training Certificate or Experience Letter",
        "Bank Loan In-Principle Sanction Letter",
      ],
      hi: [
        "आधार कार्ड",
        "पशु शेड निर्माण हेतु भूमि रिकॉर्ड",
        "पशुपालन प्रशिक्षण प्रमाण पत्र",
        "बैंक ऋण स्वीकृति पत्र",
      ],
      mr: [
        "आधार कार्ड",
        "गोठा बांधकामासाठी जागेचा दाखला/उतारा",
        "पशुसंवर्धन प्रशिक्षण प्रमाणपत्र",
        "बँक कर्ज मंजुरी पत्र",
      ],
    },
    portalUrl: "https://dahd.nic.in/schemes/programmes/rashtriya-gokul-mission",
    portalDomain: "dahd.nic.in",
    formName: {
      en: "Dairy Entrepreneurship Development Online Scheme Portal",
      hi: "डेयरी उद्यमिता विकास योजना ऑनलाइन फॉर्म",
      mr: "दुग्ध व्यवसाय विकास योजना ऑनलाइन अर्ज",
    },
    guidelineUrl: "https://dahd.nic.in/",
    helpline: "011-23382753 / 1800-180-1551",
    badge: {
      en: "50% Dairy Grant",
      hi: "50% डेयरी अनुदान",
      mr: "50% गोवंश सबसिडी",
    },
  },
];

export const GovtSchemesPage: React.FC = () => {
  const { language, t } = useAgri();

  // State
  const [activeCategory, setActiveCategory] = useState<
    "all" | "cash" | "solar" | "machinery" | "insurance" | "irrigation"
  >("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSchemeId, setExpandedSchemeId] = useState<string | null>("pm-kisan");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Calculator State
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [calcAcreage, setCalcAcreage] = useState<number>(3.5);
  const [calcSocialCategory, setCalcSocialCategory] = useState<"general" | "obc" | "sc_st" | "women">("general");
  const [calcIrrigation, setCalcIrrigation] = useState<"borewell" | "canal" | "rainfed">("borewell");

  // Filter schemes
  const filteredSchemes = useMemo(() => {
    return SCHEMES_DATA.filter((scheme) => {
      // Category filter
      if (activeCategory !== "all" && scheme.category !== activeCategory) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const nameMatch =
          scheme.name.en.toLowerCase().includes(q) ||
          scheme.name.hi.toLowerCase().includes(q) ||
          scheme.name.mr.toLowerCase().includes(q);
        const benefitMatch =
          scheme.benefit.en.toLowerCase().includes(q) ||
          scheme.benefit.hi.toLowerCase().includes(q) ||
          scheme.benefit.mr.toLowerCase().includes(q);
        const domainMatch = scheme.portalDomain.toLowerCase().includes(q);
        const ministryMatch = scheme.ministry.en.toLowerCase().includes(q);

        if (!nameMatch && !benefitMatch && !domainMatch && !ministryMatch) {
          return false;
        }
      }

      return true;
    });
  }, [activeCategory, searchQuery]);

  // Compute calculated benefits
  const calculatedEligibleSchemes = useMemo(() => {
    return SCHEMES_DATA.filter((scheme) => {
      if (scheme.maxLandAcres && calcAcreage > scheme.maxLandAcres) {
        return false;
      }
      return true;
    });
  }, [calcAcreage]);

  const totalCalculatedBenefit = useMemo(() => {
    return calculatedEligibleSchemes.reduce((sum, item) => sum + item.benefitAmountNum, 0);
  }, [calculatedEligibleSchemes]);

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const getTranslated = (obj: { en: string; hi: string; mr: string }) => {
    return obj[language] || obj.en;
  };

  const getTranslatedList = (obj: { en: string[]; hi: string[]; mr: string[] }) => {
    return obj[language] || obj.en;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-br from-rose-900 via-rose-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl -translate-y-10 translate-x-10 pointer-events-none" />

        <div className="relative z-10 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider flex items-center gap-1.5 border border-white/20">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Verified .gov.in Portals
              </span>
              <span className="bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 px-2.5 py-1 rounded-full text-xs font-bold">
                FY 2025-2026 Active
              </span>
            </div>

            <button
              onClick={() => setCalculatorOpen(!calculatorOpen)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-2 rounded-2xl flex items-center gap-2 shadow-lg transition-all hover:scale-105"
            >
              <Calculator className="w-4 h-4" />
              <span>{t("check_eligibility")}</span>
              {calculatorOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight font-serif leading-tight">
              {t("schemes_page_title")}
            </h1>
            <p className="text-sm sm:text-base text-rose-100 max-w-3xl mt-1.5 leading-relaxed">
              {t("schemes_page_desc")}
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-rose-200 block">PM-KISAN DBT</span>
              <span className="text-lg font-black text-white">₹6,000 / yr</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-rose-200 block">PM-KUSUM Solar</span>
              <span className="text-lg font-black text-amber-300">60% Subsidy</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-rose-200 block">SMAM Machinery</span>
              <span className="text-lg font-black text-white">50% Grant</span>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 border border-white/10">
              <span className="text-[11px] font-bold text-rose-200 block">Crop Insurance</span>
              <span className="text-lg font-black text-emerald-300">₹1 / 100% Risk</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive "Check My Eligibility & Subsidy Calculator" Drawer */}
      {calculatorOpen && (
        <div className="bg-white rounded-3xl p-6 border-2 border-amber-300 shadow-md animate-fade-in space-y-6">
          <div className="flex items-center justify-between border-b border-stone-200 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-800 rounded-2xl">
                <Calculator className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900">
                  {language === "hi"
                    ? "किसान पात्रता एवं सरकारी अनुदान गणकयंत्र"
                    : language === "mr"
                    ? "शेतकरी पात्रता व शासकीय सबसिडी गणकयंत्र"
                    : "Farmer Eligibility & Government Subsidy Calculator"}
                </h3>
                <p className="text-xs text-slate-500">
                  {language === "hi"
                    ? "अपनी जमीन और श्रेणी चुनें और जानें आपको कुल कितना सरकारी अनुदान मिल सकता है।"
                    : language === "mr"
                    ? "आपली जमीन व जात प्रवर्ग निवडा आणि एकूण मिळणारी शासकीय सबसिडी जाणून घ्या."
                    : "Enter your land acreage and category to calculate total verified subsidy entitlements."}
                </p>
              </div>
            </div>
            <button
              onClick={() => setCalculatorOpen(false)}
              className="text-xs font-bold text-slate-400 hover:text-slate-700 bg-stone-100 px-3 py-1.5 rounded-xl"
            >
              Close
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Input 1: Land Holding */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {language === "hi" ? "कुल कृषि भूमि (एकड़):" : language === "mr" ? "एकूण शेती जमीन (एकर):" : "Total Farm Acreage (Acres):"}
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={calcAcreage}
                  onChange={(e) => setCalcAcreage(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
                />
                <span className="text-sm font-black text-amber-900 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 shrink-0">
                  {calcAcreage} Acres
                </span>
              </div>
              <span className="text-[11px] text-slate-500 block">
                {calcAcreage <= 5
                  ? "Small & Marginal Farmer (< 5 Acres) - Eligible for 10% Extra Priority Subsidy"
                  : "Medium/Large Farmer (> 5 Acres) - Standard Subsidy Limits"}
              </span>
            </div>

            {/* Input 2: Social Category */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {language === "hi" ? "किसान सामाजिक वर्ग:" : language === "mr" ? "शेतकरी सामाजिक प्रवर्ग:" : "Farmer Category:"}
              </label>
              <select
                value={calcSocialCategory}
                onChange={(e) => setCalcSocialCategory(e.target.value as any)}
                className="w-full text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="general">General (सामान्य)</option>
                <option value="obc">OBC (अन्य पिछड़ा वर्ग)</option>
                <option value="sc_st">SC / ST (अनुसूचित जाति / जनजाति - 50% Priority)</option>
                <option value="women">Women Farmer (महिला किसान - 50% Priority)</option>
              </select>
            </div>

            {/* Input 3: Water Availability */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                {language === "hi" ? "सिंचाई व जल उपलब्धता:" : language === "mr" ? "सिंचन व पाणी स्त्रोत:" : "Irrigation Water Source:"}
              </label>
              <select
                value={calcIrrigation}
                onChange={(e) => setCalcIrrigation(e.target.value as any)}
                className="w-full text-xs font-bold bg-stone-50 border border-stone-300 rounded-xl p-2.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="borewell">Open Well / Borewell (विहीर / बोअरवेल)</option>
                <option value="canal">Canal / River (नहर / नदी)</option>
                <option value="rainfed">Rainfed / Dryland (कोरडवाहू / पावसावर आधारित)</option>
              </select>
            </div>
          </div>

          {/* Calculator Output Highlight Card */}
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-600 text-white rounded-2xl shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-extrabold text-emerald-800 uppercase tracking-wider block">
                  {language === "hi"
                    ? "आपकी अनुमानित सरकारी अनुदान पात्रता:"
                    : language === "mr"
                    ? "तुमची अंदाजे शासकीय सबसिडी पात्रता:"
                    : "Estimated Total Government Grants & Subsidies:"}
                </span>
                <span className="text-2xl font-black text-slate-900">
                  ₹{totalCalculatedBenefit.toLocaleString("en-IN")}+
                </span>
                <span className="text-xs text-slate-600 block mt-0.5">
                  {language === "hi"
                    ? `आप ${calculatedEligibleSchemes.length} प्रमुख केंद्रीय व राज्य योजनाओं के लिए सीधे पात्र हैं।`
                    : language === "mr"
                    ? `तुम्ही ${calculatedEligibleSchemes.length} प्रमुख केंद्रीय व राज्य योजनांसाठी पात्र आहात.`
                    : `You qualify for ${calculatedEligibleSchemes.length} verified national & state schemes.`}
                </span>
              </div>
            </div>

            <button
              onClick={() => {
                setActiveCategory("all");
                setCalculatorOpen(false);
              }}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-all shrink-0 flex items-center gap-2"
            >
              <span>View All {calculatedEligibleSchemes.length} Eligible Schemes</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-white p-3 rounded-2xl border border-stone-200 shadow-xs">
        {/* Search Input */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={
              language === "hi"
                ? "योजना, अनुदान या विभाग खोजें..."
                : language === "mr"
                ? "योजना, सबसिडी किंवा विभाग शोधा..."
                : "Search schemes, subsidies, or keywords..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-600"
          />
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveCategory("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "all"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("all_schemes")}
          </button>
          <button
            onClick={() => setActiveCategory("cash")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "cash"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("cash_grants")}
          </button>
          <button
            onClick={() => setActiveCategory("solar")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "solar"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("solar_pumps")}
          </button>
          <button
            onClick={() => setActiveCategory("machinery")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "machinery"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("machinery_grants")}
          </button>
          <button
            onClick={() => setActiveCategory("insurance")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "insurance"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("insurance_schemes")}
          </button>
          <button
            onClick={() => setActiveCategory("irrigation")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              activeCategory === "irrigation"
                ? "bg-rose-800 text-white shadow-xs"
                : "bg-stone-100 text-slate-600 hover:bg-stone-200"
            }`}
          >
            {t("irrigation_grants")}
          </button>
        </div>
      </div>

      {/* 4. Scheme Cards List */}
      <div className="space-y-4">
        {filteredSchemes.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">
              {language === "hi"
                ? "कोई योजना नहीं मिली"
                : language === "mr"
                ? "कोणतीही योजना सापडली नाही"
                : "No matching government schemes found"}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search keywords or clearing your category filters to see all available national subsidies.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                setSearchQuery("");
              }}
              className="text-xs font-bold text-rose-800 bg-rose-50 px-4 py-2 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredSchemes.map((scheme) => {
            const isExpanded = expandedSchemeId === scheme.id;
            const docList = getTranslatedList(scheme.documents);

            return (
              <div
                key={scheme.id}
                className="bg-white rounded-3xl border border-stone-200 hover:border-rose-300 shadow-xs hover:shadow-md transition-all overflow-hidden"
              >
                {/* Scheme Summary Card Header */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="bg-rose-50 text-rose-800 border border-rose-200 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full">
                        {getTranslated(scheme.badge)}
                      </span>
                      <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5 text-slate-400" />
                        {getTranslated(scheme.ministry)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-emerald-600" />
                        {scheme.portalDomain}
                      </span>
                    </div>
                  </div>

                  {/* Title & Key Benefit Callout */}
                  <div className="space-y-1.5">
                    <h3 className="text-lg sm:text-xl font-black text-slate-900 leading-snug">
                      {getTranslated(scheme.name)}
                    </h3>
                    <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[10px] font-black uppercase text-amber-800 block">
                          {t("benefit_amount")}
                        </span>
                        <p className="text-xs sm:text-sm font-black text-slate-900">
                          {getTranslated(scheme.benefit)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Eligibility Teaser */}
                  <div className="text-xs text-slate-600 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>
                      <strong className="text-slate-800 font-bold">{t("eligibility_criteria")} </strong>
                      {getTranslated(scheme.eligibility)}
                    </span>
                  </div>

                  {/* Direct Action Buttons Row */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Official Registration Portal Link Button */}
                      <a
                        href={scheme.portalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-rose-800 hover:bg-rose-900 text-white rounded-xl text-xs font-black shadow-xs transition-transform hover:scale-102"
                      >
                        <span>{t("apply_online_btn")}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>

                      {/* Official Helpline Button */}
                      <a
                        href={`tel:${scheme.helpline.split("/")[0].trim()}`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-stone-100 hover:bg-stone-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{scheme.helpline}</span>
                      </a>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyLink(scheme.portalUrl, scheme.id)}
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-stone-100 transition-colors title='Copy official portal URL'"
                      >
                        {copiedId === scheme.id ? (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                            <Check className="w-3.5 h-3.5" /> Copied!
                          </span>
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() =>
                          setExpandedSchemeId(isExpanded ? null : scheme.id)
                        }
                        className="text-xs font-bold text-rose-800 hover:text-rose-950 flex items-center gap-1 px-2.5 py-1.5 rounded-xl hover:bg-rose-50"
                      >
                        <span>{isExpanded ? "Hide Documents" : "View Documents & Checklist"}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Section: Required Documents & Application Steps */}
                {isExpanded && (
                  <div className="bg-stone-50/80 border-t border-stone-200/90 p-5 sm:p-6 space-y-4 animate-fade-in">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Left: Required Documents Checklist */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-rose-700" />
                            {t("documents_required")}
                          </h4>
                          <span className="text-[10px] text-slate-500 font-medium">
                            Take originals & photocopy to CSC
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          {docList.map((doc, idx) => (
                            <div
                              key={idx}
                              className="flex items-start gap-2 bg-white p-2.5 rounded-xl border border-stone-200 text-xs text-slate-700 font-medium"
                            >
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              <span>{doc}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Step-by-Step How to Apply */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-black uppercase text-slate-800 tracking-wider flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-700" />
                          {language === "hi"
                            ? "आवेदन कैसे करें (4 आसान चरण):"
                            : language === "mr"
                            ? "अर्ज कसा करावा (४ सोप्या पायऱ्या):"
                            : "How to Apply (4 Step Process):"}
                        </h4>

                        <div className="space-y-2 text-xs text-slate-600">
                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              1
                            </span>
                            <span>
                              <strong>
                                {language === "hi" ? "दस्तावेज तैयार रखें: " : language === "mr" ? "कागदपत्रे तयार ठेवा: " : "Keep documents ready: "}
                              </strong>
                              {language === "hi"
                                ? "आधार कार्ड, 7/12 जमीन नकल और सक्रिय बैंक पासबुक की प्रति रखें।"
                                : language === "mr"
                                ? "आधार कार्ड, ७/१२ उतारा आणि चालू बँक पासबुक प्रत सोबत ठेवा."
                                : "Ensure your Aadhaar is linked to your bank account with NPCI DBT enabled."}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              2
                            </span>
                            <span>
                              <strong>
                                {language === "hi" ? "आधिकारिक पोर्टल खोलें: " : language === "mr" ? "अधिकृत पोर्टल उघडा: " : "Open official portal: "}
                              </strong>
                              {language === "hi"
                                ? `ऊपर दिए गए "Apply on Official Govt Portal" बटन पर क्लिक करें (${scheme.portalDomain})।`
                                : language === "mr"
                                ? `वरील "Apply on Official Govt Portal" बटनावर क्लिक करा (${scheme.portalDomain}).`
                                : `Click the official portal link to open the verified government portal (${scheme.portalDomain}).`}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              3
                            </span>
                            <span>
                              <strong>
                                {language === "hi" ? "ऑनलाइन फॉर्म भरें: " : language === "mr" ? "ऑनलाइन फॉर्म भरा: " : "Fill online form: "}
                              </strong>
                              {getTranslated(scheme.formName)}
                            </span>
                          </div>

                          <div className="flex items-start gap-2 bg-white p-2 rounded-xl border border-stone-200">
                            <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 font-bold flex items-center justify-center shrink-0 text-[10px]">
                              4
                            </span>
                            <span>
                              <strong>
                                {language === "hi" ? "स्थिति ट्रैक करें: " : language === "mr" ? "अर्जाची स्थिती तपासा: " : "Track application: "}
                              </strong>
                              {language === "hi"
                                ? "आवेदन क्रमांक या आधार नंबर दर्ज करके स्टेटस जांचें या टोल-फ्री 155261 पर कॉल करें।"
                                : language === "mr"
                                ? "नोंदणी क्रमांक किंवा आधार नंबर टाकून स्थिती तपासा अथवा टोल-फ्री क्रमांकावर संपर्क साधा."
                                : "Save the Application Ref ID to track DBT status or call the toll-free helpline."}
                            </span>
                          </div>
                        </div>

                        {/* Direct Form External Link Card */}
                        <div className="pt-2 flex items-center justify-between">
                          <a
                            href={scheme.portalUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-rose-800 hover:underline flex items-center gap-1"
                          >
                            <span>Open Direct Registration: {scheme.portalDomain}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>

                          <button
                            onClick={() => window.print()}
                            className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-stone-200"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print Checklist</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 5. Citizen & Farmer Safety Notice */}
      <div className="bg-stone-100 rounded-3xl p-5 border border-stone-200 flex items-start gap-3 text-xs text-slate-600">
        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <strong className="text-slate-900 block font-bold">
            {language === "hi"
              ? "सतर्कता सूचना - बिचौलियों से सावधान रहें"
              : language === "mr"
              ? "दक्षता सूचना - दलालांपासून सावध रहा"
              : "Farmer Advisory - Official Portals Only"}
          </strong>
          <span>
            {language === "hi"
              ? "सरकारी कृषि योजनाओं के लिए केवल आधिकारिक .gov.in व .nic.in वेबसाइटों पर ही आवेदन करें। सरकार कभी भी अनुदान पास करने के लिए फोन पर ओटीपी या बैंक खाते का पिन नहीं मांगती।"
              : language === "mr"
              ? "शासकीय योजनांसाठी केवळ .gov.in आणि .nic.in अधिकृत पोर्टलवरूनच अर्ज करा. शासकीय अनुदानासाठी कोणालाही फोनवर ओटीपी किंवा पैसे देऊ नका."
              : "All schemes listed on AgriGenius link directly to official national (.gov.in) repositories. Government agencies never ask for OTP or processing fees via unsolicited phone calls."}
          </span>
        </div>
      </div>
    </div>
  );
};
