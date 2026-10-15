/*
 * Edit this file to rebrand the demo for another restaurant.
 * It is intentionally a browser global (instead of an import) so the site
 * works when index.html is opened directly with file:// as well as on hosting.
 */
window.MENU_DATA = {
  restaurant: {
    name: "فُرن",
    tagline: "بيتزا بعجينة يومية، ساندوتشات سخنة، واختيارات معمولة عشان تتاكل حالًا.",
    rating: 4.8,
    reviewCount: "340+",
    openLabel: "مفتوح الآن",
    shortHours: "حتى 12 منتصف الليل",
    fullHours: "يوميًا، 12 ظ — 12 ص",
    prepTime: "~20 دقيقة",
    phoneDisplay: "01024553480",
    phoneLink: "+201024553480",
    whatsapp: "201024553480",
    address: "دمياط الجديدة، المنطقة المركزية",
    mapUrl: "https://maps.google.com/?q=New+Damietta",
    currency: "ج.م",
    deliveryFee: 25,
    freeDeliveryAt: 350
  },
  categories: [
    { id: "pizza", name: "بيتزا", icon: "🍕" },
    { id: "sandwiches", name: "ساندوتشات", icon: "🥪" },
    { id: "sides", name: "إضافات", icon: "🍟" },
    { id: "drinks", name: "مشروبات", icon: "🥤" },
    { id: "desserts", name: "حلويات", icon: "🍫" }
  ],
  items: [
    {
      id: "pepperoni-pizza", category: "pizza", name: "بيتزا بيبروني", price: 195,
      description: "موتزاريلا سايحة، بيبروني مدخن وصوص طماطم متسبّك على عجينة يومية.",
      image: "pepperoni", alt: "بيتزا بيبروني بجبنة موتزاريلا", badge: "الأكثر طلبًا",
      tags: ["popular", "spicy"], options: [
        { group: "الحجم", required: true, choices: [{ name: "وسط", price: 0 }, { name: "كبير", price: 55 }] },
        { group: "إضافات", multiple: true, choices: [{ name: "موتزاريلا زيادة", price: 30 }, { name: "هالبينو", price: 12 }, { name: "صوص رانش", price: 15 }] }
      ]
    },
    {
      id: "garden-pizza", category: "pizza", name: "بيتزا خضار مشوي", price: 165,
      description: "فلفل ألوان، مشروم، زيتون وريحان طازة مع رشة زيت زيتون.",
      image: "garden-pizza", alt: "بيتزا خضار مشوي وزيتون", badge: "خفيفة",
      tags: ["vegetarian"], options: [
        { group: "الحجم", required: true, choices: [{ name: "وسط", price: 0 }, { name: "كبير", price: 45 }] },
        { group: "إضافات", multiple: true, choices: [{ name: "موتزاريلا زيادة", price: 30 }, { name: "مشروم زيادة", price: 20 }] }
      ]
    },
    {
      id: "margherita", category: "pizza", name: "مارجريتا فُرن", price: 150,
      description: "طماطم، موتزاريلا، ريحان وزيت زيتون — بسيطة ومتظبطة.",
      image: "margherita", alt: "بيتزا مارجريتا بالريحان", badge: "اختيار الشيف",
      tags: ["popular", "vegetarian"], options: [
        { group: "الحجم", required: true, choices: [{ name: "وسط", price: 0 }, { name: "كبير", price: 45 }] }
      ]
    },
    {
      id: "crispy-chicken", category: "sandwiches", name: "كريسبي فُرن", price: 125,
      description: "فراخ مقرمشة، كول سلو، خيار مخلل وصوص فُرن في خبز طري.",
      image: "crispy-chicken", alt: "ساندوتش فراخ مقرمشة", badge: "الأكثر طلبًا",
      tags: ["popular"], options: [
        { group: "درجة الحِرّ", required: true, choices: [{ name: "عادي", price: 0 }, { name: "حار", price: 0 }] },
        { group: "إضافات", multiple: true, choices: [{ name: "جبنة شيدر", price: 18 }, { name: "قطعة فراخ زيادة", price: 45 }] }
      ]
    },
    {
      id: "double-burger", category: "sandwiches", name: "ميني برجر دبل", price: 145,
      description: "قطعتان لحم مشوي، شيدر، بصل مكرمل وصوص مدخن.",
      image: "burger", alt: "برجر لحم دبل بجبنة شيدر", badge: "اختيار الشيف",
      tags: ["popular"], options: [
        { group: "التسوية", required: true, choices: [{ name: "وسط", price: 0 }, { name: "تامة", price: 0 }] },
        { group: "إضافات", multiple: true, choices: [{ name: "شيدر زيادة", price: 18 }, { name: "مشروم", price: 20 }] }
      ]
    },
    {
      id: "shawarma", category: "sandwiches", name: "شاورما فراخ", price: 105,
      description: "فراخ متبلة، تومية، بطاطس ومخلل في عيش سوري محمّص.",
      image: "shawarma", alt: "ساندوتش شاورما فراخ", badge: "حار اختياري",
      tags: ["spicy"], options: [
        { group: "درجة الحِرّ", required: true, choices: [{ name: "عادي", price: 0 }, { name: "حار", price: 0 }] },
        { group: "إضافات", multiple: true, choices: [{ name: "تومية زيادة", price: 12 }, { name: "جبنة", price: 18 }] }
      ]
    },
    {
      id: "loaded-fries", category: "sides", name: "بطاطس تشيزي", price: 70,
      description: "بطاطس مقرمشة، صوص جبنة دافئ، بابريكا وبصل أخضر.",
      image: "loaded-fries", alt: "بطاطس مغطاة بصوص الجبنة", badge: "مشاركة",
      tags: ["popular", "vegetarian"], options: [
        { group: "إضافات", multiple: true, choices: [{ name: "هالبينو", price: 12 }, { name: "صوص جبنة زيادة", price: 18 }] }
      ]
    },
    {
      id: "wings", category: "sides", name: "أجنحة فاير", price: 115,
      description: "6 قطع أجنحة مقرمشة بصوص حار متوازن ورشة سمسم.",
      image: "wings", alt: "أجنحة دجاج بصوص حار", badge: "سبايسي",
      tags: ["spicy"], options: [
        { group: "الصوص", required: true, choices: [{ name: "هوت هاني", price: 0 }, { name: "باربكيو", price: 0 }] }
      ]
    },
    {
      id: "garden-salad", category: "sides", name: "سلطة الحديقة", price: 65,
      description: "خس مقرمش، طماطم، خيار، أعشاب ودريسنج ليمون خفيف.",
      image: "salad", alt: "سلطة خضراء طازجة", badge: "خفيفة",
      tags: ["vegetarian"], options: []
    },
    {
      id: "mint-lemonade", category: "drinks", name: "ليمون بالنعناع", price: 45,
      description: "ليمون فريش، نعناع وثلج — متظبط وقت الطلب.",
      image: "lemonade", alt: "مشروب ليمون بالنعناع", badge: "فريش",
      tags: ["popular", "vegetarian"], options: []
    },
    {
      id: "cola", category: "drinks", name: "كولا ساقعة", price: 30,
      description: "كان 330 مل — باردة وجاهزة مع الطلب.",
      image: "cola", alt: "مشروب كولا بارد", badge: "",
      tags: ["vegetarian"], options: []
    },
    {
      id: "brownie", category: "desserts", name: "براوني سخنة", price: 80,
      description: "شوكولاتة غنية، قلب طري وصوص شوكولاتة دافئ.",
      image: "brownie", alt: "قطعة براوني شوكولاتة", badge: "اختيار الشيف",
      tags: ["popular", "vegetarian"], options: [
        { group: "إضافات", multiple: true, choices: [{ name: "سكوب آيس كريم", price: 30 }, { name: "صوص شوكولاتة زيادة", price: 15 }] }
      ]
    }
  ]
};
