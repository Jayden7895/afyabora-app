import { ProductCategory } from '../types';

const PREF_COOKIE_NAME = 'afyabora_preferences';
const COOKIE_EXPIRY_DAYS = 30;

interface UserPreferences {
  categoryScores: Record<string, number>;
  lastViewed: string[]; // Product IDs
}

export const CookieService = {
  setCookie: (name: string, value: string, days: number) => {
    let expires = "";
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "")  + expires + "; path=/";
  },

  getCookie: (name: string): string | null => {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for(let i=0;i < ca.length;i++) {
      let c = ca[i];
      while (c.charAt(0) === ' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length,c.length);
    }
    return null;
  },

  getPreferences: (): UserPreferences => {
    const cookieVal = CookieService.getCookie(PREF_COOKIE_NAME);
    if (!cookieVal) {
      return { categoryScores: {}, lastViewed: [] };
    }
    try {
      return JSON.parse(decodeURIComponent(cookieVal));
    } catch (e) {
      return { categoryScores: {}, lastViewed: [] };
    }
  },

  savePreferences: (prefs: UserPreferences) => {
    const jsonStr = JSON.stringify(prefs);
    CookieService.setCookie(PREF_COOKIE_NAME, encodeURIComponent(jsonStr), COOKIE_EXPIRY_DAYS);
  },

  trackView: (categoryId: ProductCategory, productId: string) => {
    const prefs = CookieService.getPreferences();
    
    // Increment category score (weight of 1)
    prefs.categoryScores[categoryId] = (prefs.categoryScores[categoryId] || 0) + 1;
    
    // Add to last viewed (keep last 5)
    prefs.lastViewed = [productId, ...prefs.lastViewed.filter(id => id !== productId)].slice(0, 5);
    
    CookieService.savePreferences(prefs);
  },

  getTopCategory: (): string | null => {
    const prefs = CookieService.getPreferences();
    const scores = prefs.categoryScores;
    let maxScore = 0;
    let topCategory = null;

    Object.entries(scores).forEach(([cat, score]) => {
      if (score > maxScore) {
        maxScore = score;
        topCategory = cat;
      }
    });

    return topCategory;
  }
};