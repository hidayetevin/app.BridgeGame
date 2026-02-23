import {
    AdMob,
    BannerAdOptions,
    BannerAdSize,
    BannerAdPosition,
    AdMobInitializationOptions,
    InterstitialAdPluginEvents,
    RewardAdPluginEvents,
} from '@capacitor-community/admob';
import { Capacitor } from '@capacitor/core';

export const AdConfig = {
    appId: 'ca-app-pub-4190858087915294~5199801146',
    banner: 'ca-app-pub-4190858087915294/4014566191',
    interstitial: 'ca-app-pub-4190858087915294/3886719476',
    rewarded: 'ca-app-pub-4190858087915294/6856351954',
    native: 'ca-app-pub-4190858087915294/1479543408',
};

// If the player just watched a rewarded ad, skip the next interstitial so they
// aren't bombarded with two ads back-to-back.
let skipNextInterstitial = false;

export class AdManager {

    /** Call after a rewarded ad is successfully watched to skip the next interstitial. */
    static markRewardedWatched() {
        skipNextInterstitial = true;
    }

    static async init() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const options: AdMobInitializationOptions = {
                testingDevices: [],
                initializeForTesting: false,
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
                isTesting: false,
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
                isTesting: false,
            });
        } catch (error) {
            console.log('Failed to prepare interstitial', error);
        }
    }

    /**
     * Shows an interstitial ad.
     * - If a rewarded ad was just watched, skips the interstitial.
     * - If the ad fails to load or show, resolves immediately (game never freezes).
     * - Has a 5-second hard timeout as last resort safety net.
     */
    static async showInterstitial(): Promise<void> {
        // Skip if player just watched a rewarded ad
        if (skipNextInterstitial) {
            skipNextInterstitial = false;
            console.log('Interstitial skipped (rewarded ad was just watched)');
            return;
        }

        if (!Capacitor.isNativePlatform()) return;

        return new Promise(async (resolve) => {
            let resolved = false;
            const done = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                }
            };

            // Hard timeout: 5 seconds max — game will never freeze waiting for an ad
            const timeout = setTimeout(done, 5000);

            try {
                await this.prepareInterstitial();

                const dismissListener = await AdMob.addListener(
                    InterstitialAdPluginEvents.Dismissed,
                    () => {
                        dismissListener.remove();
                        clearTimeout(timeout);
                        done();
                    }
                );

                // Also handle failed-to-show events
                const failListener = await AdMob.addListener(
                    InterstitialAdPluginEvents.FailedToLoad,
                    () => {
                        failListener.remove();
                        clearTimeout(timeout);
                        done();
                    }
                );

                await AdMob.showInterstitial();
            } catch (error) {
                console.log('Failed to show interstitial', error);
                clearTimeout(timeout);
                done();
            }
        });
    }

    /**
     * Shows a rewarded ad.
     * - Returns `true` only if the player watched the ad to completion.
     * - Returns `false` if the ad is dismissed early or fails to load/show.
     * - Has a 30-second hard timeout as last resort safety net.
     * - On web, returns `true` for easy testing.
     */
    static async showRewarded(): Promise<boolean> {
        // On web, simulate a successful reward for testing
        if (!Capacitor.isNativePlatform()) return Promise.resolve(true);

        return new Promise(async (resolve) => {
            let resolved = false;
            const done = (result: boolean) => {
                if (!resolved) {
                    resolved = true;
                    resolve(result);
                }
            };

            // Hard timeout: 30 seconds — user can't be stuck forever
            const timeout = setTimeout(() => {
                console.log('Rewarded ad timed out');
                done(false);
            }, 30000);

            try {
                let isRewarded = false;

                await AdMob.prepareRewardVideoAd({
                    adId: AdConfig.rewarded,
                    isTesting: false,
                });

                const rewardListener = await AdMob.addListener(
                    RewardAdPluginEvents.Rewarded,
                    () => {
                        // Fired when player earns the reward (watched fully)
                        isRewarded = true;
                    }
                );

                const dismissListener = await AdMob.addListener(
                    RewardAdPluginEvents.Dismissed,
                    () => {
                        rewardListener.remove();
                        dismissListener.remove();
                        clearTimeout(timeout);
                        done(isRewarded); // false if dismissed before reward
                    }
                );

                const failListener = await AdMob.addListener(
                    RewardAdPluginEvents.FailedToLoad,
                    () => {
                        failListener.remove();
                        clearTimeout(timeout);
                        done(false);
                    }
                );

                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.log('Failed to show rewarded ad', error);
                clearTimeout(timeout);
                done(false);
            }
        });
    }
}
