import { tokenStorage } from "@/store/tokenStorage";
import {
  HubConnection,
  HubConnectionBuilder,
  LogLevel,
} from "@microsoft/signalr";

/**
 * storage.getString("access_token")
 * пример для mmkv
 */

class SignalRService {
  private connection: HubConnection | null = null;
  onReceiveFinishedEmergency?: ((message: string) => void) | null = null;
  onReceiveParamedicLocation?:
    | ((payload: {
        emergencyId: string;

        paramedicLocation: {
          latitude: number;
          longitude: number;
        };
      }) => void)
    | null = null;
  async startConnection() {
    /**
     * already connected
     */
    if (this.connection && this.connection.state === "Connected") {
      return this.connection;
    }

    /**
     * reconnecting connection
     */
    if (this.connection) {
      return this.connection;
    }

    this.connection = new HubConnectionBuilder()
      .withUrl("http://10.0.2.2:5032/clientHub", {
        accessTokenFactory: async () => {
          const token = await tokenStorage.getAccessToken();

          if (!token) {
            throw new Error("No access token found");
          }

          return token;
        },
      })

      .withAutomaticReconnect()

      .configureLogging(LogLevel.Information)

      .build();

    /**
     * connection events
     */
    this.connection.onclose((error) => {
      console.log("SIGNALR_CLOSED", error);
    });

    this.connection.onreconnecting((error) => {
      console.log("SIGNALR_RECONNECTING", error);
    });

    this.connection.onreconnected((connectionId) => {
      console.log("SIGNALR_RECONNECTED", connectionId);
    });

    this.connection.on("ReceiveFinishedEmergency", (message: string) => {
      console.log("ReceiveFinishedEmergency", message);

      this.onReceiveFinishedEmergency?.(message);
    });

    this.connection.on("ReceiveParamedicLocation", (payload) => {
      console.log("ReceiveParamedicLocation", payload);

      this.onReceiveParamedicLocation?.(payload);
    });

    await this.connection.start();

    console.log("SIGNALR_CONNECTED");

    return this.connection;
  }

  async stopConnection() {
    if (!this.connection) {
      return;
    }

    await this.connection.stop();

    this.connection = null;
  }

  async sendEmergencyUpdate(payload: {
    initiatorLocation: { latitude: number; longitude: number };
    symptomQuestionsIds: string[];
    symptomAnswerOptionsIds: string[];
  }) {
    const connection = await this.startConnection();
    console.log("PAYLOAD", payload);
    // SignalR JS client expects: invoke(methodName, ...args)
    // Postman sends an envelope with `target`/`arguments`, but from the client
    // we should call the hub method directly.
    await connection.invoke("SendEmergencyUpdate", payload);
  }
}

export const signalRService = new SignalRService();
