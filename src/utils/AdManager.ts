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

// --- Internal state ---

/** If a rewarded ad was just watched, skip the very next interstitial. */
let skipNextInterstitial = false;

/** Tracks whether interstitial is currently loaded and ready to show. */
let interstitialReady = false;

/** Tracks whether rewarded ad is currently loaded and ready to show. */
let rewardedReady = false;

/** Prevents parallel preload calls for the same ad type. */
let interstitialLoading = false;
let rewardedLoading = false;

// --- Preloaders ---

/** Silently preloads an interstitial ad in the background. */
async function preloadInterstitial() {
    if (!Capacitor.isNativePlatform()) return;
    if (interstitialReady || interstitialLoading) return;
    interstitialLoading = true;
    try {
        await AdMob.prepareInterstitial({
            adId: AdConfig.interstitial,
            isTesting: false,
            immersiveMode: true,
        });
        interstitialReady = true;
        console.log('[AdManager] Interstitial preloaded ✓');
    } catch (e) {
        console.log('[AdManager] Interstitial preload failed', e);
    } finally {
        interstitialLoading = false;
    }
}

/** Silently preloads a rewarded ad in the background. */
async function preloadRewarded() {
    if (!Capacitor.isNativePlatform()) return;
    if (rewardedReady || rewardedLoading) return;
    rewardedLoading = true;
    try {
        await AdMob.prepareRewardVideoAd({
            adId: AdConfig.rewarded,
            isTesting: false,
            immersiveMode: true,
        });
        rewardedReady = true;
        console.log('[AdManager] Rewarded preloaded ✓');
    } catch (e) {
        console.log('[AdManager] Rewarded preload failed', e);
    } finally {
        rewardedLoading = false;
    }
}

// --- Public API ---

export class AdManager {

    /** Call after a rewarded ad is successfully watched to skip the next interstitial. */
    static markRewardedWatched() {
        skipNextInterstitial = true;
    }

    /**
     * Initialises AdMob and immediately starts preloading both ad types
     * so they are ready the moment the player needs them.
     */
    static async init() {
        if (!Capacitor.isNativePlatform()) return;
        try {
            const options: AdMobInitializationOptions = {
                testingDevices: [],
                initializeForTesting: false,
            };
            await AdMob.initialize(options);
            console.log('[AdManager] Initialized');

            // Kick off background preloads immediately — don't await, run in parallel
            preloadInterstitial();
            preloadRewarded();
        } catch (error) {
            console.error('[AdManager] Initialization failed', error);
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
            console.log('[AdManager] Failed to show banner', error);
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

    /** @deprecated Use init() — preloading is now automatic. */
    static async prepareInterstitial(): Promise<void> {
        await preloadInterstitial();
    }

    /**
     * Shows an interstitial ad.
     * - Uses the preloaded ad immediately if available (near-instant display).
     * - Skips if a rewarded ad was just watched.
     * - Resolves after dismiss or on any failure (game never freezes).
     * - Hard timeout: 5 seconds.
     */
    static async showInterstitial(): Promise<void> {
        if (skipNextInterstitial) {
            skipNextInterstitial = false;
            console.log('[AdManager] Interstitial skipped (post-rewarded)');
            return;
        }

        if (!Capacitor.isNativePlatform()) return;

        // If not preloaded yet, try a fast load now
        if (!interstitialReady) {
            console.log('[AdManager] Interstitial not preloaded, loading now...');
            await preloadInterstitial();
        }

        return new Promise(async (resolve) => {
            let resolved = false;
            const done = () => {
                if (!resolved) {
                    resolved = true;
                    resolve();
                    // Immediately preload next one in background
                    interstitialReady = false;
                    preloadInterstitial();
                }
            };

            // Hard 5-second safety net
            const timeout = setTimeout(done, 5000);

            try {
                const dismissListener = await AdMob.addListener(
                    InterstitialAdPluginEvents.Dismissed,
                    () => {
                        dismissListener.remove();
                        clearTimeout(timeout);
                        done();
                    }
                );

                const failListener = await AdMob.addListener(
                    InterstitialAdPluginEvents.FailedToLoad,
                    () => {
                        failListener.remove();
                        clearTimeout(timeout);
                        done();
                    }
                );

                interstitialReady = false; // consumed
                await AdMob.showInterstitial();
            } catch (error) {
                console.log('[AdManager] Failed to show interstitial', error);
                clearTimeout(timeout);
                done();
            }
        });
    }

    /**
     * Shows a rewarded ad.
     * - Uses the preloaded ad immediately if available.
     * - Returns `true` only if the player watched to completion and earned the reward.
     * - Returns `false` if dismissed early or if ad failed — no penalty, game continues.
     * - Hard timeout: 30 seconds.
     */
    static async showRewarded(): Promise<boolean> {
        if (!Capacitor.isNativePlatform()) return true; // web: always reward for dev testing

        // If not preloaded yet, try a fast load now
        if (!rewardedReady) {
            console.log('[AdManager] Rewarded not preloaded, loading now...');
            await preloadRewarded();
        }

        return new Promise(async (resolve) => {
            let resolved = false;
            const done = (result: boolean) => {
                if (!resolved) {
                    resolved = true;
                    resolve(result);
                    // Immediately preload the next one in background
                    rewardedReady = false;
                    preloadRewarded();
                }
            };

            // Hard 30-second safety net
            const timeout = setTimeout(() => {
                console.log('[AdManager] Rewarded ad timed out');
                done(false);
            }, 30000);

            try {
                let isRewarded = false;

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
                        done(isRewarded); // false if dismissed before reward event
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

                rewardedReady = false; // consumed
                await AdMob.showRewardVideoAd();
            } catch (error) {
                console.log('[AdManager] Failed to show rewarded ad', error);
                clearTimeout(timeout);
                done(false);
            }
        });
    }
}
