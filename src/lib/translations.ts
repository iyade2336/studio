
export const translations = {
  en: {
    dashboard: {
      welcome: "Welcome",
      guest: "Guest",
      currentPlan: "You are currently on the",
      noPlan: "No Plan",
      loginPrompt: "Please log in or register to manage your devices.",
      loading: "Loading Dashboard...",
      activeAlerts: (count: number) => `Active Alert${count > 1 ? 's' : ''}`,
      attentionNeeded: "Some of your devices require attention. Please check their status below.",
      viewAlerts: "View Alerts",
      realtimeDataTitle: "Real-time Sensor Data & AI Analysis",
      quickActions: "Quick Actions",
      aiTroubleshooter: "AI Troubleshooter",
      viewCommonIssues: "View Common Issues",
      manageSubscription: "Manage Subscription",
      needHelp: "Need help?",
      needHelpDescription: "If you're experiencing issues or have questions, our AI assistant can help, or you can browse common solutions.",
      askAiAssistant: "Ask AI Assistant"
    },
    aiAnalysis: {
        title: "Automatic AI Analysis",
        description: "AI is analyzing the sensor data for potential issues.",
        thinking: "AI is thinking...",
        problem: "Problem Identification:",
        solutions: "Suggested Solutions:",
        disclaimer: "Disclaimer: This AI-generated advice is for informational purposes only. Always ensure safety when working with electronic devices."
    }
  },
  ar: {
    dashboard: {
      welcome: "أهلاً بك",
      guest: "زائر",
      currentPlan: "أنت حاليًا مشترك في باقة",
      noPlan: "بدون باقة",
      loginPrompt: "يرجى تسجيل الدخول أو التسجيل لإدارة أجهزتك.",
      loading: "جاري تحميل لوحة التحكم...",
      activeAlerts: (count: number) => `تنبيه${count > 1 ? 'ات' : ''} نشطة`,
      attentionNeeded: "بعض أجهزتك تتطلب الانتباه. يرجى التحقق من حالتها أدناه.",
      viewAlerts: "عرض التنبيهات",
      realtimeDataTitle: "بيانات الحساسات الفورية وتحليل الذكاء الاصطناعي",
      quickActions: "إجراءات سريعة",
      aiTroubleshooter: "مستكشف الأخطاء بالذكاء الاصطناعي",
      viewCommonIssues: "عرض المشاكل الشائعة",
      manageSubscription: "إدارة الاشتراك",
      needHelp: "هل تحتاج إلى مساعدة؟",
      needHelpDescription: "إذا كنت تواجه مشاكل أو لديك أسئلة، يمكن لمساعدنا الذكي المساعدة، أو يمكنك تصفح الحلول الشائعة.",
      askAiAssistant: "اسأل المساعد الذكي"
    },
     aiAnalysis: {
        title: "تحليل تلقائي بالذكاء الاصطناعي",
        description: "يقوم الذكاء الاصطناعي بتحليل بيانات المستشعر بحثًا عن المشكلات المحتملة.",
        thinking: "الذكاء الاصطناعي يفكر ...",
        problem: "تحديد المشكلة:",
        solutions: "الحلول المقترحة:",
        disclaimer: "إخلاء مسؤولية: هذه النصيحة التي تم إنشاؤها بواسطة الذكاء الاصطناعي هي لأغراض إعلامية فقط. تأكد دائمًا من السلامة عند التعامل مع الأجهزة الإلكترونية."
    }
  },
  fr: {
    dashboard: {
      welcome: "Bienvenue",
      guest: "Invité",
      currentPlan: "Vous êtes actuellement sur le forfait",
      noPlan: "Aucun forfait",
      loginPrompt: "Veuillez vous connecter ou vous inscrire pour gérer vos appareils.",
      loading: "Chargement du tableau de bord...",
      activeAlerts: (count: number) => `Alerte${count > 1 ? 's' : ''} active${count > 1 ? 's' : ''}`,
      attentionNeeded: "Certains de vos appareils nécessitent une attention particulière. Veuillez vérifier leur statut ci-dessous.",
      viewAlerts: "Voir les alertes",
      realtimeDataTitle: "Données des capteurs en temps réel et analyse IA",
      quickActions: "Actions rapides",
      aiTroubleshooter: "Dépannage par IA",
      viewCommonIssues: "Voir les problèmes courants",
      manageSubscription: "Gérer l'abonnement",
      needHelp: "Besoin d'aide ?",
      needHelpDescription: "Si vous rencontrez des problèmes ou avez des questions, notre assistant IA peut vous aider, ou vous pouvez parcourir les solutions courantes.",
      askAiAssistant: "Demander à l'assistant IA"
    },
     aiAnalysis: {
        title: "Analyse IA automatique",
        description: "L'IA analyse les données des capteurs pour détecter les problèmes potentiels.",
        thinking: "L'IA réfléchit...",
        problem: "Identification du problème:",
        solutions: "Solutions suggérées:",
        disclaimer: "Avis de non-responsabilité : ces conseils générés par l'IA sont uniquement à des fins d'information. Assurez-vous toujours de la sécurité lorsque vous travaillez avec des appareils électroniques."
    }
  }
};
