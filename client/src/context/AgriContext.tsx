import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "hi" | "mr";

export interface CartItem {
  id: string;
  title: string;
  brand: string;
  category: string;
  price: number;
  subsidizedPrice?: number;
  quantity: number;
  image: string;
  packWeight: string;
}

export interface LedgerEntry {
  id: string;
  date: string;
  type: "income" | "expense";
  category: "fertilizer" | "seeds" | "pesticides" | "labor" | "machinery" | "produce_sale" | "other";
  title: string;
  amount: number;
  notes?: string;
}

export interface ProduceListing {
  id: string;
  farmerName: string;
  farmerPhone: string;
  cropName: string;
  variety: string;
  quantityQuintals: number;
  askingPricePerQuintal: number;
  location: string;
  harvestDate: string;
  image: string;
  grade: "A+" | "A" | "B";
}

interface AgriContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;

  // Offline sync simulation
  isOffline: boolean;
  toggleOffline: () => void;
  pendingSyncCount: number;
  triggerSync: () => void;
  isSyncing: boolean;

  // Cart
  cart: CartItem[];
  addToCart: (item: Omit<CartItem, "quantity">, qty?: number) => void;
  removeFromCart: (id: string) => void;
  clearCart: () => void;
  cartTotal: number;

  // Ledger
  ledger: LedgerEntry[];
  addLedgerEntry: (entry: Omit<LedgerEntry, "id" | "date">) => void;

  // Context for chat
  activeChatListing: ProduceListing | null;
  setActiveChatListing: (listing: ProduceListing | null) => void;

  // Voice Assistant state
  voiceModalOpen: boolean;
  setVoiceModalOpen: (open: boolean) => void;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation & Suite
    command_center: "Command Center",
    ai_crop_scanner: "AI Crop Scanner",
    buy_fertilizers: "Buy Fertilizers",
    sell_produce: "Sell Produce",
    direct_chat: "Direct Chat",
    khata_ledger: "Daily Ledger",
    tractor_rental: "Machinery Rental",
    farm_mapping: "Field Maps & Measurement",
    gov_schemes: "Govt Grants & Schemes",
    crop_wizard: "Crop Advisory Wizard",
    livestock_care: "Cattle Welfare Care",
    advisory_archive: "Advisory Archive",
    farm_settings: "Farm Profile",
    sanctuary_directory: "Gaushala Directory",
    new_crop_advisory: "New Crop Advisory",
    voice_assistant: "Voice Assistant",
    offline_mode: "Offline Mode",
    online: "Online",
    offline_banner: "Field Offline Mode: Actions cached locally. Will auto-sync when cellular signal returns.",
    syncing_banner: "Reconnecting to cloud... Synchronizing offline transactions.",
    farmer_suite_title: "Farmer Action Suite",
    farmer_suite_desc: "Touch-optimized for outdoor field work",

    // Weather & Spray Advisory
    spray_advisory: "Today's Spray Advisory",
    ideal_spray_window: "IDEAL SPRAY WINDOW: Safe to spray pesticides until 4:00 PM (Wind 7 km/h, 0% rain)",
    humidity: "Humidity",
    wind: "Wind",
    gentle_wind: "Gentle",

    // Dashboard Cards
    scanner_card_desc: "Snap leaf photo to detect disease & get 1-tap medicine prescription.",
    store_card_desc: "Certified Nano Urea, DAP, local dealer pickup & COD delivery.",
    market_card_desc: "List fresh vegetables and grains directly for restaurant & wholesale buyers.",
    chat_card_desc: "Instagram-style bargaining cards, voice notes, and instant deals.",
    machinery_card_desc: "Uber for Tractors — rotavators, levelers, and spray drones nearby.",
    ledger_card_desc: "Track input expenses and crop sales with automated seasonal profit analysis.",
    mapping_card_desc: "Drop satellite pins to measure acreage, Gunthas, and estimate barbed-wire fencing.",
    schemes_card_desc: "PM-KISAN ₹6,000, 60% Solar Pump subsidies & direct official registration portal links.",
    recent_reports: "Recent Agronomic Reports",
    view_all: "View All",

    // Satellite Measurement Page
    satellite_measuring_title: "Satellite Farm Acreage & Perimeter Measurement",
    satellite_measuring_desc: "Drop perimeter pins directly onto live satellite imagery. Instantly calculate Acreage, Hectares, Bighas, and Barbed Wire Fencing requirements.",
    click_map_pins: "Click on Map to Drop Boundary Pins",
    boundary_points_marked: "boundary points marked",
    direct_ruler_mode: "Distance Ruler",
    direct_area_mode: "Farm Area Polygon",
    locate_my_field: "My Farm GPS",
    search_village_placeholder: "Search village, tehsil or district...",
    drag_pin_hint: "Tip: Drag pins to fine-tune farm boundaries",
    walk_gps_boundary: "Walk GPS Boundary",
    walking_gps: "Walking GPS...",
    undo_point: "Undo Last Point",
    clear_all: "Clear All Pins",
    sample_plots: "Sample Plots:",
    measured_land_dimensions: "Measured Land Dimensions",
    total_measured_area: "Total Measured Farm Area",
    boundary_perimeter: "Boundary Perimeter",
    total_fencing_length: "Total Fencing Length",
    fence_estimator: "Barbed Wire Fence Estimator:",
    fence_desc: "Requires 3-strand wire bundles. Estimated wire cost approx.",
    input_dosage_title: "Input Dosage for",
    acres_label: "Acres",
    ha_label: "Ha",
    bigha_label: "Bigha",
    guntha_label: "Guntha",
    add_dosage_to_cart: "Add Dosage for Measured Land to Cart",
    save_boundary: "Save Measured Boundary to Profile",
    field_saved_notice: "Field Saved to Farmer Registry!",
    satellite_layer: "Satellite View",
    ndvi_layer: "NDVI Crop Health",
    cadastral_layer: "Cadastral Khasra",

    // Fertilizer Store
    fertilizer_store_title: "Fertilizer & Agri-Input Store",
    fertilizer_store_desc: "Buy genuine subsidized fertilizers, certified bio-nutrients, and crop protection directly from licensed rural dealers. Cash on Delivery or Kisan Credit Card.",
    view_cart: "View Cart",
    village_pool_title: "Village Community Bulk Pool (Rampur Cluster)",
    dosage_calc_title: "Smart Acreage Fertilizer Dosage Calculator",
    dosage_calc_desc: "Auto-computes scientific bags based on crop acreage to prevent overspending",
    select_crop: "Select Crop",
    field_acreage: "Field Acreage:",
    add_acres_dosage: "Add Dosage to Cart",
    all_products: "All Products",
    subsidized_urea_dap: "Govt Subsidized Urea & DAP",
    crop_protection: "Crop Protection & Fungicides",
    bio_fertilizers: "Bio-Fertilizers & Tonics",
    sprayers_machinery: "Sprayers & Machinery",
    subsidized_badge: "Subsidized",
    mrp: "MRP",
    add: "Add",
    payment_mode: "Select Payment Mode:",
    cash_on_delivery: "Cash On Delivery",
    upi_scan: "UPI QR Scan",
    kisan_credit: "Kisan Credit (Pay Later)",
    confirm_order: "Confirm Order",

    // Scanner
    crop_scanner_title: "AI Crop Disease Diagnosis",
    crop_scanner_desc: "Snap a leaf photo or pick a sample. AI computer vision detects the pathogen, severity index, and prescribes certified remedies with 1-tap store checkout.",
    leaf_viewfinder: "Leaf Viewfinder",
    snap_camera: "Snap Camera",
    upload_photo: "Upload Photo",
    quick_test_samples: "Quick Test Samples:",
    symptoms: "Visual Symptoms:",
    organic_remedy: "Organic & Biological Remedy",
    chemical_control: "Chemical & Fast Control",
    spray_dosage: "Safe Spray Dosage & Application Timing:",
    buy_cure_button: "1-Tap Buy Cure & Open Store",
    audio_read_aloud: "Audio Read-Aloud",

    // Govt Schemes Page
    schemes_page_title: "Government Grants, Subsidies & Official Forms",
    schemes_page_desc: "Verified direct links to official Central and State government portals for cash grants, solar pumps, machinery subsidies, and crop insurance.",
    check_eligibility: "Check My Eligibility",
    apply_online_btn: "Apply on Official Govt Portal",
    documents_required: "Documents Required:",
    benefit_amount: "Subsidy / Grant Benefit:",
    direct_link: "Direct Portal Form Link:",
    eligibility_criteria: "Eligibility Criteria:",
    helpline_number: "Toll-Free Helpline:",
    all_schemes: "All Schemes",
    cash_grants: "Direct Cash Grants",
    solar_pumps: "Solar Agriculture Pumps",
    machinery_grants: "Tractor & Machinery Subsidy",
    insurance_schemes: "Crop Insurance (PMFBY)",
    irrigation_grants: "Micro-Irrigation (Drip/Sprinkler)",
  },
  hi: {
    // Navigation & Suite
    command_center: "कमांड सेंटर",
    ai_crop_scanner: "फसल रोग स्कैनर",
    buy_fertilizers: "खाद व उर्वरक खरीदें",
    sell_produce: "उपज बेचें (मंडी)",
    direct_chat: "सीधी बातचीत (चैट)",
    khata_ledger: "दैनिक खाता / बही",
    tractor_rental: "ट्रैक्टर व मशीन किराया",
    farm_mapping: "खेत का नक्शा व नपाई",
    gov_schemes: "सरकारी योजनाएं व अनुदान",
    crop_wizard: "फसल सलाहकार विज़ार्ड",
    livestock_care: "गोवंश कल्याण व देखभाल",
    advisory_archive: "सलाहकार रिकॉर्ड",
    farm_settings: "खेत व किसान प्रोफाइल",
    sanctuary_directory: "गौशाला निर्देशिका",
    new_crop_advisory: "नया फसल परामर्श",
    voice_assistant: "वाणी सहायक (माइक)",
    offline_mode: "ऑफ़लाइन मोड",
    online: "ऑनलाइन",
    offline_banner: "ऑफ़लाइन मोड सक्रिय: सभी लेन-देन और स्कैन फोन में सुरक्षित हैं। नेटवर्क आने पर स्वतः सिंक होंगे।",
    syncing_banner: "क्लाउड से जुड़ रहे हैं... ऑफ़लाइन डेटा सिंक हो रहा है।",
    farmer_suite_title: "किसान कार्य मंच",
    farmer_suite_desc: "खेत में काम करने के लिए आसान व बड़े टच बटन",

    // Weather & Spray Advisory
    spray_advisory: "आज की छिड़काव सलाह",
    ideal_spray_window: "उत्तम छिड़काव समय: शाम 4:00 बजे तक दवा छिड़कना सुरक्षित है (हवा 7 किमी/घं, वर्षा 0%)",
    humidity: "नमी / आर्द्रता",
    wind: "हवा",
    gentle_wind: "मंद गति",

    // Dashboard Cards
    scanner_card_desc: "पत्ती की फोटो खींचें, रोग पहचानें और 1-क्लिक में सही दवा मंगवाएं।",
    store_card_desc: "सरकारी सब्सिडी यूरिया, डीएपी, नज़दीकी डीलर से उठाव व कैश ऑन डिलीवरी।",
    market_card_desc: "ताज़ा फसल सीधे होटल, रेस्टोरेंट और थोक व्यापारियों को अच्छे दाम पर बेचें।",
    chat_card_desc: "इंस्टाग्राम जैसी चैट: बोलकर संदेश भेजें, मोलभाव करें और पक्के सौदे करें।",
    machinery_card_desc: "ट्रैक्टर व मशीनरी: रोटावेटर, लेवलर और स्प्रे ड्रोन प्रति घंटा किराए पर लें।",
    ledger_card_desc: "दैनिक खर्च और फसल बिक्री का स्वतः हिसाब-किताब व मौसमी मुनाफा देखें।",
    mapping_card_desc: "सैटेलाइट से खेत का कोना-कोना नापें, कुल एकड़ निकालें और तारबंदी का हिसाब लगाएं।",
    schemes_card_desc: "पीएम-किसान ₹6000, सोलर पंप 60% व कृषि यंत्र सब्सिडी के सीधे सरकारी फॉर्म लिंक।",
    recent_reports: "हालिया कृषि रिपोर्ट",
    view_all: "सभी देखें",

    // Satellite Measurement Page
    satellite_measuring_title: "सैटेलाइट से खेत की नपाई व सीमांकन",
    satellite_measuring_desc: "सैटेलाइट नक्शे पर खेत के कोनों पर टैप करें। तुरंत कुल एकड़, बीघा, हेक्टेयर व तारबंदी की लंबाई जानें और सही खाद-बीज निकालें।",
    click_map_pins: "खेत के कोने चिह्नित करने के लिए नक्शे पर टैप करें",
    boundary_points_marked: "सीमा बिंदु चिह्नित",
    direct_ruler_mode: "दूरी मापक (रूलर)",
    direct_area_mode: "खेत क्षेत्रफल (बहुभुज)",
    locate_my_field: "मेरा खेत (GPS)",
    search_village_placeholder: "गांव, तहसील या जिला खोजें...",
    drag_pin_hint: "सलाह: सीमा ठीक करने के लिए पिन को ड्रैग करें",
    walk_gps_boundary: "जीपीएस से खेत नापें",
    walking_gps: "जीपीएस से नाप रहे हैं...",
    undo_point: "पिछला बिंदु हटाएं",
    clear_all: "सभी बिंदु हटाएं",
    sample_plots: "नमूना खेत:",
    measured_land_dimensions: "मापी गई भूमि का माप",
    total_measured_area: "कुल मापा गया क्षेत्रफल",
    boundary_perimeter: "खेत की बाहरी सीमा (तारबंदी)",
    total_fencing_length: "कुल बाड़ लगाने की लंबाई",
    fence_estimator: "कंटीले तार की बाड़ का अनुमान:",
    fence_desc: "3-तार वाली कंटीली बाड़ के बंडल की आवश्यकता। अनुमानित लागत लगभग।",
    input_dosage_title: "अनुशंसित खाद मात्रा:",
    acres_label: "एकड़",
    ha_label: "हेक्टेयर",
    bigha_label: "बीघा",
    guntha_label: "गुंठा",
    add_dosage_to_cart: "मापे गए खेत के लिए खाद झोले में डालें",
    save_boundary: "मापा गया खेत प्रोफाइल में सहेजें",
    field_saved_notice: "खेत किसान खाते में सुरक्षित कर लिया गया!",
    satellite_layer: "सैटेलाइट दृश्य",
    ndvi_layer: "NDVI फसल स्वास्थ्य",
    cadastral_layer: "खसरा / नक्शा ग्रिड",

    // Fertilizer Store
    fertilizer_store_title: "उर्वरक व खाद ई-स्टोर",
    fertilizer_store_desc: "सरकारी सब्सिडी वाले असली उर्वरक, जैविक खाद व कीटनाशक सीधे नज़दीकी प्रमाणित डीलर से खरीदें। कैश ऑन डिलीवरी या किसान क्रेडिट कार्ड।",
    view_cart: "झोला देखें",
    village_pool_title: "ग्राम सामूहिक खरीद समूह (रामपुर क्लस्टर)",
    dosage_calc_title: "एकड़ अनुसार खाद व उर्वरक गणक (कैलकुलेटर)",
    dosage_calc_desc: "फसल के क्षेत्रफल के अनुसार वैज्ञानिक खाद की मात्रा निकालें और अतिरिक्त खर्च बचाएं।",
    select_crop: "फसल चुनें",
    field_acreage: "खेत का क्षेत्रफल:",
    add_acres_dosage: "खाद झोले में डालें",
    all_products: "सभी उत्पाद",
    subsidized_urea_dap: "सब्सिडी यूरिया व डीएपी",
    crop_protection: "फसल सुरक्षा व फफूंदनाशक",
    bio_fertilizers: "जैविक खाद व टॉनिक",
    sprayers_machinery: "स्प्रेयर व कृषि यंत्र",
    subsidized_badge: "सब्सिडी प्राप्त",
    mrp: "बाज़ार भाव",
    add: "जोड़ें",
    payment_mode: "भुगतान का तरीका चुनें:",
    cash_on_delivery: "कैश ऑन डिलीवरी (नकद)",
    upi_scan: "यूपीआई क्यूआर स्कैन",
    kisan_credit: "किसान क्रेडिट कार्ड (कटाई के बाद दें)",
    confirm_order: "ऑर्डर पक्का करें",

    // Scanner
    crop_scanner_title: "स्मार्ट फसल रोग स्कैनर",
    crop_scanner_desc: "पत्ती की तस्वीर लें या नमूना चुनें। कृत्रिम बुद्धिमत्ता तुरंत रोग की पहचान कर जैविक व रासायनिक उपचार और दवा की सही मात्रा बताएगी।",
    leaf_viewfinder: "पत्ती व्यूफाइंडर",
    snap_camera: "कैमरा चालू करें",
    upload_photo: "फोटो अपलोड करें",
    quick_test_samples: "तुरंत टेस्ट नमूने:",
    symptoms: "रोग के मुख्य लक्षण:",
    organic_remedy: "जैविक व प्राकृतिक उपचार",
    chemical_control: "रासायनिक त्वरित उपचार",
    spray_dosage: "छिड़काव की सही मात्रा व समय:",
    buy_cure_button: "1-क्लिक में दवा खरीदें व स्टोर खोलें",
    audio_read_aloud: "आवाज़ में सुनें",

    // Govt Schemes Page
    schemes_page_title: "सरकारी कृषि योजनाएं, अनुदान व ऑनलाइन फॉर्म लिंक",
    schemes_page_desc: "नकद सहायता (₹6000), सोलर पंप सब्सिडी (60%), ट्रैक्टर अनुदान (50%) व फसल बीमा के लिए सीधे आधिकारिक सरकारी पोर्टल से ऑनलाइन आवेदन करें।",
    check_eligibility: "मेरी पात्रता जांचें",
    apply_online_btn: "सरकारी पोर्टल पर ऑनलाइन आवेदन करें",
    documents_required: "आवश्यक सरकारी दस्तावेज:",
    benefit_amount: "अनुदान / मिलने वाला लाभ:",
    direct_link: "आधिकारिक फॉर्म वेब पोर्टल:",
    eligibility_criteria: "पात्रता की शर्तें:",
    helpline_number: "टोल-फ्री हेल्पलाइन नंबर:",
    all_schemes: "सभी योजनाएं",
    cash_grants: "नकद सहायता (PM-KISAN)",
    solar_pumps: "सोलर पंप (PM-KUSUM)",
    machinery_grants: "ट्रैक्टर व मशीन सब्सिडी (SMAM)",
    insurance_schemes: "फसल बीमा (PMFBY)",
    irrigation_grants: "ड्रिप व स्प्रिंकलर सिंचाई",
  },
  mr: {
    // Navigation & Suite
    command_center: "मुख्य केंद्र",
    ai_crop_scanner: "पीक रोग स्कॅनर",
    buy_fertilizers: "खते व औषधे खरेदी",
    sell_produce: "शेतमाल विक्री (मंडी)",
    direct_chat: "थेट संवाद (चॅट)",
    khata_ledger: "दैनिक हिशोब वही",
    tractor_rental: "ट्रॅक्टर व अवजारे भाडे",
    farm_mapping: "शेत नकाशा व मोजणी",
    gov_schemes: "शासकीय योजना व अनुदान",
    crop_wizard: "पीक सल्लागार विझार्ड",
    livestock_care: "गोवंश संवर्धन व काळजी",
    advisory_archive: "सल्लागार नोंदी",
    farm_settings: "शेतकरी प्रोफाइल",
    sanctuary_directory: "गोशाळा डिरेक्टरी",
    new_crop_advisory: "नवीन पीक सल्ला",
    voice_assistant: "आवाज साहाय्यक",
    offline_mode: "ऑफलाइन मोड",
    online: "ऑनलाइन",
    offline_banner: "ऑफलाइन मोड सक्रिय: सर्व व्यवहार फोनमध्ये सेव्ह आहेत. इंटरनेट सुरू झाल्यावर ऑटो-सिंक होईल.",
    syncing_banner: "सर्व्हरशी जोडत आहे... ऑफलाइन डेटा सिंक होत आहे.",
    farmer_suite_title: "शेतकरी कार्य मंच",
    farmer_suite_desc: "शेतात काम करताना वापरण्यासाठी मोठे व सोपे बटण",

    // Weather & Spray Advisory
    spray_advisory: "आजचा फवारणी सल्ला",
    ideal_spray_window: "उत्कृष्ट फवारणी वेळ: संध्याकाळी 4:00 वाजेपर्यंत फवारणी सुरक्षित आहे (वारा 7 किमी/तास, पाऊस 0%)",
    humidity: "हवेतील आर्द्रता",
    wind: "वारा",
    gentle_wind: "मंद गती",

    // Dashboard Cards
    scanner_card_desc: "पानाचा फोटो काढा, रोग ओळखा आणि एका क्लिकवर औषध खरेदी करा.",
    store_card_desc: "अनुदानित नॅनो युरिया, डीएपी, स्थानिक दुकानातून मिळवा किंवा कॅश ऑन डिलिव्हरी.",
    market_card_desc: "हॉटेल आणि घाऊक व्यापाऱ्यांना थेट चांगल्या दरात शेतमाल विका.",
    chat_card_desc: "इन्स्टाग्राम सारखी चॅट: बोलून संदेश पाठवा, भाव ठरवा आणि थेट सौदा करा.",
    machinery_card_desc: "ट्रॅक्टर, रोटाव्हेटर आणि फवारणी ड्रोन तासाच्या हिशोबाने भाड्याने घ्या.",
    ledger_card_desc: "दैनिक खर्च आणि शेतमाल विक्रीचा स्वयंचलित नफा-तोटा हिशोब ठेवा.",
    mapping_card_desc: "उपग्रहावरून शेत मोजा, एकर-गुंठे काढा आणि काटेरी तारेच्या कुंपणाचा खर्च ठरवा.",
    schemes_card_desc: "पीएम-किसान ₹6000, 60% सौर कृषी पंप व ट्रॅक्टर सबसिडीचे थेट शासकीय पोर्टल अर्ज.",
    recent_reports: "अलीकडील कृषी अहवाल",
    view_all: "सर्व पहा",

    // Satellite Measurement Page
    satellite_measuring_title: "उपग्रहावरून शेत मोजणी व क्षेत्रफळ",
    satellite_measuring_desc: "नकाशावर शेताच्या कोपऱ्यांवर टॅप करा. लगेच एकर, गुंठे, हेक्टर आणि कुंपणाची लांबी मोजा आणि खतांचे अचूक प्रमाण काढा.",
    click_map_pins: "शेताचे कोपरे निश्चित करण्यासाठी नकाशावर टॅप करा",
    boundary_points_marked: "सीमा बिंदू निश्चित",
    direct_ruler_mode: "अंतर मोजणी (रूलर)",
    direct_area_mode: "शेत क्षेत्रफळ (बहुभुज)",
    locate_my_field: "माझे शेत (GPS)",
    search_village_placeholder: "गाव, तालुका किंवा जिल्हा शोधा...",
    drag_pin_hint: "सूचना: सीमा जुळवण्यासाठी पिन सरकवा",
    walk_gps_boundary: "जीपीएसने शेत मोजा",
    walking_gps: "जीपीएसने मोजत आहे...",
    undo_point: "मागील बिंदू काढा",
    clear_all: "सर्व बिंदू काढा",
    sample_plots: "नमुने शेत:",
    measured_land_dimensions: "मोजलेले शेत क्षेत्रफळ",
    total_measured_area: "एकूण मोजलेले क्षेत्रफळ",
    boundary_perimeter: "शेताची सीमा (कुंपण लांबी)",
    total_fencing_length: "एकूण कुंपणाची लांबी",
    fence_estimator: "काटेरी तारेचे कुंपण अंदाज:",
    fence_desc: "3 पदरी काटेरी तारेचे बंडल लागतील. अंदाजे खर्च.",
    input_dosage_title: "खतांचे शिफारस केलेले प्रमाण:",
    acres_label: "एकर",
    ha_label: "हेक्टर",
    bigha_label: "बिघा",
    guntha_label: "गुंठा",
    add_dosage_to_cart: "मोजलेल्या शेतासाठी खत खरेदी करा",
    save_boundary: "मोजलेले क्षेत्र प्रोफाइलमध्ये सेव्ह करा",
    field_saved_notice: "शेत यशस्वीरीत्या नोंदवले गेले!",
    satellite_layer: "उपग्रह दृश्य",
    ndvi_layer: "NDVI पीक आरोग्य",
    cadastral_layer: "गट नंबर ग्रिड",

    // Fertilizer Store
    fertilizer_store_title: "खते व औषधे ई-स्टोअर",
    fertilizer_store_desc: "शासकीय अनुदानित खरी खते, सेंद्रिय टॉनिक आणि कीटकनाशके थेट परवानाधारक विक्रेत्याकडून खरेदी करा. कॅश ऑन डिलिव्हरी किंवा किसान क्रेडिट कार्ड.",
    view_cart: "खरेदी झोळी पहा",
    village_pool_title: "गावाचा सामूहिक खरेदी गट (रामपूर क्लस्टर)",
    dosage_calc_title: "एकराप्रमाणे खतांचे गणकयंत्र",
    dosage_calc_desc: "शेताच्या क्षेत्रफळानुसार खतांचे अचूक प्रमाण काढा आणि अतिरिक्त खर्च टाळा.",
    select_crop: "पीक निवडा",
    field_acreage: "शेताचे क्षेत्रफळ:",
    add_acres_dosage: "खत झोळीत टाका",
    all_products: "सर्व उत्पादने",
    subsidized_urea_dap: "अनुदानित युरिया व डीएपी",
    crop_protection: "पीक संरक्षण व बुरशीनाशके",
    bio_fertilizers: "सेंद्रिय खते व टॉनिक",
    sprayers_machinery: "फवारणी पंप व यंत्रे",
    subsidized_badge: "अनुदानित दर",
    mrp: "बाजार भाव",
    add: "जोडा",
    payment_mode: "पेमेंट पद्धत निवडा:",
    cash_on_delivery: "कॅश ऑन डिलिव्हरी (रोख)",
    upi_scan: "यूपीआय क्यूआर स्कॅन",
    kisan_credit: "किसान क्रेडिट कार्ड (पीक आल्यावर द्या)",
    confirm_order: "ऑर्डर पक्की करा",

    // Scanner
    crop_scanner_title: "स्मार्ट पीक रोग स्कॅनर",
    crop_scanner_desc: "पानाचा फोटो काढा किंवा नमुना निवडा. एआय लगेच रोग ओळखेल, सेंद्रिय व रासायनिक उपचार आणि औषधांचे अचूक प्रमाण सुचवेल.",
    leaf_viewfinder: "पान स्कॅनर व्ह्यूफाइंडर",
    snap_camera: "कॅमेरा चालू करा",
    upload_photo: "फोटो अपलोड करा",
    quick_test_samples: "चाचणी नमुने:",
    symptoms: "रोगाची मुख्य लक्षणे:",
    organic_remedy: "सेंद्रिय व जैविक उपाय",
    chemical_control: "रासायनिक त्वरित उपचार",
    spray_dosage: "फवारणीचे अचूक प्रमाण व वेळ:",
    buy_cure_button: "एका क्लिकवर औषध खरेदी करा",
    audio_read_aloud: "आवाजात ऐका",

    // Govt Schemes Page
    schemes_page_title: "शासकीय कृषी योजना, सबसिडी व ऑनलाइन अर्ज",
    schemes_page_desc: "थेट रोख मदत (₹6000), सोलर पंप सबसिडी (60%), ट्रॅक्टर अनुदान (50%) आणि पीक विम्यासाठी थेट अधिकृत शासकीय पोर्टलवरून ऑनलाइन अर्ज करा.",
    check_eligibility: "माझी पात्रता तपासा",
    apply_online_btn: "शासकीय पोर्टलवर थेट ऑनलाइन अर्ज करा",
    documents_required: "आवश्यक कागदपत्रे:",
    benefit_amount: "अनुदान / मिळणारा लाभ:",
    direct_link: "अधिकृत नोंदणी वेब पोर्टल:",
    eligibility_criteria: "पात्रतेच्या अटी:",
    helpline_number: "टोल-फ्री हेल्पलाइन क्रमांक:",
    all_schemes: "सर्व योजना",
    cash_grants: "थेट रोख मदत (PM-KISAN)",
    solar_pumps: "सौर कृषी पंप (PM-KUSUM)",
    machinery_grants: "ट्रॅक्टर व यंत्र सबसिडी (SMAM)",
    insurance_schemes: "पीक विमा (PMFBY)",
    irrigation_grants: "ठिबक व तुषार सिंचन",
  },
};

const AgriContext = createContext<AgriContextType | undefined>(undefined);

export const AgriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem("agrigenius_lang") as Language) || "en";
  });

  const [isOffline, setIsOffline] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [activeChatListing, setActiveChatListing] = useState<ProduceListing | null>(null);

  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("agrigenius_cart");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [ledger, setLedger] = useState<LedgerEntry[]>(() => {
    try {
      const saved = localStorage.getItem("agrigenius_ledger");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: "l-1",
        date: "2026-09-24",
        type: "expense",
        category: "fertilizer",
        title: "2 Bags IFFCO Nano Urea & Potash",
        amount: 840,
        notes: "Applied to Field 1 Wheat crop",
      },
      {
        id: "l-2",
        date: "2026-09-22",
        type: "income",
        category: "produce_sale",
        title: "Sold 35 Quintals Fresh Tomatoes",
        amount: 78500,
        notes: "Direct sale to Delhi Azadpur buyer",
      },
      {
        id: "l-3",
        date: "2026-09-18",
        type: "expense",
        category: "machinery",
        title: "Rotavator Field Tillage Rental (4 hrs)",
        amount: 3200,
        notes: "Land prep for rabi season",
      },
      {
        id: "l-4",
        date: "2026-09-15",
        type: "expense",
        category: "labor",
        title: "Weeding and nursery transplantation labor",
        amount: 4500,
        notes: "5 workers for 2 days",
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem("agrigenius_lang", language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem("agrigenius_cart", JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem("agrigenius_ledger", JSON.stringify(ledger));
  }, [ledger]);

  const t = (key: string): string => {
    return translations[language]?.[key] || translations.en[key] || key;
  };

  const toggleOffline = () => {
    if (isOffline) {
      setIsOffline(false);
      triggerSync();
    } else {
      setIsOffline(true);
    }
  };

  const triggerSync = () => {
    if (pendingSyncCount === 0) return;
    setIsSyncing(true);
    setTimeout(() => {
      setPendingSyncCount(0);
      setIsSyncing(false);
    }, 1800);
  };

  const addToCart = (item: Omit<CartItem, "quantity">, qty = 1) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + qty } : i));
      }
      return [...prev, { ...item, quantity: qty }];
    });
    if (isOffline) {
      setPendingSyncCount((c) => c + 1);
    }
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((i) => i.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartTotal = cart.reduce((sum, item) => {
    const unitPrice = item.subsidizedPrice ?? item.price;
    return sum + unitPrice * item.quantity;
  }, 0);

  const addLedgerEntry = (entry: Omit<LedgerEntry, "id" | "date">) => {
    const newEntry: LedgerEntry = {
      ...entry,
      id: "l-" + Date.now(),
      date: new Date().toISOString().split("T")[0],
    };
    setLedger((prev) => [newEntry, ...prev]);
    if (isOffline) {
      setPendingSyncCount((c) => c + 1);
    }
  };

  return (
    <AgriContext.Provider
      value={{
        language,
        setLanguage,
        t,
        isOffline,
        toggleOffline,
        pendingSyncCount,
        triggerSync,
        isSyncing,
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
        ledger,
        addLedgerEntry,
        activeChatListing,
        setActiveChatListing,
        voiceModalOpen,
        setVoiceModalOpen,
      }}
    >
      {children}
    </AgriContext.Provider>
  );
};

export const useAgri = () => {
  const context = useContext(AgriContext);
  if (!context) {
    throw new Error("useAgri must be used within an AgriProvider");
  }
  return context;
};
