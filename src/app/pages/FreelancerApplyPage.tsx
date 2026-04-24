'use client';

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Briefcase, CheckCircle, FileText, Mail, Send, Upload, User, X } from "lucide-react";
<<<<<<< HEAD
import { alertDialog } from "@/app/components/ui/confirmBus";
=======
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a

const SAUDI_BANKS = [
  "البنك الأهلي السعودي",
  "مصرف الراجحي",
  "بنك الرياض",
  "البنك السعودي الأول",
  "البنك العربي الوطني",
  "مصرف الإنماء",
  "البنك السعودي الفرنسي",
  "البنك السعودي للاستثمار",
  "بنك البلاد",
  "بنك الجزيرة",
  "بنك الخليج الدولي",
  "بنك دال 360",
  "بنك إس تي سي",
  "بنك فيجن",
  "بنك الإمارات دبي الوطني",
  "فرع بنك أبوظبي الأول",
  "بنك الكويت الوطني",
];

const SAUDI_CITIES_AR = [
  "الرياض", "جدة", "مكة المكرمة", "المدينة المنورة", "الدمام", "الخبر", "الظهران", "الأحساء", "الجبيل", "القطيف",
  "حفر الباطن", "الخفجي", "أبها", "خميس مشيط", "بيشة", "النماص", "محايل عسير", "تبوك", "تيماء", "حقل",
  "ضبا", "القريات", "سكاكا", "دومة الجندل", "حائل", "بقعاء", "الشنان", "عرعر", "رفحاء", "طريف",
  "جازان", "صبيا", "أبو عريش", "صامطة", "نجران", "شرورة", "حبونا", "الباحة", "المخواة", "بلجرشي",
  "القنفذة", "الطائف", "رابغ", "ينبع", "العُلا", "وادي الدواسر", "الخرج", "المجمعة", "بريدة", "عنيزة",
  "الرس", "البكيرية",
];

const COUNTRIES = [
  { code: "SA", name: "المملكة العربية السعودية", phone: "+966", flag: "🇸🇦", phoneMin: 9, phoneMax: 9, phoneStarts: "5" },
  { code: "AE", name: "الإمارات العربية المتحدة", phone: "+971", flag: "🇦🇪", phoneMin: 9, phoneMax: 9, phoneStarts: "5" },
  { code: "KW", name: "الكويت", phone: "+965", flag: "🇰🇼", phoneMin: 8, phoneMax: 8 },
  { code: "QA", name: "قطر", phone: "+974", flag: "🇶🇦", phoneMin: 8, phoneMax: 8 },
  { code: "BH", name: "البحرين", phone: "+973", flag: "🇧🇭", phoneMin: 8, phoneMax: 8 },
  { code: "OM", name: "عُمان", phone: "+968", flag: "🇴🇲", phoneMin: 8, phoneMax: 8 },
  { code: "IQ", name: "العراق", phone: "+964", flag: "🇮🇶", phoneMin: 10, phoneMax: 10, phoneStarts: "7" },
  { code: "SY", name: "سوريا", phone: "+963", flag: "🇸🇾", phoneMin: 9, phoneMax: 9, phoneStarts: "9" },
  { code: "LB", name: "لبنان", phone: "+961", flag: "🇱🇧", phoneMin: 7, phoneMax: 8 },
  { code: "JO", name: "الأردن", phone: "+962", flag: "🇯🇴", phoneMin: 9, phoneMax: 9, phoneStarts: "7" },
  { code: "PS", name: "فلسطين", phone: "+970", flag: "🇵🇸", phoneMin: 9, phoneMax: 9, phoneStarts: "5" },
  { code: "YE", name: "اليمن", phone: "+967", flag: "🇾🇪", phoneMin: 9, phoneMax: 9, phoneStarts: "7" },
  { code: "EG", name: "مصر", phone: "+20", flag: "🇪🇬", phoneMin: 10, phoneMax: 10, phoneStarts: "1" },
  { code: "LY", name: "ليبيا", phone: "+218", flag: "🇱🇾", phoneMin: 9, phoneMax: 9, phoneStarts: "9" },
  { code: "TN", name: "تونس", phone: "+216", flag: "🇹🇳", phoneMin: 8, phoneMax: 8 },
  { code: "DZ", name: "الجزائر", phone: "+213", flag: "🇩🇿", phoneMin: 9, phoneMax: 9 },
  { code: "MA", name: "المغرب", phone: "+212", flag: "🇲🇦", phoneMin: 9, phoneMax: 9 },
  { code: "MR", name: "موريتانيا", phone: "+222", flag: "🇲🇷", phoneMin: 8, phoneMax: 8 },
  { code: "SD", name: "السودان", phone: "+249", flag: "🇸🇩", phoneMin: 9, phoneMax: 9, phoneStarts: "9" },
  { code: "SO", name: "الصومال", phone: "+252", flag: "🇸🇴", phoneMin: 8, phoneMax: 9 },
  { code: "DJ", name: "جيبوتي", phone: "+253", flag: "🇩🇯", phoneMin: 8, phoneMax: 8 },
  { code: "KM", name: "جزر القمر", phone: "+269", flag: "🇰🇲", phoneMin: 7, phoneMax: 7 },
];

const VERIFICATION_REQUIRED_CATEGORIES = ["استشارات قانونية", "محاسبة", "موارد بشرية", "استشارات تسويقية", "خطط أعمال"];
const VERIFICATION_REQUIRED_MAINS = ["أعمال واستشارات"];

const CITIES_BY_COUNTRY: Record<string, string[]> = {
  SA: SAUDI_CITIES_AR,
  AE: ["دبي", "أبوظبي", "الشارقة", "العين", "عجمان", "رأس الخيمة", "الفجيرة", "أم القيوين"],
  KW: ["مدينة الكويت", "حولي", "الفروانية", "الأحمدي", "الجهراء", "مبارك الكبير"],
  QA: ["الدوحة", "الريان", "الوكرة", "الخور", "أم صلال"],
  BH: ["المنامة", "المحرق", "الرفاع", "مدينة عيسى", "مدينة حمد"],
  OM: ["مسقط", "صلالة", "صحار", "نزوى", "صور", "البريمي"],
  EG: ["القاهرة", "الإسكندرية", "الجيزة", "شبرا الخيمة", "بورسعيد", "السويس", "المنصورة", "طنطا", "أسيوط", "الأقصر", "أسوان", "دمياط", "الفيوم", "المنيا", "بني سويف"],
  JO: ["عمّان", "الزرقاء", "إربد", "العقبة", "السلط", "الكرك", "مأدبا"],
  LB: ["بيروت", "طرابلس", "صيدا", "صور", "زحلة", "جونيه"],
  MA: ["الرباط", "الدار البيضاء", "فاس", "مراكش", "طنجة", "أكادير", "مكناس", "وجدة"],
  DZ: ["الجزائر", "وهران", "قسنطينة", "عنابة", "البليدة", "باتنة", "سطيف"],
  TN: ["تونس", "صفاقس", "سوسة", "القيروان", "بنزرت", "قابس", "المنستير"],
  IQ: ["بغداد", "البصرة", "الموصل", "أربيل", "النجف", "كربلاء", "السليمانية"],
  YE: ["صنعاء", "عدن", "تعز", "الحديدة", "إب", "المكلا"],
  SY: ["دمشق", "حلب", "حمص", "حماة", "اللاذقية", "طرطوس", "دير الزور"],
  PS: ["القدس", "غزة", "رام الله", "نابلس", "الخليل", "بيت لحم", "جنين"],
  SD: ["الخرطوم", "أم درمان", "بورتسودان", "كسلا", "نيالا"],
  LY: ["طرابلس", "بنغازي", "مصراتة", "الزاوية", "سبها"],
};

const CATEGORY_TREE: Record<string, { subs: string[]; skills: string[] }> = {
  "تصميم وإبداع": {
    subs: ["تصميم شعارات", "هوية بصرية", "تصميم UI/UX", "تصميم بطاقات", "تصميم أغلفة", "إنفوجرافيك", "تصميم منشورات", "تصميم مطبوعات"],
    skills: ["Adobe Photoshop", "Adobe Illustrator", "Adobe XD", "Figma", "Sketch", "InDesign", "CorelDraw", "Canva", "Affinity Designer", "Procreate", "Branding", "Typography", "Color Theory", "Wireframing", "Prototyping"],
  },
  "تسويق رقمي": {
    subs: ["إدارة سوشيال ميديا", "تصميم منشورات", "إعلانات مدفوعة", "تحسين SEO", "تسويق بالمحتوى", "التسويق بالعمولة", "تسويق بالبريد"],
    skills: ["Google Ads", "Meta Ads", "TikTok Ads", "Snap Ads", "SEO", "SEM", "Google Analytics", "Email Marketing", "Mailchimp", "HubSpot", "Content Strategy", "Influencer Marketing", "Copywriting", "A/B Testing", "Conversion Optimization"],
  },
  "كتابة ومحتوى": {
    subs: ["كتابة مقالات", "كتابة إعلانية", "ترجمة", "تدقيق لغوي", "كتابة سيناريو", "كتابة قصصية"],
    skills: ["Copywriting", "Content Writing", "Translation", "Proofreading", "SEO Writing", "Technical Writing", "Storytelling", "Editing", "Research", "Scriptwriting", "Ghostwriting", "Localization"],
  },
  "فيديو وأنيميشن": {
    subs: ["مونتاج فيديو", "موشن جرافيك", "أنيميشن 2D", "أنيميشن 3D", "تصوير فيديو", "إخراج"],
    skills: ["Adobe Premiere Pro", "Adobe After Effects", "Final Cut Pro", "DaVinci Resolve", "Cinema 4D", "Blender", "Maya", "3ds Max", "Toon Boom", "Color Grading", "Sound Design", "Storyboarding", "VFX", "Motion Graphics"],
  },
  "برمجة وتطوير": {
    subs: ["تطوير مواقع", "تطوير تطبيقات", "تطوير ألعاب", "برمجة بوتات", "أتمتة", "تطوير ووردبريس", "تطوير شوبيفاي"],
    skills: ["JavaScript", "TypeScript", "React", "Next.js", "Vue", "Angular", "Node.js", "Python", "Django", "Flask", "PHP", "Laravel", "WordPress", "Shopify", "Flutter", "React Native", "Swift", "Kotlin", "Java", "C#", ".NET", "Go", "Rust", "PostgreSQL", "MongoDB", "MySQL", "Redis", "Docker", "AWS", "Firebase", "GraphQL", "REST API", "Tailwind CSS"],
  },
  "أعمال واستشارات": {
    subs: ["استشارات تسويقية", "خطط أعمال", "تحليل بيانات", "إدارة مشاريع", "محاسبة", "موارد بشرية", "استشارات قانونية"],
    skills: ["Business Strategy", "Financial Analysis", "Market Research", "Project Management", "Agile", "Scrum", "Excel", "Power BI", "Tableau", "SQL", "Python", "Data Visualization", "Risk Management", "Accounting", "Bookkeeping", "QuickBooks", "HR Management"],
  },
};

interface FormData {
  name: string;
  email: string;
  phone: string;
  phoneCountryCode: string;
  countryCode: string;
  country: string;
  city: string;
  gender: string;
  dateOfBirth: string;
  bio: string;
  mainCategories: string[];
  subCategories: string[];
  yearsExperience: string;
  skills: string[];
  languages: string[];
  portfolioUrl: string;
  nationalIdFrontImage: string;
  nationalIdBackImage: string;
  bankName: string;
  iban: string;
  accountHolderName: string;
  accountHolderEdited: boolean;
  ibanDocument: string;
  idType: "national_id" | "passport" | "";
  nationalIdNumber: string;
  passportNumber: string;
  agreedToTerms: boolean;
}

const initial: FormData = {
  name: "", email: "", phone: "", phoneCountryCode: "+966", countryCode: "SA", country: "المملكة العربية السعودية",
  city: "", gender: "", dateOfBirth: "", bio: "",
  mainCategories: [], subCategories: [], yearsExperience: "", skills: [],
  languages: [], portfolioUrl: "",
  nationalIdFrontImage: "", nationalIdBackImage: "",
  bankName: "", iban: "", accountHolderName: "", accountHolderEdited: false, ibanDocument: "",
  idType: "", nationalIdNumber: "", passportNumber: "",
  agreedToTerms: false,
};

type Errors = Partial<Record<string, string>>;

function formatIban(raw: string) {
  const v = raw.replace(/\s/g, "").toUpperCase();
  return v.replace(/(.{4})/g, "$1 ").trim();
}

export default function FreelancerApplyPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormData>(initial);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileNames, setFileNames] = useState<Record<string, string>>({});
  const frontRef = useRef<HTMLInputElement>(null);
  const backRef = useRef<HTMLInputElement>(null);
  const ibanDocRef = useRef<HTMLInputElement>(null);
  const [skillInput, setSkillInput] = useState("");
  const [langInput, setLangInput] = useState("");

  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [otpResendIn, setOtpResendIn] = useState(0);
  const [otpSending, setOtpSending] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpDevHint, setOtpDevHint] = useState("");

  const [emailTaken, setEmailTaken] = useState(false);
  const [emailChecking, setEmailChecking] = useState(false);
  const [phoneTaken, setPhoneTaken] = useState(false);
  const [phoneChecking, setPhoneChecking] = useState(false);
  const [duplicatePopup, setDuplicatePopup] = useState<{ field: "email" | "phone"; value: string } | null>(null);

  const [siteInfo, setSiteInfo] = useState<{ siteName: string; siteLogoUrl: string; registrationMode: "open" | "invite" | "closed" } | null>(null);
  const [inviteToken, setInviteToken] = useState<string>("");
  const [inviteValid, setInviteValid] = useState<boolean | null>(null);
  const [inviteError, setInviteError] = useState<string>("");
  const [verifDocs, setVerifDocs] = useState<Array<{ name: string; data: string }>>([]);
  const verifDocsRef = useRef<HTMLInputElement>(null);
  const [portfolioFiles, setPortfolioFiles] = useState<Array<{ name: string; data: string }>>([]);
  const portfolioFilesRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetch("/api/public/site").then(r => r.json()).then(setSiteInfo).catch(() => {}); }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const t = new URLSearchParams(window.location.search).get("invite");
    if (t) setInviteToken(t);
  }, []);

  useEffect(() => {
    if (!inviteToken) { setInviteValid(null); setInviteError(""); return; }
    fetch(`/api/public/check-invite?token=${encodeURIComponent(inviteToken)}`).then(r => r.json()).then(d => {
      if (d.valid) { setInviteValid(true); setInviteError(""); if (d.email) setForm(f => ({ ...f, email: f.email || d.email })); }
      else { setInviteValid(false); setInviteError(d.error === "used" ? "تم استخدام هذه الدعوة مسبقاً" : d.error === "expired" ? "انتهت صلاحية الدعوة" : "رمز الدعوة غير صحيح"); }
    });
  }, [inviteToken]);

  useEffect(() => {
    if (otpResendIn <= 0) return;
    const t = setTimeout(() => setOtpResendIn(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [otpResendIn]);

  // Live email availability check (debounced)
  useEffect(() => {
    const email = form.email.trim();
    if (!email || !/^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(email)) {
      setEmailTaken(false); return;
    }
    setEmailChecking(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/apply/check-availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) });
        const d = await r.json();
        const taken = !!d.emailTaken;
        setEmailTaken(taken);
        if (taken) setDuplicatePopup({ field: "email", value: email });
      } catch {} finally { setEmailChecking(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.email]);

  // Live phone availability check (debounced) — only freelancer side
  useEffect(() => {
    const phone = form.phone.trim();
    if (!phone || phone.replace(/\D/g, "").length < 7) { setPhoneTaken(false); return; }
    setPhoneChecking(true);
    const t = setTimeout(async () => {
      try {
        const r = await fetch("/api/apply/check-availability", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone, phoneCountryCode: form.phoneCountryCode }) });
        const d = await r.json();
        const taken = !!d.phoneTaken;
        setPhoneTaken(taken);
        if (taken) setDuplicatePopup({ field: "phone", value: form.phoneCountryCode + phone });
      } catch {} finally { setPhoneChecking(false); }
    }, 500);
    return () => clearTimeout(t);
  }, [form.phone, form.phoneCountryCode]);

  const currentCountry = useMemo(() => COUNTRIES.find(c => c.code === form.countryCode) || COUNTRIES[0], [form.countryCode]);
  const phoneDigits = form.phone.replace(/\D/g, "").length;
  const phoneLengthOk = phoneDigits >= currentCountry.phoneMin && phoneDigits <= currentCountry.phoneMax;
  const phoneStartsOk = !currentCountry.phoneStarts || form.phone.startsWith(currentCountry.phoneStarts);
  const phoneFullyValid = phoneLengthOk && phoneStartsOk;
  const requiresVerifDocs = useMemo(() => form.mainCategories.some(m => VERIFICATION_REQUIRED_MAINS.includes(m)) || form.subCategories.some(s => VERIFICATION_REQUIRED_CATEGORIES.includes(s)), [form.mainCategories, form.subCategories]);

  const totalSteps = 3;
  const cities = useMemo(() => CITIES_BY_COUNTRY[form.countryCode] || [], [form.countryCode]);
  const allSubs = useMemo(() => form.mainCategories.flatMap(c => CATEGORY_TREE[c]?.subs || []), [form.mainCategories]);
  const skillSuggestions = useMemo(() => {
    const set = new Set<string>();
    form.mainCategories.forEach(c => (CATEGORY_TREE[c]?.skills || []).forEach(s => set.add(s)));
    return Array.from(set);
  }, [form.mainCategories]);

  const set = <K extends keyof FormData>(k: K, v: FormData[K]) => setForm(f => ({ ...f, [k]: v }));
  const fieldClass = (k: string) => `w-full border ${errors[k] ? "border-red-400" : "border-gray-200"} rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none`;

  function selectCountry(code: string) {
    const c = COUNTRIES.find(x => x.code === code);
    if (!c) return;
    setForm(f => ({ ...f, countryCode: code, country: c.name, phoneCountryCode: c.phone, city: "" }));
    setOtpVerified(false); setOtpSent(false); setOtpCode("");
  }

  function toggleMain(cat: string) {
    setErrors(e => ({ ...e, mainCategories: undefined }));
    setForm(f => {
      const has = f.mainCategories.includes(cat);
      let mains = has ? f.mainCategories.filter(c => c !== cat) : (f.mainCategories.length >= 2 ? f.mainCategories : [...f.mainCategories, cat]);
      const valid = mains.flatMap(c => CATEGORY_TREE[c]?.subs || []);
      const subs = f.subCategories.filter(s => valid.includes(s));
      return { ...f, mainCategories: mains, subCategories: subs };
    });
  }

  function toggleSub(s: string) {
    setErrors(e => ({ ...e, subCategories: undefined }));
    setForm(f => {
      const has = f.subCategories.includes(s);
      const subs = has ? f.subCategories.filter(x => x !== s) : (f.subCategories.length >= 5 ? f.subCategories : [...f.subCategories, s]);
      return { ...f, subCategories: subs };
    });
  }

  function toggleLang(l: string) {
    setErrors(e => ({ ...e, languages: undefined }));
    setForm(f => ({ ...f, languages: f.languages.includes(l) ? f.languages.filter(x => x !== l) : [...f.languages, l] }));
  }

  function addLang() {
    const v = langInput.trim();
    if (!v) return;
    if (!form.languages.includes(v)) set("languages", [...form.languages, v]);
    setLangInput("");
  }

  function addSkill(value = skillInput) {
    const skill = value.trim();
    if (!skill) return;
    if (!form.skills.includes(skill)) set("skills", [...form.skills, skill]);
    setSkillInput("");
    setErrors(e => ({ ...e, skills: undefined }));
  }

  function removeSkill(s: string) { set("skills", form.skills.filter(x => x !== s)); }

  async function sendOtp() {
    setOtpError(""); setOtpDevHint("");
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 7) { setOtpError("أدخل رقم الواتساب أولاً"); return; }
    setOtpSending(true);
    try {
      const r = await fetch("/api/apply/whatsapp/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: form.phoneCountryCode + form.phone }) });
      const d = await r.json();
      if (!r.ok) { setOtpError(d.error || "فشل الإرسال"); return; }
      setOtpSent(true); setOtpResendIn(45);
      if (d.devCode) setOtpDevHint(`(وضع التطوير) الرمز: ${d.devCode}`);
    } finally { setOtpSending(false); }
  }

  async function verifyOtp() {
    setOtpError("");
    if (!otpCode.trim()) { setOtpError("أدخل الرمز"); return; }
    const r = await fetch("/api/apply/whatsapp/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone: form.phoneCountryCode + form.phone, code: otpCode.trim() }) });
    const d = await r.json();
    if (!r.ok) { setOtpError(d.error || "رمز غير صحيح"); return; }
    setOtpVerified(true);
  }

  function validateStep(s: number): boolean {
    const e: Errors = {};
    if (s === 1) {
      if (!form.name.trim()) e.name = "الاسم مطلوب";
      if (!form.email.trim() || !/\S+@\S+\.\S+/.test(form.email)) e.email = "بريد إلكتروني غير صالح";
      if (!form.phone.trim()) e.phone = "رقم الواتساب مطلوب";
      if (!otpVerified) e.phone = "يجب التحقق من رقم الواتساب";
      if (!form.country) e.country = "الدولة مطلوبة";
      if (!form.city) e.city = "المدينة مطلوبة";
      if (!form.gender) e.gender = "الجنس مطلوب";
      if (!form.dateOfBirth) e.dateOfBirth = "تاريخ الميلاد مطلوب";
      else {
        const dob = new Date(form.dateOfBirth);
        const ageMs = Date.now() - dob.getTime();
        const ageYears = ageMs / (365.25 * 24 * 3600 * 1000);
        if (Number.isNaN(dob.getTime())) e.dateOfBirth = "تاريخ الميلاد غير صالح";
        else if (ageYears < 18) e.dateOfBirth = "يجب أن يكون عمرك 18 سنة أو أكثر للتسجيل (لمتطلبات الهوية والحساب البنكي)";
        else if (ageYears > 100) e.dateOfBirth = "تاريخ الميلاد غير صالح";
      }
      if (emailTaken) e.email = "هذا البريد الإلكتروني مسجل مسبقاً — استخدم بريداً آخر أو سجّل دخول";
      if (phoneTaken) e.phone = "رقم الواتساب مسجل مسبقاً كمستقل — استخدم رقماً آخر";
      const len = form.bio.trim().length;
      if (len < 150 || len > 300) e.bio = "النبذة يجب أن تكون بين 150 و 300 حرف";
    }
    if (s === 2) {
      if (form.mainCategories.length === 0) e.mainCategories = "اختر تخصصاً رئيسياً واحداً على الأقل";
      if (form.subCategories.length === 0) e.subCategories = "اختر تخصصاً فرعياً واحداً على الأقل";
      if (!form.yearsExperience) e.yearsExperience = "سنوات الخبرة مطلوبة";
      if (form.languages.length === 0) e.languages = "اختر لغة واحدة على الأقل";
      if (form.skills.length === 0) e.skills = "أضف مهارة واحدة على الأقل";
    }
    if (s === 3) {
      if (!form.portfolioUrl.trim()) e.portfolioUrl = "رابط ملف الأعمال مطلوب";
      if (!form.idType) e.idType = "اختر نوع وثيقة الهوية";
      if (form.idType === "national_id" && !/^[12]\d{9}$/.test(form.nationalIdNumber)) e.nationalIdNumber = "رقم الهوية يجب أن يكون 10 أرقام ويبدأ بـ 1 أو 2";
      if (form.idType === "passport" && !/^[A-Z0-9]{6,12}$/i.test(form.passportNumber)) e.passportNumber = "رقم الجواز غير صالح";
      if (!form.nationalIdFrontImage) e.nationalIdFrontImage = form.idType === "passport" ? "صورة الجواز مطلوبة" : "صورة الهوية من الأمام مطلوبة";
      if (form.idType !== "passport" && !form.nationalIdBackImage) e.nationalIdBackImage = "صورة الهوية من الخلف مطلوبة";
      if (!form.bankName) e.bankName = "اسم البنك مطلوب";
      const iban = form.iban.replace(/\s/g, "");
      if (!iban) e.iban = "رقم الآيبان مطلوب";
      else if (!/^SA\d{22}$/i.test(iban)) e.iban = "الآيبان السعودي يبدأ بـ SA ويتكون من 24 خانة";
      if (!form.accountHolderName.trim()) e.accountHolderName = "اسم صاحب الحساب مطلوب";
      if (!form.ibanDocument) e.ibanDocument = "وثيقة الآيبان مطلوبة";
      if (!form.agreedToTerms) e.agreedToTerms = "يجب الموافقة على الشروط";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function nextStep() { if (validateStep(step)) setStep(s => s + 1); }

  function handleFileUpload(k: "nationalIdFrontImage" | "nationalIdBackImage" | "ibanDocument", file?: File) {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { setErrors(er => ({ ...er, [k]: "حجم الملف يجب أن لا يتجاوز 8MB" })); return; }
    const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/heic", "image/heif", "application/pdf"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(jpe?g|png|webp|gif|heic|heif|pdf)$/i)) {
      setErrors(er => ({ ...er, [k]: "نوع الملف غير مدعوم (صور أو PDF فقط)" })); return;
    }
    setFileNames(f => ({ ...f, [k]: file.name }));
    const reader = new FileReader();
    reader.onload = () => { set(k, reader.result as string); setErrors(er => ({ ...er, [k]: undefined })); };
    reader.readAsDataURL(file);
  }

  async function handleSubmit() {
    if (!validateStep(3)) return;
    if (siteInfo?.registrationMode === "closed") { setErrors({ form: "التسجيل مغلق حالياً" }); return; }
    if (siteInfo?.registrationMode === "invite" && !inviteValid) { setErrors({ form: inviteError || "هذا التسجيل بدعوة فقط — يلزم رابط دعوة صالح" }); return; }
    if (requiresVerifDocs && verifDocs.length === 0) { setErrors({ form: "هذه الفئة تتطلب رفع وثائق إثبات (شهادات/تراخيص)" }); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name, email: form.email, phone: form.phone, phoneCountryCode: form.phoneCountryCode,
          country: form.country, city: form.city, gender: form.gender, dateOfBirth: form.dateOfBirth,
          bio: form.bio, mainCategory: form.mainCategories.join(", "), subCategory: form.subCategories.join(", "),
          yearsExperience: form.yearsExperience, skills: form.skills, languages: form.languages,
          portfolioUrl: form.portfolioUrl,
          nationalIdFrontImage: form.nationalIdFrontImage, nationalIdBackImage: form.nationalIdBackImage,
          bankName: form.bankName, iban: form.iban.replace(/\s/g, "").toUpperCase(),
          accountHolderName: form.accountHolderName, ibanDocument: form.ibanDocument,
          idType: form.idType, nationalIdNumber: form.nationalIdNumber, passportNumber: form.passportNumber,
          verificationDocuments: verifDocs,
          portfolioFiles,
          inviteToken: inviteValid ? inviteToken : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ form: data.error || "حدث خطأ" }); return; }
      setSubmitted(true);
    } catch { setErrors({ form: "تعذّر الاتصال بالخادم" }); }
    finally { setLoading(false); }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-lg w-full text-center">
          <div className="w-20 h-20 bg-[#34cc30] rounded-full flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-white" /></div>
          <h1 className="text-3xl font-bold text-[#485869] mb-3">تم استلام طلبك بنجاح</h1>
          <p className="text-gray-600 mb-2">شكراً لتقديمك على الانضمام إلى منصتنا.</p>
          <p className="text-gray-500 text-sm mb-2">أرسلنا رسالة تأكيد إلى <span dir="ltr" className="text-[#34cc30] font-medium">{form.email}</span></p>
          <p className="text-gray-500 text-sm mb-8">طلبك الآن قيد المراجعة من قبل فريق العمل. سنتواصل معك عبر البريد الإلكتروني خلال أيام العمل القليلة القادمة بقرار قبول أو رفض الطلب. وفي حال القبول سنرسل لك رابطاً لإكمال إنشاء حسابك وتعيين كلمة المرور.</p>
          <Link href="/" className="text-[#34cc30] hover:text-[#2eb829] font-medium flex items-center justify-center gap-2"><ArrowLeft size={16} /> العودة للصفحة الرئيسية</Link>
        </div>
      </div>
    );
  }

  const FileBox = ({ label, errorKey, fileKey, refObj, optional }: { label: string; errorKey: string; fileKey: "nationalIdFrontImage" | "nationalIdBackImage" | "ibanDocument"; refObj: React.RefObject<HTMLInputElement | null>; optional?: boolean }) => {
    const data = form[fileKey];
    const isImage = data && data.startsWith("data:image/");
    const isPdf = data && data.startsWith("data:application/pdf");
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1.5">{label} {!optional && <span className="text-red-500">*</span>}</label>
        <div onClick={() => refObj.current?.click()} className={`border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors ${errors[errorKey] ? "border-red-400 bg-red-50" : data ? "border-[#34cc30] bg-green-50" : "border-gray-200 hover:border-[#34cc30]"}`}>
          <input ref={refObj} type="file" accept="image/*,application/pdf" className="hidden" onChange={e => handleFileUpload(fileKey, e.target.files?.[0])} />
          {data ? (
            <div className="flex flex-col items-center gap-2">
              {isImage ? (
                <img src={data} alt={fileNames[fileKey]} className="max-h-32 rounded-lg object-contain bg-white border border-gray-200" />
              ) : isPdf ? (
                <div className="bg-red-100 text-red-700 rounded-lg px-4 py-3 text-xs font-bold">PDF</div>
              ) : null}
              <div className="flex items-center gap-2 text-[#34cc30]"><CheckCircle size={16} /><span className="text-xs font-medium truncate max-w-[200px]">{fileNames[fileKey]}</span></div>
              <span className="text-xs text-gray-500">اضغط لاستبدال الملف</span>
            </div>
          ) : (
            <div className="py-2"><Upload size={28} className="text-gray-400 mx-auto mb-2" /><p className="text-sm text-gray-500">اضغط للرفع (صور أو PDF)</p><p className="text-xs text-gray-400 mt-1">حتى 8MB</p></div>
          )}
        </div>
        {errors[errorKey] && <p className="text-red-500 text-xs mt-1">{errors[errorKey]}</p>}
      </div>
    );
  };

  const bioLen = form.bio.trim().length;
  const bioColor = bioLen < 150 || bioLen > 300 ? "text-red-500" : "text-[#34cc30]";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white" dir="rtl">
      {duplicatePopup && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setDuplicatePopup(null)}>
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center text-2xl">⚠️</div>
              <div>
                <h3 className="text-lg font-bold text-[#485869]">{duplicatePopup.field === "email" ? "البريد الإلكتروني مستخدم" : "رقم الواتساب مستخدم"}</h3>
                <p className="text-xs text-gray-500" dir="ltr">{duplicatePopup.value}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              {duplicatePopup.field === "email"
                ? "هذا البريد الإلكتروني مسجل مسبقاً في منصتنا. إذا كنت أنت صاحب الحساب، يمكنك تسجيل الدخول مباشرة، أو استخدام بريد آخر للتقديم."
                : "رقم الواتساب هذا مسجل مسبقاً كمستقل. كل مستقل يجب أن يكون لديه رقم واتساب فريد. يرجى استخدام رقم آخر."}
            </p>
            <div className="flex gap-2 justify-end">
              {duplicatePopup.field === "email" && <Link href="/login" className="px-4 py-2 bg-[#34cc30] text-white rounded-lg hover:bg-[#2eb829] text-sm font-medium">تسجيل الدخول</Link>}
              <button onClick={() => setDuplicatePopup(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium">حسناً، سأغيّره</button>
            </div>
          </div>
        </div>
      )}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-[#485869] hover:text-[#34cc30]"><ArrowLeft size={18} /> <span className="text-sm">العودة</span></Link>
          <Link href="/" className="flex items-center">
            {siteInfo?.siteLogoUrl ? (
              <img src={siteInfo.siteLogoUrl} alt={siteInfo.siteName || "khadom"} className="h-10 w-auto object-contain" />
            ) : (
              <svg width="40" height="40" viewBox="0 0 3000 3000">
                <path fill="#34cc30" d="M2383.2,241.38H616.8c-146.62,146.62-228.8,228.85-375.42,375.47v1766.35s59.51,59.51,59.51,59.51l354.53-204.46,42.84-24.7v-.05l441.69-254.72,1.22,2.13,932.73-537.95s-598.17-100.73-982.84,124.01c-26.63,18.19-30.03,17.28-39.69-14.28-32.93-106.72-40.86-165.02-60.22-248.16-5.69-39.54,10.21-51.59,42.38-70.14,64.34-37.1,201.71-76.33,330.85-105.1,450.89-100.07,699.1,82.53,1044.74,3.2,19.67-5.59,42.08-1.42,45.54,19.46,7.57,52.75,7.83,186.92,4.98,251.41,1.32,22.11-16.41,40.91-45.48,54.83l-92.25,53.16c-128.63,74.2-138.34,96.97-178.54,185.85-26.78,52.6-3.05,78.93-125.83,158.31-25.77,14.84-130.81,75.42-130.81,75.42l-581.04,335.12-94.32,54.43-347.36,200.29-42.89,24.75-277.38,159.99,73.08,73.08h1768.26c145.88-145.88,227.67-227.67,373.56-373.56V616.85c-146.62-146.62-228.8-228.85-375.42-375.47ZM1331.7,691l-118.62,205.52c-10.06,17.23-31.81,24.09-49.04,14.03l-205.57-118.62c-17.23-10.06-24.09-31.81-14.03-49.04l118.62-205.57c10.06-17.23,31.81-24.04,49.09-13.98l205.52,118.57c17.23,10.06,24.09,31.87,14.03,49.09Z"/>
              </svg>
            )}
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-3 sm:px-6 py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#485869] mb-2">انضم لمنصة خدوم كمستقل</h1>
          <p className="text-sm sm:text-base text-gray-500">أكمل النموذج التالي وسيتم مراجعة طلبك خلال 24-48 ساعة</p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 mb-6 sm:mb-8">
          {[{ n: 1, l: "معلومات شخصية", i: User }, { n: 2, l: "التخصص والخبرة", i: Briefcase }, { n: 3, l: "المستندات والبنك", i: FileText }].map(s => (
            <div key={s.n} className="flex-1">
              <div className={`flex items-center justify-center md:justify-start gap-2 p-2 sm:p-3 rounded-xl border transition-all ${step === s.n ? "bg-[#34cc30] text-white border-[#34cc30] shadow-sm" : step > s.n ? "bg-[#34cc30]/15 text-[#34cc30] border-[#34cc30]/40" : "bg-white text-gray-600 border-gray-300"}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${step === s.n ? "bg-white text-[#34cc30]" : step > s.n ? "bg-[#34cc30] text-white" : "bg-gray-200 text-gray-600"}`}>{step > s.n ? <CheckCircle size={16} /> : s.n}</div>
                <span className="text-xs sm:text-sm font-medium hidden md:block">{s.l}</span>
                <span className="text-xs font-medium md:hidden truncate">{s.l.split(" ")[0]}</span>
              </div>
            </div>
          ))}
        </div>

        {siteInfo?.registrationMode === "closed" && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl text-sm flex items-center gap-2"><X size={16} /> التسجيل مغلق حالياً. يرجى المحاولة لاحقاً.</div>
        )}
        {siteInfo?.registrationMode === "invite" && (
          <div className={`mb-4 p-4 rounded-xl text-sm border ${inviteValid ? "bg-green-50 border-green-200 text-green-800" : "bg-yellow-50 border-yellow-200 text-yellow-800"}`}>
            <div className="flex items-center gap-2 mb-2 font-medium">
              {inviteValid ? <><CheckCircle size={16} /> دعوتك صالحة — تابع التسجيل</> : <>التسجيل بدعوة فقط — أدخل رمز الدعوة المرسل لك</>}
            </div>
            {!inviteValid && (
              <div className="flex gap-2" dir="ltr">
                <input value={inviteToken} onChange={e => setInviteToken(e.target.value.trim())} placeholder="invite-token" className="flex-1 border border-yellow-300 rounded-lg px-3 py-2 text-sm bg-white" />
              </div>
            )}
            {inviteError && <p className="text-xs text-red-600 mt-1">{inviteError}</p>}
          </div>
        )}
        {errors.form && <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-center gap-2"><X size={16} /> {errors.form}</div>}

        <div className="bg-white rounded-2xl shadow-sm p-4 sm:p-6 md:p-8">
          {step === 1 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#485869] mb-4">المعلومات الشخصية</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الاسم الكامل <span className="text-red-500">*</span></label>
                  <input value={form.name} onChange={e => { const v = e.target.value; setForm(f => ({ ...f, name: v, accountHolderName: f.accountHolderEdited ? f.accountHolderName : v })); }} className={fieldClass("name")} placeholder="الاسم الثلاثي" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البريد الإلكتروني <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <input value={form.email} onChange={e => set("email", e.target.value.replace(/[^\x20-\x7E]/g, "").replace(/\s/g, "").toLowerCase())} className={`${fieldClass("email")} ${emailTaken ? "border-red-400 bg-red-50" : (form.email && !emailChecking && !emailTaken ? "" : "")}`} type="email" placeholder="example@email.com" dir="ltr" autoComplete="email" />
                    {emailChecking && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">جاري التحقق...</span>}
                    {!emailChecking && emailTaken && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-red-500 font-bold">مستخدم!</span>}
                    {!emailChecking && !emailTaken && form.email && /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/.test(form.email) && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#34cc30] font-bold">✓ متاح</span>}
                  </div>
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  <p className="text-xs text-gray-400 mt-1">سيتم إرسال رابط تأكيد البريد وتعيين كلمة المرور بعد إكمال النموذج.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الدولة <span className="text-red-500">*</span></label>
                  <select value={form.countryCode} onChange={e => selectCountry(e.target.value)} className={fieldClass("country")}>
                    {COUNTRIES.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name} ({c.phone})</option>)}
                  </select>
                  {errors.country && <p className="text-red-500 text-xs mt-1">{errors.country}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">المدينة <span className="text-red-500">*</span></label>
                  <select value={form.city} onChange={e => set("city", e.target.value)} className={fieldClass("city")}>
                    <option value="">اختر المدينة...</option>
                    {cities.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الواتساب <span className="text-red-500">*</span></label>
                  <div className="flex flex-wrap gap-2" dir="ltr">
                    <input value={form.phoneCountryCode} readOnly className="w-20 sm:w-24 border border-gray-200 rounded-lg px-2 sm:px-3 py-2.5 bg-gray-50 text-center text-sm font-mono" />
                    <input value={form.phone} onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, currentCountry.phoneMax); set("phone", v); setOtpVerified(false); setOtpSent(false); }} className={`flex-1 min-w-0 border ${errors.phone || phoneTaken ? "border-red-400" : "border-gray-200"} rounded-lg px-3 sm:px-4 py-2.5 focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none ${otpVerified ? "bg-green-50" : phoneTaken ? "bg-red-50" : ""}`} placeholder={currentCountry.phoneStarts ? `${currentCountry.phoneStarts}${"X".repeat(currentCountry.phoneMin - 1)}` : "X".repeat(currentCountry.phoneMin)} maxLength={currentCountry.phoneMax} disabled={otpVerified} type="tel" inputMode="numeric" />
                    {!otpSent && !otpVerified && (
                      <button type="button" onClick={sendOtp} disabled={otpSending || !phoneFullyValid} title={!phoneFullyValid ? "أكمل رقم الجوال أولاً" : ""} className="bg-[#34cc30] text-white px-4 py-2.5 rounded-lg hover:bg-[#2eb829] disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap text-sm font-medium shrink-0">{otpSending ? "..." : "تحقق"}</button>
                    )}
                    {otpVerified && (
                      <span className="bg-[#34cc30]/10 text-[#34cc30] px-3 sm:px-4 py-2.5 rounded-lg flex items-center gap-1 text-sm font-medium whitespace-nowrap shrink-0"><CheckCircle size={16} /> تم التحقق</span>
                    )}
                  </div>
                  {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  {otpSent && !otpVerified && (
                    <div className="mt-3 bg-gray-50 border border-gray-200 rounded-lg p-3" dir="rtl">
                      <p className="text-xs text-gray-600 mb-2">أدخل رمز التحقق المرسل عبر الواتساب على الرقم <span dir="ltr" className="font-medium">{form.phoneCountryCode}{form.phone}</span></p>
                      <div className="flex gap-2" dir="ltr">
                        <input value={otpCode} onChange={e => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="000000" maxLength={6} className="flex-1 border border-gray-200 rounded-lg px-4 py-2 text-center text-lg tracking-widest focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" />
                        <button type="button" onClick={verifyOtp} className="bg-[#34cc30] text-white px-4 py-2 rounded-lg hover:bg-[#2eb829] text-sm font-medium">تأكيد</button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        {otpResendIn > 0 ? (
                          <span className="text-xs text-gray-500">إعادة الإرسال خلال {otpResendIn} ثانية</span>
                        ) : (
                          <button type="button" onClick={sendOtp} disabled={otpSending} className="text-xs text-[#34cc30] hover:underline">إعادة إرسال الرمز</button>
                        )}
                        {otpError && <span className="text-xs text-red-500">{otpError}</span>}
                      </div>
                      {otpDevHint && <p className="text-xs text-orange-600 mt-1">{otpDevHint}</p>}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">الجنس <span className="text-red-500">*</span></label>
                  <select value={form.gender} onChange={e => set("gender", e.target.value)} className={fieldClass("gender")}>
                    <option value="">اختر...</option><option value="ذكر">ذكر</option><option value="أنثى">أنثى</option>
                  </select>
                  {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">تاريخ الميلاد <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(يجب أن يكون عمرك 18 سنة أو أكثر)</span></label>
                  {(() => {
                    const parts = (form.dateOfBirth || "").split("-");
                    const y = parts[0] || "", m = parts[1] || "", d = parts[2] || "";
                    const update = (yy: string, mm: string, dd: string) => set("dateOfBirth", yy && mm && dd ? `${yy}-${mm.padStart(2, "0")}-${dd.padStart(2, "0")}` : "");
                    const months = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"];
                    const maxYear = new Date().getFullYear() - 18;
                    const years = Array.from({length: maxYear - 1939}, (_, i) => maxYear - i);
                    const daysInMonth = m && y ? new Date(Number(y), Number(m), 0).getDate() : 31;
                    return (
                      <div className="grid grid-cols-3 gap-2">
                        <select value={d} onChange={e => update(y, m, e.target.value)} className={fieldClass("dateOfBirth")}>
                          <option value="">يوم</option>
                          {Array.from({length: daysInMonth}, (_, i) => i + 1).map(n => <option key={n} value={String(n)}>{n}</option>)}
                        </select>
                        <select value={m} onChange={e => update(y, e.target.value, d)} className={fieldClass("dateOfBirth")}>
                          <option value="">شهر</option>
                          {months.map((mn, i) => <option key={i} value={String(i + 1)}>{mn}</option>)}
                        </select>
                        <select value={y} onChange={e => update(e.target.value, m, d)} className={fieldClass("dateOfBirth")}>
                          <option value="">سنة</option>
                          {years.map(yy => <option key={yy} value={String(yy)}>{yy}</option>)}
                        </select>
                      </div>
                    );
                  })()}
                  {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">نبذة عنك <span className="text-red-500">*</span></label>
                <textarea value={form.bio} onChange={e => set("bio", e.target.value.slice(0, 300))} rows={4} placeholder="عرّف عن نفسك وخبراتك (150-300 حرف)" className={fieldClass("bio")} />
                <div className="flex items-center justify-between mt-1">
                  <span className={`text-xs ${bioColor}`}>{bioLen} / 300 حرف (الحد الأدنى 150)</span>
                  {errors.bio && <p className="text-red-500 text-xs">{errors.bio}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-[#485869] mb-4">التخصص والخبرة</h2>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المجال الرئيسي <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(اختر حتى 2)</span></label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {Object.keys(CATEGORY_TREE).map(c => {
                    const sel = form.mainCategories.includes(c);
                    const dis = !sel && form.mainCategories.length >= 2;
                    return (
                      <button type="button" key={c} onClick={() => toggleMain(c)} disabled={dis} className={`p-3 rounded-lg border text-sm transition-colors ${sel ? "bg-[#34cc30] text-white border-[#34cc30]" : dis ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-700 border-gray-200 hover:border-[#34cc30]"}`}>{c}</button>
                    );
                  })}
                </div>
                {errors.mainCategories && <p className="text-red-500 text-xs mt-1">{errors.mainCategories}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">التخصص الفرعي <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(اختر حتى 5)</span></label>
                {form.mainCategories.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 text-center">اختر المجال الرئيسي أولاً</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {allSubs.map(s => {
                      const sel = form.subCategories.includes(s);
                      const dis = !sel && form.subCategories.length >= 5;
                      return (
                        <button type="button" key={s} onClick={() => toggleSub(s)} disabled={dis} className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${sel ? "bg-[#34cc30] text-white border-[#34cc30]" : dis ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed" : "bg-white text-gray-700 border-gray-200 hover:border-[#34cc30]"}`}>{s}</button>
                      );
                    })}
                  </div>
                )}
                {errors.subCategories && <p className="text-red-500 text-xs mt-1">{errors.subCategories}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">سنوات الخبرة <span className="text-red-500">*</span></label>
                  <select value={form.yearsExperience} onChange={e => set("yearsExperience", e.target.value)} className={fieldClass("yearsExperience")}>
                    <option value="">اختر...</option>
                    {["أقل من سنة", "1-3 سنوات", "3-5 سنوات", "5-10 سنوات", "أكثر من 10 سنوات"].map(y => <option key={y}>{y}</option>)}
                  </select>
                  {errors.yearsExperience && <p className="text-red-500 text-xs mt-1">{errors.yearsExperience}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">اللغات <span className="text-red-500">*</span></label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {["العربية", "الإنجليزية"].map(l => (
                    <label key={l} className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer ${form.languages.includes(l) ? "bg-[#34cc30]/10 border-[#34cc30] text-[#34cc30]" : "bg-white border-gray-200"}`}>
                      <input type="checkbox" checked={form.languages.includes(l)} onChange={() => toggleLang(l)} className="accent-[#34cc30]" />
                      <span className="text-sm font-medium">{l}</span>
                    </label>
                  ))}
                  {form.languages.filter(l => l !== "العربية" && l !== "الإنجليزية").map(l => (
                    <span key={l} className="bg-[#34cc30]/10 text-[#34cc30] px-3 py-2 rounded-lg text-sm flex items-center gap-1 border border-[#34cc30]">
                      <button type="button" onClick={() => toggleLang(l)}><X size={12} /></button>
                      {l}
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input value={langInput} onChange={e => setLangInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addLang(); } }} placeholder="إضافة لغة جديدة..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" />
                  <button type="button" onClick={addLang} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">إضافة</button>
                </div>
                {errors.languages && <p className="text-red-500 text-xs mt-1">{errors.languages}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">المهارات <span className="text-red-500">*</span> <span className="text-xs text-gray-400">(بالإنجليزية)</span></label>
                {form.mainCategories.length === 0 ? (
                  <p className="text-sm text-gray-400 bg-gray-50 rounded-lg p-3 text-center">اختر المجال الرئيسي أولاً لرؤية المهارات المقترحة</p>
                ) : (
                  <div dir="ltr" className="flex flex-wrap gap-2 mb-3">
                    {skillSuggestions.filter(s => !form.skills.includes(s)).map(s => (
                      <button type="button" key={s} onClick={() => addSkill(s)} className="px-3 py-1.5 rounded-full text-sm border border-gray-200 bg-white text-gray-700 hover:border-[#34cc30] hover:text-[#34cc30]">+ {s}</button>
                    ))}
                  </div>
                )}
                {form.skills.length > 0 && (
                  <div dir="ltr" className="flex flex-wrap gap-2 mb-3">
                    {form.skills.map(s => (
                      <span key={s} className="bg-[#34cc30]/10 text-[#34cc30] px-3 py-1.5 rounded-full text-sm flex items-center gap-1">
                        {s}<button type="button" onClick={() => removeSkill(s)}><X size={12} /></button>
                      </span>
                    ))}
                  </div>
                )}
                <div dir="ltr" className="flex gap-2">
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addSkill(); } }} placeholder="Add custom skill (English)..." className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#34cc30]/30 focus:border-[#34cc30] outline-none" />
                  <button type="button" onClick={() => addSkill()} className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 text-sm">Add</button>
                </div>
                {errors.skills && <p className="text-red-500 text-xs mt-1" dir="rtl">{errors.skills}</p>}
              </div>

              {requiresVerifDocs && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                  <label className="block text-sm font-medium text-amber-900 mb-1">
                    وثائق إثبات التخصص <span className="text-red-500">*</span>
                    <span className="text-xs font-normal text-amber-700 mr-2">(شهادات، تراخيص مهنية، أو ما يثبت اختصاصك في هذا المجال)</span>
                  </label>
                  <p className="text-xs text-amber-700 mb-3">يمكنك رفع حتى 5 ملفات (صور أو PDF، حد أقصى 8MB لكل ملف)</p>
                  <input
                    ref={verifDocsRef}
                    type="file"
                    accept="image/*,application/pdf"
                    multiple
                    className="hidden"
                    onChange={e => {
                      const files = Array.from(e.target.files || []);
                      const remaining = 5 - verifDocs.length;
                      files.slice(0, remaining).forEach(f => {
                        if (f.size > 8 * 1024 * 1024) return;
                        const r = new FileReader();
                        r.onload = () => setVerifDocs(d => [...d, { name: f.name, data: r.result as string }].slice(0, 5));
                        r.readAsDataURL(f);
                      });
                      if (verifDocsRef.current) verifDocsRef.current.value = "";
                    }}
                  />
                  <button type="button" onClick={() => verifDocsRef.current?.click()} disabled={verifDocs.length >= 5} className="bg-amber-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-amber-700 disabled:opacity-50 flex items-center gap-2">
                    <Upload size={16} /> رفع وثائق ({verifDocs.length}/5)
                  </button>
                  {verifDocs.length > 0 && (
                    <ul className="mt-3 space-y-1">
                      {verifDocs.map((d, i) => (
                        <li key={i} className="flex items-center justify-between bg-white rounded px-3 py-1.5 text-sm border border-amber-100">
                          <span className="flex items-center gap-2 text-gray-700"><CheckCircle size={14} className="text-[#34cc30]" /> {d.name}</span>
                          <button type="button" onClick={() => setVerifDocs(arr => arr.filter((_, x) => x !== i))} className="text-red-500 hover:text-red-700"><X size={14} /></button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5">
              <h2 className="text-xl font-bold text-[#485869] mb-4">المستندات والبيانات البنكية</h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">رابط ملف الأعمال أو الموقع <span className="text-red-500">*</span></label>
                <input value={form.portfolioUrl} onChange={e => set("portfolioUrl", e.target.value)} dir="ltr" placeholder="https://..." className={fieldClass("portfolioUrl")} />
                {errors.portfolioUrl && <p className="text-red-500 text-xs mt-1">{errors.portfolioUrl}</p>}
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  نماذج من أعمالك السابقة <span className="text-xs font-normal text-gray-500">(اختياري — يساعد في تقييم طلبك بشكل أفضل)</span>
                </label>
                <p className="text-xs text-gray-500 mb-3">صور أو PDF أو ملفات شائعة (Word, Excel, PowerPoint). حتى 5 ملفات، 10MB لكل ملف.</p>
                <input
                  ref={portfolioFilesRef}
                  type="file"
                  multiple
                  accept="image/*,application/pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip"
                  className="hidden"
                  onChange={e => {
                    const files = Array.from(e.target.files || []);
                    const remaining = 5 - portfolioFiles.length;
                    const blockedExt = /\.(exe|bat|cmd|sh|js|vbs|scr|msi|dll|com|jar|app|apk|ps1)$/i;
                    files.slice(0, remaining).forEach(f => {
<<<<<<< HEAD
                      if (f.size > 10 * 1024 * 1024) { void alertDialog(`الملف ${f.name} يتجاوز 10MB`, "warning"); return; }
                      if (blockedExt.test(f.name)) { void alertDialog(`نوع الملف ${f.name} غير مسموح به لأسباب أمنية`, "warning"); return; }
=======
                      if (f.size > 10 * 1024 * 1024) { alert(`الملف ${f.name} يتجاوز 10MB`); return; }
                      if (blockedExt.test(f.name)) { alert(`نوع الملف ${f.name} غير مسموح به لأسباب أمنية`); return; }
>>>>>>> 8eb51cc93e5b4ccff945f13b2cd31105415d835a
                      const r = new FileReader();
                      r.onload = () => setPortfolioFiles(d => [...d, { name: f.name, data: r.result as string }].slice(0, 5));
                      r.readAsDataURL(f);
                    });
                    if (portfolioFilesRef.current) portfolioFilesRef.current.value = "";
                  }}
                />
                <button type="button" onClick={() => portfolioFilesRef.current?.click()} disabled={portfolioFiles.length >= 5} className="bg-[#485869] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#3a4756] disabled:opacity-50 flex items-center gap-2">
                  <Upload size={16} /> رفع ملفات ({portfolioFiles.length}/5)
                </button>
                {portfolioFiles.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {portfolioFiles.map((d, i) => (
                      <div key={i} className="relative bg-white rounded-lg border border-gray-200 p-2 flex flex-col items-center gap-1">
                        {d.data.startsWith("data:image/") ? (
                          <img src={d.data} alt={d.name} className="h-20 w-full object-cover rounded" />
                        ) : (
                          <div className="h-20 w-full flex items-center justify-center bg-gray-100 rounded text-xs text-gray-500 font-bold">{d.name.split(".").pop()?.toUpperCase() || "FILE"}</div>
                        )}
                        <span className="text-xs truncate w-full text-center text-gray-700">{d.name}</span>
                        <button type="button" onClick={() => setPortfolioFiles(arr => arr.filter((_, x) => x !== i))} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-red-600"><X size={10} /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع وثيقة الهوية <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {[{ v: "national_id", l: "الهوية الوطنية" }, { v: "passport", l: "جواز السفر" }].map(o => (
                    <button type="button" key={o.v} onClick={() => set("idType", o.v as "national_id" | "passport")} className={`p-3 rounded-lg border text-sm transition-colors ${form.idType === o.v ? "bg-[#34cc30] text-white border-[#34cc30]" : "bg-white text-gray-700 border-gray-200 hover:border-[#34cc30]"}`}>{o.l}</button>
                  ))}
                </div>
                {errors.idType && <p className="text-red-500 text-xs mt-1">{errors.idType}</p>}
              </div>

              {form.idType === "national_id" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الهوية الوطنية <span className="text-red-500">*</span></label>
                  <input value={form.nationalIdNumber} onChange={e => set("nationalIdNumber", e.target.value.replace(/\D/g, "").slice(0, 10))} dir="ltr" inputMode="numeric" maxLength={10} placeholder="1XXXXXXXXX (10 أرقام)" className={`${fieldClass("nationalIdNumber")} font-mono tracking-wider`} />
                  {errors.nationalIdNumber && <p className="text-red-500 text-xs mt-1">{errors.nationalIdNumber}</p>}
                  {!errors.nationalIdNumber && form.nationalIdNumber.length > 0 && form.nationalIdNumber.length < 10 && <p className="text-orange-500 text-xs mt-1">باقي {10 - form.nationalIdNumber.length} أرقام</p>}
                  {!errors.nationalIdNumber && /^[12]\d{9}$/.test(form.nationalIdNumber) && <p className="text-[#34cc30] text-xs mt-1 flex items-center gap-1"><CheckCircle size={12} /> رقم صحيح</p>}
                </div>
              )}

              {form.idType === "passport" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم جواز السفر <span className="text-red-500">*</span></label>
                  <input value={form.passportNumber} onChange={e => set("passportNumber", e.target.value.replace(/[^A-Za-z0-9]/g, "").toUpperCase().slice(0, 12))} dir="ltr" maxLength={12} placeholder="A12345678" className={`${fieldClass("passportNumber")} font-mono tracking-wider`} />
                  {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
                  {!errors.passportNumber && /^[A-Z0-9]{6,12}$/.test(form.passportNumber) && <p className="text-[#34cc30] text-xs mt-1 flex items-center gap-1"><CheckCircle size={12} /> رقم صحيح</p>}
                </div>
              )}

              {form.idType && (
                form.idType === "passport" ? (
                  <FileBox label="صورة جواز السفر" errorKey="nationalIdFrontImage" fileKey="nationalIdFrontImage" refObj={frontRef} />
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    <FileBox label="صورة الهوية من الأمام" errorKey="nationalIdFrontImage" fileKey="nationalIdFrontImage" refObj={frontRef} />
                    <FileBox label="صورة الهوية من الخلف" errorKey="nationalIdBackImage" fileKey="nationalIdBackImage" refObj={backRef} />
                  </div>
                )
              )}

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">البنك <span className="text-red-500">*</span></label>
                  <select value={form.bankName} onChange={e => set("bankName", e.target.value)} className={fieldClass("bankName")}>
                    <option value="">اختر البنك...</option>
                    {SAUDI_BANKS.map(b => <option key={b}>{b}</option>)}
                  </select>
                  {errors.bankName && <p className="text-red-500 text-xs mt-1">{errors.bankName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">رقم الآيبان (IBAN) <span className="text-red-500">*</span></label>
                  <input value={form.iban} onChange={e => set("iban", formatIban(e.target.value))} placeholder="SA00 0000 0000 0000 0000 0000" dir="ltr" maxLength={29} className={`${fieldClass("iban")} font-mono tracking-wider`} />
                  {errors.iban && <p className="text-red-500 text-xs mt-1">{errors.iban}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">اسم صاحب الحساب كما هو في الوثيقة الوطنية والآيبان <span className="text-red-500">*</span></label>
                <input value={form.accountHolderName} onChange={e => setForm(f => ({ ...f, accountHolderName: e.target.value, accountHolderEdited: true }))} placeholder="الاسم كما هو مكتوب في الهوية" className={fieldClass("accountHolderName")} />
                <p className="text-xs text-gray-400 mt-1">تم تعبئته من اسمك في الخطوة الأولى — يمكنك تعديله هنا فقط ليطابق ما هو مكتوب في الوثيقة الوطنية والآيبان.</p>
                {errors.accountHolderName && <p className="text-red-500 text-xs mt-1">{errors.accountHolderName}</p>}
              </div>

              <FileBox label="وثيقة الآيبان المختومة من البنك" errorKey="ibanDocument" fileKey="ibanDocument" refObj={ibanDocRef} />

              <label className="flex items-start gap-2 cursor-pointer">
                <input type="checkbox" checked={form.agreedToTerms} onChange={e => set("agreedToTerms", e.target.checked)} className="mt-1 accent-[#34cc30]" />
                <span className="text-sm text-gray-700">أوافق على <Link href="/terms" className="text-[#34cc30] hover:underline">الشروط والأحكام</Link> و<Link href="/privacy" className="text-[#34cc30] hover:underline">سياسة الخصوصية</Link></span>
              </label>
              {errors.agreedToTerms && <p className="text-red-500 text-xs">{errors.agreedToTerms}</p>}
            </div>
          )}

          <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
            {step > 1 ? (
              <button type="button" onClick={() => setStep(s => s - 1)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50">السابق</button>
            ) : <div />}
            {step < totalSteps ? (
              <button type="button" onClick={nextStep} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] font-medium">التالي</button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading} className="bg-[#34cc30] text-white px-6 py-2.5 rounded-lg hover:bg-[#2eb829] font-medium disabled:opacity-50 flex items-center gap-2">
                {loading ? "جارٍ الإرسال..." : <>إرسال الطلب <Send size={16} /></>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
