import { useState } from 'react';
import { View } from 'react-native';
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';
import { adUnitIdBanner } from '../ads/AdManager';

export default function AdBanner() {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adFailed, setAdFailed] = useState(false);

  if (adFailed) return null;

  return (
    <View style={[
      { alignItems: 'center', justifyContent: 'center', width: '100%', backgroundColor: 'transparent' },
      adLoaded && { paddingVertical: 10, minHeight: 50 }
    ]}>
      <BannerAd
        unitId={adUnitIdBanner}
        size={BannerAdSize.BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
        onAdLoaded={() => setAdLoaded(true)}
        onAdFailedToLoad={(error) => {
          console.log('Banner Failed:', error);
          setAdFailed(true);
        }}
      />
    </View>
  );
}
