import { AdMob, BannerAdOptions, BannerAdSize, BannerAdPosition, AdMobInitializationOptions, InterstitialAdPluginEvents, RewardAdPluginEvents } from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const AdConfig = {
    appId: 'ca-app-pub-4190858087915294~5199801146',
    banner: 'ca-app-pub-4190858087915294/4014566191',
    interstitial: 'ca-app-pub-4190858087915294/3886719476',
    rewarded: 'ca-app-pub-4190858087915294/6856351954',
    native: 'ca-app-pub-4190858087915294/1479543408' // Named "Local"
};

export class AdManager {
    static async init() {
        // Run only on native (Android/iOS)
        if (!Capacitor.isNativePlatform()) return;

        try {
            const options: AdMobInitializationOptions = {
                testingDevices: [],
                initializeForTesting: false, // Set to true if you are debugging
            };
            await AdMob.initialize(options);
            console.log('AdMob initialized');
        } catch (error) {
            console.error('AdMob initialization failed', error);
        }
    }

    static async showBanner() {
        if (!Capacitor.isNativePlatform()) return;

        try {
            const options: BannerAdOptions = {
                adId: AdConfig.banner,
                adSize: BannerAdSize.BANNER,
                position: BannerAdPosition.BOTTOM_CENTER,
                margin: 0,
                isTesting: false
            };
            await AdMob.showBanner(options);
        } catch (error) {
            console.log('Failed to show banner', error);
        }
    }

    static async hideBanner() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await AdMob.hideBanner();
        } catch (error) {
            console.log(error);
        }
    }

    static async prepareInterstitial(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        try {
            await AdMob.prepareInterstitial({
                adId: AdConfig.interstitial,
                isTesting: false
            });
        } catch (error) {
            console.log(error);
        }
    }

    static async showInterstitial(): Promise<void> {
        if (!Capacitor.isNativePlatform()) return;
        return new Promise(async (resolve) => {
            try {
                // Ensure it's prepared
                await this.prepareInterstitial();

                const dismissListener = await AdMob.addListener(InterstitialAdPluginEvents.Dismissed, () => {
                    dismissListener.remove();
                    resolve();
                });

                // Backup timeout just in case ad doesn't load/show
                setTimeout(() => resolve(), 2000);

                await AdMob.showInterstitial();
            } catch (error) {
                console.log('Failed to show interstitial', error);
                resolve(); // resolve anyway to not block the game
            }
        });
    }

    static async showRewarded(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return Promise.resolve(true); // Default true on web for testing

        return new Promise(async (resolve) => {
            try {
                let isRewarded = false;
                await AdMob.prepareRewardVideoAd({
                    adId: AdConfig.rewarded,
                    isTesting: false
                });

                const rewardListener = await AdMob.addListener(RewardAdPluginEvents.Rewarded, () => {
                    isRewarded = true;
                });

                const dismissListener = await AdMob.addListener(RewardAdPluginEvents.Dismissed, () => {
                    rewardListener.remove();
                    dismissListener.remove();
                    resolve(isRewarded);
                });

                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.log('Failed to show rewarded', error);
                resolve(false);
            }
        });
    }
}
