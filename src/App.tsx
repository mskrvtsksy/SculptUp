/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, lazy, Suspense } from 'react';
import {
  UserProfile,
  FilterSettings,
  Match,
  WhoLikedItem,
  LooksmaxxingRating,
  SupportedLanguage,
  OnboardingData,
  TelegramUser,
} from './types';
import {
  INITIAL_PROFILES,
  INITIAL_WHO_LIKED,
  INITIAL_MATCHES,
} from './data/mockProfiles';
import {
  initTelegramApp,
  authenticateTelegramSession,
  bindTelegramBackButton,
  triggerHaptic,
} from './lib/telegram';
import { detectTelegramOrBrowserLanguage, LanguageProvider } from './lib/i18n';
import { calculateDistance } from './lib/geo';
import { getMyProfile, saveOnboardingProfile } from './lib/api';
import { TopNavbar, BottomNavbar, NavTabType } from './components/Navbar';
import { SwipeDeck } from './components/SwipeDeck';
import { MatchesView } from './components/MatchesView';
import { ChatsListView } from './components/ChatsListView';
import { ProfileView } from './components/ProfileView';
import { WelcomeScreen } from './components/WelcomeScreen';

const FiltersModal = lazy(() => import('./components/FiltersModal').then((module) => ({ default: module.FiltersModal })));
const StarsShopModal = lazy(() => import('./components/StarsShopModal').then((module) => ({ default: module.StarsShopModal })));
const ChatModal = lazy(() => import('./components/ChatModal').then((module) => ({ default: module.ChatModal })));
const AuditView = lazy(() => import('./components/AuditView').then((module) => ({ default: module.AuditView })));
const MatchCelebrationModal = lazy(() => import('./components/MatchCelebrationModal').then((module) => ({ default: module.MatchCelebrationModal })));
const OnboardingModal = lazy(() => import('./components/OnboardingModal').then((module) => ({ default: module.OnboardingModal })));
const LanguageSettingsModal = lazy(() => import('./components/LanguageSettingsModal').then((module) => ({ default: module.LanguageSettingsModal })));

const demoMode = (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
  .env?.VITE_DEMO_MODE === 'true';
const photoAuditEnabled = (import.meta as ImportMeta & { env?: Record<string, string | undefined> })
  .env?.VITE_ENABLE_PHOTO_AUDIT === 'true';
const storageKey = (telegramId: number, key: string) => `sculpt:v1:${telegramId}:${key}`;

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTabType>('deck');
  const [profiles, setProfiles] = useState<UserProfile[]>(() => demoMode ? INITIAL_PROFILES : []);
  const [whoLikedList, setWhoLikedList] = useState<WhoLikedItem[]>(() => demoMode ? INITIAL_WHO_LIKED : []);
  const [matches, setMatches] = useState<Match[]>(() => demoMode ? INITIAL_MATCHES : []);

  const [swipesRemaining, setSwipesRemaining] = useState<number>(15);
  const [isPremium, setIsPremium] = useState<boolean>(false);
  const [isWhoLikedUnlocked, setIsWhoLikedUnlocked] = useState<boolean>(false);
  const [starsBalance, setStarsBalance] = useState<number>(0);

  // Welcome screen & Onboarding registration states
  const [isRegistered, setIsRegistered] = useState<boolean>(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);

  // User location states
  const [userCity, setUserCity] = useState<string>('');
  const [userCountry, setUserCountry] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat?: number; lon?: number }>({});

  const [uiLanguage, setUiLanguage] = useState<SupportedLanguage>(() => detectTelegramOrBrowserLanguage());
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(['ru', 'en']);
  const [isVerified, setIsVerified] = useState<boolean>(false);

  const [filters, setFilters] = useState<FilterSettings>(() => {
    return {
      gender: 'all',
      minAge: 18,
      maxAge: 40,
      maxDistanceKm: 100,
      city: '',
      country: '',
      countryId: '',
      cityId: undefined,
      selectedTags: [],
    };
  });

  // Modal states
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [activeChatMatch, setActiveChatMatch] = useState<Match | null>(null);
  const [celebrationPartner, setCelebrationPartner] = useState<UserProfile | null>(null);

  const [currentUser, setCurrentUser] = useState<TelegramUser | null>(null);
  const [authState, setAuthState] = useState<'loading' | 'ready' | 'blocked'>(demoMode ? 'ready' : 'loading');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authAttempt, setAuthAttempt] = useState(0);

  useEffect(() => {
    const cleanup = initTelegramApp();
    if (demoMode) {
      setCurrentUser({ id: -1, first_name: 'Demo' });
      setShowWelcomeScreen(true);
      return cleanup;
    }

    const controller = new AbortController();
    setAuthState('loading');
    setAuthError(null);
    authenticateTelegramSession(controller.signal)
      .then(async ({ user }) => {
        setCurrentUser(user);
        const read = (key: string) => localStorage.getItem(storageKey(user.id, key));
        // A completed profile on the server wins over device-local cache so a
        // user can switch Telegram clients without re-registering.
        const remoteProfile = await getMyProfile().catch(() => null);
        const savedMatches = read('matches');
        if (savedMatches) {
          try {
            const parsed = JSON.parse(savedMatches);
            setMatches(Array.isArray(parsed) ? parsed : []);
          } catch {
            setMatches([]);
          }
        }
        const isComplete = Boolean(remoteProfile?.onboarding_completed_at) || (demoMode && read('onboarding_completed') === 'true');
        setIsRegistered(isComplete);
        setShowWelcomeScreen(!isComplete);
        setIsVerified(remoteProfile?.verification_status === 'verified' || (demoMode && read('verified') === 'true'));
        setUserCity(remoteProfile?.city || (demoMode ? read('city') || '' : ''));
        setUserCountry(remoteProfile?.country || (demoMode ? read('country') || '' : ''));
        if (remoteProfile?.latitude !== null && remoteProfile?.longitude !== null && remoteProfile?.latitude !== undefined && remoteProfile?.longitude !== undefined) {
          setUserCoords({ lat: remoteProfile.latitude, lon: remoteProfile.longitude });
        }
        if (remoteProfile?.ui_language) setUiLanguage(remoteProfile.ui_language);
        if (remoteProfile) {
          setFilters((prev) => ({
            ...prev,
            gender: remoteProfile.interested_in === 'all' ? 'all' : remoteProfile.interested_in,
            maxDistanceKm: remoteProfile.search_radius_km,
            country: remoteProfile.country,
            countryId: remoteProfile.country_id || '',
            cityId: remoteProfile.city_id || undefined,
          }));
          setCurrentUser((current) => current ? { ...current, first_name: remoteProfile.display_name, language_code: remoteProfile.ui_language } : current);
        }
        try {
          const languages = JSON.parse(read('spoken_languages') || '["ru", "en"]');
          setSpokenLanguages(Array.isArray(languages) ? languages : ['ru', 'en']);
        } catch {
          setSpokenLanguages(['ru', 'en']);
        }
        setStarsBalance(Number(read('stars_balance')) || 0);
        setAuthState('ready');
      })
      .catch((error: Error) => {
        if (controller.signal.aborted) return;
        setAuthError(error.message);
        setAuthState('blocked');
      });
    return () => {
      controller.abort();
      cleanup?.();
    };
  }, [authAttempt]);

  useEffect(() => {
    document.documentElement.lang = uiLanguage;
  }, [uiLanguage]);

  // Client cache is only a convenience. It is deliberately partitioned by the
  // verified Telegram ID, so an account cannot see another account's chats on
  // the same device. The production API remains the source of truth.
  useEffect(() => {
    if (currentUser && authState === 'ready') {
      localStorage.setItem(storageKey(currentUser.id, 'matches'), JSON.stringify(matches));
    }
  }, [matches, currentUser, authState]);

  useEffect(() => {
    const hasOverlay = showWelcomeScreen || isOnboardingOpen || isLanguageModalOpen || isFiltersOpen || isShopOpen || Boolean(activeChatMatch) || Boolean(celebrationPartner);
    return bindTelegramBackButton(() => {
      if (activeChatMatch) return setActiveChatMatch(null);
      if (isShopOpen) return setIsShopOpen(false);
      if (isFiltersOpen) return setIsFiltersOpen(false);
      if (isLanguageModalOpen) return setIsLanguageModalOpen(false);
      if (celebrationPartner) return setCelebrationPartner(null);
      if (isOnboardingOpen) return setIsOnboardingOpen(false);
      if (showWelcomeScreen) return setShowWelcomeScreen(false);
      if (currentTab !== 'deck') setCurrentTab('deck');
    }, hasOverlay || currentTab !== 'deck');
  }, [activeChatMatch, celebrationPartner, currentTab, isFiltersOpen, isLanguageModalOpen, isOnboardingOpen, isShopOpen, showWelcomeScreen]);

  const handleOnboardingComplete = async (data: OnboardingData) => {
    if (!currentUser) return;
    // The server must accept the profile before the app treats onboarding as complete.
    await saveOnboardingProfile(data);
    triggerHaptic('success');
    if (typeof window !== 'undefined') {
      localStorage.setItem(storageKey(currentUser.id, 'onboarding_completed'), 'true');
      localStorage.setItem(storageKey(currentUser.id, 'verified'), data.verified ? 'true' : 'false');
      localStorage.setItem(storageKey(currentUser.id, 'ui_language'), data.uiLanguage);
      if (data.city) {
        localStorage.setItem(storageKey(currentUser.id, 'city'), data.city);
      }
      if (data.country) {
        localStorage.setItem(storageKey(currentUser.id, 'country'), data.country);
      }
      if (data.countryId) {
        localStorage.setItem(storageKey(currentUser.id, 'country_id'), data.countryId);
      }
      if (data.cityId) {
        localStorage.setItem(storageKey(currentUser.id, 'city_id'), data.cityId);
      }
      if (data.latitude && data.longitude) {
        localStorage.setItem(storageKey(currentUser.id, 'lat'), String(data.latitude));
        localStorage.setItem(storageKey(currentUser.id, 'lon'), String(data.longitude));
      }
    }

    setUiLanguage(data.uiLanguage);
    setIsVerified(data.verified);
    setIsRegistered(true);
    setUserCity(data.city);
    setUserCountry(data.country);
    if (data.latitude && data.longitude) {
      setUserCoords({ lat: data.latitude, lon: data.longitude });
    }

    // Update current user profile details
    setCurrentUser((prev) => ({
      ...prev,
      first_name: data.name,
      language_code: data.uiLanguage,
      photo_url: prev.photo_url,
    }));

    // Align dating filters with user seeking preference and location
    setFilters((prev) => ({
      ...prev,
      gender: data.interestedIn !== 'all' ? (data.interestedIn as any) : prev.gender,
      maxDistanceKm: data.searchRadiusKm || 100,
      countryId: data.countryId || '',
      country: data.country || '',
      city: '',
      cityId: undefined,
    }));

    setIsOnboardingOpen(false);
    setShowWelcomeScreen(false);
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    triggerHaptic('selection');
    setUiLanguage(newLang);
    if (typeof window !== 'undefined') {
      if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'ui_language'), newLang);
    }
    setCurrentUser((prev) => ({
      ...prev,
      language_code: newLang,
    }));
  };

  const handleSpokenLanguagesChange = (languages: string[]) => {
    setSpokenLanguages(languages);
    if (typeof window !== 'undefined') {
      if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'spoken_languages'), JSON.stringify(languages));
    }
  };

  // Dynamically calculate distance from user's coordinates to each profile
  const localizedProfiles = useMemo(() => {
    if (!userCoords.lat || !userCoords.lon) return profiles;
    return profiles.map((p) => {
      if (p.latitude && p.longitude) {
        const dist = calculateDistance(userCoords.lat!, userCoords.lon!, p.latitude, p.longitude);
        return {
          ...p,
          distanceKm: dist,
        };
      }
      return p;
    });
  }, [profiles, userCoords.lat, userCoords.lon]);

  // Filter profiles with relational country/city ID support and dynamic distance
  const filteredProfiles = useMemo(() => {
    return localizedProfiles.filter((p) => {
      // Gender
      if (filters.gender !== 'all' && p.gender !== filters.gender) {
        return false;
      }
      // Age
      if (p.age < filters.minAge || p.age > filters.maxAge) {
        return false;
      }
      // Country Filter (relational check)
      if (filters.countryId) {
        if (p.countryId) {
          if (p.countryId !== filters.countryId) return false;
        } else if (filters.country && !p.country.toLowerCase().includes(filters.country.toLowerCase())) {
          return false;
        }
      }
      // City Filter (relational check by ID or name)
      if (filters.cityId) {
        if (p.cityId) {
          if (p.cityId !== filters.cityId) return false;
        } else if (filters.city) {
          if (!p.city.toLowerCase().includes(filters.city.toLowerCase())) return false;
        }
      } else if (
        filters.city &&
        !p.city.toLowerCase().includes(filters.city.toLowerCase())
      ) {
        return false;
      }
      // Distance (maxDistanceKm)
      if (p.distanceKm > filters.maxDistanceKm) {
        return false;
      }
      // Tags (if any are selected, profile must have at least one)
      if (filters.selectedTags.length > 0) {
        const hasMatchingTag = filters.selectedTags.some((tag) => p.tags.includes(tag));
        if (!hasMatchingTag) return false;
      }
      return true;
    });
  }, [localizedProfiles, filters]);

  const handleLike = (profile: UserProfile, rating?: LooksmaxxingRating) => {
    if (!isPremium) {
      setSwipesRemaining((prev) => Math.max(0, prev - 1));
    }

    // Determine if mutual match occurs
    // Profiles in INITIAL_WHO_LIKED or with high scores trigger a match
    const wasInWhoLiked = whoLikedList.some((item) => item.user.id === profile.id);
    const isSimulatedMatch = wasInWhoLiked || profile.glowUpScore >= 9.0;

    if (isSimulatedMatch) {
      triggerHaptic('success');

      const newMatch: Match = {
        id: `match_${Date.now()}`,
        user: profile,
        matchedAt: 'Только что',
        lastMessage: rating?.comment || 'Взаимный мэтч! Зацените стиль друг друга',
        unreadCount: 1,
        theirRatingForYou: {
          facialStructure: 9.4,
          hairGrooming: 9.0,
          styleAndFit: 9.5,
          physique: 9.2,
          glowUpPotential: 9.6,
          adviceTag: 'Идеальная посадка плеч и осанка',
        },
        yourRatingForThem: rating,
      };

      setMatches((prev) => [newMatch, ...prev]);
      // Remove from who liked if was there
      setWhoLikedList((prev) => prev.filter((item) => item.user.id !== profile.id));

      // Trigger Celebration
      setCelebrationPartner(profile);
    }
  };

  const handleDislike = (_profile: UserProfile) => {
    // Normal pass
  };

  const handlePurchaseSuccess = (packageType: 'premium' | 'who_liked' | 'swipes' | 'boost') => {
    if (packageType === 'premium') {
      setIsPremium(true);
      setIsWhoLikedUnlocked(true);
      setSwipesRemaining(999);
      setStarsBalance((prev) => {
        const next = Math.max(0, prev - 150);
        if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'stars_balance'), String(next));
        return next;
      });
    } else if (packageType === 'who_liked') {
      setIsWhoLikedUnlocked(true);
      setStarsBalance((prev) => {
        const next = Math.max(0, prev - 50);
        if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'stars_balance'), String(next));
        return next;
      });
    } else if (packageType === 'swipes') {
      setSwipesRemaining((prev) => prev + 25);
      setStarsBalance((prev) => {
        const next = Math.max(0, prev - 35);
        if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'stars_balance'), String(next));
        return next;
      });
    } else if (packageType === 'boost') {
      setStarsBalance((prev) => {
        const next = Math.max(0, prev - 45);
        if (currentUser) localStorage.setItem(storageKey(currentUser.id, 'stars_balance'), String(next));
        return next;
      });
    }
  };

  const handleUpdateLastMessage = (matchId: string, text: string) => {
    setMatches((prev) => {
      const updated = prev.map((m) =>
        m.id === matchId ? { ...m, lastMessage: text, unreadCount: 0 } : m
      );
      return updated;
    });
  };

  const handleLikeBackFromWhoLiked = (item: WhoLikedItem) => {
    triggerHaptic('success');
    const newMatch: Match = {
      id: `match_${Date.now()}`,
      user: item.user,
      matchedAt: 'Только что',
      unreadCount: 1,
      lastMessage: item.ratingGiven?.comment || 'Взаимный мэтч! Начни диалог',
      theirRatingForYou: item.ratingGiven,
      yourRatingForThem: {
        facialStructure: 9.0,
        hairGrooming: 9.2,
        styleAndFit: 9.4,
        physique: 9.1,
        glowUpPotential: 9.3,
        adviceTag: 'Отличный вайб и эстетика',
      },
    };

    setMatches((prev) => [newMatch, ...prev]);
    setWhoLikedList((prev) => prev.filter((wl) => wl.id !== item.id));
    setCelebrationPartner(item.user);
  };

  if (authState !== 'ready' || !currentUser) {
    const loading = authState === 'loading';
    return (
      <div className="min-h-[var(--tg-viewport-height)] bg-[#070707] text-white flex items-center justify-center px-6 font-sans">
        <div className="w-full max-w-sm text-center space-y-4">
          <div className="mx-auto w-12 h-12 rounded-2xl border border-[#CCFF00]/30 bg-[#CCFF00]/10 flex items-center justify-center text-[#CCFF00] font-mono font-black">S</div>
          <h1 className="font-mono text-xl font-black">{loading ? 'Проверяем Telegram' : 'Откройте SCULPT в Telegram'}</h1>
          <p className="text-sm leading-relaxed text-gray-400">
            {loading
              ? 'Безопасно подтверждаем ваш аккаунт…'
              : authError === 'TELEGRAM_AUTH_NETWORK' || authError === 'TELEGRAM_AUTH_TIMEOUT'
                ? 'Не удалось связаться с сервисом. Проверьте соединение и повторите попытку.'
                : 'Для входа используйте кнопку Mini App в официальном боте. Демо-аккаунты в релизной версии отключены.'}
          </p>
          {!loading && (authError === 'TELEGRAM_AUTH_NETWORK' || authError === 'TELEGRAM_AUTH_TIMEOUT') && (
            <button
              type="button"
              onClick={() => setAuthAttempt((attempt) => attempt + 1)}
              className="min-h-11 px-5 rounded-xl bg-[#CCFF00] text-black font-mono text-xs font-black uppercase tracking-wide active:scale-95"
            >
              Повторить
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <LanguageProvider value={uiLanguage}>
    <div className="flex items-center justify-center w-full min-h-[var(--tg-viewport-height)] bg-[#000000] text-white selection:bg-[#CCFF00] selection:text-black font-sans">
      {/* Mobile WebView Simulated Container matching OKX-style tech aesthetic */}
      <div className="w-full max-w-[440px] h-[var(--tg-viewport-height)] min-h-[var(--tg-viewport-height)] sm:h-auto sm:min-h-[740px] sm:max-h-[94vh] sm:my-auto flex flex-col relative bg-black sm:rounded-[44px] sm:border-[6px] sm:border-[#1c1c1c] sm:shadow-[0_25px_80px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Sleek top camera notch */}
        <div className="hidden sm:flex absolute top-0 inset-x-0 h-6 justify-center items-center z-50 pointer-events-none">
          <div className="w-28 h-4 bg-[#1a1a1a] rounded-b-xl" />
        </div>

        {/* Top Navbar */}
        <TopNavbar
          isPremium={isPremium}
          isVerified={isVerified}
          uiLanguage={uiLanguage}
          starsBalance={starsBalance}
          onOpenShop={() => setIsShopOpen(true)}
          onOpenSettings={() => setIsLanguageModalOpen(true)}
          onOpenOnboarding={() => setIsOnboardingOpen(true)}
          onOpenWelcome={() => setShowWelcomeScreen(true)}
        />

        {/* View Switcher with min-h-0 and smooth overflow scroll */}
        <main className="flex-1 min-h-0 flex flex-col overflow-y-auto overscroll-contain pb-16 relative">
          {currentTab === 'deck' && (
            <SwipeDeck
              profiles={filteredProfiles}
              swipesRemaining={swipesRemaining}
              isPremium={isPremium}
              onLike={handleLike}
              onDislike={handleDislike}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenFilters={() => setIsFiltersOpen(true)}
              onResetDeck={() => setProfiles(demoMode ? [...INITIAL_PROFILES] : [])}
            />
          )}

          {currentTab === 'audit' && (
            <Suspense fallback={<div className="flex-1 flex items-center justify-center text-xs font-mono text-gray-500">Загрузка…</div>}><AuditView
              userPhoto={currentUser.photo_url}
              onOpenShop={() => setIsShopOpen(true)}
              lang={uiLanguage}
              isVerified={isVerified}
              isAvailable={photoAuditEnabled}
            /></Suspense>
          )}

          {currentTab === 'matches' && (
            <MatchesView
              matches={matches}
              whoLikedList={whoLikedList}
              isWhoLikedUnlocked={isWhoLikedUnlocked}
              isPremium={isPremium}
              onOpenShop={() => setIsShopOpen(true)}
              onSelectMatch={(match) => setActiveChatMatch(match)}
              onLikeBack={handleLikeBackFromWhoLiked}
              lang={uiLanguage}
            />
          )}

          {currentTab === 'chats' && (
            <ChatsListView
              matches={matches}
              onSelectMatch={(match) => {
                setMatches((prev) =>
                  prev.map((m) => (m.id === match.id ? { ...m, unreadCount: 0 } : m))
                );
                setActiveChatMatch(match);
              }}
              onGoToDeck={() => setCurrentTab('deck')}
            />
          )}

          {currentTab === 'profile' && (
            <ProfileView
              currentUser={currentUser}
              isPremium={isPremium}
              isVerified={isVerified}
              userCity={userCity}
              userCountry={userCountry}
              uiLanguage={uiLanguage}
              spokenLanguages={spokenLanguages}
              onLanguageChange={handleLanguageChange}
              onOpenLanguageSettings={() => setIsLanguageModalOpen(true)}
              onOpenShop={() => setIsShopOpen(true)}
              onOpenOnboarding={() => setIsOnboardingOpen(true)}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNavbar
          currentTab={currentTab}
          matchesCount={matches.length}
          likesCount={whoLikedList.length}
          isPremium={isPremium}
          onTabChange={(tab) => setCurrentTab(tab)}
          onOpenShop={() => setIsShopOpen(true)}
        />

        {/* Welcome Hero Screen with Logo, Transcription and Swipe-up */}
        {showWelcomeScreen && (
          <WelcomeScreen
            onStartRegistration={() => {
              setIsOnboardingOpen(true);
            }}
            onQuickEnter={() => {
              setShowWelcomeScreen(false);
            }}
            isRegistered={isRegistered}
          />
        )}

        {/* Modals */}
        <Suspense fallback={null}><OnboardingModal
          isOpen={isOnboardingOpen}
          currentUser={currentUser}
          uiLanguage={uiLanguage}
          onComplete={handleOnboardingComplete}
        /></Suspense>
        <Suspense fallback={null}><LanguageSettingsModal
          isOpen={isLanguageModalOpen}
          uiLanguage={uiLanguage}
          spokenLanguages={spokenLanguages}
          onLanguageChange={handleLanguageChange}
          onSpokenLanguagesChange={handleSpokenLanguagesChange}
          onClose={() => setIsLanguageModalOpen(false)}
        /></Suspense>
        <Suspense fallback={null}><FiltersModal
          isOpen={isFiltersOpen}
          filters={filters}
          onClose={() => setIsFiltersOpen(false)}
          onApply={(newFilters) => setFilters(newFilters)}
          lang={uiLanguage}
        /></Suspense>

        <Suspense fallback={null}><StarsShopModal
          isOpen={isShopOpen}
          isPremium={isPremium}
          onClose={() => setIsShopOpen(false)}
          onPurchaseSuccess={handlePurchaseSuccess}
        /></Suspense>

        <Suspense fallback={null}><ChatModal
          match={activeChatMatch}
          isOpen={Boolean(activeChatMatch)}
          onClose={() => setActiveChatMatch(null)}
          onUpdateLastMessage={handleUpdateLastMessage}
          storageScope={`sculpt:v1:${currentUser.id}`}
          enableDemoReplies={demoMode}
        /></Suspense>

        <Suspense fallback={null}><MatchCelebrationModal
          partner={celebrationPartner}
          currentUser={currentUser}
          isOpen={Boolean(celebrationPartner)}
          onSendMessage={() => {
            const partner = celebrationPartner;
            setCelebrationPartner(null);
            if (partner) {
              const foundMatch = matches.find((m) => m.user.id === partner.id);
              if (foundMatch) {
                setActiveChatMatch(foundMatch);
              }
            }
          }}
          onKeepSwiping={() => setCelebrationPartner(null)}
        /></Suspense>

      </div>
    </div>
    </LanguageProvider>
  );
}
