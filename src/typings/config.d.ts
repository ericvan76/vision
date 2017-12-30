/**
 * This file was automatically generated by json-schema-to-typescript.
 * DO NOT MODIFY IT BY HAND. Instead, modify the source JSONSchema file,
 * and run json-schema-to-typescript to regenerate this file.
 */

export type AzureLocation = "westus" | "australiaeast" | "southeastasia" | "northeurope";

/**
 * extra section in app.json
 */
export interface Config {
  /**
   * Semantic Version
   */
  semver: string;
  /**
   * Show Hint when idle for x seconds
   */
  showHintIdleSeconds: number;
  /**
   * Show interstitial ad every x calls
   */
  showInterstitialCalls: number;
  /**
   * Maximium calls when failed to load ad
   */
  limitedAccessCalls: number;
  /**
   * Geo and azure location mapping
   */
  geoAzureLocationMap: {
    AF?: AzureLocation;
    AN?: AzureLocation;
    AS?: AzureLocation;
    EU?: AzureLocation;
    NA?: AzureLocation;
    OC?: AzureLocation;
    SA?: AzureLocation;
  };
  /**
   * Face api endpoints and keys
   */
  faceApiKeys: ApiLocationKey[];
  /**
   * Emotion api endpoints and keys
   */
  emotionApiKeys: ApiLocationKey[];
  /**
   * Vision api endpoints and keys
   */
  visionApiKeys: ApiLocationKey[];
  /**
   * AdMob Settings
   */
  adMob: {
    banners: AdUnitIds[];
    interstitials: AdUnitIds[];
    testDeviceIds: string[];
  };
  /**
   * Amplitude Settings
   */
  amplitude: {
    apiKey: string;
  };
}
export interface ApiLocationKey {
  location: AzureLocation;
  key: string;
}
export interface AdUnitIds {
  ios?: string;
  android?: string;
}