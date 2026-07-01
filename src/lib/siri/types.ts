import type { InfoChannel } from "@/generated/prisma/client";

export interface SiriResponse {
  Siri?: {
    ServiceDelivery?: {
      ResponseTimestamp?: string;
      GeneralMessageDelivery?: GeneralMessageDelivery[];
    };
  };
}

interface GeneralMessageDelivery {
  ResponseTimestamp?: string;
  GeneralMessage?: SiriGeneralMessage[];
}

interface SiriGeneralMessage {
  InfoMessageIdentifier?: { value?: string };
  InfoMessageVersion?: number;
  InfoChannelRef?: { value?: string };
  ValidUntilTime?: string;
  Content?: {
    LineRef?: Array<{ value?: string }>;
    StopPointRef?: Array<{ value?: string }>;
    Message?: Array<{ MessageType?: string; MessageText?: { value?: string; lang?: string } }>;
  };
  formatRef?: string;
}

export type { SiriGeneralMessage };

// SIRI message normalized to the shape we persist.
export interface NormalizedMessage {
  id: string;
  channel: InfoChannel;
  version: number;
  validUntil: Date | null;
  title: string;
  description: string | null;
  lineRefs: string[];
  stopRefs: string[];
}
