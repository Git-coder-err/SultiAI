export interface FeatureFlags {
  enableARMode: boolean;
  enableVoicePipelineV2: boolean;
  enablePronunciationAnalytics: boolean;
  enableOfflineSync: boolean;
}

const DEFAULT_FLAGS: FeatureFlags = {
  enableARMode: true,
  enableVoicePipelineV2: true,
  enablePronunciationAnalytics: true,
  enableOfflineSync: true,
};

export class FeatureFlagService {
  private flags: FeatureFlags = { ...DEFAULT_FLAGS };

  public isEnabled(key: keyof FeatureFlags): boolean {
    return this.flags[key] ?? false;
  }

  public updateFlags(newFlags: Partial<FeatureFlags>) {
    this.flags = { ...this.flags, ...newFlags };
  }

  public getAll(): FeatureFlags {
    return { ...this.flags };
  }

  public reset() {
    this.flags = { ...DEFAULT_FLAGS };
  }
}

export const featureFlags = new FeatureFlagService();
export default featureFlags;
