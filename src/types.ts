import { Timestamp } from "firebase/firestore";

export enum BadgeType {
  NORMAL = "NORMAL",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  VERIFIED = "VERIFIED",
  VIP = "VIP",
  CONTRIBUTOR = "CONTRIBUTOR",
  POPULAR = "POPULAR",
  PRO = "PRO",
  WARNING = "WARNING"
}

export const BadgeIcons: Record<BadgeType, string> = {
  [BadgeType.NORMAL]: "〽️",
  [BadgeType.ADMIN]: "👑",
  [BadgeType.EMPLOYEE]: "🚹",
  [BadgeType.VERIFIED]: "🩵",
  [BadgeType.VIP]: "🔮",
  [BadgeType.CONTRIBUTOR]: "⚡",
  [BadgeType.POPULAR]: "🉑",
  [BadgeType.PRO]: "✴️",
  [BadgeType.WARNING]: "📵"
};

export interface UserProfile {
  id: string; // Auth UID
  uid: string; // Chetme Unique ID (numeric string)
  displayName: string;
  email: string;
  phone: string;
  photoURL: string;
  bio: string;
  gender: string;
  age: number;
  isPublic: boolean;
  badge: BadgeType;
  uidPrivacy: boolean; // if false, cannot find via global search
  bannedUntil: Timestamp | null;
  isPermanentlyBanned: boolean;
  createdAt: Timestamp;
  lastSeen: Timestamp;
}

export interface Chat {
  id: string;
  type: "individual" | "group";
  name?: string; // For groups
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  participants: string[]; // List of Chetme UIDs (not Auth UIDs for privacy)
  participantAuthIds: string[]; // List of Auth UIDs for query efficiency
  createdBy?: string;
}

export interface Message {
  id: string;
  senderId: string; // Chetme UID
  senderAuthId: string; // Auth UID
  text: string;
  type: "text" | "image" | "video" | "file" | "call";
  createdAt: Timestamp;
  readBy: string[]; // List of Chetme UIDs
}

export interface Story {
  id: string;
  userId: string; // Chetme UID
  userAuthId: string;
  content: string; // Used for text stories or caption for media stories
  mediaUrl?: string; // URL for image or video
  type: "text" | "image" | "video";
  createdAt: Timestamp;
  expiresAt: Timestamp;
}

export interface CallRecord {
  id: string;
  from: string; // Chetme UID
  to: string; // Chetme UID
  type: "voice";
  status: "missed" | "accepted" | "rejected";
  startedAt: Timestamp;
  endedAt: Timestamp | null;
}

export interface FriendRequest {
  id: string;
  from: string; // Chetme UID
  to: string; // Chetme UID
  status: "pending" | "accepted" | "rejected";
  createdAt: Timestamp;
}

export interface AdminNotice {
  id: string;
  title: string;
  body: string;
  imageUrl?: string;
  link?: string;
  createdAt: Timestamp;
  isActive: boolean;
  type: "global" | "targeted";
  targetUids?: string[]; // Array of Chetme UIDs
}
