declare namespace WebAgent {
  interface WebRTCConfig {
    tag: string;
    ringFile: string;
    ringTag: string;
    localTag: string;
  }

  interface WaParams {
    ui: boolean;
    sipUseCphone: boolean;
  }

  interface ChatParams {}

  type EventHandler = (data: any) => void;

  function init(options: {
    loadBootstrap?: boolean;
    useLocal?: boolean;
    webRTCConfig: WebRTCConfig;
    WaParams: WaParams;
    isUseCChat?: boolean;
    ChatParams: ChatParams;
    callback?: () => void;
  }): void;

  function registerEventHandler(handler: EventHandler): void;
  namespace extend {
    function makeCall(options: {
      outCallNumber: string;
      disNumber: string;
    }): Promise<void>;

    function consult(options: {
      consultAgent: string;
      type: number;
    }): { code: number };

    function agentGetList(type: string): void;
    function conference({ transferTo: string, type: number})
  }

  interface MultiChannelLoginOptions {
    entId: string;
    agentId: string;
    agentPassword: string;
    agentNumber: string;
    waAutoLoginResult: boolean;
    isForce: boolean;
    isLocking: (state: string, moreStates?: any) => void;
    unLocking: (state: string, moreStates?: any) => void;
  }

  function multiChannelLogin(
    agent: typeof WebAgent,
    options: MultiChannelLoginOptions
  ): void;

  function multiRegisterEvent(eventType: string, handler: (data: any) => void): void;

  function multiChannelLogout(): void;

  namespace multiChannelState {
    function agentReady(successCallback?: () => void, errorCallback?: () => void): void;

    function agentBusy(successCallback?: () => void, errorCallback?: () => void): void;
  }
}
declare namespace CR {
  function hangup(): void;

  function answer(): void;
}
