export const MSGT = {
    HELLO_CLIENT: "hello-client",
    HELLO_MESSENGER: "hello-messenger",
    CHANNEL_READY: "channel-ready",
    MESSAGE: "message",
    ACK: "ack",
    ERROR: "error",
}

export interface Message {
    type: string;
    data?: string;
}

export interface PasskeyAuthInitChallenge {
    challenge: string;
    allowCredIds: string[];
    rpId: string;
    kexM: string;
}

export interface PasskeyAuthResult {
    encryptedAccessToken: string;
}

  
export class WebSocketController {
    ws: WebSocket;
    listenCallbacks: ((event: Message) => void)[] = [];
    open: boolean = false;
  
    constructor(wsUrl: string) {
      this.ws = new WebSocket(wsUrl);
  
      this.ws.onmessage = (event) => {
        console.log("WebSocket received", event.data);
  
        let data: Message = JSON.parse(event.data);
        this.listenCallbacks.forEach((callback) => {
          callback(data);
        });
      }
  
      this.ws.onopen = (event) => {
        console.log("WebSocket connected", event);
  
        this.open = true;
      }
    }
  
    checkConnected() {
      if (!this.open) {
        throw new Error("WebSocket not connected");
      }
    }
  
    async waitConnected(timeout: number): Promise<void> {
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          clearInterval(checkInterval);
          clearTimeout(timeoutId);
  
          reject(new Error("Timeout"));
        }, timeout);
  
        const checkInterval = setInterval(() => {
          if (this.open) {
            clearInterval(checkInterval);
            clearTimeout(timeoutId);
            resolve();
          }
        }, 300);
      });
    }
  
    async connectAndWaitChannelReady(channelReadyTimeout: number = 60 * 1000): Promise<void> {
      await this.waitConnected(10000);
  
      this.sendMessage({ type: MSGT.HELLO_CLIENT });
  
      await this.awaitMessage(MSGT.ACK, 10000);
  
      await this.awaitMessage(MSGT.CHANNEL_READY, channelReadyTimeout);
    }
  
    listen(callback: (message: Message) => void) {
      this.checkConnected();
  
      this.listenCallbacks.push(callback);
    }
  
    removeListener(callback: (message: Message) => void) {
      this.checkConnected();
  
      this.listenCallbacks = this.listenCallbacks.filter((cb) => cb !== callback);
    }
  
  
    async awaitMessage(type: string, timeout: number): Promise<Message> {
      this.checkConnected();
  
      return new Promise((resolve, reject) => {
        const timeoutId = setTimeout(() => {
          reject(new Error("Timeout"));
        }, timeout);
  
        let listener = (data: Message) => {
          if (data.type === type) {
            clearTimeout(timeoutId);
            resolve(data);
            this.removeListener(listener);
          }
        }
        this.listen(listener);
      });
    }
  
    sendMessage(message: Message) {
      this.checkConnected();
  
      let msg = JSON.stringify(message);
  
      console.log("WebSocket send", msg);
      this.ws.send(msg);
    }
  
    close() {
      this.ws.close();
    }
}
    