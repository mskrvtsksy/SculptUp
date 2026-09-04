import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronRight,
  ChevronLeft,
  Check,
  Camera,
  Shield,
  Lock,
  MapPin,
  Compass,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertCircle,
  Video,
  FileText,
  AlertTriangle,
  UserCheck,
  ExternalLink,
  Search,
  Globe,
  Sparkles,
  X,
} from 'lucide-react';
import { OnboardingData, SupportedLanguage, TelegramUser } from '../types';
import { triggerHaptic } from '../lib/telegram';
import { LogoS, CircleVerifiedCheck } from './BrandAssets';
import {
  reverseGeocode,
  getClosestCity,
  detectLocationByIP,
  searchLocations,
  isCityValidInCountry,
  WORLD_COUNTRIES,
  getCitiesByCountryId,
  getCountryById,
  findCountryByName,
  filterLocalCities,
  getCityDisplayName,
  getCountryDisplayName,
  WorldCountry,
  GeoLocationResult,
} from '../lib/geo';
import { playHoverSound, playClickSound } from '../lib/sound';
import { TermsOfServiceModal } from './TermsOfServiceModal';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (data: OnboardingData) => void | Promise<void>;
  uiLanguage: SupportedLanguage;
  onLanguageChange?: (lang: SupportedLanguage) => void;
  currentUser: TelegramUser;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  uiLanguage,
  currentUser,
}) => {
  // Step index:
  // 0 = Telegram SSO & Legal (18+ Mandatory Gate)
  // 1 = Basic Profile (Name, Age 18+, Gender, Orientation)
  // 2 = Verified City & Country (Relational country -> city selector, GPS)
  // 3 = Photo Verification (Get badge OR skip without badge)
  const [step, setStep] = useState(0);

  // The parent only renders onboarding after server-side initData validation.
  // Never substitute a template identity here.
  const tgUser = currentUser;

  // Step 0: Legal & 18+ Confirmation (Apple/Notion frictionless model)
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true);
  const [isTermsAccepted, setIsTermsAccepted] = useState(true);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);

  // Step 1: Personal Info
  const [name, setName] = useState(tgUser.first_name);
  const [age, setAge] = useState<number>(24);
  const [gender, setGender] = useState<'female' | 'male' | 'nonbinary'>('male');
  const [interestedIn, setInterestedIn] = useState<'female' | 'male' | 'all'>('female');

  // Step 2: Location (RELATIONAL Country -> City structure with GPS)
  const [selectedCountryId, setSelectedCountryId] = useState<string>('');
  const [country, setCountry] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [selectedCityObj, setSelectedCityObj] = useState<GeoLocationResult | null>(null);
  const [latitude, setLatitude] = useState<number | undefined>();
  const [longitude, setLongitude] = useState<number | undefined>();
  const [searchRadiusKm, setSearchRadiusKm] = useState<number>(50);
  const [geoStatus, setGeoStatus] = useState<'idle' | 'detecting' | 'success' | 'denied'>('idle');
  const [geoAccuracy, setGeoAccuracy] = useState<number | null>(null);

  // City Autocomplete suggestions (filtered strictly by country)
  const [citySuggestions, setCitySuggestions] = useState<GeoLocationResult[]>([]);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  // Step 3: Bio & Verification
  const [bio, setBio] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string>(tgUser.photo_url || '');
  const [hasCapturedPhoto, setHasCapturedPhoto] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Camera & DOM refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);

  // Stop camera stream safely
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    return () => {
      stopCameraStream();
    };
  }, []);

  // Update city search suggestions on typing, strictly constrained to selectedCountryId
  useEffect(() => {
    const q = cityInput.trim().toLowerCase();
    const localCities = filterLocalCities(q, selectedCountryId).map((c) => ({
      city: c.nameRu,
      country: c.countryRu,
      countryId: c.countryId,
      cityId: c.id,
      latitude: c.lat,
      longitude: c.lng,
      flag: c.flag,
      region: c.region,
    }));

    setCitySuggestions(localCities.slice(0, 10));

    // If query is at least 2 chars and few local matches, query async search
    if (q.length >= 2 && localCities.length < 4) {
      setIsSearchingCities(true);
      const timer = setTimeout(async () => {
        try {
          const asyncResults = await searchLocations(q, selectedCountryId);
          setCitySuggestions(asyncResults.slice(0, 8));
        } catch {
          // ignore
        } finally {
          setIsSearchingCities(false);
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [cityInput, selectedCountryId]);

  // Handler for selecting a country
  const handleCountryChange = (newCountryId: string) => {
    playClickSound();
    triggerHaptic('selection');
    const cObj = getCountryById(newCountryId);
    if (!cObj) return;

    setSelectedCountryId(newCountryId);
    setCountry(getCountryDisplayName(cObj, uiLanguage));
    // Enforce Geo Rule: always reset city when country changes
    setCityInput('');
    setSelectedCityObj(null);
    setLatitude(null);
    setLongitude(null);
    setShowCityDropdown(true);
  };

  // Handler for selecting a city from verified suggestions
  const handleSelectVerifiedCity = (item: GeoLocationResult) => {
    playClickSound();
    triggerHaptic('selection');
    setCityInput(item.city);
    setSelectedCityObj(item);
    setCountry(item.country);
    if (item.countryId && item.countryId !== selectedCountryId) {
      setSelectedCountryId(item.countryId);
    }
    setLatitude(item.latitude);
    setLongitude(item.longitude);
    setShowCityDropdown(false);
  };

  // GPS Auto-detection (satellite or network fallback)
  const handleDetectLocation = async () => {
    playClickSound();
    triggerHaptic('medium');
    setGeoStatus('detecting');

    const executeReverse = async (lat: number, lon: number, accuracy?: number) => {
      setLatitude(lat);
      setLongitude(lon);
      if (accuracy) setGeoAccuracy(accuracy);

      try {
        const geoRes = await reverseGeocode(lat, lon);
        if (geoRes && geoRes.city) {
          const resolvedCountry =
            (geoRes.countryId ? getCountryById(geoRes.countryId) : null) ||
            findCountryByName(geoRes.country);
          const resolvedCountryId = resolvedCountry?.id || geoRes.countryId || 'GE';
          const resolvedCountryName = resolvedCountry?.nameRu || geoRes.country;

          setSelectedCountryId(resolvedCountryId);
          setCountry(resolvedCountryName);
          setCityInput(geoRes.city);
          setSelectedCityObj({
            ...geoRes,
            country: resolvedCountryName,
            countryId: resolvedCountryId,
          });
          setGeoStatus('success');
          triggerHaptic('success');
          return;
        }
      } catch {
        // continue to fallback
      }

      const fallback = getClosestCity({ latitude: lat, longitude: lon });
      setSelectedCountryId(fallback.countryId || 'GE');
      setCountry(fallback.country);
      setCityInput(fallback.city);
      setSelectedCityObj(fallback);
      setGeoStatus('success');
      triggerHaptic('success');
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          await executeReverse(
            pos.coords.latitude,
            pos.coords.longitude,
            Math.round(pos.coords.accuracy)
          );
        },
        async (err) => {
          console.warn('GPS failed/denied, falling back to IP:', err);
          const ipLocation = await detectLocationByIP();
          if (ipLocation) {
            await executeReverse(ipLocation.latitude, ipLocation.longitude);
          } else {
            setGeoStatus('denied');
            triggerHaptic('warning');
          }
        },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 30000 }
      );
    } else {
      const ipLocation = await detectLocationByIP();
      if (ipLocation) {
        await executeReverse(ipLocation.latitude, ipLocation.longitude);
      } else {
        setGeoStatus('denied');
      }
    }
  };

  // WebRTC Camera
  const handleStartCamera = async () => {
    try {
      playClickSound();
      triggerHaptic('medium');
      stopCameraStream();

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 640 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (error) {
      console.warn('Camera error:', error);
      setIsCameraActive(false);
      fileInputRef.current?.click();
    }
  };

  const handleCaptureSnapshot = () => {
    if (!videoRef.current || !canvasRef.current) return;

    triggerHaptic('heavy');
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const snapshotUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPhotoUrl(snapshotUrl);
      setHasCapturedPhoto(true);
      setPhotoError(null);
      stopCameraStream();
      triggerHaptic('success');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024) {
        setPhotoError('Выберите JPEG, PNG или WebP размером до 5 МБ.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        if (uploadEvent.target?.result) {
          setPhotoUrl(uploadEvent.target.result as string);
          setHasCapturedPhoto(true);
          setPhotoError(null);
          stopCameraStream();
          triggerHaptic('success');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Completion handler: supports with verified badge OR skipped without badge
  const handleFinishRegistration = async (verifiedStatus: boolean) => {
    stopCameraStream();
    triggerHaptic('success');

    const verifiedCityName = selectedCityObj?.city || cityInput.trim();
    const verifiedCountryName = selectedCityObj?.country || country;
    const verifiedCountryId = selectedCityObj?.countryId || selectedCountryId;
    const verifiedCityId = selectedCityObj?.cityId;

    const data: OnboardingData = {
      ageConfirmed: isAgeConfirmed,
      termsAccepted: isTermsAccepted,
      uiLanguage,
      spokenLanguages: ['ru', 'en'],
      name: name.trim() || tgUser.first_name,
      age: Math.max(18, age),
      gender,
      interestedIn,
      city: verifiedCityName,
      country: verifiedCountryName,
      countryId: verifiedCountryId,
      cityId: verifiedCityId,
      latitude,
      longitude,
      searchRadiusKm,
      isGeoVerified: geoStatus === 'success' || Boolean(selectedCityObj),
      heightCm: 184,
      bio: bio.trim(),
      photos: [photoUrl],
      verified: verifiedStatus,
      verificationPhotoUrl: verifiedStatus ? photoUrl : undefined,
    };

    setIsSavingProfile(true);
    setSubmitError(null);
    try {
      await onComplete(data);
    } catch (error) {
      const code = error instanceof Error ? error.message : '';
      setSubmitError(code === 'DATABASE_NOT_CONFIGURED'
        ? 'Сервис регистрации ещё не настроен. Попробуйте позже.'
        : 'Не удалось сохранить профиль. Проверьте интернет и повторите попытку.');
      triggerHaptic('error');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Check if current city is strictly valid in registry and belongs to the selected country
  const isCurrentCityStrictlyValid = Boolean(
    (selectedCityObj &&
      (!selectedCountryId || !selectedCityObj.countryId || selectedCityObj.countryId === selectedCountryId)) ||
    isCityValidInCountry(cityInput, selectedCountryId)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/95 backdrop-blur-xl font-sans overflow-hidden">
      <div className="w-full max-w-[460px] h-[var(--tg-viewport-height)] sm:h-auto sm:max-h-[94vh] bg-[#000000] border-x sm:border border-white/10 sm:rounded-[36px] flex flex-col shadow-[0_25px_80px_rgba(0,0,0,0.95)] text-white relative">
        {/* Hidden inputs & canvas for snapshot */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileUpload}
          className="hidden"
        />
        <canvas ref={canvasRef} className="hidden" />

        {/* Top Header: Brand + 4-Segment Progress Bar */}
        <div className="pt-4 sm:pt-5 px-5 sm:px-6 pb-2 text-center bg-black shrink-0">
          <div className="flex justify-center mb-1.5">
            <LogoS size={36} />
          </div>

          <span className="text-[11px] font-mono font-black text-[#CCFF00] tracking-widest uppercase block">
            SCULPT / ONBOARDING
          </span>

          {/* 4 Progress Segment Bars */}
          <div className="flex items-center gap-1.5 mt-2 max-w-[260px] mx-auto">
            {[0, 1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                  s <= step
                    ? 'bg-[#CCFF00] shadow-[0_0_8px_rgba(204,255,0,0.6)]'
                    : 'bg-[#222222]'
                }`}
              />
            ))}
          </div>

          {/* Step Counter Text */}
          <span className="text-[10px] font-mono text-gray-400 block mt-1">
            ШАГ 0{step + 1} / 04
          </span>
        </div>

        {/* Step Body Container with explicit min-h-0 and smooth overscroll */}
        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 sm:px-6 py-3 space-y-4">
          <AnimatePresence mode="wait">
            {/* ======================================================== */}
            {/* STEP 0: TELEGRAM ACCESS CONFIRMATION (APPLE / NOTION)    */}
            {/* ======================================================== */}
            {step === 0 && (
              <motion.div
                key="step0"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="text-center">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase">
                    Подтверждение доступа
                  </span>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                    Почти готово
                  </h1>
                  <p className="text-xs text-gray-300 max-w-xs mx-auto mt-1 leading-relaxed">
                    SCULPT предназначен только для совершеннолетних пользователей.
                  </p>
                </div>

                {/* Telegram Identity Card: Friendly, no technical jargon */}
                <div className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold tracking-wider text-gray-400 uppercase">
                      Вход через Telegram
                    </span>
                    <span className="text-[10px] font-mono text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full border border-[#CCFF00]/30 flex items-center gap-1 font-bold">
                      <CheckCircle2 className="w-3 h-3 text-[#CCFF00]" /> Подключен
                    </span>
                  </div>

                  <p className="text-[11px] text-gray-400 leading-snug">
                    Ваш аккаунт используется для подтверждения личности и защиты от фейков.
                  </p>

                  <div className="flex items-center gap-3 bg-black/50 p-2.5 rounded-xl border border-white/5">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-[#1a1a1a] border border-white/10 shrink-0">
                      {photoUrl ? (
                        <img src={photoUrl} alt={name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="w-full h-full flex items-center justify-center text-sm font-mono font-black text-[#CCFF00]">
                          {tgUser.first_name.slice(0, 1).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-mono font-bold text-white truncate">
                          {tgUser.first_name}
                        </span>
                        {tgUser.username && (
                          <span className="text-xs font-mono text-gray-400 truncate">
                            @{tgUser.username}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] font-mono text-gray-500 block mt-0.5">
                        Telegram Mini App · ID {tgUser.id}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Apple / Notion Clean Confirmation Checklist */}
                <div className="p-4 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-3">
                  <span className="text-[10px] font-mono font-bold tracking-widest text-gray-400 uppercase block">
                    Перед продолжением подтвердите:
                  </span>

                  <div className="space-y-2.5">
                    {[
                      'Вам исполнилось 18 лет',
                      'Вы используете собственные фотографии',
                      'Вы соблюдаете правила сообщества',
                      'Вы согласны с условиями сервиса',
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <div className="w-5 h-5 rounded-full bg-[#CCFF00]/15 border border-[#CCFF00]/40 flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[#CCFF00] stroke-[3]" />
                        </div>
                        <span className="text-xs text-gray-200 font-medium font-sans">
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Secondary Link to view full terms */}
                  <div className="pt-2 border-t border-white/5 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        triggerHaptic('light');
                        setIsTermsModalOpen(true);
                      }}
                      onMouseEnter={playHoverSound}
                      className="inline-flex items-center gap-1.5 text-xs font-mono text-[#CCFF00] hover:underline underline-offset-4 cursor-pointer hover-glow-green py-0.5 px-1.5"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Посмотреть полный документ</span>
                      <ExternalLink className="w-3 h-3 ml-0.5" />
                    </button>
                  </div>
                </div>

                {/* Step Action: Clean & Prompt [ Продолжить ] */}
                <div className="pt-2 space-y-2">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      triggerHaptic('medium');
                      setIsAgeConfirmed(true);
                      setIsTermsAccepted(true);
                      setStep(1);
                    }}
                    onMouseEnter={playHoverSound}
                    className="w-full py-3.5 rounded-2xl font-mono font-black text-sm flex items-center justify-center gap-2 bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[0_0_25px_rgba(204,255,0,0.35)] hover-glow-green cursor-pointer transition-all active:scale-98"
                  >
                    <span>Продолжить</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>

                  <p className="text-center text-[10.5px] text-gray-400 font-sans leading-tight">
                    Нажимая кнопку, вы принимаете условия использования.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 1: PERSONAL DETAILS (Name, Age 18+, Gender)        */}
            {/* ======================================================== */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-sans">Profile Identity</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                    Данные профиля
                  </h1>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Укажите базовые параметры для точного подбора анкет в ленте.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {/* Name field */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
                      ВАШЕ ИМЯ
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Имя"
                      className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#CCFF00] rounded-2xl px-4 py-3 text-sm text-white font-mono transition-colors outline-none"
                    />
                  </div>

                  {/* Age field with STRICT 18+ enforcement */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
                        ВОЗРАСТ (СТРОГО 18+)
                      </label>
                      {age < 18 ? (
                        <span className="text-[10px] font-mono font-bold text-red-400 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Младше 18 лет нельзя
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold text-[#CCFF00]">
                          ✓ Совершеннолетний
                        </span>
                      )}
                    </div>
                    <input
                      type="number"
                      min={18}
                      max={99}
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 18)}
                      className={`w-full bg-[#0D0D0D] border rounded-2xl px-4 py-3 text-sm text-white font-mono transition-colors outline-none ${
                        age < 18
                          ? 'border-red-500/70 focus:border-red-500'
                          : 'border-white/10 focus:border-[#CCFF00]'
                      }`}
                    />
                  </div>

                  {/* Gender Selector */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
                      ВАШ ПОЛ
                    </label>
                    <div className="rounded-2xl bg-[#0D0D0D] border border-white/10 divide-y divide-[#1a1a1a] overflow-hidden">
                      {[
                        { id: 'male', label: 'Мужчина (Man)' },
                        { id: 'female', label: 'Женщина (Woman)' },
                        { id: 'nonbinary', label: 'Non-binary' },
                      ].map((item) => {
                        const isSelected = gender === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              triggerHaptic('selection');
                              setGender(item.id as any);
                            }}
                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/5 transition-colors text-left cursor-pointer"
                          >
                            <span
                              className={`text-sm ${
                                isSelected ? 'text-white font-bold' : 'text-gray-400'
                              }`}
                            >
                              {item.label}
                            </span>
                            {isSelected && (
                              <Check className="w-4 h-4 text-[#CCFF00] stroke-[3]" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Seeking Preference */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
                      КОГО ИЩЕТЕ
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: 'female', label: 'Девушек' },
                        { id: 'male', label: 'Парней' },
                        { id: 'all', label: 'Всех' },
                      ].map((item) => {
                        const isSelected = interestedIn === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                              playClickSound();
                              triggerHaptic('selection');
                              setInterestedIn(item.id as any);
                            }}
                            className={`py-2.5 px-2 rounded-xl text-xs font-mono font-bold border text-center transition-all ${
                              isSelected
                                ? 'bg-[#151909] border-[#CCFF00] text-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.25)]'
                                : 'bg-[#0D0D0D] border-white/10 text-gray-400 hover:border-white/20'
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      triggerHaptic('light');
                      setStep(0);
                    }}
                    onMouseEnter={playHoverSound}
                    className="py-3.5 px-4 rounded-2xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-sm font-mono flex items-center justify-center gap-1 transition-colors hover-glow-green"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    type="button"
                    disabled={!name.trim() || age < 18}
                    onClick={() => {
                      playClickSound();
                      triggerHaptic('medium');
                      setStep(2);
                    }}
                    onMouseEnter={() => {
                      if (name.trim() && age >= 18) playHoverSound();
                    }}
                    className={`flex-1 py-3.5 rounded-2xl font-mono font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                      name.trim() && age >= 18
                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[0_0_25px_rgba(204,255,0,0.35)] hover-glow-green cursor-pointer'
                        : 'bg-[#161616] border border-[#262626] text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Далее к локации</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 2: VERIFIED RELATIONAL COUNTRY & CITY SELECTOR     */}
            {/* ======================================================== */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="text-center">
                  <p className="text-xs text-[#CCFF00] font-mono tracking-wider uppercase">Verified Geo-Registry</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                    Локация и радиус
                  </h1>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Страна и город связаны через единый реестр координат для точного расчета дистанции между анкетами.
                  </p>
                </div>

                {/* 1. GPS Auto-Detect Button Card */}
                <div className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Compass className="w-4 h-4 text-[#CCFF00]" />
                      <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                        GPS АВТООПРЕДЕЛЕНИЕ
                      </span>
                    </div>

                    {geoStatus === 'success' && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-[#CCFF00] font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Спутник подтвержден
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={handleDetectLocation}
                    disabled={geoStatus === 'detecting'}
                    className="w-full py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-[#1f1f1f] border border-[#262626] hover:border-[#CCFF00]/50 flex items-center justify-center gap-2 text-xs font-mono text-gray-200 transition-all active:scale-98 cursor-pointer hover-glow-green"
                  >
                    {geoStatus === 'detecting' ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 text-[#CCFF00] animate-spin" />
                        <span>Получение геопозиции (спутник/сеть)...</span>
                      </>
                    ) : (
                      <>
                        <MapPin className="w-3.5 h-3.5 text-[#CCFF00]" />
                        <span>📍 Определить автоматически</span>
                      </>
                    )}
                  </button>

                  {geoStatus === 'success' && geoAccuracy && (
                    <div className="text-[10px] font-mono text-gray-400 flex items-center justify-between px-1">
                      <span>Точность позиционирования:</span>
                      <span className="text-[#CCFF00] font-bold">~{geoAccuracy} м</span>
                    </div>
                  )}
                </div>

                {/* 2. Country Selector (Step 1 in manual flow) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
                      <Globe className="w-3 h-3 text-[#CCFF00]" />
                      ШАГ 1: ВЫБЕРИТЕ СТРАНУ
                    </label>
                    <span className="text-[10px] font-mono text-gray-400">
                      ID: {selectedCountryId}
                    </span>
                  </div>

                  <select
                    value={selectedCountryId}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-white/15 focus:border-[#CCFF00] rounded-2xl px-4 py-3 text-sm text-white font-mono transition-colors outline-none cursor-pointer"
                  >
                    <option value="" disabled className="bg-[#141414] text-gray-400">Выберите страну</option>
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c.id} value={c.id} className="bg-[#141414] text-white py-1">
                        {c.flag} {c.nameRu} ({c.nameEn})
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. City Selection (Step 2 in manual flow - strictly for this country) */}
                <div className="space-y-1.5 relative">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-[#CCFF00]" />
                      ШАГ 2: ГОРОД ({country})
                    </label>

                    {isCurrentCityStrictlyValid ? (
                      <span className="text-[10px] font-mono font-bold text-[#CCFF00] flex items-center gap-1">
                        <Check className="w-3 h-3 stroke-[3]" /> В реестре {country}
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono text-amber-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> Выберите город {country}
                      </span>
                    )}
                  </div>

                  {/* Quick-choice chips for popular cities in the selected country */}
                  {(() => {
                    const topCities = getCitiesByCountryId(selectedCountryId).slice(0, 5);
                    if (topCities.length === 0) return null;
                    return (
                      <div className="flex flex-wrap gap-1.5 pb-1">
                        {topCities.map((c) => {
                          const isSelected = selectedCityObj?.city === c.nameRu;
                          return (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                playClickSound();
                                triggerHaptic('selection');
                                setCityInput(c.nameRu);
                                setSelectedCityObj({
                                  city: c.nameRu,
                                  country,
                                  countryId: selectedCountryId,
                                  cityId: c.id,
                                  latitude: c.lat,
                                  longitude: c.lng,
                                  flag: c.flag,
                                  region: c.region,
                                });
                                setLatitude(c.lat);
                                setLongitude(c.lng);
                                setShowCityDropdown(false);
                              }}
                              className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-[#CCFF00] text-black font-bold border-[#CCFF00] shadow-[0_0_12px_rgba(204,255,0,0.3)]'
                                  : 'bg-[#121212] text-gray-300 border-white/10 hover:border-[#CCFF00]/50 hover:text-white'
                              }`}
                            >
                              {c.nameRu}
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  {/* Input container for city search */}
                  <div className="relative">
                    <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      ref={cityInputRef}
                      type="text"
                      value={cityInput}
                      onChange={(e) => {
                        setCityInput(e.target.value);
                        setSelectedCityObj(null);
                        setShowCityDropdown(true);
                      }}
                      onFocus={() => setShowCityDropdown(true)}
                      placeholder={`Введите город (${country})...`}
                      className={`w-full pl-10 pr-9 py-3 bg-[#0D0D0D] border rounded-2xl text-sm text-white font-mono transition-colors outline-none ${
                        isCurrentCityStrictlyValid
                          ? 'border-[#CCFF00] focus:border-[#CCFF00]'
                          : 'border-white/15 focus:border-amber-400'
                      }`}
                    />
                    {cityInput && (
                      <button
                        type="button"
                        onClick={() => {
                          setCityInput('');
                          setSelectedCityObj(null);
                          setShowCityDropdown(true);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Verified City Confirmation Card if chosen */}
                  {selectedCityObj && (
                    <div className="p-2.5 rounded-xl bg-[#121609] border border-[#CCFF00]/40 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{selectedCityObj.flag || '📍'}</span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-white">
                              {selectedCityObj.city}
                            </span>
                            <span className="text-[10px] font-mono text-[#CCFF00]">
                              {selectedCityObj.country}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-gray-400 block">
                            {selectedCityObj.region && `${selectedCityObj.region} · `}
                            Координаты: {selectedCityObj.latitude.toFixed(4)}, {selectedCityObj.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      <span className="text-[9px] font-mono font-bold text-black bg-[#CCFF00] px-2 py-0.5 rounded uppercase shrink-0">
                        Связано по ID
                      </span>
                    </div>
                  )}

                  {/* Strict Autocomplete Dropdown List */}
                  {showCityDropdown && citySuggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 z-30 mt-1 max-h-52 overflow-y-auto bg-[#121212] border border-white/20 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.95)] divide-y divide-white/5 no-scrollbar">
                      <div className="px-3 py-1.5 bg-black/60 text-[9px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Города ({country}): {citySuggestions.length}</span>
                        {isSearchingCities && (
                          <RefreshCw className="w-2.5 h-2.5 text-[#CCFF00] animate-spin" />
                        )}
                      </div>
                      {citySuggestions.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleSelectVerifiedCity(item)}
                          className="w-full px-3.5 py-2.5 flex items-center justify-between hover:bg-white/10 transition-colors text-left cursor-pointer group"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base shrink-0">{item.flag || '📍'}</span>
                            <div>
                              <span className="text-xs font-mono font-bold text-white group-hover:text-[#CCFF00] transition-colors block">
                                {item.city}
                              </span>
                              <span className="text-[10px] font-mono text-gray-400">
                                {item.country}
                                {item.region && ` · ${item.region}`}
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] font-mono text-gray-500 group-hover:text-[#CCFF00]">
                            Выбрать →
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Warning when typed city doesn't match selected country */}
                  {!isCurrentCityStrictlyValid && cityInput.trim().length > 0 && !showCityDropdown && (
                    <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/40 text-[11px] font-mono text-amber-200 leading-snug flex items-start gap-2">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                      <span>
                        Город «{cityInput}» не найден в реестре для страны «{country}». Выберите город из предложенных вариантов выше или смените страну.
                      </span>
                    </div>
                  )}
                </div>

                {/* 4. Search Radius Slider */}
                <div className="p-3.5 rounded-2xl bg-[#0D0D0D] border border-white/10 space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-[#CCFF00]" /> Радиус поиска анкет
                    </span>
                    <span className="font-bold text-[#CCFF00]">{searchRadiusKm} км</span>
                  </div>

                  <input
                    type="range"
                    min={5}
                    max={150}
                    step={5}
                    value={searchRadiusKm}
                    onChange={(e) => setSearchRadiusKm(parseInt(e.target.value))}
                    className="w-full accent-[#CCFF00] cursor-pointer"
                  />

                  <div className="flex justify-between text-[9px] font-mono text-gray-500">
                    <span>5 км (Рядом)</span>
                    <span>30 км</span>
                    <span>75 км</span>
                    <span>150 км (Вся страна)</span>
                  </div>
                </div>

                {/* Step Action Buttons */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      playClickSound();
                      triggerHaptic('light');
                      setStep(1);
                    }}
                    onMouseEnter={playHoverSound}
                    className="py-3.5 px-4 rounded-2xl border border-white/10 hover:bg-white/5 text-gray-400 hover:text-white text-sm font-mono flex items-center justify-center gap-1 transition-colors hover-glow-green"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Назад</span>
                  </button>

                  <button
                    type="button"
                    disabled={!isCurrentCityStrictlyValid}
                    onClick={() => {
                      playClickSound();
                      triggerHaptic('medium');
                      setStep(3);
                    }}
                    onMouseEnter={() => {
                      if (isCurrentCityStrictlyValid) playHoverSound();
                    }}
                    className={`flex-1 py-3.5 rounded-2xl font-mono font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                      isCurrentCityStrictlyValid
                        ? 'bg-[#CCFF00] hover:bg-[#b8e600] text-black shadow-[0_0_25px_rgba(204,255,0,0.35)] hover-glow-green cursor-pointer'
                        : 'bg-[#161616] border border-[#262626] text-gray-600 cursor-not-allowed'
                    }`}
                  >
                    <span>Далее к верификации</span>
                    <ChevronRight className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================================================== */}
            {/* STEP 3: PHOTO VERIFICATION & SKIP MECHANISM              */}
            {/* ======================================================== */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4 pt-1"
              >
                <div className="text-center">
                  <p className="text-xs text-gray-400 font-sans">Trust & Verification</p>
                  <h1 className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight mt-1">
                    Верификация селфи
                  </h1>
                  <p className="text-xs text-gray-400 max-w-xs mx-auto mt-1 leading-relaxed">
                    Сделайте селфи, чтобы получить значок <strong>«ПРОВЕРЕН»</strong>. Или пропустите этот шаг и завершите регистрацию без значка.
                  </p>
                </div>

                {/* Verified Badge Perks Highlight */}
                <div className="p-3 rounded-2xl bg-[#0e0e0e] border border-white/10 flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <CircleVerifiedCheck size={20} />
                    <span className="text-white font-bold">Знак «ПРОВЕРЕН»</span>
                  </div>
                  <span className="text-[10px] text-[#CCFF00] font-bold">
                    +78% к вниманию в ленте
                  </span>
                </div>

                {/* CAMERA VIEWPORT OR PHOTO CONTAINER */}
                <div className="space-y-3">
                  {isCameraActive ? (
                    <div className="relative w-full aspect-square max-w-[280px] mx-auto rounded-3xl overflow-hidden border-2 border-[#CCFF00] bg-black shadow-[0_0_30px_rgba(204,255,0,0.3)]">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover -scale-x-100"
                      />

                      {/* Face Oval Overlay */}
                      <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                        <div className="w-48 h-60 border-2 border-dashed border-[#CCFF00]/70 rounded-[50%] animate-pulse" />
                        <div className="absolute w-44 h-0.5 bg-[#CCFF00] shadow-[0_0_12px_#CCFF00] animate-bounce" />
                      </div>

                      {/* Camera buttons */}
                      <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-3 z-10">
                        <button
                          type="button"
                          onClick={handleCaptureSnapshot}
                          className="px-5 py-2.5 rounded-full bg-[#CCFF00] hover:bg-[#d8ff33] text-black font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg active:scale-95 transition-all cursor-pointer"
                        >
                          <Camera className="w-4 h-4 stroke-[2.5]" />
                          <span>Сделать селфи</span>
                        </button>

                        <button
                          type="button"
                          onClick={stopCameraStream}
                          className="w-9 h-9 rounded-full bg-black/60 border border-white/20 text-white text-xs flex items-center justify-center hover:bg-black cursor-pointer"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="w-full border-2 border-dashed border-[#CCFF00]/40 hover:border-[#CCFF00] bg-[#0c0c0c] rounded-[28px] p-4 flex flex-col items-center justify-center text-center transition-all group relative overflow-hidden">
                        {hasCapturedPhoto ? (
                          <div className="flex flex-col items-center space-y-2">
                            <div className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#CCFF00] shadow-[0_0_20px_rgba(204,255,0,0.35)]">
                              <img
                                src={photoUrl}
                                alt="Verification preview"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <span className="text-xs font-mono font-bold text-gray-300 flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3] text-[#CCFF00]" />
                              Фото добавлено. Значок появится после проверки.
                            </span>
                          </div>
                        ) : (
                          <div className="py-2.5 flex flex-col items-center">
                            <div className="w-12 h-12 rounded-full bg-[#161616] border border-white/10 flex items-center justify-center mb-2">
                              <Camera className="w-5 h-5 text-[#CCFF00]" />
                            </div>
                            <h3 className="text-xs font-bold text-white leading-snug">
                              Пройдите быструю селфи-проверку
                            </h3>
                            <p className="text-[11px] text-gray-500 mt-0.5">
                              Сделайте живой снимок или выберите фото
                            </p>
                          </div>
                        )}
                      </div>
                      {photoError && <p className="text-xs text-rose-300 px-1" role="alert">{photoError}</p>}

                      {/* 2 Camera / Upload Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={handleStartCamera}
                          className="py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-[#202020] border border-[#CCFF00]/40 hover:border-[#CCFF00] flex items-center justify-center gap-2 text-xs font-mono font-bold text-[#CCFF00] transition-colors cursor-pointer hover-glow-green"
                        >
                          <Video className="w-4 h-4" />
                          <span>Открыть камеру</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="py-2.5 px-3 rounded-xl bg-[#141414] hover:bg-[#202020] border border-white/10 hover:border-white/30 flex items-center justify-center gap-2 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
                        >
                          <Camera className="w-4 h-4" />
                          <span>Загрузить фото</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Bio statement */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase block">
                      ВАША КРАТКАЯ ЦЕЛЬ / ВАЙБ
                    </label>
                    <textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Пара слов о ваших интересах..."
                      className="w-full bg-[#0D0D0D] border border-white/10 focus:border-[#CCFF00] rounded-2xl p-2.5 text-xs text-white leading-relaxed resize-none transition-colors outline-none font-mono"
                    />
                  </div>
                </div>

                {/* STEP ACTIONS: COMPLETE WITH BADGE OR SKIP WITHOUT BADGE */}
                <div className="pt-2 space-y-2.5">
                  {/* Option A: Complete with Verified Checkmark */}
                  {hasCapturedPhoto ? (
                    <button
                      type="button"
                      onClick={() => void handleFinishRegistration(false)}
                      disabled={isSavingProfile}
                      onMouseEnter={playHoverSound}
                      className="w-full py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.4)] active:scale-98 transition-all hover-glow-green cursor-pointer"
                    >
                      <Check size={18} />
                      <span>{isSavingProfile ? 'Сохраняем…' : 'Завершить профиль'}</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handleFinishRegistration(false)}
                      disabled={isSavingProfile}
                      onMouseEnter={playHoverSound}
                      className="w-full py-3.5 rounded-2xl bg-[#CCFF00] hover:bg-[#b8e600] text-black font-mono font-black text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(204,255,0,0.35)] active:scale-98 transition-all hover-glow-green cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{isSavingProfile ? 'Сохраняем…' : 'Продолжить без фото'}</span>
                    </button>
                  )}

                  {/* Option B: Skip without Badge */}
                  <div className="text-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        playClickSound();
                        handleFinishRegistration(false);
                      }}
                      onMouseEnter={playHoverSound}
                      className="text-xs font-mono text-gray-400 hover:text-white transition-colors underline underline-offset-4 py-1 px-3 cursor-pointer hover-glow-green"
                    >
                      Добавить фото позже →
                    </button>
                    <span className="block text-[10px] font-mono text-gray-400 mt-0.5">
                      Проверка живого селфи проводится серверным провайдером и не имитируется в приложении.
                    </span>
                  </div>
                  {submitError && <p className="text-center text-xs text-rose-300" role="alert">{submitError}</p>}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Full Terms of Service Modal */}
        <TermsOfServiceModal
          isOpen={isTermsModalOpen}
          onClose={() => setIsTermsModalOpen(false)}
          onAcceptAndClose={() => {
            setIsAgeConfirmed(true);
            setIsTermsAccepted(true);
            setIsTermsModalOpen(false);
          }}
        />
      </div>
    </div>
  );
};
