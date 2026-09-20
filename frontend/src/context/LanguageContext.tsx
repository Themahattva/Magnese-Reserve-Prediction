'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isHindi: boolean;
}

// Master Translation Dictionary for UI elements and phrases
const MASTER_DICTIONARY: Record<string, string> = {
  // Page Titles & Headers
  'Operational & Exploration Dashboard': 'परिचालन एवं अन्वेषण डैशबोर्ड',
  'Manganese Exploration & Subsurface Orebody Intelligence': 'मैंगनीज अन्वेषण एवं उपसतह अयस्क आसूचना',
  'Production Shortfall & Fleet Telemetry': 'उत्पादन कमी एवं भारी उपकरण टेलीमेट्री',
  'What-If Scenario Simulator': 'क्या-अगर परिदृश्य सिमुलेटर',
  'Decision Center & Human-in-the-Loop Governance': 'निर्णय केंद्र एवं मानव-समीक्षा अभिशासन',
  'AI Decision Center & Recommendations': 'एआई निर्णय केंद्र एवं सिफ़ारिशें',
  'Data Sources Registry & Quality Governance': 'डेटा स्रोत रजिस्ट्री एवं गुणवत्ता अभिशासन',
  'Data Sources & Quality Pipeline': 'डेटा स्रोत एवं गुणवत्ता पाइपलाइन',
  'AI/ML Model Registry & Continuous Drift Governance': 'एआई/एमएल मॉडल रजिस्ट्री एवं निरंतर ड्रिफ्ट अभिशासन',
  'Model Registry & Drift Monitoring': 'मॉडल रजिस्ट्री एवं ड्रिफ्ट निगरानी',
  'Audit-Ready Reports & Immutable System Governance Log': 'ऑडिट-तैयार रिपोर्ट एवं अपरिवर्तनीय सिस्टम गवर्नेंस लॉग',
  'Reports & Regulatory Audit Trail': 'रिपोर्ट एवं विनियामक ऑडिट ट्रेल',
  'Shortfall Predictions': 'उत्पादन कमी पूर्वानुमान',
  'Production Analytics': 'उत्पादन विश्लेषण',
  'Corrective Actions & Interventions': 'सुधारात्मक कार्रवाइयां एवं हस्तक्षेप',
  'Heavy Earth Moving Machinery (HEMM) Fleet Operations': 'भारी अर्थ मूविंग मशीनरी (एचईएमएम) बेड़ा संचालन',
  'Geospatial Lease Overview & Alert Zones': 'भू-स्थानिक पट्टा अवलोकन एवं चेतावनी क्षेत्र',
  'Production vs. Target Horizon (12-Month Trend)': 'उत्पादन बनाम लक्ष्य रुझान (12-महीने)',
  'Production vs Target Trend (12 Months)': 'उत्पादन बनाम लक्ष्य रुझान (12 महीने)',
  'Shortfall Warnings & Pending Reviews': 'कमी की चेतावनियां एवं लंबित समीक्षाएं',
  'Recent Operational Alerts': 'हाल के परिचालन अलर्ट',
  'Mine Locations & Shortfall Risk': 'खदान स्थल एवं कमी का जोखिम',

  // Descriptions & Subtitles
  'Real-time synthesis of satellite mineral indicators, borehole assay distributions, and fleet telemetry across MOIL Ltd. mining leases.':
    'मॉयल लिमिटेड खनन पट्टों में उपग्रह खनिज संकेतकों, बोरहोल परख वितरण और बेड़े टेलीमेट्री का वास्तविक समय विश्लेषण।',
  'Multimodal evidence fusion combining Sentinel-2 remote sensing indicators, Sausar Group stratigraphy, and core borehole assays to infer 3D prospectivity and quantify decision uncertainty.':
    '3डी पूर्वेक्षण और निर्णय अनिश्चितता की मात्रा निर्धारित करने के लिए सेंटिनल-2 उपग्रह रिमोट सेंसिंग, सौसर समूह स्तरिकी और कोर बोरहोल परख का बहुविध संलयन।',
  'Uncertainty-guided borehole drilling optimization, satellite mineral prospectivity, and subsurface grade kriging.':
    'अनिश्चितता-निर्देशित बोरहोल ड्रिलिंग अनुकूलन, उपग्रह खनिज पूर्वेक्षण और उपसतह ग्रेड क्रिगिंग।',
  'Predictive shortfall intelligence, heavy equipment breakdown telemetry, and blast recovery forecasts.':
    'पूर्वानुमानित कमी आसूचना, भारी उपकरण ब्रेकडाउन टेलीमेट्री, और ब्लास्ट रिकवरी पूर्वानुमान।',
  'Monte Carlo & discrete-event simulation of rainfall events, equipment outages, and dynamic blending.':
    'भारी वर्षा की घटनाओं, उपकरण विफलताओं और गतिशील सम्मिश्रण का मोंटे कार्लो एवं असतत-घटना सिमुलेशन।',
  'Actionable operational mitigations, dispatch re-routing, and blend optimization with human-in-the-loop review.':
    'मानवीय समीक्षा के साथ व्यावहारिक परिचालन शमन, डिस्पैच पुनर्मार्गन और सम्मिश्रण अनुकूलन।',
  'Health status of telemetry streams, borehole assays, GEE satellite rasters, and legacy ERP data.':
    'टेलीमेट्री धाराओं, बोरहोल परख, जीईई उपग्रह रास्टर और ईआरपी डेटा की स्वास्थ्य स्थिति।',
  'MLOps tracking for XGBoost, Random Forest, Kriging models, and real-time concept drift detection.':
    'एक्सजीबूस्ट, रैंडम फ़ॉरेस्ट, क्रिगिंग मॉडल के लिए एमएलऑप्स ट्रैकिंग और वास्तविक समय अवधारणा ड्रिफ्ट का पता लगाना।',
  'Generate GIGW-compliant compliance documentation, production summaries, and export audit trails.':
    'जीआईजीडब्ल्यू-अनुरूप अनुपालन दस्तावेज, उत्पादन सारांश तैयार करें और ऑडिट ट्रेल निर्यात करें।',
  'Loading ANVESHA Mining Intelligence...': 'अन्वेषा खनन आसूचना लोड हो रही है...',
  'Connecting to operational telemetry and geological models': 'परिचालन टेलीमेट्री और भूवैज्ञानिक मॉडल से जुड़ रहा है',

  // Masthead & Identity
  'MOIL LIMITED': 'मॉयल लिमिटेड',
  '(A Government of India Enterprise)': '(भारत सरकार का उपक्रम)',
  'ANVESHA': 'अन्वेषा',
  'Mining Exploration & Production AI': 'खनन अन्वेषण और उत्पादन एआई',
  'Skip To Main Content': 'मुख्य सामग्री पर जाएं',
  'Skip to main content': 'मुख्य सामग्री पर जाएं',
  'Screen Reader Access': 'स्क्रीन रीडर एक्सेस',

  // Navigation Items
  'Dashboard': 'डैशबोर्ड',
  'Exploration': 'अन्वेषण',
  'Production Intelligence': 'उत्पादन आसूचना',
  'What-If Simulation': 'क्या-अगर सिमुलेशन',
  'Decision Center': 'निर्णय केंद्र',
  'Data Sources': 'डेटा स्रोत',
  'Model Registry': 'मॉडल रजिस्ट्री',
  'Reports & Audit': 'रिपोर्ट और ऑडिट',
  'Simulation': 'सिमुलेशन',
  'Reviewer (MOIL)': 'समीक्षक (मॉयल)',
  '4 Alerts': '4 अलर्ट',
  'Home': 'होम',

  // Tabs Across Pages
  'Spatial & Borehole Map': 'स्थानिक एवं बोरहोल मानचित्र',
  '3D Orebody Model': '3डी अयस्क भंडार मॉडल',
  'Active Drilling (BO)': 'सक्रिय ड्रिलिंग (बीओ)',
  'Uncertainty Engine': 'अनिश्चितता इंजन',
  '14-Day Production Forecast': '14-दिवसीय उत्पादन पूर्वानुमान',
  'HEMM Equipment Telemetry': 'एचईएमएम उपकरण टेलीमेट्री',
  'Blast Recovery & Fragmentation': 'ब्लास्ट रिकवरी एवं विखंडन',
  'All 9 Mines (Sausar Belt Arc)': 'सभी 9 खदानें (सौसर बेल्ट)',
  'All 9 MOIL Mines (Sausar Belt Regional Arc — Maharashtra & Madhya Pradesh)':
    'सभी 9 मॉयल खदानें (सौसर बेल्ट क्षेत्रीय चाप — महाराष्ट्र एवं मध्य प्रदेश)',

  // Mines and Clusters
  'All Clusters (Maharashtra & Madhya Pradesh)': 'सभी क्लस्टर (महाराष्ट्र एवं मध्य प्रदेश)',
  'Nagpur Cluster (Munsar, Kandri, Gumgaon, Parsioni)': 'नागपुर क्लस्टर (मुनसर, कांद्री, गुमगांव, पारशिवनी)',
  'Bhandara Cluster (Dongri Buzurg, Chikla)': 'भंडारा क्लस्टर (डोंगरी बुजुर्ग, चिकला)',
  'Balaghat Cluster (Balaghat, Sitapatore, Tirodi)': 'बालाघाट क्लस्टर (बालाघाट, सीतापातोरे, तिरोड़ी)',
  'Dongri Buzurg': 'डोंगरी बुजुर्ग',
  'Balaghat': 'बालाघाट',
  'Chikla': 'चिकला',
  'Munsar': 'मुनसर',
  'Kandri': 'कांद्री',
  'Gumgaon': 'गुमगांव',
  'Parsioni': 'पारशिवनी',
  'Sitapatore': 'सीतापातोरे',
  'Tirodi': 'तिरोड़ी',
  'Maharashtra': 'महाराष्ट्र',
  'Madhya Pradesh': 'मध्य प्रदेश',
  'Mining Cluster:': 'खनन क्लस्टर:',
  'Active Lease:': 'सक्रिय पट्टा:',
  'Active Mines:': 'सक्रिय खदानें:',
  'Mines with Shortfall Risk:': 'कमी के जोखिम वाली खदानें:',

  // KPI Metrics & Labels
  'Total Inferred Reserves': 'कुल अनुमानित भंडार',
  'Across operational blocks': 'परिचालन ब्लॉकों में',
  'Monthly Production': 'मासिक उत्पादन',
  'below target': 'लक्ष्य से कम',
  'Active Alerts': 'सक्रिय अलर्ट',
  'sites requiring operational review': 'साइटों को परिचालन समीक्षा की आवश्यकता है',
  'Fleet Availability': 'बेड़े की उपलब्धता',
  'Above baseline threshold (75%)': 'आधार रेखा सीमा (75%) से ऊपर',
  'Average Ore Grade': 'औसत अयस्क ग्रेड',
  'Run-of-mine Mn concentration': 'खनन अयस्क एमएन सांद्रता',
  '9 Active Leases': '9 सक्रिय पट्टे',
  'Unit: Tonnes / Month': 'इकाई: टन / माह',

  // Buttons & Actions
  'Explore Map': 'मानचित्र देखें',
  'Review Actions': 'कार्रवाई की समीक्षा करें',
  'View What-If Simulator': 'क्या-अगर सिमुलेटर देखें',
  'Full Exploration Map': 'पूर्ण अन्वेषण मानचित्र',
  'Export PDF Report': 'पीडीएफ रिपोर्ट निर्यात करें',
  'Export PDF': 'पीडीएफ निर्यात करें',
  'Download Report': 'रिपोर्ट डाउनलोड करें',
  'Download CSV': 'सीएसवी डाउनलोड करें',
  'Generate Report': 'रिपोर्ट बनाएं',
  'Review': 'समीक्षा करें',
  'Approved': 'स्वीकृत',
  'Rejected': 'अस्वीकृत',
  'Pending Review': 'समीक्षा लंबित',
  'Run Simulation': 'सिमुलेशन चलाएं',
  'Reset Parameters': 'पैरामीटर रीसेट करें',
  'Apply Recommendation': 'सिफारिश लागू करें',
  'Search': 'खोजें',
  'Filter': 'फ़िल्टर',
  'Close': 'बंद करें',
  'Save': 'सहेजें',
  'Cancel': 'रद्द करें',

  // Table Headers
  'Risk Level': 'जोखिम स्तर',
  'Mine Site': 'खदान स्थल',
  'Alert Description': 'चेतावनी विवरण',
  'Target Horizon': 'लक्ष्य क्षितिज',
  'Reported On': 'दर्ज तिथि',
  'Action': 'कार्रवाई',
  'Actions': 'कार्रवाइयां',
  'Source ID': 'स्रोत आईडी',
  'Source Name': 'स्रोत का नाम',
  'Data Type': 'डेटा प्रकार',
  'Resolution': 'रिज़ॉल्यूशन',
  'Coverage Area': 'कवरेज क्षेत्र',
  'Quality Score': 'गुणवत्ता स्कोर',
  'Last Sync': 'अंतिम समन्वय',
  'Status': 'स्थिति',
  'Model ID': 'मॉडल आईडी',
  'Model Type': 'मॉडल प्रकार',
  'Algorithm': 'एल्गोरिदम',
  'Target Metric': 'लक्ष्य मीट्रिक',
  'Accuracy': 'सटीकता',
  'Drift': 'ड्रिफ्ट',
  'Event / Action': 'घटना / कार्रवाई',
  'Officer / System': 'अधिकारी / सिस्टम',
  'Timestamp': 'समय',
  'Verification Hash': 'सत्यापन हैश',

  // Statuses & Risk Badges
  'critical': 'गंभीर',
  'Critical': 'गंभीर',
  'high': 'उच्च',
  'High': 'उच्च',
  'medium': 'मध्यम',
  'Medium': 'मध्यम',
  'low': 'निम्न',
  'Low': 'निम्न',
  'operational': 'परिचालन में',
  'Operational': 'परिचालन में',
  'healthy': 'सामान्य',
  'Healthy': 'सामान्य',
  'degraded': 'ह्रासित',
  'Degraded': 'ह्रासित',
  'active': 'सक्रिय',
  'Active': 'सक्रिय',
  'idle': 'निष्क्रिय',
  'Idle': 'निष्क्रिय',
  'maintenance': 'रखरखाव',
  'Maintenance': 'रखरखाव',
  'breakdown': 'ब्रेकडाउन',
  'Breakdown': 'ब्रेकडाउन',

  // Geological Terms
  'Borehole Database': 'बोरहोल डेटाबेस',
  'Borehole Core Drill Logs & Chemical Assays': 'बोरहोल कोर ड्रिल लॉग एवं रासायनिक परख',
  'Estimated Tonnage': 'अनुमानित टन भार',
  'Confidence Score': 'विश्वास स्तर',
  'Target Depth': 'लक्ष्य गहराई',
  'Collar Elevation': 'कॉलर ऊंचाई',
  'Overburden': 'ओवरबर्डन',
  'Quartzite': 'क्वार्ट्जाइट',
  'Schist': 'शिस्ट',
  'Marble': 'संगमरमर',
  'Gondite': 'गोंडाइट',
  'Pelite': 'पेलाइट',
  'Reef': 'रीफ',

  // Footer Content
  'ANVESHA — Mining Decision Support System': 'अन्वेषा — खनन निर्णय समर्थन प्रणाली',
  'Operational Notice': 'परिचालन सूचना',
  'Ministry of Steel • MOIL Limited • ANVESHA': 'इस्पात मंत्रालय • मॉयल लिमिटेड • अन्वेषा',
  'WCAG 2.1 AA Target': 'डब्ल्यूसीएजी 2.1 एए मानक',
  'System Status: Healthy': 'सिस्टम स्थिति: सामान्य',
  'Version 3.0-gov • Deterministic Demo Engine': 'संस्करण 3.0-शासकीय • डेमो इंजन',
};

// Sort entries by length descending so multi-word compounds match first
const SORTED_REPLACEMENTS: [string, string][] = Object.entries(MASTER_DICTIONARY).sort(
  (a, b) => b[0].length - a[0].length
);

// Map to store original text for any DOM text node that was translated
const originalNodeMap = new WeakMap<Node, string>();

function translateString(input: string): string {
  if (!input || !input.trim()) return input;
  let result = input;
  for (const [english, hindi] of SORTED_REPLACEMENTS) {
    if (result.includes(english)) {
      result = result.split(english).join(hindi);
    }
  }
  return result;
}

function processTextNode(node: Node, lang: Language) {
  if (node.nodeType !== Node.TEXT_NODE) return;

  // Skip script, style, code blocks, pre tags
  const parent = node.parentElement;
  if (!parent) return;
  const tagName = parent.tagName.toLowerCase();
  if (tagName === 'script' || tagName === 'style' || tagName === 'code' || tagName === 'pre') {
    return;
  }

  const currentVal = node.nodeValue || '';
  if (!currentVal.trim()) return;

  if (lang === 'hi') {
    // Save original if not saved yet
    if (!originalNodeMap.has(node)) {
      originalNodeMap.set(node, currentVal);
    }
    const orig = originalNodeMap.get(node) || currentVal;
    const translated = translateString(orig);
    if (translated !== currentVal) {
      node.nodeValue = translated;
    }
  } else {
    // English mode: restore original text if it was modified
    if (originalNodeMap.has(node)) {
      const orig = originalNodeMap.get(node);
      if (orig !== undefined && node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
      originalNodeMap.delete(node);
    }
  }
}

function walkAndTranslate(root: Node, lang: Language) {
  if (root.nodeType === Node.TEXT_NODE) {
    processTextNode(root, lang);
    return;
  }

  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
  let currentNode = walker.nextNode();
  while (currentNode) {
    processTextNode(currentNode, lang);
    currentNode = walker.nextNode();
  }
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isHindi: false,
});

const STORAGE_KEY = 'moil-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default is strictly English ('en')
  const [language, setLanguageState] = useState<Language>('en');
  const observerRef = useRef<MutationObserver | null>(null);

  // Initialize from storage or default to 'en'
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      const initialLang: Language = stored === 'hi' ? 'hi' : 'en';
      setLanguageState(initialLang);
      document.documentElement.lang = initialLang;
      document.documentElement.setAttribute('data-lang', initialLang);
    }
  }, []);

  // Run translation engine across the entire DOM whenever language or pages change
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Apply immediate translation to entire document body
    walkAndTranslate(document.body, language);

    // Set up MutationObserver to translate dynamically rendered content (Next.js route changes, modals, data fetch)
    if (language === 'hi') {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const observer = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              walkAndTranslate(node, 'hi');
            });
          } else if (mutation.type === 'characterData') {
            if (mutation.target) {
              processTextNode(mutation.target, 'hi');
            }
          }
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        characterData: true,
      });

      observerRef.current = observer;
    } else {
      // If language switched back to 'en', disconnect observer and restore all text nodes
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      walkAndTranslate(document.body, 'en');
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    }
  };

  const toggleLanguage = () => {
    const next: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(next);
  };

  const t = (key: string, fallback?: string): string => {
    if (language === 'hi') {
      if (MASTER_DICTIONARY[key]) return MASTER_DICTIONARY[key];
      if (fallback && MASTER_DICTIONARY[fallback]) return MASTER_DICTIONARY[fallback];
      return translateString(fallback || key);
    }
    return fallback || key;
  };

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      toggleLanguage,
      t,
      isHindi: language === 'hi',
    }),
    [language]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
