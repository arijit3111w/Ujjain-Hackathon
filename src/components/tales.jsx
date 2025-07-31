import React, { useState } from 'react';

const talesData = [
  {
    title: {
      en: 'The Origin of Kumbh Mela',
      hi: 'कुंभ मेले की उत्पत्ति',
      ta: 'கும்ப்மேளாவின் தோற்றம்',
      te: 'కుంభ్ మేళా ఉద్భవం'
    },
    summary: 'Read time: 3 min',
    content: {
      en: 'Once upon a time, Kumbh Mela emerged from the sacred churning of the ocean. The gods and demons fought over the nectar of immortality, and drops of it fell at four holy locations—one of which was Ujjain.',
      hi: 'कुंभ मेला समुद्र मंथन की पवित्र कथा से उत्पन्न हुआ। देवताओं और असुरों ने अमृत के लिए संघर्ष किया, जिसकी कुछ बूंदें उज्जैन सहित चार पवित्र स्थानों पर गिरीं।',
      ta: 'கும்ப்மேளா கடல் கடையலில் இருந்து தோன்றியது. தேவர்கள் மற்றும் அசுரர்கள் அமிர்தத்திற்காக போராடினர், அதன் சில துளிகள் உஜ்ஜைனில் உள்பட நான்கு புனித இடங்களில் விழுந்தன.',
      te: 'కుంభ్ మేళా సముద్ర మథనం కథ నుండి ఉద్భవించింది. దేవతలు మరియు రాక్షసులు అమృతాన్ని కోసం పోరాడారు, దాని కొన్ని బిందువులు ఉజ్జయిన్లో సహా నాలుగు పవిత్ర స్థలాల్లో పడ్డాయి.'
    },
    image: '/images/kumbh.jpg',
  },
  {
    title: {
      en: 'Guardian of Ujjain',
      hi: 'उज्जैन का संरक्षक',
      ta: 'உஜ்ஜைனின் பாதுகாவலர்',
      te: 'ఉజ్జయిన్కు రక్షకుడు'
    },
    summary: 'Read time: 4 min',
    content: {
      en: 'In the heart of Ujjain lies Mahakaleshwar, a revered Jyotirlinga temple where divine power is believed to protect the city. Pilgrims travel from distant lands to feel its timeless energy and seek sacred blessings.',
      hi: 'उज्जैन के केंद्र में महाकालेश्वर है, एक पूजनीय ज्योतिर्लिंग मंदिर जहाँ दिव्य शक्ति शहर की रक्षा करती है। श्रद्धालु दूर-दूर से इसकी शाश्वत ऊर्जा का अनुभव करने और आशीर्वाद पाने आते हैं।',
      ta: 'உஜ்ஜைனின் இதயத்தில் மகாகாலேஸ்வர், ஒரு மதிப்புமிக்க ஜ்யோதிர்லிங்கா கோவில், நகரத்தை பாதுகாக்கும் தெய்வீக சக்தி. பக்தர்கள் அதன் காலமற்ற ஆற்றலை உணர மற்றும் ஆசீர்வாதம் பெற தொலைதூரங்களில் இருந்து வருகிறார்கள்.',
      te: 'ఉజ్జయిన్లో మహాకాళేశ్వర్, ఒక ప్రముఖ జ్యోతిర్లింగ ఆలయం, నగరాన్ని రక్షించే దైవిక శక్తి. భక్తులు దాని శాశ్వత శక్తిని అనుభవించడానికి మరియు ఆశీర్వాదం పొందడానికి దూర ప్రాంతాల నుండి వస్తారు.'
    },
    image: '/images/mahakaleshwar.png',
  },
  {
    title: {
      en: 'The Royal Bath (Shahi Snan)',
      hi: 'शाही स्नान',
      ta: 'சாஹி ஸ்நானம்',
      te: 'శాహీ స్నానం'
    },
    summary: 'Read time: 2 min',
    content: {
      en: 'Millions gather for the Shahi Snan — a grand ceremonial bath led by revered saints and sages. As sacred chants echo through the air, devotees immerse in the holy river, seeking spiritual cleansing and divine grace',
      hi: 'शाही स्नान के लिए लाखों लोग एकत्रित होते हैं — एक भव्य स्नान जिसमें संतों और साधुओं का नेतृत्व होता है। पवित्र मंत्रों की गूंज के बीच, भक्त पवित्र नदी में स्नान कर आध्यात्मिक शुद्धि और दिव्य कृपा प्राप्त करते हैं।',
      ta: 'சாஹி ஸ்நானுக்காக மில்லியன் மக்கள் கூடுகிறார்கள் — மதிப்புமிக்க சாமியார்கள் மற்றும் முனிவர்களால் நடத்தப்படும் ஒரு பெரிய சடங்கு. புனித நதியில் மூழ்கி, பக்தர்கள் ஆன்மீக தூய்மை மற்றும் தெய்வீக கிருபையை நாடுகிறார்கள்.',
      te: 'శాహీ స్నానానికి లక్షలాది మంది చేరుకుంటారు — ప్రముఖ సన్యాసులు మరియు మునులు నేతృత్వం వహించే గొప్ప స్నానం. పవిత్ర నదిలో మునిగి, భక్తులు ఆధ్యాత్మిక శుద్ధి మరియు దైవిక కృపను కోరుకుంటారు.'
    },
    image: '/images/kumbh1.png',
  },
  {
    title: {
      en: 'Saints and Akharas',
      hi: 'संत और अखाड़े',
      ta: 'சாமியார்கள் மற்றும் அகாரா',
      te: 'సన్యాసులు మరియు అఖారాలు'
    },
    summary: 'Read time: 3 min',
    content: {
      en: 'Akhara saints carry centuries-old traditions with deep spiritual roots. Their captivating stories, sacred rituals, and vibrant appearances bring a mystical energy to Mahakumbh that continues to fascinate every devoted pilgrim.',
      hi: 'अखाड़ा संत सदियों पुरानी परंपराओं और गहरे आध्यात्मिक मूल्यों को संजोए हुए हैं। उनकी आकर्षक कथाएँ, पवित्र अनुष्ठान और जीवंत उपस्थिति महाकुंभ में एक रहस्यमयी ऊर्जा लाती है।',
      ta: 'அகாரா சாமியார்கள் நூற்றாண்டுகளாக பழமைவாய்ந்த ஆன்மீக மரபுகளை கொண்டுள்ளனர். அவர்களின் கதைகள், சடங்குகள் மற்றும் வண்ணமயமான தோற்றங்கள் மகாகும்பில் ஒரு மாயமான ஆற்றலை கொண்டு வருகிறது.',
      te: 'అఖారా సన్యాసులు శతాబ్దాల పురాతన సంప్రదాయాలను, లోతైన ఆధ్యాత్మిక మూలాలను కలిగి ఉంటారు. వారి కథలు, పూజలు మరియు రంగురంగుల రూపాలు మహాకుంభ్‌లో మాయాజాల శక్తిని తీసుకువస్తాయి.'
    },
    image: '/images/swastika.png',
  },
];
const languageOptions = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'te', label: 'తెలుగు' },
];

const Tales = () => {
  const [lang, setLang] = useState('en');

  return (
    <div className="max-w-9xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-bold text-amber-700 mb-10 text-center">
        Echoes of the Divine: Exploring the Heart of Mahakumbh
      </h2>

      <div className="flex flex-wrap justify-center items-center mb-8 gap-3">
        {languageOptions.map((opt) => (
          <button
            key={opt.code}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border-2 border-amber-300 shadow-sm bg-white/90 hover:bg-amber-100 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-amber-400 ${lang === opt.code ? 'bg-amber-300 text-amber-900 border-amber-500' : 'text-amber-700'}`}
            onClick={() => setLang(opt.code)}
            aria-label={opt.label}
          >
            {opt.code === 'en' && <span role="img" aria-label="English">🇬🇧</span>}
            {opt.code === 'hi' && <span role="img" aria-label="Hindi">🇮🇳</span>}
            {opt.code === 'ta' && <span role="img" aria-label="Tamil">🇮🇳</span>}
            {opt.code === 'te' && <span role="img" aria-label="Telugu">🇮🇳</span>}
            <span>{opt.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {talesData.map((tale, idx) => (
          <div
            key={idx}
            className="relative rounded-3xl overflow-hidden shadow-lg group transition-transform duration-300 hover:scale-[1.02] bg-white/80"
          >
            {/* Image with bottom gradient */}
            <div className="relative h-72 sm:h-80">
              <img
                src={tale.image}
                alt={tale.title}
                className="w-full h-full brightness-75 object-cover object-center"
              />
              {/* Gradient for text readability */}
              <div className="absolute inset-x-0 bottom-0 h-32 sm:h-40 z-10" />
            </div>

            {/* Blended Text Over Image Bottom */}
            <div className="absolute top-1/4 left-0 w-full z-20 px-4 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-amber-500 mb-1 drop-shadow text-shadow-lighter">{tale.title[lang]}</h3>
              <p className="text-xs sm:text-sm text-amber-800 leading-relaxed drop-shadow-sm bg-white/90 p-2 sm:p-3 rounded-xl">
                {tale.content[lang]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tales;
