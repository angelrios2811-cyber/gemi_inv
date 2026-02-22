// ✅ Firebase Global Types - INVCAS v4.0.0
// Declaración de tipos para Firebase desde CDN

declare global {
  var firebase: {
    initializeApp: (config: any) => any;
    firestore: {
      (): any;
      Timestamp: {
        now: () => any;
      };
      enablePersistence: (options?: any) => Promise<void>;
      collection: (name: string) => any;
    };
    auth: () => any;
  };
}

export {};
