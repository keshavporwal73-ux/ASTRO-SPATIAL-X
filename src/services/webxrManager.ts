import { WebXRStatus } from '@/types/spatial';
import * as THREE from 'three';

export interface WebXRDiagnostics {
  isSecureContext: boolean;
  hasNavigatorXR: boolean;
  isVRSupported: boolean;
  isARSupported: boolean;
  activeSession: boolean;
  deviceType?: string;
  errorMessage?: string;
  recommendations: string[];
}

export class WebXRManager {
  private static status: WebXRStatus = {
    supported: false,
    vrSupported: false,
    arSupported: false,
    activeSession: false,
    sessionType: null,
  };

  private static currentSession: any = null;

  /**
   * Checks WebXR browser support and device hardware capability
   */
  static async checkXRSupport(): Promise<WebXRStatus> {
    const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;

    if (typeof window === 'undefined' || !('xr' in navigator)) {
      this.status = {
        supported: false,
        vrSupported: false,
        arSupported: false,
        activeSession: false,
        sessionType: null,
        errorMessage: !isSecure
          ? 'WebXR requires a secure context (HTTPS or localhost).'
          : 'WebXR Device API is not supported in this browser environment. Desktop 3D WebGL viewport active.',
      };
      return this.status;
    }

    try {
      const xr = (navigator as any).xr;
      const isVR = await xr.isSessionSupported('immersive-vr').catch(() => false);
      const isAR = await xr.isSessionSupported('immersive-ar').catch(() => false);

      this.status = {
        supported: isVR || isAR,
        vrSupported: isVR,
        arSupported: isAR,
        activeSession: Boolean(this.currentSession),
        sessionType: this.currentSession ? (isVR ? 'immersive-vr' : 'immersive-ar') : null,
        errorMessage: !(isVR || isAR)
          ? 'No compatible WebXR Headset or VR runtime detected. Desktop 3D Viewport remains fully interactive.'
          : undefined,
      };
      return this.status;
    } catch (err: any) {
      this.status = {
        supported: false,
        vrSupported: false,
        arSupported: false,
        activeSession: false,
        sessionType: null,
        errorMessage: `WebXR query error: ${err?.message || 'Hardware interface unverified'}.`,
      };
      return this.status;
    }
  }

  /**
   * Requests and starts an authentic immersive WebXR VR session
   */
  static async requestVRSession(
    renderer: THREE.WebGLRenderer,
    onSessionEnd?: () => void
  ): Promise<{ success: boolean; session?: any; error?: string }> {
    if (typeof window === 'undefined' || !('xr' in navigator)) {
      return {
        success: false,
        error: 'WebXR is not supported on this browser/platform. Desktop 3D mode remains active.',
      };
    }

    try {
      const xr = (navigator as any).xr;
      const isVR = await xr.isSessionSupported('immersive-vr').catch(() => false);
      if (!isVR) {
        return {
          success: false,
          error: 'Immersive VR session mode is unsupported or no VR headset runtime was detected.',
        };
      }

      // Enable Three.js WebXR
      renderer.xr.enabled = true;

      const session = await xr.requestSession('immersive-vr', {
        optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
      });

      this.currentSession = session;
      this.status.activeSession = true;
      this.status.sessionType = 'immersive-vr';

      await renderer.xr.setSession(session);

      session.addEventListener('end', () => {
        this.currentSession = null;
        this.status.activeSession = false;
        this.status.sessionType = null;
        if (onSessionEnd) {
          onSessionEnd();
        }
      });

      return { success: true, session };
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Failed to initialize WebXR immersive session with headset.',
      };
    }
  }

  /**
   * Ends any active WebXR session
   */
  static async endSession(): Promise<void> {
    if (this.currentSession) {
      try {
        await this.currentSession.end();
      } catch (err) {
        console.warn('Error ending WebXR session:', err);
      }
      this.currentSession = null;
      this.status.activeSession = false;
      this.status.sessionType = null;
    }
  }

  /**
   * Returns comprehensive diagnostics for user review
   */
  static async getDiagnostics(): Promise<WebXRDiagnostics> {
    const isSecure = typeof window !== 'undefined' ? window.isSecureContext : false;
    const hasXR = typeof window !== 'undefined' && 'xr' in navigator;
    let isVR = false;
    let isAR = false;

    if (hasXR) {
      try {
        const xr = (navigator as any).xr;
        isVR = await xr.isSessionSupported('immersive-vr').catch(() => false);
        isAR = await xr.isSessionSupported('immersive-ar').catch(() => false);
      } catch {
        // Ignore
      }
    }

    const recommendations: string[] = [];
    if (!isSecure) {
      recommendations.push('WebXR requires an HTTPS connection or localhost origin.');
    }
    if (!hasXR) {
      recommendations.push('Use a WebXR-compatible browser (e.g., Meta Quest Browser, Chrome with WebXR enabled, Wolvic).');
    }
    if (hasXR && !isVR && !isAR) {
      recommendations.push('Ensure your VR headset (Oculus/Meta Quest, HTC Vive, Valve Index, Apple Vision Pro) is connected and SteamVR / Oculus Link runtime is running.');
    }

    return {
      isSecureContext: isSecure,
      hasNavigatorXR: hasXR,
      isVRSupported: isVR,
      isARSupported: isAR,
      activeSession: Boolean(this.currentSession),
      errorMessage: this.status.errorMessage,
      recommendations,
    };
  }

  static getCachedStatus(): WebXRStatus {
    return this.status;
  }
}
