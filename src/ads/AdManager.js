import mobileAds, { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';

// Production GritMath Ad Unit IDs
const BANNER_ID = 'ca-app-pub-1157854963201430/1801530158';
const INTERSTITIAL_ID = 'ca-app-pub-1157854963201430/2404894336';
const REWARDED_ID = 'ca-app-pub-1157854963201430/7988393504';

export const adUnitIdInterstitial = __DEV__ ? TestIds.INTERSTITIAL : INTERSTITIAL_ID;
export const adUnitIdBanner = __DEV__ ? TestIds.BANNER : BANNER_ID;

let interstitialAd = null;
let isInterstitialLoaded = false;

export const initAds = () => {
  mobileAds()
    .initialize()
    .then(adapterStatuses => {
      console.log('AdMob Initialized');
      preloadInterstitial();
    })
    .catch(err => console.warn('AdMob Init Error:', err));
};

export const preloadInterstitial = () => {
  if (interstitialAd) return;
  
  interstitialAd = InterstitialAd.createForAdRequest(adUnitIdInterstitial, {
    requestNonPersonalizedAdsOnly: true, // Safer for GDPR compliance by default
  });

  interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
    isInterstitialLoaded = true;
  });

  interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
    isInterstitialLoaded = false;
    interstitialAd = null;
    preloadInterstitial(); // Start loading the next one immediately
  });

  interstitialAd.addAdEventListener(AdEventType.ERROR, (error) => {
    isInterstitialLoaded = false;
    interstitialAd = null;
  });

  interstitialAd.load();
};

export const showInterstitialAd = (onAdClosed) => {
  if (isInterstitialLoaded && interstitialAd) {
    // We attach a specific one-time listener for this exact show() call
    const unsubscribe = interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      unsubscribe();
      if (onAdClosed) onAdClosed();
    });
    
    interstitialAd.show();
  } else {
    // If the ad failed to load or isn't ready yet, don't punish the user.
    // Just seamlessly continue to the next screen!
    if (onAdClosed) onAdClosed();
  }
};
