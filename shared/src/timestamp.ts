// Timestamp type (compatible with Firebase Timestamp)
export interface Timestamp {
  seconds: number;
  nanoseconds: number;
  toDate(): Date;
  toMillis(): number;
}
