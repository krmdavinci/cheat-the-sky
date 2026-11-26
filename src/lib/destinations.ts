// Static, human-checked guide content for the top 20 destinations (sections 9.4, 10).
// Also the SEO source for /destinations/[slug].
export interface DestinationNote { currency: string; language: string; plugs: string; safety: string; customs: string; transport: string; bestSeason: string; dailyBudget: string; officialLinks: { label: string; url: string }[]; }
export interface DayPlan { day: number; morning: string; afternoon: string; evening: string; tip: string; }
export interface Destination {
  slug: string; iata: string; name: string; nameAr: string; country: string; countryAr: string;
  blurb: string; blurbAr: string;
  highlights: { morning: string[]; afternoon: string[]; evening: string[]; tips: string[] };
  highlightsAr: { morning: string[]; afternoon: string[]; evening: string[]; tips: string[] };
  notes: DestinationNote; notesAr: DestinationNote;
}

const L = (label: string, url: string) => ({ label, url });

export const DESTINATIONS: Destination[] = [
  {
    slug: 'istanbul', iata: 'IST', name: 'Istanbul', nameAr: 'إسطنبول', country: 'Turkey', countryAr: 'تركيا',
    blurb: 'Two continents, bazaars, ferries and endless food.', blurbAr: 'قارتين في مدينة واحدة، بازارات وعبّارات وأكل على الآخر.',
    highlights: {
      morning: ['Hagia Sophia and the Blue Mosque in Sultanahmet', 'Breakfast in Karaköy with a Bosphorus view', 'Topkapi Palace when it opens'],
      afternoon: ['Grand Bazaar and the Spice Market', 'Ferry to Kadıköy on the Asian side', 'Dolmabahçe Palace and a walk in Beşiktaş'],
      evening: ['Sunset from Galata Tower', 'Dinner in a meyhane in Nevizade', 'Walk the Istiklal street and Taksim'],
      tips: ['Get an Istanbulkart for all public transport', 'Ferries are the cheapest Bosphorus cruise', 'Bargaining is expected in the bazaar'],
    },
    highlightsAr: {
      morning: ['آيا صوفيا والجامع الأزرق في السلطان أحمد', 'فطار في كاراكوي على البوسفور', 'قصر توبكابي أول ما يفتح'],
      afternoon: ['السوق الكبير وسوق التوابل', 'عبّارة لكاديكوي في الجانب الآسيوي', 'قصر دولمة بهجة ومشوار في بشكتاش'],
      evening: ['الغروب من برج غالاتا', 'عشا في ميخانة في نفيزاده', 'مشوار في شارع الاستقلال وتقسيم'],
      tips: ['اطلع كارت إسطنبول لكل المواصلات', 'العبّارات أرخص رحلة بوسفور', 'الفصال متوقع في البازار'],
    },
    notes: { currency: 'Turkish Lira (TRY)', language: 'Turkish; English common in tourist areas', plugs: 'Type C/F, 230V', safety: 'Generally safe in tourist areas; watch for pickpockets in crowds', customs: 'Dress modestly in mosques; shoes off at the entrance', transport: 'Metro, tram and ferries with Istanbulkart', bestSeason: 'April-June and September-October', dailyBudget: '$40-90', officialLinks: [L('Turkish Ministry of Foreign Affairs', 'https://www.mfa.gov.tr/'), L('e-Visa Turkey', 'https://www.evisa.gov.tr/')] },
    notesAr: { currency: 'ليرة تركية (TRY)', language: 'تركي؛ الإنجليزية منتشرة في الأماكن السياحية', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة عموماً في المناطق السياحية؛ خد بالك من النشل في الزحمة', customs: 'لبس محتشم في الجوامع؛ الحذاء يتخلع عند الدخول', transport: 'مترو وترام وعبّارات بكارت إسطنبول', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '40-90$', officialLinks: [L('وزارة الخارجية التركية', 'https://www.mfa.gov.tr/'), L('الفيزا الإلكترونية التركية', 'https://www.evisa.gov.tr/')] },
  },
  {
    slug: 'dubai', iata: 'DXB', name: 'Dubai', nameAr: 'دبي', country: 'UAE', countryAr: 'الإمارات',
    blurb: 'Skyline, desert and malls on a grand scale.', blurbAr: 'ناطحات سحاب وصحراء ومولات بمقاسات ضخمة.',
    highlights: {
      morning: ['Old Dubai: Al Fahidi and the abra across the Creek', 'Miracle Garden (winter) or a slow Jumeirah beach morning', 'Museum of the Future right at opening'],
      afternoon: ['Dubai Mall and the Aquarium', 'Desert safari with dune bashing', 'Souk Madinat Jumeirah and the canals'],
      evening: ['Burj Khalifa at sunset, fountain show after', 'Dinner in Dubai Marina', 'Global Village (winter evenings)'],
      tips: ['Metro covers most sights and is air-conditioned', 'Friday brunch is a local institution', 'Beach clubs are cheaper on weekdays'],
    },
    highlightsAr: {
      morning: ['دبي القديمة: الفهيدي والعبرة على الخور', 'حديقة الزهور (في الشتا) أو صبحية هادية على شاطئ جميرا', 'متحف المستقبل أول ما يفتح'],
      afternoon: ['دبي مول والأكواريوم', 'سفاري صحراء مع تطعيس', 'سوق مدينة جميرا والقنوات'],
      evening: ['برج خليفة وقت الغروب وعرض النافورة بعده', 'عشا في دبي مارينا', 'القرية العالمية (ليالي الشتا)'],
      tips: ['المترو بيغطي أغلب المعالم ومكيّف', 'غداء الجمعة عادة محلية', 'الشواطئ الخاصة أرخص في وسط الأسبوع'],
    },
    notes: { currency: 'UAE Dirham (AED)', language: 'Arabic; English everywhere', plugs: 'Type G, 230V', safety: 'Very safe; strict laws, respect local rules', customs: 'Modest dress in malls and public places; no public drunkenness', transport: 'Metro, tram, taxis and Careem/Uber', bestSeason: 'November-March', dailyBudget: '$90-250', officialLinks: [L('UAE Government portal', 'https://u.ae/'), L('GDRFA Dubai', 'https://www.gdrfad.gov.ae/')] },
    notesAr: { currency: 'درهم إماراتي (AED)', language: 'عربي؛ الإنجليزية في كل حتة', plugs: 'فيشة G، 230 فولت', safety: 'آمنة جداً؛ قوانين صارمة، احترم القواعد المحلية', customs: 'لبس محتشم في المولات والأماكن العامة؛ ممنوع السكر العلني', transport: 'مترو وترام وتاكسي وكريم/أوبر', bestSeason: 'نوفمبر-مارس', dailyBudget: '90-250$', officialLinks: [L('بوابة حكومة الإمارات', 'https://u.ae/'), L('الإدارة العامة للإقامة وشؤون الأجانب', 'https://www.gdrfad.gov.ae/')] },
  },
  {
    slug: 'rome', iata: 'FCO', name: 'Rome', nameAr: 'روما', country: 'Italy', countryAr: 'إيطاليا',
    blurb: 'Ancient ruins, piazzas and the best carbs on earth.', blurbAr: 'آثار قديمة وساحات وأحلى أكل كربوهيدرات في الدنيا.',
    highlights: {
      morning: ['Colosseum and the Roman Forum early', 'Vatican Museums right at opening', 'Pantheon then espresso at Tazza d\'Oro'],
      afternoon: ['Trastevere lanes and lunch', 'Villa Borghese gardens and gallery', 'Jewish Ghetto and Campo de\' Fiori'],
      evening: ['Trevi Fountain at night', 'Aperitivo in Monti', 'Gelato and a Spanish Steps stroll'],
      tips: ['Book Colosseum and Vatican tickets weeks ahead', 'Churches require covered shoulders and knees', 'Drink from the nasoni fountains for free'],
    },
    highlightsAr: {
      morning: ['الكولوسيوم والمنتدى الروماني بدري', 'متاحف الفاتيكان أول ما تفتح', 'البانثيون وبعده إسبريسو في تاتسا دورو'],
      afternoon: ['حارات تراستيفيري والغداء', 'حدائق وجاليري فيلا بورغيزي', 'الحي اليهودي وكامبو دي فيوري'],
      evening: ['نافورة تريفي بالليل', 'أبيريتيفو في مونتي', 'جيلاتو ومشوار على السلم الإسباني'],
      tips: ['احجز تذاكر الكولوسيوم والفاتيكان قبلها بأسابيع', 'الكنائس محتاجة كتاف وركب مغطاة', 'اشرب من نافورات الناسوني ببلاش'],
    },
    notes: { currency: 'Euro (EUR)', language: 'Italian; English in tourist areas', plugs: 'Type C/F/L, 230V', safety: 'Safe; pickpockets around major sights and Termini', customs: 'Modest dress for churches; coperto charge is normal at restaurants', transport: 'Metro, buses and lots of walking; validate tickets', bestSeason: 'April-June and September-October', dailyBudget: '€70-150', officialLinks: [L('Italian Ministry of Foreign Affairs', 'https://www.esteri.it/'), L('Visit Rome official', 'https://www.turismoroma.it/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'إيطالي؛ الإنجليزية في الأماكن السياحية', plugs: 'فيشة C/F/L، 230 فولت', safety: 'آمنة؛ انتبه للنشل حوالين المعالم ومحطة تيرميني', customs: 'لبس محتشم للكنائس؛ رسوم الكوبرتو في المطاعم حاجة عادية', transport: 'مترو وأتوبيسات ومشي كتير؛ لازم تختم التذكرة', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '70-150€', officialLinks: [L('وزارة الخارجية الإيطالية', 'https://www.esteri.it/'), L('موقع روما الرسمي', 'https://www.turismoroma.it/')] },
  },
  {
    slug: 'bangkok', iata: 'BKK', name: 'Bangkok', nameAr: 'بانكوك', country: 'Thailand', countryAr: 'تايلاند',
    blurb: 'Temples, street food and river boats.', blurbAr: 'معابد وأكل شارع ومراكب في النهر.',
    highlights: {
      morning: ['Grand Palace and Wat Phra Kaew early', 'Wat Pho and the Reclining Buddha', 'Wat Arun across the river at sunrise light'],
      afternoon: ['Chatuchak market (weekends)', 'Jim Thompson House and Siam area', 'Longtail boat through the klongs'],
      evening: ['Street food in Chinatown (Yaowarat)', 'Rooftop view over the Chao Phraya', 'Asiatique night market'],
      tips: ['Use BTS and river boats to skip traffic', 'Cover shoulders and knees for temples', 'Agree tuk-tuk prices before you ride'],
    },
    highlightsAr: {
      morning: ['القصر الكبير ووات فرا كايو بدري', 'وات فو وبوذا النائم', 'وات آرون على الناحية التانية وقت الشروق'],
      afternoon: ['سوق تشاتوتشاك (الويك إند)', 'بيت جيم طومسون ومنطقة سيام', 'مركب لونج تيل في القنوات'],
      evening: ['أكل شارع في الحي الصيني (ياواراات)', 'منظر من سطح على نهر تشاو فرايا', 'سوق أسياتيك الليلي'],
      tips: ['استخدم المترو السماوي ومراكب النهر عشان الزحمة', 'غطّي كتافك وركبك في المعابد', 'اتفق على سعر التوك توك قبل ما تركب'],
    },
    notes: { currency: 'Thai Baht (THB)', language: 'Thai; English in tourist zones', plugs: 'Type A/B/C, 220V', safety: 'Safe; common tourist scams around the Grand Palace', customs: 'Never touch heads or point feet at Buddha images', transport: 'BTS, MRT, river boats and Grab', bestSeason: 'November-February', dailyBudget: '$35-80', officialLinks: [L('Thai Ministry of Foreign Affairs', 'https://www.mfa.go.th/'), L('Thailand e-Visa', 'https://www.thaievisa.go.th/')] },
    notesAr: { currency: 'بات تايلاندي (THB)', language: 'تايلاندي؛ الإنجليزية في المناطق السياحية', plugs: 'فيشة A/B/C، 220 فولت', safety: 'آمنة؛ خد بالك من النصب السياحي حوالين القصر الكبير', customs: 'متمسش راس حد ومتوجهش رجليك لتماثيل بوذا', transport: 'مترو سماوي وأرضي ومراكب نهر وGrab', bestSeason: 'نوفمبر-فبراير', dailyBudget: '35-80$', officialLinks: [L('وزارة الخارجية التايلاندية', 'https://www.mfa.go.th/'), L('الفيزا الإلكترونية التايلاندية', 'https://www.thaievisa.go.th/')] },
  },
  {
    slug: 'paris', iata: 'CDG', name: 'Paris', nameAr: 'باريس', country: 'France', countryAr: 'فرنسا',
    blurb: 'Museums, cafés and evening light on the Seine.', blurbAr: 'متاحف وقهاوي ونور المغربية على نهر السين.',
    highlights: {
      morning: ['Louvre at opening (book a slot)', 'Eiffel Tower then Trocadéro', 'Sainte-Chapelle and Île de la Cité'],
      afternoon: ['Musée d\'Orsay', 'Le Marais lanes and Place des Vosges', 'Luxembourg Gardens and Saint-Germain'],
      evening: ['Seine cruise at dusk', 'Montmartre and Sacré-Cœur at sunset', 'Bistro dinner in the 11th'],
      tips: ['Museum passes skip long lines', 'Shops often close on Sundays', 'Learn bonjour - it opens doors'],
    },
    highlightsAr: {
      morning: ['اللوفر أول ما يفتح (احجز معاد)', 'برج إيفل وبعده التروكاديرو', 'سانت شابيل وجزيرة المدينة'],
      afternoon: ['متحف أورسيه', 'حارات لو ماريه وساحة الفوج', 'حدائق لوكسمبورغ وسان جيرمان'],
      evening: ['رحلة مركب في السين وقت الغروب', 'مونمارتر والساكريه كور عند الغروب', 'عشا بيسترو في الدائرة 11'],
      tips: ['بطاقات المتاحف بتوفر طوابير طويلة', 'المحلات كتير بتقفل يوم الحد', 'اتعلم بونجور - بتفتح أبواب'],
    },
    notes: { currency: 'Euro (EUR)', language: 'French; English widely understood', plugs: 'Type C/E, 230V', safety: 'Safe; pickpockets at major sights and on metro line 1', customs: 'Greet shopkeepers when entering; dinner starts late', transport: 'Metro and RER; carnets or Navigo card', bestSeason: 'April-June and September-October', dailyBudget: '€90-200', officialLinks: [L('France-Visas', 'https://france-visas.gouv.fr/'), L('Paris je t\'aime (official)', 'https://parisjetaime.com/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'فرنسي؛ الإنجليزية مفهومة في أماكن كتير', plugs: 'فيشة C/E، 230 فولت', safety: 'آمنة؛ انتبه للنشل عند المعالم وفي خط المترو 1', customs: 'سلّم على أصحاب المحلات عند الدخول؛ العشا بيبدأ متأخر', transport: 'مترو وRER؛ تذاكر كارنيه أو كارت نافيغو', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '90-200€', officialLinks: [L('فرنسا فيزا', 'https://france-visas.gouv.fr/'), L('باريس الرسمي', 'https://parisjetaime.com/')] },
  },
  {
    slug: 'tokyo', iata: 'HND', name: 'Tokyo', nameAr: 'طوكيو', country: 'Japan', countryAr: 'اليابان',
    blurb: 'Neon, shrines and the quietest crowds.', blurbAr: 'نيون ومعابد وهدوء وسط الزحمة.',
    highlights: {
      morning: ['Meiji Shrine and Harajuku', 'Senso-ji in Asakusa early', 'teamLab digital art (book ahead)'],
      afternoon: ['Shibuya crossing and Hachiko', 'Ueno Park museums', 'Akihabara or Nakano for games and anime'],
      evening: ['Shinjuku izakaya alleys (Omoide Yokocho)', 'Tokyo Skytree or Shibuya Sky at night', 'Ramen in a back alley'],
      tips: ['Get a Suica/Pasmo card immediately', 'Convenience stores have great cheap food', 'Trains stop around midnight'],
    },
    highlightsAr: {
      morning: ['معبد ميجي وهاراجوكو', 'سينسوجي في أساكوسا بدري', 'تيم لاب للفن الرقمي (احجز قبلها)'],
      afternoon: ['تقاطع شيبويا وتمثال هاتشيكو', 'متاحف حديقة أوينو', 'أكيهابارا أو ناكانو للألعاب والأنمي'],
      evening: ['حارات الإيزاكايا في شينجوكو', 'طوكيو سكاي تري أو شيبويا سكاي بالليل', 'رامن في حارة خلفية'],
      tips: ['اطلع كارت سويكا/باسمو فوراً', 'محلات الكونبيني فيها أكل حلو ورخيص', 'القطارات بتقفل حوالين نص الليل'],
    },
    notes: { currency: 'Japanese Yen (JPY)', language: 'Japanese; limited English, signage excellent', plugs: 'Type A/B, 100V', safety: 'Extremely safe; very low crime', customs: 'Queue politely; no tipping; quiet on trains', transport: 'JR and metro with Suica; Google Maps works perfectly', bestSeason: 'March-May and October-November', dailyBudget: '$80-180', officialLinks: [L('Japan Ministry of Foreign Affairs', 'https://www.mofa.go.jp/'), L('Japan National Tourism', 'https://www.japan.travel/')] },
    notesAr: { currency: 'ين ياباني (JPY)', language: 'ياباني؛ إنجليزية محدودة لكن اللافتات ممتازة', plugs: 'فيشة A/B، 100 فولت', safety: 'آمنة جداً؛ معدل جريمة منخفض جداً', customs: 'قف في الطابور بأدب؛ مفيش بقشيش؛ هدوء في القطارات', transport: 'قطارات JR والمترو بكارت سويكا؛ خرايط جوجل شغالة تمام', bestSeason: 'مارس-مايو وأكتوبر-نوفمبر', dailyBudget: '80-180$', officialLinks: [L('وزارة الخارجية اليابانية', 'https://www.mofa.go.jp/'), L('السياحة اليابانية الرسمية', 'https://www.japan.travel/')] },
  },
  {
    slug: 'barcelona', iata: 'BCN', name: 'Barcelona', nameAr: 'برشلونة', country: 'Spain', countryAr: 'إسبانيا',
    blurb: 'Gaudí, tapas and the Mediterranean.', blurbAr: 'غاودي وتاباس والبحر المتوسط.',
    highlights: {
      morning: ['Sagrada Família (book ahead)', 'Park Güell early for the light', 'La Boqueria market breakfast'],
      afternoon: ['Gothic Quarter and El Born', 'Casa Batlló and Passeig de Gràcia', 'Barceloneta beach and boardwalk'],
      evening: ['Tapas crawl in El Born', 'Magic Fountain show (seasonal)', 'Sunset at Bunkers del Carmel'],
      tips: ['Watch for pickpockets on La Rambla', 'Dinner starts after 9pm', 'T-casual metro card saves money'],
    },
    highlightsAr: {
      morning: ['ساغرادا فاميليا (احجز قبلها)', 'بارك غويل بدري للنور الحلو', 'فطار في سوق لا بوكيريا'],
      afternoon: ['الحي القوطي وإل بورن', 'كازا باتيو وشارع باسيغ دي غراسيا', 'شاطئ بارسيلونيتا والكورنيش'],
      evening: ['جولة تاباس في إل بورن', 'عرض النافورة السحرية (موسمي)', 'غروب من بونكرس ديل كارميل'],
      tips: ['خد بالك من النشل في لا رامبلا', 'العشا بيبدأ بعد 9 بالليل', 'كارت المترو تي-كازوال بيوفر'],
    },
    notes: { currency: 'Euro (EUR)', language: 'Spanish and Catalan; English in tourist areas', plugs: 'Type C/F, 230V', safety: 'Safe; high pickpocket rates in tourist zones', customs: 'Late meals are normal; lunch 2pm, dinner 9pm+', transport: 'Metro, buses and walkable center', bestSeason: 'May-June and September-October', dailyBudget: '€70-140', officialLinks: [L('Spanish Ministry of Foreign Affairs', 'https://www.exteriores.gob.es/'), L('Barcelona official tourism', 'https://www.barcelonaturisme.com/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'إسباني وكتالاني؛ الإنجليزية في المناطق السياحية', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة؛ نسبة نشل عالية في المناطق السياحية', customs: 'الأكل متأخر عادي؛ الغداء 2 الضهر والعشا 9+ بالليل', transport: 'مترو وأتوبيسات والنص ماشي', bestSeason: 'مايو-يونيو وسبتمبر-أكتوبر', dailyBudget: '70-140€', officialLinks: [L('وزارة الخارجية الإسبانية', 'https://www.exteriores.gob.es/'), L('سياحة برشلونة الرسمية', 'https://www.barcelonaturisme.com/')] },
  },
  {
    slug: 'cairo', iata: 'CAI', name: 'Cairo', nameAr: 'القاهرة', country: 'Egypt', countryAr: 'مصر',
    blurb: 'Pyramids, the Nile and a city that never slows down.', blurbAr: 'أهرامات ونيل ومدينة مبتبطنش.',
    highlights: {
      morning: ['Giza Pyramids and the Sphinx early', 'Grand Egyptian Museum (GEM)', 'Islamic Cairo: Al-Azhar and Al-Muizz street'],
      afternoon: ['Egyptian Museum in Tahrir', 'Khan el-Khalili bazaar', 'Coptic Cairo and the Hanging Church'],
      evening: ['Nile felucca at sunset', 'Koshary dinner downtown', 'Zamalek cafés'],
      tips: ['Agree taxi prices or use Uber/Careem', 'Fridays are quiet in the morning', 'Carry small change for tips'],
    },
    highlightsAr: {
      morning: ['أهرامات الجيزة وأبو الهول بدري', 'المتحف المصري الكبير', 'القاهرة الإسلامية: الأزهر وشارع المعز'],
      afternoon: ['المتحف المصري في التحرير', 'خان الخليلي', 'مصر القديمة والكنيسة المعلقة'],
      evening: ['فلوكة في النيل وقت الغروب', 'عشا كشري في وسط البلد', 'قهاوي الزمالك'],
      tips: ['اتفق على سعر التاكسي أو استخدم أوبر/كريم', 'يوم الجمعة الصبح هادي', 'شيل فكّة للإكراميات'],
    },
    notes: { currency: 'Egyptian Pound (EGP)', language: 'Arabic; English in tourist areas', plugs: 'Type C/F, 220V', safety: 'Safe in tourist areas; expect persistent vendors', customs: 'Modest dress appreciated; baksheesh culture is normal', transport: 'Metro, Uber and Careem; traffic is heavy', bestSeason: 'October-April', dailyBudget: '$30-70', officialLinks: [L('Egypt e-Visa', 'https://www.visa2egypt.gov.eg/'), L('Egypt Ministry of Tourism', 'https://www.egypt.travel/')] },
    notesAr: { currency: 'جنيه مصري (EGP)', language: 'عربي؛ الإنجليزية في الأماكن السياحية', plugs: 'فيشة C/F، 220 فولت', safety: 'آمنة في المناطق السياحية؛ البياعين ملحّين شوية', customs: 'اللبس المحتشم متقدّر؛ البقشيش حاجة عادية', transport: 'مترو وأوبر وكريم؛ الزحمة تقيلة', bestSeason: 'أكتوبر-أبريل', dailyBudget: '30-70$', officialLinks: [L('الفيزا الإلكترونية المصرية', 'https://www.visa2egypt.gov.eg/'), L('وزارة السياحة المصرية', 'https://www.egypt.travel/')] },
  },
  {
    slug: 'london', iata: 'LHR', name: 'London', nameAr: 'لندن', country: 'UK', countryAr: 'بريطانيا',
    blurb: 'Royal parks, markets and world-class free museums.', blurbAr: 'حدائق ملكية وأسواق ومتاحف عالمية ببلاش.',
    highlights: {
      morning: ['British Museum at opening', 'Tower of London and Tower Bridge', 'Westminster Abbey and Big Ben'],
      afternoon: ['Borough Market lunch', 'Tate Modern and the South Bank walk', 'Camden Market'],
      evening: ['West End show', 'Soho dinner', 'Sunset from Primrose Hill or Sky Garden'],
      tips: ['Tap your card to ride the Tube - no tickets needed', 'Many top museums are free', 'Book West End tickets same-day at TKTS'],
    },
    highlightsAr: {
      morning: ['المتحف البريطاني أول ما يفتح', 'برج لندن وجسر البرج', 'دير وستمنستر والبيج بن'],
      afternoon: ['غداء في سوق بورو', 'تيت مودرن ومشوار الساوث بانك', 'سوق كامدن'],
      evening: ['عرض في الويست إند', 'عشا في سوهو', 'غروب من بريمروز هيل أو سكاي جاردن'],
      tips: ['اعمل تاب بكارتك في المترو - من غير تذاكر', 'أغلب المتاحف الكبيرة ببلاش', 'احجز تذاكر الويست إند نفس اليوم من TKTS'],
    },
    notes: { currency: 'British Pound (GBP)', language: 'English', plugs: 'Type G, 230V', safety: 'Safe; normal big-city awareness', customs: 'Queueing is sacred; pubs are central to social life', transport: 'Tube, buses and contactless payment', bestSeason: 'May-September', dailyBudget: '£90-180', officialLinks: [L('UK Government (GOV.UK)', 'https://www.gov.uk/'), L('VisitBritain', 'https://www.visitbritain.com/')] },
    notesAr: { currency: 'جنيه إسترليني (GBP)', language: 'إنجليزي', plugs: 'فيشة G، 230 فولت', safety: 'آمنة؛ انتباه عادي لأي مدينة كبيرة', customs: 'الطابور مقدس؛ البارات مركز الحياة الاجتماعية', transport: 'مترو وأتوبيسات ودفع كونتاكتلس', bestSeason: 'مايو-سبتمبر', dailyBudget: '90-180£', officialLinks: [L('حكومة بريطانيا', 'https://www.gov.uk/'), L('فيزيت بريطانيا', 'https://www.visitbritain.com/')] },
  },
  {
    slug: 'kuala-lumpur', iata: 'KUL', name: 'Kuala Lumpur', nameAr: 'كوالالمبور', country: 'Malaysia', countryAr: 'ماليزيا',
    blurb: 'Twin towers, night markets and a food heaven.', blurbAr: 'البرجين التوأم وأسواق ليلية وجنة أكل.',
    highlights: {
      morning: ['Batu Caves early before the heat', 'Petronas Towers and KLCC Park', 'Thean Hou Temple'],
      afternoon: ['Central Market and Chinatown', 'Islamic Arts Museum', 'Kuala Lumpur Tower view'],
      evening: ['Jalan Alor food street', 'Petaling Street night market', 'Saloma Bridge lights'],
      tips: ['Grab is cheap and reliable', 'Rain comes fast - carry an umbrella', 'Try nasi lemak for breakfast'],
    },
    highlightsAr: {
      morning: ['كهوف باتو بدري قبل الحر', 'أبراج بتروناس وحديقة KLCC', 'معبد ثيان هو'],
      afternoon: ['السوق المركزي والحي الصيني', 'متحف الفنون الإسلامية', 'منظر من برج كوالالمبور'],
      evening: ['شارع أكل جالان ألور', 'سوق بيتالينغ الليلي', 'أنوار كوبري سالوما'],
      tips: ['Grab رخيص ومظبوط', 'المطر بييجي بسرعة - شيل شمسية', 'جرب ناسي ليماك في الفطار'],
    },
    notes: { currency: 'Malaysian Ringgit (MYR)', language: 'Malay; English widely spoken', plugs: 'Type G, 240V', safety: 'Safe; normal city awareness', customs: 'Modest dress in mosques; remove shoes', transport: 'LRT, monorail and Grab', bestSeason: 'Year-round; driest May-July', dailyBudget: '$35-80', officialLinks: [L('Malaysia Immigration', 'https://www.imi.gov.my/'), L('Tourism Malaysia', 'https://www.malaysia.travel/')] },
    notesAr: { currency: 'رينغيت ماليزي (MYR)', language: 'مالاوي؛ الإنجليزية منتشرة', plugs: 'فيشة G، 240 فولت', safety: 'آمنة؛ انتباه عادي', customs: 'لبس محتشم في الجوامع؛ اخلع حذاءك', transport: 'قطار خفيف ومونوريل وGrab', bestSeason: 'طول السنة؛ أجف شهور مايو-يوليو', dailyBudget: '35-80$', officialLinks: [L('هجرة ماليزيا', 'https://www.imi.gov.my/'), L('سياحة ماليزيا', 'https://www.malaysia.travel/')] },
  },
  {
    slug: 'baku', iata: 'GYD', name: 'Baku', nameAr: 'باكو', country: 'Azerbaijan', countryAr: 'أذربيجان',
    blurb: 'Flame towers, an old walled city and Caspian winds.', blurbAr: 'أبراج اللهب ومدينة قديمة مسوّرة ورياح قزوين.',
    highlights: {
      morning: ['Old City (Icherisheher) and Maiden Tower', 'Palace of the Shirvanshahs', 'Heydar Aliyev Center architecture'],
      afternoon: ['Baku Boulevard along the Caspian', 'Carpet Museum', 'Funicular to Highland Park'],
      evening: ['Flame Towers light show', 'Dinner in the Old City', 'Nizami street stroll'],
      tips: ['BakuKart works for the metro', 'Wind is strong year-round - bring a jacket', 'Try the tea houses with jam'],
    },
    highlightsAr: {
      morning: ['المدينة القديمة (إتشيري شهير) وبرج العذراء', 'قصر الشيروانشاه', 'عمارة مركز حيدر علييف'],
      afternoon: ['كورنيش باكو على قزوين', 'متحف السجاد', 'الفونيكولار لحديقة المرتفعات'],
      evening: ['عرض أنوار أبراج اللهب', 'عشا في المدينة القديمة', 'مشوار في شارع نظامي'],
      tips: ['كارت باكو بيشتغل في المترو', 'الرياح قوية طول السنة - خد جاكيت', 'جرب بيوت الشاي بالمربى'],
    },
    notes: { currency: 'Azerbaijani Manat (AZN)', language: 'Azerbaijani; Russian common, English growing', plugs: 'Type C/F, 220V', safety: 'Very safe; low street crime', customs: 'Tea culture is central; hospitality is generous', transport: 'Metro and Bolt/Uber taxis', bestSeason: 'April-June and September-October', dailyBudget: '$40-90', officialLinks: [L('Azerbaijan e-Visa (ASAN)', 'https://evisa.gov.az/'), L('Azerbaijan Tourism', 'https://azerbaijan.travel/')] },
    notesAr: { currency: 'مانات أذربيجاني (AZN)', language: 'أذربيجاني؛ الروسية منتشرة والإنجليزية بتزيد', plugs: 'فيشة C/F، 220 فولت', safety: 'آمنة جداً؛ جريمة شارع قليلة', customs: 'ثقافة الشاي أساسية؛ الضيافة كريمة', transport: 'مترو وتاكسي بولت/أوبر', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '40-90$', officialLinks: [L('الفيزا الإلكترونية الأذربيجانية', 'https://evisa.gov.az/'), L('سياحة أذربيجان', 'https://azerbaijan.travel/')] },
  },
  {
    slug: 'lisbon', iata: 'LIS', name: 'Lisbon', nameAr: 'لشبونة', country: 'Portugal', countryAr: 'البرتغال',
    blurb: 'Trams, tiles and Atlantic sunsets.', blurbAr: 'ترام وبلاط ملون وغروب أطلسي.',
    highlights: {
      morning: ['Alfama lanes and São Jorge Castle', 'Belém Tower and Jerónimos Monastery', 'Pastéis de Belém warm from the oven'],
      afternoon: ['LX Factory under the bridge', 'Tram 28 ride', 'Chiado and Bairro Alto'],
      evening: ['Fado dinner in Alfama', 'Sunset at Miradouro da Senhora do Monte', 'Praça do Comércio at night'],
      tips: ['Wear grippy shoes for the hills', 'Time Out Market is touristy but tasty', 'Sintra is an easy day trip - go early'],
    },
    highlightsAr: {
      morning: ['حارات ألفاما وقلعة ساو جورجي', 'برج بيليم ودير جيرونيموس', 'باستيل دي بيليم سخن من الفرن'],
      afternoon: ['إل إكس فاكتوري تحت الكوبري', 'ركوب ترام 28', 'كيادو وبايرو ألتو'],
      evening: ['عشا فادو في ألفاما', 'غروب من ميرادورو دا سينيورا دو مونتي', 'ساحة التجارة بالليل'],
      tips: ['البس جزمة مريحة للتلال', 'سوق تايم أوت سياحي بس طعمه حلو', 'سينترا رحلة يوم سهلة - روح بدري'],
    },
    notes: { currency: 'Euro (EUR)', language: 'Portuguese; English widely spoken', plugs: 'Type C/F, 230V', safety: 'Very safe; watch trams and hills', customs: 'Relaxed pace; lunch is the main meal', transport: 'Trams, metro and walkable hills', bestSeason: 'March-June and September-October', dailyBudget: '€60-120', officialLinks: [L('Portugal Immigration (AIMA)', 'https://aima.gov.pt/'), L('Visit Portugal', 'https://www.visitportugal.com/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'برتغالي؛ الإنجليزية منتشرة', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة جداً؛ انتبه للترام والتلال', customs: 'إيقاع هادي؛ الغداء هو الوجبة الأساسية', transport: 'ترام ومترو ومشي في التلال', bestSeason: 'مارس-يونيو وسبتمبر-أكتوبر', dailyBudget: '60-120€', officialLinks: [L('هجرة البرتغال', 'https://aima.gov.pt/'), L('فيزيت البرتغال', 'https://www.visitportugal.com/')] },
  },
  {
    slug: 'maldives', iata: 'MLE', name: 'Maldives (Malé)', nameAr: 'المالديف (ماليه)', country: 'Maldives', countryAr: 'المالديف',
    blurb: 'Atolls, lagoons and house reefs.', blurbAr: 'جزر مرجانية وبحيرات فيروزية وشعاب عند بابك.',
    highlights: {
      morning: ['Snorkel the house reef', 'Sandbank picnic trip', 'Dolphin cruise at dawn'],
      afternoon: ['Dive or intro dive', 'Kayak the lagoon', 'Malé fish market and mosque'],
      evening: ['Sunset fishing trip', 'Beach dinner under the stars', 'Bioluminescent beach walk (seasonal)'],
      tips: ['Resorts include transfers - factor the cost', 'Local islands are much cheaper than resorts', 'Reef-safe sunscreen only'],
    },
    highlightsAr: {
      morning: ['غطس على الشعاب اللي عند الجزيرة', 'رحلة بيك نيك على بنك رملي', 'رحلة دولفين وقت الشروق'],
      afternoon: ['غوص أو تجربة غوص أولى', 'كاياك في البحيرة', 'سوق السمك والجامع في ماليه'],
      evening: ['رحلة صيد وقت الغروب', 'عشا على الشاطئ تحت النجوم', 'مشي على الشاطئ المضيء (موسمي)'],
      tips: ['المنتجعات شاملة الانتقالات - احسب تكلفتها', 'الجزر المحلية أرخص بكتير من المنتجعات', 'صن بلوك صديق للشعاب بس'],
    },
    notes: { currency: 'Maldivian Rufiyaa (MVR); USD widely accepted', language: 'Dhivehi; English in resorts', plugs: 'Type D/G, 230V', safety: 'Very safe; respect sun and sea', customs: 'Muslim country; modest dress on local islands, alcohol only in resorts', transport: 'Speedboats and seaplanes between islands', bestSeason: 'November-April (dry season)', dailyBudget: '$80-400', officialLinks: [L('Maldives Immigration', 'https://immigration.gov.mv/'), L('Visit Maldives', 'https://visitmaldives.com/')] },
    notesAr: { currency: 'روفية مالديفية (MVR)؛ الدولار مقبول في كل حتة', language: 'ديفيهي؛ الإنجليزية في المنتجعات', plugs: 'فيشة D/G، 230 فولت', safety: 'آمنة جداً؛ احترم الشمس والبحر', customs: 'دولة مسلمة؛ لبس محتشم في الجزر المحلية، والكحول في المنتجعات بس', transport: 'قوارب سريعة وطيارات مائية بين الجزر', bestSeason: 'نوفمبر-أبريل (الموسم الجاف)', dailyBudget: '80-400$', officialLinks: [L('هجرة المالديف', 'https://immigration.gov.mv/'), L('فيزيت المالديف', 'https://visitmaldives.com/')] },
  },
  {
    slug: 'bali', iata: 'DPS', name: 'Bali', nameAr: 'بالي', country: 'Indonesia', countryAr: 'إندونيسيا',
    blurb: 'Rice terraces, surf and temple gates.', blurbAr: 'مدرجات أرز وركوب أمواج وبوابات معابد.',
    highlights: {
      morning: ['Tegalalang rice terraces early', 'Uluwatu temple before sunset crowds', 'Campuhan ridge walk at dawn'],
      afternoon: ['Ubud monkey forest and market', 'Surf lesson in Canggu', 'Tirta Empul water temple'],
      evening: ['Kecak fire dance at Uluwatu', 'Beach clubs in Seminyak', 'Warung dinner of babi guling'],
      tips: ['Scooter rental is common - ride carefully', 'Sarong required in temples (usually free)', 'Rainy season is November-March'],
    },
    highlightsAr: {
      morning: ['مدرجات أرز تيغالالانغ بدري', 'معبد أولواتو قبل زحمة الغروب', 'مشوار كامبوهان وقت الشروق'],
      afternoon: ['غابة القرود وسوق أوبود', 'درس ركوب أمواج في كانغو', 'معبد مياه تيرتا إمبول'],
      evening: ['رقصة كيتشاك النارية في أولواتو', 'بيتش كلاب في سيمينياك', 'عشا وارونغ بابي غولينغ'],
      tips: ['تأجير الاسكوتر منتشر - سوق بحذر', 'السارونغ مطلوب في المعابد (غالباً ببلاش)', 'موسم المطر نوفمبر-مارس'],
    },
    notes: { currency: 'Indonesian Rupiah (IDR)', language: 'Indonesian and Balinese; English in tourist areas', plugs: 'Type C/F, 230V', safety: 'Safe; traffic is the main risk', customs: 'Hindu-Balinese culture; respect offerings on the ground', transport: 'Scooters and Gojek/Grab', bestSeason: 'April-October (dry season)', dailyBudget: '$35-90', officialLinks: [L('Indonesia e-VOA', 'https://evisa.imigrasi.go.id/'), L('Wonderful Indonesia', 'https://www.indonesia.travel/')] },
    notesAr: { currency: 'روبية إندونيسية (IDR)', language: 'إندونيسي وبالينيزي؛ الإنجليزية في المناطق السياحية', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة؛ المرور هو الخطر الأساسي', customs: 'ثقافة هندوسية بالينيزية؛ احترم القرابين على الأرض', transport: 'اسكوتر وجوجيك/Grab', bestSeason: 'أبريل-أكتوبر (الموسم الجاف)', dailyBudget: '35-90$', officialLinks: [L('الفيزا الإلكترونية الإندونيسية', 'https://evisa.imigrasi.go.id/'), L('إندونيسيا الرائعة', 'https://www.indonesia.travel/')] },
  },
  {
    slug: 'santorini', iata: 'JTR', name: 'Santorini', nameAr: 'سانتوريني', country: 'Greece', countryAr: 'اليونان',
    blurb: 'Caldera views, white villages and volcanic beaches.', blurbAr: 'مناظر الكالديرا وقرى بيضا وشواطئ بركانية.',
    highlights: {
      morning: ['Oia before the crowds', 'Akrotiri archaeological site', 'Fira to Oia caldera hike (early)'],
      afternoon: ['Red Beach and Perissa black sand', 'Santo Wines tasting', 'Pyrgos village'],
      evening: ['Oia sunset (arrive 2 hours early)', 'Dinner in Imerovigli', 'Amoudi Bay cliff swim at dusk'],
      tips: ['Book ferries early in summer', 'ATVs are the fun way around', 'Shoulder season is just as beautiful'],
    },
    highlightsAr: {
      morning: ['أويا قبل الزحمة', 'موقع أكروتيري الأثري', 'مشي الكالديرا من فيرا لأويا (بدري)'],
      afternoon: ['الشاطئ الأحمر ورمال بيريسا السودا', 'تذوق نبيذ سانتو', 'قرية بيرغوس'],
      evening: ['غروب أويا (اوصل قبلها بساعتين)', 'عشا في إيميروفيغلي', 'عوم في خليج أمودي وقت الغروب'],
      tips: ['احجز العبّارات بدري في الصيف', 'الـATV أحلى وسيلة مواصلات', 'مواسم الركود بنفس الجمال'],
    },
    notes: { currency: 'Euro (EUR)', language: 'Greek; English everywhere touristy', plugs: 'Type C/F, 230V', safety: 'Very safe', customs: 'Relaxed island pace; churches everywhere', transport: 'Buses, ATVs and taxis (limited)', bestSeason: 'May-June and September-October', dailyBudget: '€100-250', officialLinks: [L('Greek Ministry of Foreign Affairs', 'https://www.mfa.gr/'), L('Visit Greece', 'https://visitgreece.gr/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'يوناني؛ الإنجليزية في كل الأماكن السياحية', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة جداً', customs: 'إيقاع جزيرة هادي؛ كنائس في كل حتة', transport: 'أتوبيسات وATV وتاكسي (محدود)', bestSeason: 'مايو-يونيو وسبتمبر-أكتوبر', dailyBudget: '100-250€', officialLinks: [L('وزارة الخارجية اليونانية', 'https://www.mfa.gr/'), L('فيزيت اليونان', 'https://visitgreece.gr/')] },
  },
  {
    slug: 'marrakech', iata: 'RAK', name: 'Marrakech', nameAr: 'مراكش', country: 'Morocco', countryAr: 'المغرب',
    blurb: 'Medina maze, riads and Atlas views.', blurbAr: 'متاهة المدينة القديمة ورياضات ومناظر الأطلس.',
    highlights: {
      morning: ['Jardin Majorelle early', 'Bahia Palace', 'Ben Youssef Madrasa'],
      afternoon: ['Souk Semmarine haggling', 'Jemaa el-Fnaa square', 'Hammam experience'],
      evening: ['Jemaa el-Fnaa food stalls', 'Rooftop dinner over the medina', 'Koutoubia at dusk'],
      tips: ['Agree prices before taxis and tours', 'The medina is a maze - download offline maps', 'Friday is prayer day; some shops close midday'],
    },
    highlightsAr: {
      morning: ['حديقة ماجوريل بدري', 'قصر الباهية', 'مدرسة بن يوسف'],
      afternoon: ['فصال في سوق السمارين', 'ساحة جامع الفنا', 'تجربة الحمام'],
      evening: ['أكل الساحة في جامع الفنا', 'عشا على سطح فوق المدينة القديمة', 'الكوتبية وقت الغروب'],
      tips: ['اتفق على الأسعار قبل التاكسي والجولات', 'المدينة القديمة متاهة - نزّل خرايط أوفلاين', 'يوم الجمعة يوم صلاة؛ محلات بتقفل نص النهار'],
    },
    notes: { currency: 'Moroccan Dirham (MAD)', language: 'Arabic and French; English in tourist areas', plugs: 'Type C/E, 220V', safety: 'Safe; expect persistent sellers and unofficial guides', customs: 'Modest dress appreciated; ask before photographing people', transport: 'Petit taxis and walking in the medina', bestSeason: 'March-May and September-November', dailyBudget: '$40-90', officialLinks: [L('Morocco Ministry of Foreign Affairs', 'https://www.diplomatie.ma/'), L('Visit Morocco', 'https://www.visitmorocco.com/')] },
    notesAr: { currency: 'درهم مغربي (MAD)', language: 'عربي وفرنسي؛ الإنجليزية في المناطق السياحية', plugs: 'فيشة C/E، 220 فولت', safety: 'آمنة؛ البياعين والمرشدين غير الرسميين ملحّين', customs: 'اللبس المحتشم متقدّر؛ اسأل قبل ما تصور الناس', transport: 'بيتي تاكسي ومشي في المدينة القديمة', bestSeason: 'مارس-مايو وسبتمبر-نوفمبر', dailyBudget: '40-90$', officialLinks: [L('وزارة الخارجية المغربية', 'https://www.diplomatie.ma/'), L('فيزيت المغرب', 'https://www.visitmorocco.com/')] },
  },
  {
    slug: 'sharm-el-sheikh', iata: 'SSH', name: 'Sharm El Sheikh', nameAr: 'شرم الشيخ', country: 'Egypt', countryAr: 'مصر',
    blurb: 'Red Sea reefs and desert evenings.', blurbAr: 'شعاب البحر الأحمر وسهرات الصحراء.',
    highlights: {
      morning: ['Snorkel at Ras Mohammed', 'Dive the Straits of Tiran', 'Glass-bottom boat with kids'],
      afternoon: ['Naama Bay beach time', 'Old Market (Sharm Old Town)', 'Quad biking in the desert'],
      evening: ['Bedouin dinner under the stars', 'Soho Square promenade', 'Ras Um Sid sunset'],
      tips: ['All-inclusive deals are often the best value', 'Bring reef shoes', 'Taxi prices are negotiable - agree first'],
    },
    highlightsAr: {
      morning: ['غطس في راس محمد', 'غوص في مضايق تيران', 'مركب زجاج للأطفال'],
      afternoon: ['شاطئ خليج نعمة', 'السوق القديم (شرم القديمة)', 'موتوسيكلات رباعية في الصحراء'],
      evening: ['عشا بدوي تحت النجوم', 'ممشى سوهو سكوير', 'غروب راس أم سيد'],
      tips: ['عروض الشامل كل حاجة غالباً أحسن قيمة', 'هات جزمة للشعاب', 'أسعار التاكسي فيها فصال - اتفق الأول'],
    },
    notes: { currency: 'Egyptian Pound (EGP); USD/EUR accepted in resorts', language: 'Arabic; English and Russian in resorts', plugs: 'Type C/F, 220V', safety: 'Resort areas are heavily secured', customs: 'Resort casual is fine; modest dress in town', transport: 'Taxis and hotel shuttles', bestSeason: 'March-May and September-November', dailyBudget: '$40-120', officialLinks: [L('Egypt e-Visa', 'https://www.visa2egypt.gov.eg/'), L('Egypt Ministry of Tourism', 'https://www.egypt.travel/')] },
    notesAr: { currency: 'جنيه مصري (EGP)؛ الدولار واليورو مقبولين في المنتجعات', language: 'عربي؛ الإنجليزية والروسية في المنتجعات', plugs: 'فيشة C/F، 220 فولت', safety: 'مناطق المنتجعات مؤمّنة جداً', customs: 'كاجوال المنتجعات عادي؛ لبس محتشم في المدينة', transport: 'تاكسي وباصات الفنادق', bestSeason: 'مارس-مايو وسبتمبر-نوفمبر', dailyBudget: '40-120$', officialLinks: [L('الفيزا الإلكترونية المصرية', 'https://www.visa2egypt.gov.eg/'), L('وزارة السياحة المصرية', 'https://www.egypt.travel/')] },
  },
  {
    slug: 'prague', iata: 'PRG', name: 'Prague', nameAr: 'براغ', country: 'Czechia', countryAr: 'التشيك',
    blurb: 'A fairy-tale old town and riverside beer gardens.', blurbAr: 'مدينة قديمة من الحكايات وجناين بيرة على النهر.',
    highlights: {
      morning: ['Charles Bridge at dawn', 'Prague Castle and St Vitus', 'Old Town Square and the Astronomical Clock'],
      afternoon: ['Jewish Quarter (Josefov)', 'Petřín Hill and the lookout tower', 'Letná beer garden view'],
      evening: ['Vltava river cruise', 'Traditional Czech dinner (svíčková)', 'Old Town at night'],
      tips: ['Trams cover everything - validate tickets', 'Avoid exchange offices with 0% commission signs', 'Czech beer is cheaper than water'],
    },
    highlightsAr: {
      morning: ['كوبري تشارلز وقت الفجر', 'قلعة براغ وكاتدرائية سانت فيتوس', 'ساحة المدينة القديمة والساعة الفلكية'],
      afternoon: ['الحي اليهودي (جوزيفوف)', 'تل بيترشين وبرج المراقبة', 'جنينة بيرة ليتنا والمنظر'],
      evening: ['رحلة مركب في نهر فلتافا', 'عشا تشيكي تقليدي (سفيتشكوفا)', 'المدينة القديمة بالليل'],
      tips: ['الترام بيغطي كل حاجة - اختم تذكرتك', 'بعيد عن مكاتب الصرافة اللي كاتبة 0% عمولة', 'البيرة التشيكية أرخص من المياه'],
    },
    notes: { currency: 'Czech Koruna (CZK)', language: 'Czech; English in tourist areas', plugs: 'Type C/E, 230V', safety: 'Safe; pickpockets on Charles Bridge and trams', customs: 'Beer culture is central; toast with eye contact', transport: 'Trams and metro; very walkable center', bestSeason: 'April-June and September-October', dailyBudget: '€60-110', officialLinks: [L('Czech Ministry of Foreign Affairs', 'https://mzv.gov.cz/'), L('Prague official tourism', 'https://www.prague.eu/')] },
    notesAr: { currency: 'كورونا تشيكية (CZK)', language: 'تشيكي؛ الإنجليزية في المناطق السياحية', plugs: 'فيشة C/E، 230 فولت', safety: 'آمنة؛ انتبه للنشل على كوبري تشارلز وفي الترام', customs: 'ثقافة البيرة أساسية؛ اتصال بصري عند الشرب', transport: 'ترام ومترو؛ والنص ماشي', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '60-110€', officialLinks: [L('وزارة الخارجية التشيكية', 'https://mzv.gov.cz/'), L('سياحة براغ الرسمية', 'https://www.prague.eu/')] },
  },
  {
    slug: 'athens', iata: 'ATH', name: 'Athens', nameAr: 'أثينا', country: 'Greece', countryAr: 'اليونان',
    blurb: 'The Acropolis, rooftop bars and seaside trams.', blurbAr: 'الأكروبوليس وبارات على الأسطح وترام البحر.',
    highlights: {
      morning: ['Acropolis at opening', 'Acropolis Museum', 'Ancient Agora'],
      afternoon: ['Plaka and Anafiotika lanes', 'National Archaeological Museum', 'Tram to the Athens Riviera'],
      evening: ['Sunset at Lycabettus Hill', 'Dinner in Psyrri', 'Monastiraki square at night'],
      tips: ['Combo ticket covers the major ancient sites', 'August is very hot - plan siestas', 'Watch for pickpockets on the metro'],
    },
    highlightsAr: {
      morning: ['الأكروبوليس أول ما يفتح', 'متحف الأكروبوليس', 'الأغورا القديمة'],
      afternoon: ['حارات بلاكا وأنافيوتيكا', 'المتحف الأثري الوطني', 'ترام لريفييرا أثينا'],
      evening: ['غروب من تل ليكابيتوس', 'عشا في بسيري', 'ساحة موناستيراكي بالليل'],
      tips: ['التذكرة المجمعة بتغطي أغلب المواقع الأثرية', 'أغسطس حر جداً - خطط لقيلولة', 'خد بالك من النشل في المترو'],
    },
    notes: { currency: 'Euro (EUR)', language: 'Greek; English widely spoken', plugs: 'Type C/F, 230V', safety: 'Safe; normal city awareness', customs: 'Late dinners; coffee culture is strong', transport: 'Metro, tram and walking', bestSeason: 'April-June and September-October', dailyBudget: '€60-120', officialLinks: [L('Greek Ministry of Foreign Affairs', 'https://www.mfa.gr/'), L('Visit Greece', 'https://visitgreece.gr/')] },
    notesAr: { currency: 'يورو (EUR)', language: 'يوناني؛ الإنجليزية منتشرة', plugs: 'فيشة C/F، 230 فولت', safety: 'آمنة؛ انتباه عادي', customs: 'عشا متأخر؛ ثقافة القهوة قوية', transport: 'مترو وترام ومشي', bestSeason: 'أبريل-يونيو وسبتمبر-أكتوبر', dailyBudget: '60-120€', officialLinks: [L('وزارة الخارجية اليونانية', 'https://www.mfa.gr/'), L('فيزيت اليونان', 'https://visitgreece.gr/')] },
  },
  {
    slug: 'new-york', iata: 'JFK', name: 'New York', nameAr: 'نيويورك', country: 'USA', countryAr: 'أمريكا',
    blurb: 'Skyline, museums and pizza by the slice.', blurbAr: 'ناطحات سحاب ومتاحف وبيتزا بالقطعة.',
    highlights: {
      morning: ['Statue of Liberty ferry (first boat)', 'The Met or MoMA at opening', 'Brooklyn Bridge walk at sunrise'],
      afternoon: ['Central Park loop', 'High Line and Hudson Yards', 'SoHo and Greenwich Village'],
      evening: ['Times Square lights', 'Broadway show', 'Rooftop view from Top of the Rock'],
      tips: ['OMNY tap-to-pay works on all subways', 'Tipping 18-20% is expected', 'Walk - traffic is slower than your feet'],
    },
    highlightsAr: {
      morning: ['عبّارة تمثال الحرية (أول مركب)', 'المت أو الموما أول ما يفتح', 'مشي على بروكلين بريدج وقت الشروق'],
      afternoon: ['لفة سنترال بارك', 'الهاي لاين وهدسون ياردز', 'سوهو وغرينيتش فيليدج'],
      evening: ['أنوار تايمز سكوير', 'عرض برودواي', 'منظر من توب أوف ذا روك'],
      tips: ['OMNY تاب للدفع شغال في كل المترو', 'الإكرامية 18-20% متوقعة', 'امشي - الزحمة أبطأ من رجليك'],
    },
    notes: { currency: 'US Dollar (USD)', language: 'English; every language on earth too', plugs: 'Type A/B, 120V', safety: 'Safe in tourist areas; stay alert at night on empty trains', customs: 'Tipping is expected; small talk is normal', transport: 'Subway 24/7 with OMNY', bestSeason: 'April-June and September-November', dailyBudget: '$120-300', officialLinks: [L('US State Department travel', 'https://travel.state.gov/'), L('NYC Tourism', 'https://www.nycgo.com/')] },
    notesAr: { currency: 'دولار أمريكي (USD)', language: 'إنجليزي؛ وكل لغات الدنيا كمان', plugs: 'فيشة A/B، 120 فولت', safety: 'آمنة في المناطق السياحية؛ انتبه بالليل في القطارات الفاضية', customs: 'الإكرامية متوقعة؛ الكلام الخفيف عادي', transport: 'مترو 24/7 بـOMNY', bestSeason: 'أبريل-يونيو وسبتمبر-نوفمبر', dailyBudget: '120-300$', officialLinks: [L('الخارجية الأمريكية للسفر', 'https://travel.state.gov/'), L('سياحة نيويورك', 'https://www.nycgo.com/')] },
  },
];

export function buildPlan(d: Destination, days: number, lang: 'en' | 'ar'): DayPlan[] {
  const src = lang === 'ar' ? d.highlightsAr : d.highlights;
  const tips = src.tips;
  const out: DayPlan[] = [];
  for (let i = 0; i < Math.min(days, 14); i++) {
    out.push({
      day: i + 1,
      morning: src.morning[i % src.morning.length],
      afternoon: src.afternoon[i % src.afternoon.length],
      evening: src.evening[i % src.evening.length],
      tip: tips[i % tips.length],
    });
  }
  return out;
}

export function destinationBySlug(slug: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.slug === slug);
}
export function destinationByIata(iata: string): Destination | undefined {
  return DESTINATIONS.find((d) => d.iata === iata.toUpperCase());
}
