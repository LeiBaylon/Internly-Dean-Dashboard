import { getAuth } from "firebase/auth";
import { firebaseApp } from "./client";

export const auth = firebaseApp ? getAuth(firebaseApp) : null;
