'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';

export type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string, fallback?: string) => string;
  isHindi: boolean;
}

const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Masthead & Accessibility
    'brand.title': 'MOIL LIMITED',
    'brand.subtitle': '(A Government of India Enterprise)',
    'brand.nav_title': 'ANVESHA',
    'brand.nav_subtitle': 'Mining Exploration & Production AI',
    'a11y.skip_to_main': 'Skip to main content',
    'a11y.screen_reader': 'Screen Reader Access',
    'a11y.screen_reader_alert': 'Screen Reader Access Enabled: ANVESHA portal is compliant with GIGW 3.0 and WCAG 2.1 AA standards. All data tables and interactive charts provide semantic headings, ARIA landmarks, and high-contrast labels.',
    'a11y.theme_light': 'Switch to light mode',
    'a11y.theme_dark': 'Switch to dark mode',

    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.exploration': 'Exploration',
    'nav.production': 'Production Intelligence',
    'nav.simulation': 'What-If Simulation',
    'nav.decisions': 'Decision Center',
    'nav.data': 'Data Sources',
    'nav.models': 'Model Registry',
    'nav.reports': 'Reports & Audit',
    'badge.simulation': 'Simulation',
    'badge.reviewer': 'Reviewer (MOIL)',
    'badge.alerts': '4 Alerts',

    // Breadcrumbs
    'bc.home': 'Home',
    'bc.exploration': 'Exploration',
    'bc.reserves': 'Exploration',
    'bc.active': 'Active Exploration',
    'bc.3d': '3D Orebody',
    'bc.boreholes': 'Borehole Database',
    'bc.uncertainty': 'Uncertainty Engine',
    'bc.production': 'Production Intelligence',
    'bc.predictions': 'Shortfall Forecasting',
    'bc.whatif': 'What-If Simulator',
    'bc.decisions': 'Decision Center',
    'bc.recommendations': 'Decision Center',
    'bc.data': 'Data Quality & Registry',
    'bc.models': 'Model Registry & Drift',
    'bc.reports': 'Audit & Reports',

    // Dashboard
    'dashboard.title': 'Operational & Exploration Dashboard',
    'dashboard.subtitle': 'Real-time synthesis of satellite mineral indicators, borehole assay distributions, and fleet telemetry across MOIL Ltd. mining leases.',
    'dashboard.updated': 'Updated: 14 mins ago',
    'dashboard.explore_map': 'Explore Map',
    'dashboard.review_actions': 'Review Actions',
    'dashboard.cluster_label': 'Mining Cluster:',
    'dashboard.cluster_all': 'All Clusters (Maharashtra & Madhya Pradesh)',
    'dashboard.active_mines': 'Active Mines:',
    'dashboard.shortfall_risk_mines': 'Mines with Shortfall Risk:',
    'dashboard.total_reserves': 'Total Inferred Reserves',
    'dashboard.across_blocks': 'Across operational blocks',
    'dashboard.monthly_production': 'Monthly Production',
    'dashboard.below_target': 'below target',
    'dashboard.active_alerts': 'Active Alerts',
    'dashboard.sites_review': 'sites requiring operational review',
    'dashboard.fleet_availability': 'Fleet Availability',
    'dashboard.above_baseline': 'Above baseline threshold (75%)',
    'dashboard.avg_ore_grade': 'Average Ore Grade',
    'dashboard.run_of_mine': 'Run-of-mine Mn concentration',
    'dashboard.map_title': 'Geospatial Lease Overview & Alert Zones',
    'dashboard.map_subtitle': 'Interactive spatial distribution of MOIL mining leases with real-time risk indicators and borehole clusters.',
    'dashboard.trend_title': 'Production vs Target Trend (12 Months)',
    'dashboard.trend_subtitle': 'Monthly run-of-mine extraction against ministry targets with variance and shortfall analysis.',
    'dashboard.recent_alerts_title': 'Recent Operational Alerts',
    'dashboard.recent_alerts_subtitle': 'Machine learning detected risks requiring technical and dispatch intervention.',
    'dashboard.loading_title': 'Loading ANVESHA Mining Intelligence...',
    'dashboard.loading_desc': 'Connecting to operational telemetry and geological models',

    // Exploration Page
    'exploration.title': 'Exploration & 3D Orebody Intelligence',
    'exploration.subtitle': 'Uncertainty-guided borehole drilling optimization, satellite mineral prospectivity, and subsurface grade kriging.',
    'exploration.tab_spatial': 'Spatial & Borehole Map',
    'exploration.tab_3d': '3D Orebody Model',
    'exploration.tab_active': 'Active Drilling (BO)',
    'exploration.tab_uncertainty': 'Uncertainty Engine',

    // Production Page
    'production.title': 'Production Shortfall & Fleet Telemetry',
    'production.subtitle': 'Predictive shortfall intelligence, heavy equipment breakdown telemetry, and blast recovery forecasts.',
    'production.tab_forecast': '14-Day Production Forecast',
    'production.tab_telemetry': 'HEMM Equipment Telemetry',
    'production.tab_blasting': 'Blast Recovery & Fragmentation',

    // Simulation Page
    'simulation.title': 'What-If Scenario Simulator',
    'simulation.subtitle': 'Monte Carlo & discrete-event simulation of rainfall events, equipment outages, and dynamic blending.',

    // Decisions Page
    'decisions.title': 'AI Decision Center & Recommendations',
    'decisions.subtitle': 'Actionable operational mitigations, dispatch re-routing, and blend optimization with human-in-the-loop review.',

    // Data Page
    'data.title': 'Data Sources & Quality Pipeline',
    'data.subtitle': 'Health status of telemetry streams, borehole assays, GEE satellite rasters, and legacy ERP data.',

    // Models Page
    'models.title': 'Model Registry & Drift Monitoring',
    'models.subtitle': 'MLOps tracking for XGBoost, Random Forest, Kriging models, and real-time concept drift detection.',

    // Reports Page
    'reports.title': 'Reports & Regulatory Audit Trail',
    'reports.subtitle': 'Generate GIGW-compliant compliance documentation, production summaries, and export audit trails.',
    'reports.btn_export': 'Export PDF Report',

    // Footer
    'footer.title': 'ANVESHA — Mining Decision Support System',
    'footer.desc': 'Uncertainty-Aware Geospatial AI for Manganese Exploration & Operational Shortfall Intelligence. Built in accordance with Government of India UX4G Design System 3.0 guidelines.',
    'footer.notice_title': 'Operational Notice',
    'footer.notice_desc': 'Satellite remote sensing delivers surface geological indicators to support inferred subsurface models. Underground manganese reserve calculations must be validated by core borehole assay logs.',
    'footer.copy': 'Ministry of Steel • MOIL Limited • ANVESHA',
    'footer.wcag': 'WCAG 2.1 AA Target',
    'footer.status': 'System Status: Healthy',
    'footer.version': 'Version 3.0-gov • Deterministic Demo Engine',

    // Common Buttons & Labels
    'common.export_pdf': 'Export PDF',
    'common.download': 'Download',
    'common.filter': 'Filter',
    'common.refresh': 'Refresh',
    'common.view': 'View',
    'common.status': 'Status',
    'common.risk': 'Risk Level',
    'common.confidence': 'Confidence',
    'common.high': 'High',
    'common.medium': 'Medium',
    'common.low': 'Low',
    'common.critical': 'Critical',
    'common.metric_tonnes': 'MT',
    'common.all': 'All',
  },
  hi: {
    // Masthead & Accessibility
    'brand.title': 'मॉयल लिमिटेड',
    'brand.subtitle': '(भारत सरकार का उपक्रम)',
    'brand.nav_title': 'अन्वेषा',
    'brand.nav_subtitle': 'खनन अन्वेषण और उत्पादन एआई',
    'a11y.skip_to_main': 'मुख्य सामग्री पर जाएं',
    'a11y.screen_reader': 'स्क्रीन रीडर एक्सेस',
    'a11y.screen_reader_alert': 'स्क्रीन रीडर एक्सेस सक्षम: अन्वेषा पोर्टल जीआईजीडब्ल्यू 3.0 और डब्ल्यूसीएजी 2.1 एए मानकों के अनुरूप है। सभी डेटा तालिकाएं और इंटरैक्टिव चार्ट अर्थपूर्ण शीर्षक, एआरआईए लैंडमार्क और उच्च-विपरीत लेबल प्रदान करते हैं।',
    'a11y.theme_light': 'लाइट मोड में बदलें',
    'a11y.theme_dark': 'डार्क मोड में बदलें',

    // Navigation
    'nav.dashboard': 'डैशबोर्ड',
    'nav.exploration': 'अन्वेषण',
    'nav.production': 'उत्पादन आसूचना',
    'nav.simulation': 'क्या-अगर सिमुलेशन',
    'nav.decisions': 'निर्णय केंद्र',
    'nav.data': 'डेटा स्रोत',
    'nav.models': 'मॉडल रजिस्ट्री',
    'nav.reports': 'रिपोर्ट और ऑडिट',
    'badge.simulation': 'सिमुलेशन',
    'badge.reviewer': 'समीक्षक (मॉयल)',
    'badge.alerts': '4 अलर्ट',

    // Breadcrumbs
    'bc.home': 'होम',
    'bc.exploration': 'अन्वेषण',
    'bc.reserves': 'अन्वेषण',
    'bc.active': 'सक्रिय अन्वेषण',
    'bc.3d': '3डी अयस्क मॉडल',
    'bc.boreholes': 'बोरहोल डेटाबेस',
    'bc.uncertainty': 'अनिश्चितता इंजन',
    'bc.production': 'उत्पादन आसूचना',
    'bc.predictions': 'उत्पादन पूर्वानुमान',
    'bc.whatif': 'क्या-अगर सिमुलेटर',
    'bc.decisions': 'निर्णय केंद्र',
    'bc.recommendations': 'निर्णय केंद्र',
    'bc.data': 'डेटा गुणवत्ता व रजिस्ट्री',
    'bc.models': 'मॉडल रजिस्ट्री व ड्रिफ्ट',
    'bc.reports': 'ऑडिट और रिपोर्ट',

    // Dashboard
    'dashboard.title': 'परिचालन एवं अन्वेषण डैशबोर्ड',
    'dashboard.subtitle': 'मॉयल लिमिटेड खनन पट्टों में उपग्रह खनिज संकेतकों, बोरहोल परख वितरण और बेड़े टेलीमेट्री का वास्तविक समय विश्लेषण।',
    'dashboard.updated': 'अद्यतन: 14 मिनट पहले',
    'dashboard.explore_map': 'मानचित्र देखें',
    'dashboard.review_actions': 'कार्रवाई की समीक्षा करें',
    'dashboard.cluster_label': 'खनन क्लस्टर:',
    'dashboard.cluster_all': 'सभी क्लस्टर (महाराष्ट्र एवं मध्य प्रदेश)',
    'dashboard.active_mines': 'सक्रिय खदानें:',
    'dashboard.shortfall_risk_mines': 'कमी के जोखिम वाली खदानें:',
    'dashboard.total_reserves': 'कुल अनुमानित भंडार',
    'dashboard.across_blocks': 'परिचालन ब्लॉकों में',
    'dashboard.monthly_production': 'मासिक उत्पादन',
    'dashboard.below_target': 'लक्ष्य से कम',
    'dashboard.active_alerts': 'सक्रिय अलर्ट',
    'dashboard.sites_review': 'साइटों को परिचालन समीक्षा की आवश्यकता है',
    'dashboard.fleet_availability': 'बेड़े की उपलब्धता',
    'dashboard.above_baseline': 'आधार रेखा सीमा (75%) से ऊपर',
    'dashboard.avg_ore_grade': 'औसत अयस्क ग्रेड',
    'dashboard.run_of_mine': 'खनन अयस्क एमएन सांद्रता',
    'dashboard.map_title': 'भू-स्थानिक पट्टा अवलोकन एवं चेतावनी क्षेत्र',
    'dashboard.map_subtitle': 'वास्तविक समय जोखिम संकेतकों और बोरहोल क्लस्टर के साथ मॉयल खनन पट्टों का इंटरैक्टिव स्थानिक वितरण।',
    'dashboard.trend_title': 'उत्पादन बनाम लक्ष्य रुझान (12 महीने)',
    'dashboard.trend_subtitle': 'अंतर और कमी विश्लेषण के साथ मंत्रालय के लक्ष्यों के विरुद्ध मासिक खनन उत्पादन।',
    'dashboard.recent_alerts_title': 'हाल के परिचालन अलर्ट',
    'dashboard.recent_alerts_subtitle': 'मशीन लर्निंग द्वारा पाए गए जोखिम जिन्हें तकनीकी और डिस्पैच हस्तक्षेप की आवश्यकता है।',
    'dashboard.loading_title': 'अन्वेषा खनन आसूचना लोड हो रही है...',
    'dashboard.loading_desc': 'परिचालन टेलीमेट्री और भूवैज्ञानिक मॉडल से जुड़ रहा है',

    // Exploration Page
    'exploration.title': 'अन्वेषण एवं 3डी अयस्क मॉडल आसूचना',
    'exploration.subtitle': 'अनिश्चितता-निर्देशित बोरहोल ड्रिलिंग अनुकूलन, उपग्रह खनिज पूर्वेक्षण और उपसतह ग्रेड क्रिगिंग।',
    'exploration.tab_spatial': 'स्थानिक एवं बोरहोल मानचित्र',
    'exploration.tab_3d': '3डी अयस्क भंडार मॉडल',
    'exploration.tab_active': 'सक्रिय ड्रिलिंग (बीओ)',
    'exploration.tab_uncertainty': 'अनिश्चितता इंजन',

    // Production Page
    'production.title': 'उत्पादन कमी एवं भारी उपकरण टेलीमेट्री',
    'production.subtitle': 'पूर्वानुमानित कमी आसूचना, भारी उपकरण (एचईएमएम) ब्रेकडाउन टेलीमेट्री, और ब्लास्ट रिकवरी पूर्वानुमान।',
    'production.tab_forecast': '14-दिवसीय उत्पादन पूर्वानुमान',
    'production.tab_telemetry': 'एचईएमएम उपकरण टेलीमेट्री',
    'production.tab_blasting': 'ब्लास्ट रिकवरी और विखंडन',

    // Simulation Page
    'simulation.title': 'क्या-अगर परिदृश्य सिमुलेटर',
    'simulation.subtitle': 'भारी वर्षा की घटनाओं, उपकरण विफलताओं और गतिशील सम्मिश्रण का मोंटे कार्लो एवं असतत-घटना सिमुलेशन।',

    // Decisions Page
    'decisions.title': 'एआई निर्णय केंद्र और सिफ़ारिशें',
    'decisions.subtitle': 'मानवीय समीक्षा के साथ व्यावहारिक परिचालन शमन, डिस्पैच पुनर्मार्गन और सम्मिश्रण अनुकूलन।',

    // Data Page
    'data.title': 'डेटा स्रोत और गुणवत्ता पाइपलाइन',
    'data.subtitle': 'टेलीमेट्री धाराओं, बोरहोल परख, जीईई उपग्रह रास्टर और ईआरपी डेटा की स्वास्थ्य स्थिति।',

    // Models Page
    'models.title': 'मॉडल रजिस्ट्री और ड्रिफ्ट निगरानी',
    'models.subtitle': 'एक्सजीबूस्ट, रैंडम फ़ॉरेस्ट, क्रिगिंग मॉडल के लिए एमएलऑप्स ट्रैकिंग और वास्तविक समय अवधारणा ड्रिफ्ट का पता लगाना।',

    // Reports Page
    'reports.title': 'रिपोर्ट और विनियामक ऑडिट ट्रेल',
    'reports.subtitle': 'जीआईजीडब्ल्यू-अनुरूप अनुपालन दस्तावेज, उत्पादन सारांश तैयार करें और ऑडिट ट्रेल निर्यात करें।',
    'reports.btn_export': 'पीडीएफ रिपोर्ट निर्यात करें',

    // Footer
    'footer.title': 'अन्वेषा — खनन निर्णय समर्थन प्रणाली',
    'footer.desc': 'मैंगनीज अन्वेषण और परिचालन कमी आसूचना के लिए अनिश्चितता-जागरूक भू-स्थानिक एआई। भारत सरकार के यूएक्स4जी डिजाइन सिस्टम 3.0 दिशानिर्देशों के अनुसार निर्मित।',
    'footer.notice_title': 'परिचालन सूचना',
    'footer.notice_desc': 'उपग्रह रिमोट सेंसिंग अनुमानित उपसतह मॉडल का समर्थन करने के लिए सतह भूवैज्ञानिक संकेतक प्रदान करता है। भूमिगत मैंगनीज भंडार गणना को कोर बोरहोल परख लॉग द्वारा मान्य किया जाना चाहिए।',
    'footer.copy': 'इस्पात मंत्रालय • मॉयल लिमिटेड • अन्वेषा',
    'footer.wcag': 'डब्ल्यूसीएजी 2.1 एए मानक',
    'footer.status': 'सिस्टम स्थिति: सामान्य',
    'footer.version': 'संस्करण 3.0-शासकीय • डेमो इंजन',

    // Common Buttons & Labels
    'common.export_pdf': 'पीडीएफ निर्यात करें',
    'common.download': 'डाउनलोड करें',
    'common.filter': 'फ़िल्टर',
    'common.refresh': 'रीफ़्रेश करें',
    'common.view': 'देखें',
    'common.status': 'स्थिति',
    'common.risk': 'जोखिम स्तर',
    'common.confidence': 'विश्वास',
    'common.high': 'उच्च',
    'common.medium': 'मध्यम',
    'common.low': 'निम्न',
    'common.critical': 'गंभीर',
    'common.metric_tonnes': 'मीट्रिक टन',
    'common.all': 'सभी',
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  t: (key: string, fallback?: string) => fallback || key,
  isHindi: false,
});

const STORAGE_KEY = 'moil-lang';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  // Default language is strictly 'en' as requested
  const [language, setLanguageState] = useState<Language>('en');

  // Hydrate from localStorage once mounted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored === 'en' || stored === 'hi') {
        setLanguageState(stored);
        document.documentElement.lang = stored;
        document.documentElement.setAttribute('data-lang', stored);
      } else {
        // default to english
        setLanguageState('en');
        document.documentElement.lang = 'en';
        document.documentElement.setAttribute('data-lang', 'en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, lang);
      document.documentElement.lang = lang;
      document.documentElement.setAttribute('data-lang', lang);
    }
  };

  const toggleLanguage = () => {
    const nextLang: Language = language === 'en' ? 'hi' : 'en';
    setLanguage(nextLang);
  };

  const t = (key: string, fallback?: string): string => {
    const currentDict = TRANSLATIONS[language];
    if (currentDict && currentDict[key]) {
      return currentDict[key];
    }
    // Fallback to English dictionary if key missing in current language
    const fallbackDict = TRANSLATIONS.en;
    if (fallbackDict && fallbackDict[key]) {
      return fallbackDict[key];
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
