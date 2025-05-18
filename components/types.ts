// types.ts

export type Condition = {
  name: string;
  isStartOfTurn?: boolean;
  isEndOfTurn?: boolean;
  description?: string;
  duration?: number; // ✅ ต้องเพิ่มตรงนี้เพื่อให้ลดรอบได้
};

export type Character = {
  name: string;
  initiative: number;
  type: "PC" | "Monster";
  HP?: string;
  AC?: string;
  Speed?: string;
  displayName?: string;
};